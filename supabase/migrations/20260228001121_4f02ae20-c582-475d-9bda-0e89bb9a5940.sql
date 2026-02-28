
CREATE OR REPLACE FUNCTION public.agent_performance_stats(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  agent_id UUID,
  agent_name TEXT,
  agent_email TEXT,
  avatar_url TEXT,
  is_online BOOLEAN,
  last_login_at TIMESTAMPTZ,
  total_sessions INTEGER,
  total_hours_worked NUMERIC,
  avg_daily_hours NUMERIC,
  chats_opened BIGINT,
  chats_replied BIGINT,
  chats_assigned BIGINT,
  leads_clicked BIGINT,
  conversations_claimed BIGINT,
  conversations_converted BIGINT,
  current_open_chats BIGINT,
  avg_response_minutes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_since TIMESTAMPTZ;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN;
  END IF;

  v_since := now() - (p_days || ' days')::interval;

  RETURN QUERY
  WITH agent_list AS (
    SELECT 
      a.user_id,
      COALESCE(a.display_name, p.full_name, p.email) AS display_name,
      p.email,
      p.avatar_url,
      a.is_online,
      a.last_active_at
    FROM agents a
    JOIN profiles p ON p.id = a.user_id
    WHERE a.tenant_id = p_tenant_id AND a.is_active = true
  ),
  session_stats AS (
    SELECT
      s.user_id,
      COUNT(*) AS total_sessions,
      ROUND(COALESCE(SUM(
        EXTRACT(EPOCH FROM (COALESCE(s.session_end, now()) - s.session_start)) / 3600
      ), 0)::numeric, 1) AS total_hours,
      ROUND(COALESCE(SUM(
        EXTRACT(EPOCH FROM (COALESCE(s.session_end, now()) - s.session_start)) / 3600
      ) / GREATEST(p_days, 1), 0)::numeric, 1) AS avg_daily,
      MAX(s.session_start) AS last_login
    FROM agent_sessions s
    WHERE s.tenant_id = p_tenant_id AND s.session_start >= v_since
    GROUP BY s.user_id
  ),
  -- Count conversations opened by each agent
  opened_stats AS (
    SELECT
      c.last_opened_by AS user_id,
      COUNT(*) AS opened_count
    FROM conversations c
    WHERE c.tenant_id = p_tenant_id 
      AND c.last_opened_at >= v_since
      AND c.last_opened_by IS NOT NULL
    GROUP BY c.last_opened_by
  ),
  -- Count outbound messages per assigned agent as replies
  reply_stats AS (
    SELECT
      c.assigned_to AS user_id,
      COUNT(*) AS replied_count
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id AND c.tenant_id = p_tenant_id
    WHERE m.direction = 'outbound'
      AND m.created_at >= v_since
      AND m.is_auto_reply = false
      AND c.assigned_to IS NOT NULL
    GROUP BY c.assigned_to
  ),
  -- Count assignments from events
  assign_stats AS (
    SELECT
      e.to_assigned_to AS user_id,
      COUNT(*) AS assigned_count
    FROM smeksh_conversation_events e
    WHERE e.tenant_id = p_tenant_id 
      AND e.event_type = 'assigned'
      AND e.created_at >= v_since
      AND e.to_assigned_to IS NOT NULL
    GROUP BY e.to_assigned_to
  ),
  -- Count claimed conversations
  claimed_stats AS (
    SELECT
      c.claimed_by AS user_id,
      COUNT(*) AS claimed_count
    FROM conversations c
    WHERE c.tenant_id = p_tenant_id
      AND c.claimed_at >= v_since
      AND c.claimed_by IS NOT NULL
    GROUP BY c.claimed_by
  ),
  open_chats AS (
    SELECT 
      c.assigned_to AS user_id,
      COUNT(*) AS open_count
    FROM conversations c
    WHERE c.tenant_id = p_tenant_id AND c.status = 'open'
    GROUP BY c.assigned_to
  ),
  converted_chats AS (
    SELECT
      c.assigned_to AS user_id,
      COUNT(*) AS converted_count
    FROM conversations c
    WHERE c.tenant_id = p_tenant_id 
      AND c.crm_status = 'converted' 
      AND c.updated_at >= v_since
    GROUP BY c.assigned_to
  ),
  response_times AS (
    SELECT
      c.assigned_to AS user_id,
      ROUND(AVG(
        EXTRACT(EPOCH FROM (c.first_response_at - c.created_at)) / 60
      )::numeric, 1) AS avg_resp_min
    FROM conversations c
    WHERE c.tenant_id = p_tenant_id 
      AND c.first_response_at IS NOT NULL
      AND c.created_at >= v_since
    GROUP BY c.assigned_to
  )
  SELECT
    al.user_id AS agent_id,
    al.display_name AS agent_name,
    al.email AS agent_email,
    al.avatar_url,
    al.is_online,
    COALESCE(ss.last_login, al.last_active_at) AS last_login_at,
    COALESCE(ss.total_sessions, 0)::integer AS total_sessions,
    COALESCE(ss.total_hours, 0) AS total_hours_worked,
    COALESCE(ss.avg_daily, 0) AS avg_daily_hours,
    COALESCE(os.opened_count, 0) AS chats_opened,
    COALESCE(rs.replied_count, 0) AS chats_replied,
    COALESCE(ast.assigned_count, 0) AS chats_assigned,
    COALESCE(cs.claimed_count, 0) AS leads_clicked,
    COALESCE(cs.claimed_count, 0) AS conversations_claimed,
    COALESCE(cc.converted_count, 0) AS conversations_converted,
    COALESCE(oc.open_count, 0) AS current_open_chats,
    COALESCE(rt.avg_resp_min, 0) AS avg_response_minutes
  FROM agent_list al
  LEFT JOIN session_stats ss ON ss.user_id = al.user_id
  LEFT JOIN opened_stats os ON os.user_id = al.user_id
  LEFT JOIN reply_stats rs ON rs.user_id = al.user_id
  LEFT JOIN assign_stats ast ON ast.user_id = al.user_id
  LEFT JOIN claimed_stats cs ON cs.user_id = al.user_id
  LEFT JOIN open_chats oc ON oc.user_id = al.user_id
  LEFT JOIN converted_chats cc ON cc.user_id = al.user_id
  LEFT JOIN response_times rt ON rt.user_id = al.user_id
  ORDER BY COALESCE(ss.total_hours, 0) DESC;
END;
$$;
