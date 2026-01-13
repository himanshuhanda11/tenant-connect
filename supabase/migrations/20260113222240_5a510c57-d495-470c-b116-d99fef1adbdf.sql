-- =============================================
-- ROUTING FUNCTIONS FOR SMEKSH
-- Returns profiles.id (via agents.user_id) for direct assignment to conversations.assigned_to
-- =============================================

-- 1) Round Robin picker that returns profiles.id (user_id)
CREATE OR REPLACE FUNCTION public.pick_profile_round_robin(
  p_tenant_id uuid,
  p_team_id uuid,
  p_only_online boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_ids uuid[];
  n int;
  cur int;
  idx int;
  chosen uuid;
BEGIN
  -- Build list of agent user_ids (profile_ids) in this team
  SELECT array_agg(a.user_id ORDER BY tm.created_at ASC)
  INTO profile_ids
  FROM team_members tm
  JOIN agents a ON a.id = tm.agent_id
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_tenant_id
    AND tm.is_active = true
    AND a.is_active = true
    AND a.user_id IS NOT NULL
    AND (p_only_online = false OR a.is_online = true);

  n := COALESCE(array_length(profile_ids, 1), 0);
  IF n = 0 THEN
    RETURN NULL;
  END IF;

  -- Upsert round robin state
  INSERT INTO round_robin_state(tenant_id, team_id, cursor)
  VALUES (p_tenant_id, p_team_id, 0)
  ON CONFLICT (tenant_id, team_id) DO NOTHING;

  -- Lock and get current cursor
  SELECT cursor INTO cur
  FROM round_robin_state
  WHERE tenant_id = p_tenant_id AND team_id = p_team_id
  FOR UPDATE;

  -- Calculate next agent
  idx := (cur % n) + 1;
  chosen := profile_ids[idx];

  -- Increment cursor
  UPDATE round_robin_state
  SET cursor = cur + 1, updated_at = now()
  WHERE tenant_id = p_tenant_id AND team_id = p_team_id;

  RETURN chosen;
END;
$$;

-- 2) Least Busy picker that returns profiles.id (user_id)
-- Picks the agent with the fewest OPEN conversations
CREATE OR REPLACE FUNCTION public.pick_profile_least_busy(
  p_tenant_id uuid,
  p_team_id uuid,
  p_only_online boolean DEFAULT false,
  p_max_open int DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH team_profiles AS (
    SELECT a.user_id AS profile_id,
           COALESCE(a.max_open_chats, 10) AS max_chats
    FROM team_members tm
    JOIN agents a ON a.id = tm.agent_id
    WHERE tm.team_id = p_team_id
      AND tm.tenant_id = p_tenant_id
      AND tm.is_active = true
      AND a.is_active = true
      AND a.user_id IS NOT NULL
      AND (p_only_online = false OR a.is_online = true)
  ),
  loads AS (
    SELECT tp.profile_id,
           tp.max_chats,
           COUNT(c.id) AS open_count
    FROM team_profiles tp
    LEFT JOIN conversations c
      ON c.tenant_id = p_tenant_id
     AND c.assigned_to = tp.profile_id
     AND c.status = 'open'
    GROUP BY tp.profile_id, tp.max_chats
  )
  SELECT profile_id
  FROM loads
  WHERE open_count < max_chats
    AND (p_max_open IS NULL OR open_count < p_max_open)
  ORDER BY open_count ASC, profile_id ASC
  LIMIT 1;
$$;

-- 3) Assign conversation to profile (safe for race conditions)
CREATE OR REPLACE FUNCTION public.assign_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_profile_id uuid,
  p_only_if_unassigned boolean DEFAULT true
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rows_affected int;
BEGIN
  IF p_only_if_unassigned THEN
    UPDATE conversations
    SET assigned_to = p_profile_id,
        updated_at = now()
    WHERE id = p_conversation_id
      AND tenant_id = p_tenant_id
      AND assigned_to IS NULL;
  ELSE
    UPDATE conversations
    SET assigned_to = p_profile_id,
        updated_at = now()
    WHERE id = p_conversation_id
      AND tenant_id = p_tenant_id;
  END IF;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- 4) Auto-route conversation using routing rules
