-- SMEKSH Team/Routing Schema - Workspace-style naming with profiles.id compatibility
-- Note: These are views/wrappers over existing tenant-based tables for SMEKSH naming convention

-- 1. Create smeksh_workspace_members view (maps to agents + tenant_members)
CREATE OR REPLACE VIEW public.smeksh_workspace_members AS
SELECT 
  a.id,
  a.tenant_id AS workspace_id,
  a.user_id AS profile_id,
  COALESCE(a.display_name, p.full_name, p.email) AS display_name,
  p.email,
  a.role,
  a.status,
  a.is_active,
  a.is_online,
  a.presence,
  a.skills,
  a.languages,
  a.timezone,
  a.max_open_chats,
  a.weight,
  a.notes,
  a.last_active_at,
  a.created_at,
  a.updated_at
FROM agents a
LEFT JOIN profiles p ON p.id = a.user_id;

-- 2. Create smeksh_teams view (maps to teams - using correct column name team_lead_id)
CREATE OR REPLACE VIEW public.smeksh_teams AS
SELECT 
  t.id,
  t.tenant_id AS workspace_id,
  t.name,
  t.description,
  t.color,
  t.team_lead_id,
  t.default_routing_strategy,
  t.is_active,
  t.created_at,
  t.updated_at
FROM teams t;

-- 3. Create smeksh_team_members view
CREATE OR REPLACE VIEW public.smeksh_team_members AS
SELECT 
  tm.id,
  tm.tenant_id AS workspace_id,
  tm.team_id,
  tm.agent_id AS member_id,
  a.user_id AS profile_id,
  tm.is_active,
  tm.created_at
FROM team_members tm
JOIN agents a ON a.id = tm.agent_id;

-- 4. Create smeksh_presence view (maps to agents presence fields)
CREATE OR REPLACE VIEW public.smeksh_presence AS
SELECT 
  a.id AS member_id,
  a.tenant_id AS workspace_id,
  a.user_id AS profile_id,
  CASE 
    WHEN a.is_online = true THEN 'ONLINE'
    WHEN a.presence = 'away' THEN 'AWAY'
    WHEN a.presence = 'busy' THEN 'BUSY'
    ELSE 'OFFLINE'
  END AS status,
  a.last_active_at,
  a.updated_at
FROM agents a;

-- 5. Create smeksh_routing_rules view
CREATE OR REPLACE VIEW public.smeksh_routing_rules AS
SELECT 
  rr.id,
  rr.tenant_id AS workspace_id,
  rr.name,
  rr.description,
  rr.is_active,
  CASE WHEN rr.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END AS status,
  rr.priority,
  rr.condition_type AS trigger_event,
  rr.condition_config AS match_conditions,
  rr.strategy,
  rr.assign_to_team_id AS target_team_id,
  rr.assign_to_user_id AS target_member_id,
  rr.fallback_strategy,
  rr.created_at,
  rr.updated_at
FROM routing_rules rr;

-- 6. Create smeksh_round_robin_state view
CREATE OR REPLACE VIEW public.smeksh_round_robin_state AS
SELECT 
  rrs.tenant_id AS workspace_id,
  rrs.team_id,
  rrs.cursor,
  rrs.updated_at
FROM round_robin_state rrs;

-- 7. Create smeksh_audit_logs view
CREATE OR REPLACE VIEW public.smeksh_audit_logs AS
SELECT 
  al.id,
  al.tenant_id AS workspace_id,
  al.user_id AS actor_user_id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details,
  al.ip_address,
  al.user_agent,
  al.created_at
FROM audit_logs al;

