
-- Agent sessions table to track login/logout times
CREATE TABLE public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN session_end IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (session_end - session_start))::integer / 60
      ELSE NULL 
    END
  ) STORED,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agent_sessions_tenant_user ON public.agent_sessions(tenant_id, user_id);
CREATE INDEX idx_agent_sessions_start ON public.agent_sessions(session_start DESC);

-- Enable RLS
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant members can view agent sessions"
  ON public.agent_sessions FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Service role can insert sessions"
  ON public.agent_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update sessions"
  ON public.agent_sessions FOR UPDATE
  USING (true);

-- Agent Performance Stats RPC
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
  event_stats AS (
    SELECT
      e.actor_profile_id AS user_id,
      COUNT(*) FILTER (WHERE e.event_type = 'opened') AS opened_count,
      COUNT(*) FILTER (WHERE e.event_type = 'replied') AS replied_count,
      COUNT(*) FILTER (WHERE e.event_type = 'assigned') AS assigned_count,
      COUNT(*) FILTER (WHERE e.event_type = 'claimed') AS claimed_count,
      COUNT(*) FILTER (WHERE e.event_type = 'intervened') AS intervened_count
    FROM smeksh_conversation_events e
    WHERE e.tenant_id = p_tenant_id AND e.created_at >= v_since
    GROUP BY e.actor_profile_id
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
    COALESCE(es.opened_count, 0) AS chats_opened,
    COALESCE(es.replied_count, 0) AS chats_replied,
    COALESCE(es.assigned_count, 0) AS chats_assigned,
    COALESCE(es.claimed_count, 0) + COALESCE(es.intervened_count, 0) AS leads_clicked,
    COALESCE(es.claimed_count, 0) AS conversations_claimed,
    COALESCE(cc.converted_count, 0) AS conversations_converted,
    COALESCE(oc.open_count, 0) AS current_open_chats,
    COALESCE(rt.avg_resp_min, 0) AS avg_response_minutes
  FROM agent_list al
  LEFT JOIN session_stats ss ON ss.user_id = al.user_id
  LEFT JOIN event_stats es ON es.user_id = al.user_id
  LEFT JOIN open_chats oc ON oc.user_id = al.user_id
  LEFT JOIN converted_chats cc ON cc.user_id = al.user_id
  LEFT JOIN response_times rt ON rt.user_id = al.user_id
  ORDER BY COALESCE(ss.total_hours, 0) DESC;
END;
$$;

-- Track login events: update agent last_active_at on session start
CREATE OR REPLACE FUNCTION public.record_agent_login(p_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_id UUID;
BEGIN
  -- Close any open sessions
  UPDATE agent_sessions
  SET session_end = now()
  WHERE tenant_id = p_tenant_id 
    AND user_id = v_user_id 
    AND session_end IS NULL;

  -- Create new session
  INSERT INTO agent_sessions (tenant_id, user_id)
  VALUES (p_tenant_id, v_user_id)
  RETURNING id INTO v_session_id;

  -- Update agent presence
  UPDATE agents
  SET is_online = true, last_active_at = now(), updated_at = now()
  WHERE tenant_id = p_tenant_id AND user_id = v_user_id;

  RETURN v_session_id;
END;
$$;

-- Record logout
CREATE OR REPLACE FUNCTION public.record_agent_logout(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Close open sessions
  UPDATE agent_sessions
  SET session_end = now()
  WHERE tenant_id = p_tenant_id 
    AND user_id = v_user_id 
    AND session_end IS NULL;

  -- Update agent presence
  UPDATE agents
  SET is_online = false, updated_at = now()
  WHERE tenant_id = p_tenant_id AND user_id = v_user_id;
END;
$$;