CREATE OR REPLACE FUNCTION public.auto_route_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_only_if_unassigned boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rule routing_rules;
  v_profile_id uuid;
  v_strategy text;
  v_team_id uuid;
  v_result jsonb;
BEGIN
  -- Find first active routing rule (ordered by priority)
  SELECT * INTO v_rule
  FROM routing_rules
  WHERE tenant_id = p_tenant_id
    AND is_active = true
  ORDER BY priority ASC
  LIMIT 1;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_active_rules');
  END IF;

  v_strategy := v_rule.strategy;
  v_team_id := v_rule.assign_to_team_id;

  -- If rule assigns to specific user
  IF v_rule.assign_to_user_id IS NOT NULL THEN
    v_profile_id := v_rule.assign_to_user_id;
    v_strategy := 'specific_agent';
  -- Otherwise use team-based strategy
  ELSIF v_team_id IS NOT NULL THEN
    CASE v_strategy
      WHEN 'round_robin' THEN
        v_profile_id := pick_profile_round_robin(p_tenant_id, v_team_id, false);
      WHEN 'least_busy' THEN
        v_profile_id := pick_profile_least_busy(p_tenant_id, v_team_id, false, NULL);
      ELSE
        v_profile_id := pick_profile_round_robin(p_tenant_id, v_team_id, false);
    END CASE;
    
    -- Fallback if no agent available
    IF v_profile_id IS NULL AND v_rule.fallback_strategy IS NOT NULL THEN
      CASE v_rule.fallback_strategy
        WHEN 'round_robin' THEN
          v_profile_id := pick_profile_round_robin(p_tenant_id, v_team_id, false);
        WHEN 'least_busy' THEN
          v_profile_id := pick_profile_least_busy(p_tenant_id, v_team_id, false, NULL);
        ELSE
          NULL;
      END CASE;
    END IF;
  END IF;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_available_agent');
  END IF;

  -- Assign the conversation
  IF assign_conversation(p_tenant_id, p_conversation_id, v_profile_id, p_only_if_unassigned) THEN
    -- Log the assignment
    INSERT INTO audit_logs (tenant_id, action, resource_type, resource_id, details)
    VALUES (
      p_tenant_id,
      'assignment_changed',
      'conversation',
      p_conversation_id,
      jsonb_build_object(
        'strategy', v_strategy,
        'assigned_to', v_profile_id,
        'rule_id', v_rule.id,
        'team_id', v_team_id
      )
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'assigned_to', v_profile_id,
      'strategy', v_strategy,
      'rule_id', v_rule.id
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'reason', 'already_assigned');
  END IF;
END;
$$;

-- 5) Get agent workload stats
CREATE OR REPLACE FUNCTION public.get_team_workload(
  p_tenant_id uuid,
  p_team_id uuid
)
RETURNS TABLE (
  profile_id uuid,
  display_name text,
  is_online boolean,
  open_count bigint,
  max_open_chats int,
  availability_pct numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    a.user_id AS profile_id,
    COALESCE(a.display_name, p.full_name, p.email) AS display_name,
    a.is_online,
    COUNT(c.id) AS open_count,
    COALESCE(a.max_open_chats, 10) AS max_open_chats,
    ROUND(100.0 * COUNT(c.id) / GREATEST(COALESCE(a.max_open_chats, 10), 1), 1) AS availability_pct
  FROM team_members tm
  JOIN agents a ON a.id = tm.agent_id
  LEFT JOIN profiles p ON p.id = a.user_id
  LEFT JOIN conversations c 
    ON c.tenant_id = p_tenant_id 
   AND c.assigned_to = a.user_id 
   AND c.status = 'open'
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_tenant_id
    AND tm.is_active = true
    AND a.is_active = true
  GROUP BY a.user_id, a.display_name, p.full_name, p.email, a.is_online, a.max_open_chats
  ORDER BY open_count ASC;
$$;