-- 8. SMEKSH-prefixed Round Robin picker function
CREATE OR REPLACE FUNCTION public.smeksh_pick_profile_round_robin(
  p_workspace_id uuid,
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
  -- Build list of agent profile_ids (user_ids) in this team
  SELECT array_agg(a.user_id ORDER BY tm.created_at ASC)
  INTO profile_ids
  FROM team_members tm
  JOIN agents a ON a.id = tm.agent_id
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_workspace_id
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
  VALUES (p_workspace_id, p_team_id, 0)
  ON CONFLICT (tenant_id, team_id) DO NOTHING;

  -- Lock and get current cursor
  SELECT cursor INTO cur
  FROM round_robin_state
  WHERE tenant_id = p_workspace_id AND team_id = p_team_id
  FOR UPDATE;

  -- Calculate next agent
  idx := (cur % n) + 1;
  chosen := profile_ids[idx];

  -- Increment cursor
  UPDATE round_robin_state
  SET cursor = cur + 1, updated_at = now()
  WHERE tenant_id = p_workspace_id AND team_id = p_team_id;

  RETURN chosen;
END;
$$;

-- 9. SMEKSH-prefixed Least Busy picker function
CREATE OR REPLACE FUNCTION public.smeksh_pick_profile_least_busy(
  p_workspace_id uuid,
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
    SELECT 
      a.user_id AS profile_id,
      COALESCE(a.max_open_chats, 10) AS max_chats
    FROM team_members tm
    JOIN agents a ON a.id = tm.agent_id
    WHERE tm.team_id = p_team_id
      AND tm.tenant_id = p_workspace_id
      AND tm.is_active = true
      AND a.is_active = true
      AND a.user_id IS NOT NULL
      AND (p_only_online = false OR a.is_online = true)
  ),
  loads AS (
    SELECT 
      tp.profile_id,
      tp.max_chats,
      COUNT(c.id) AS open_count
    FROM team_profiles tp
    LEFT JOIN conversations c
      ON c.tenant_id = p_workspace_id
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

-- 10. SMEKSH assign conversation function
CREATE OR REPLACE FUNCTION public.smeksh_assign_conversation(
  p_workspace_id uuid,
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
      AND tenant_id = p_workspace_id
      AND assigned_to IS NULL;
  ELSE
    UPDATE conversations
    SET assigned_to = p_profile_id,
        updated_at = now()
    WHERE id = p_conversation_id
      AND tenant_id = p_workspace_id;
  END IF;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- 11. SMEKSH auto-route conversation function
CREATE OR REPLACE FUNCTION public.smeksh_auto_route_conversation(
  p_workspace_id uuid,
  p_conversation_id uuid,
  p_trigger_event text DEFAULT 'new_conversation',
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
  -- Find first active routing rule matching trigger event (ordered by priority)
  SELECT * INTO v_rule
  FROM routing_rules
  WHERE tenant_id = p_workspace_id
    AND is_active = true
    AND (condition_type = p_trigger_event OR condition_type = 'all')
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
        v_profile_id := smeksh_pick_profile_round_robin(p_workspace_id, v_team_id, false);
      WHEN 'least_busy' THEN
        v_profile_id := smeksh_pick_profile_least_busy(p_workspace_id, v_team_id, false, NULL);
      ELSE
        v_profile_id := smeksh_pick_profile_round_robin(p_workspace_id, v_team_id, false);
    END CASE;
    
    -- Fallback if no agent available
    IF v_profile_id IS NULL AND v_rule.fallback_strategy IS NOT NULL THEN
      CASE v_rule.fallback_strategy
        WHEN 'round_robin' THEN
          v_profile_id := smeksh_pick_profile_round_robin(p_workspace_id, v_team_id, false);
        WHEN 'least_busy' THEN
          v_profile_id := smeksh_pick_profile_least_busy(p_workspace_id, v_team_id, false, NULL);
        ELSE
          NULL;
      END CASE;
    END IF;
  END IF;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_available_agent');
  END IF;

  -- Assign the conversation
  IF smeksh_assign_conversation(p_workspace_id, p_conversation_id, v_profile_id, p_only_if_unassigned) THEN
    -- Log the assignment
    INSERT INTO audit_logs (tenant_id, action, resource_type, resource_id, user_id, details)
    VALUES (
      p_workspace_id,
      'conversation.assigned',
      'conversation',
      p_conversation_id::text,
      v_profile_id,
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

-- 12. SMEKSH get team workload function
CREATE OR REPLACE FUNCTION public.smeksh_get_team_workload(
  p_workspace_id uuid,
  p_team_id uuid
)
RETURNS TABLE(
  profile_id uuid,
  display_name text,
  is_online boolean,
  open_count bigint,
  max_open_chats integer,
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
    ON c.tenant_id = p_workspace_id 
   AND c.assigned_to = a.user_id 
   AND c.status = 'open'
  WHERE tm.team_id = p_team_id
    AND tm.tenant_id = p_workspace_id
    AND tm.is_active = true
    AND a.is_active = true
  GROUP BY a.user_id, a.display_name, p.full_name, p.email, a.is_online, a.max_open_chats
  ORDER BY open_count ASC;
$$;