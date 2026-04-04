
DROP FUNCTION IF EXISTS public.agent_performance_stats(uuid, integer);

CREATE OR REPLACE FUNCTION public.agent_performance_stats(p_tenant_id uuid, p_days integer DEFAULT 7)
RETURNS TABLE(
  agent_id uuid,
  agent_name text,
  agent_email text,
  avatar_url text,
  is_online boolean,
  last_login_at timestamptz,
  total_sessions integer,
  total_hours_worked numeric,
  avg_daily_hours numeric,
  chats_opened integer,
  chats_replied integer,
  chats_assigned integer,
  leads_clicked integer,
  conversations_claimed integer,
  conversations_converted integer,
  current_open_chats integer,
  avg_response_minutes numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tz text;
  v_now timestamptz;
  v_period_start timestamptz;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN;
  END IF;

  SELECT COALESCE(timezone, 'UTC')
  INTO v_tz
  FROM public.tenants
  WHERE id = p_tenant_id;

  v_now := now();

  IF COALESCE(p_days, 7) <= 1 THEN
    v_period_start := date_trunc('day', v_now AT TIME ZONE v_tz) AT TIME ZONE v_tz;
  ELSE
    v_period_start := (date_trunc('day', v_now AT TIME ZONE v_tz) - ((p_days - 1) || ' days')::interval) AT TIME ZONE v_tz;
  END IF;

  RETURN QUERY
  WITH agent_list AS (
    SELECT
      a.user_id,
      COALESCE(a.display_name, p.full_name, p.email) AS display_name,
      p.email,
      p.avatar_url,
      a.is_online,
      a.last_active_at
    FROM public.agents a
    JOIN public.profiles p ON p.id = a.user_id
    WHERE a.tenant_id = p_tenant_id
      AND a.is_active = true
  ),
  session_stats AS (
    SELECT
      s.user_id,
      COUNT(*) AS total_sessions,
      ROUND(COALESCE(SUM(
        GREATEST(
          EXTRACT(EPOCH FROM (LEAST(COALESCE(s.session_end, v_now), v_now) - GREATEST(s.session_start, v_period_start))) / 3600,
          0
        )
      ), 0)::numeric, 1) AS total_hours,
      ROUND(
        COALESCE(SUM(
          GREATEST(
            EXTRACT(EPOCH FROM (LEAST(COALESCE(s.session_end, v_now), v_now) - GREATEST(s.session_start, v_period_start))) / 3600,
            0
          )
        ), 0)::numeric / GREATEST(COALESCE(p_days, 7), 1),
        1
      ) AS avg_daily,
      MAX(s.session_start) AS last_login
    FROM public.agent_sessions s
    WHERE s.tenant_id = p_tenant_id
      AND COALESCE(s.session_end, v_now) >= v_period_start
      AND s.session_start <= v_now
    GROUP BY s.user_id
  ),
  opened_stats AS (
    SELECT
      c.last_opened_by AS user_id,
      COUNT(DISTINCT c.id) AS opened_count
    FROM public.conversations c
    WHERE c.tenant_id = p_tenant_id
      AND c.last_opened_at >= v_period_start
      AND c.last_opened_at <= v_now
      AND c.last_opened_by IS NOT NULL
    GROUP BY c.last_opened_by
  ),
  reply_stats AS (
    SELECT
      reply_user_id AS user_id,
      COUNT(*) AS replied_count
    FROM (
      SELECT
        COALESCE(
          CASE
            WHEN jsonb_typeof(m.metadata) = 'object'
              AND (m.metadata ->> 'agent_user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            THEN (m.metadata ->> 'agent_user_id')::uuid
            ELSE NULL
          END,
          c.assigned_to
        ) AS reply_user_id
      FROM public.messages m
      JOIN public.conversations c
        ON c.id = m.conversation_id
       AND c.tenant_id = p_tenant_id
      WHERE m.direction = 'outbound'
        AND m.created_at >= v_period_start
        AND m.created_at <= v_now
        AND COALESCE(m.is_auto_reply, false) = false
    ) human_replies
    WHERE reply_user_id IS NOT NULL
    GROUP BY reply_user_id
  ),
  assign_stats AS (
    SELECT
      (e.details ->> 'assigned_to')::uuid AS user_id,
      COUNT(*) AS assigned_count
    FROM public.smeksh_conversation_events e
    WHERE e.tenant_id = p_tenant_id
      AND e.event_type = 'assigned'
      AND e.created_at >= v_period_start
      AND e.created_at <= v_now
      AND e.details ->> 'assigned_to' IS NOT NULL
    GROUP BY (e.details ->> 'assigned_to')::uuid
  ),
  claimed_stats AS (
    SELECT
      c.claimed_by AS user_id,
      COUNT(*) AS claimed_count
    FROM public.conversations c
    WHERE c.tenant_id = p_tenant_id
      AND c.claimed_at >= v_period_start
      AND c.claimed_at <= v_now
      AND c.claimed_by IS NOT NULL
    GROUP BY c.claimed_by
  ),
  open_chats AS (
    SELECT
      c.assigned_to AS user_id,
      COUNT(*) AS open_count
    FROM public.conversations c
    WHERE c.tenant_id = p_tenant_id
      AND c.status = 'open'
      AND c.assigned_to IS NOT NULL
    GROUP BY c.assigned_to
  ),
  converted_chats AS (
    SELECT
      c.assigned_to AS user_id,
      COUNT(*) AS converted_count
    FROM public.conversations c
    WHERE c.tenant_id = p_tenant_id
      AND c.crm_status = 'converted'
      AND c.updated_at >= v_period_start
      AND c.updated_at <= v_now
      AND c.assigned_to IS NOT NULL
    GROUP BY c.assigned_to
  ),
  response_times AS (
    SELECT
      fr.assigned_to AS user_id,
      ROUND(AVG(fr.resp_seconds / 60)::numeric, 1) AS avg_resp_min
    FROM (
      SELECT
        c.assigned_to,
        MIN(EXTRACT(EPOCH FROM (m.created_at - c.created_at))) AS resp_seconds
      FROM public.messages m
      JOIN public.conversations c
        ON c.id = m.conversation_id
       AND c.tenant_id = p_tenant_id
      WHERE m.direction = 'outbound'
        AND COALESCE(m.is_auto_reply, false) = false
        AND c.created_at >= v_period_start
        AND c.created_at <= v_now
        AND c.assigned_to IS NOT NULL
      GROUP BY c.id, c.assigned_to
    ) fr
    WHERE fr.resp_seconds > 0
    GROUP BY fr.assigned_to
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
    COALESCE(os.opened_count, 0)::integer AS chats_opened,
    COALESCE(rs.replied_count, 0)::integer AS chats_replied,
    COALESCE(ast.assigned_count, 0)::integer AS chats_assigned,
    COALESCE(cs.claimed_count, 0)::integer AS leads_clicked,
    COALESCE(cs.claimed_count, 0)::integer AS conversations_claimed,
    COALESCE(cc.converted_count, 0)::integer AS conversations_converted,
    COALESCE(oc.open_count, 0)::integer AS current_open_chats,
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
  ORDER BY COALESCE(rs.replied_count, 0) DESC, COALESCE(ss.total_hours, 0) DESC, al.display_name ASC;
END;
$$;
