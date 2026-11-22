
-- 1. Who sent each outbound message
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sent_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sent_by_inferred boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_messages_tenant_created ON public.messages (tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_sender_created ON public.messages (tenant_id, sent_by, created_at) WHERE sent_by IS NOT NULL;

-- Agent recorded on an assignment event (newer events use to_assigned_to, older ones only details.assigned_to)
CREATE OR REPLACE FUNCTION public.conversation_event_agent(p_to uuid, p_details jsonb)
RETURNS uuid LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT COALESCE(p_to,
    CASE WHEN p_details->>'assigned_to' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         THEN (p_details->>'assigned_to')::uuid END)
$$;

-- Owner of a conversation at a moment in time, from assignment history (falls back to the current owner)
CREATE OR REPLACE FUNCTION public.conversation_owner_at(p_conversation_id uuid, p_at timestamptz)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN ev.found THEN ev.agent ELSE COALESCE(c.claimed_by, c.assigned_to) END
  FROM public.conversations c
  LEFT JOIN LATERAL (
    SELECT true AS found,
      CASE WHEN e.event_type = 'unassigned' THEN NULL ELSE public.conversation_event_agent(e.to_assigned_to, e.details) END AS agent
    FROM public.smeksh_conversation_events e
    WHERE e.tenant_id = c.tenant_id AND e.conversation_id = c.id
      AND e.event_type IN ('assigned', 'unassigned') AND e.created_at <= p_at
    ORDER BY e.created_at DESC LIMIT 1
  ) ev ON true
  WHERE c.id = p_conversation_id
$$;
REVOKE EXECUTE ON FUNCTION public.conversation_owner_at(uuid, timestamptz) FROM PUBLIC, anon, authenticated;

-- Backfill: past manual replies are credited to whoever owned the chat when the reply went out
UPDATE public.messages m
SET sent_by = x.agent, sent_by_inferred = true
FROM (
  SELECT m2.id,
    CASE WHEN ev.found THEN ev.agent ELSE COALESCE(c.claimed_by, c.assigned_to) END AS agent
  FROM public.messages m2
  JOIN public.conversations c ON c.id = m2.conversation_id
  LEFT JOIN LATERAL (
    SELECT true AS found,
      CASE WHEN e.event_type = 'unassigned' THEN NULL ELSE public.conversation_event_agent(e.to_assigned_to, e.details) END AS agent
    FROM public.smeksh_conversation_events e
    WHERE e.tenant_id = m2.tenant_id AND e.conversation_id = m2.conversation_id
      AND e.event_type IN ('assigned', 'unassigned') AND e.created_at <= m2.created_at
    ORDER BY e.created_at DESC LIMIT 1
  ) ev ON true
  WHERE m2.direction = 'outbound'
    AND COALESCE(m2.is_auto_reply, false) = false
    AND COALESCE(m2.is_echo, false) = false
    AND COALESCE(m2.source, 'cloud_api') = 'cloud_api'
    AND m2.sent_by IS NULL
) x
WHERE m.id = x.id AND x.agent IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = x.agent);

-- 2. One definition of every metric: one row per (agent, conversation, metric)
CREATE OR REPLACE FUNCTION public._agent_perf_rows(
  p_tenant_id uuid, p_start timestamptz, p_end timestamptz,
  p_phone_number_id uuid DEFAULT NULL, p_include_snapshot boolean DEFAULT true)
RETURNS TABLE(agent_id uuid, conversation_id uuid, metric text, n bigint, seconds numeric, at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH
new_convs AS (
  SELECT c.id, c.created_at,
    COALESCE(fa.agent, c.assigned_to, c.claimed_by) AS first_agent,
    fm.direction::text AS first_dir
  FROM public.conversations c
  LEFT JOIN LATERAL (
    SELECT public.conversation_event_agent(e.to_assigned_to, e.details) AS agent
    FROM public.smeksh_conversation_events e
    WHERE e.tenant_id = c.tenant_id AND e.conversation_id = c.id AND e.event_type = 'assigned'
      AND public.conversation_event_agent(e.to_assigned_to, e.details) IS NOT NULL
    ORDER BY e.created_at ASC LIMIT 1
  ) fa ON true
  LEFT JOIN LATERAL (
    SELECT m.direction FROM public.messages m
    WHERE m.conversation_id = c.id AND m.direction IN ('inbound', 'outbound')
    ORDER BY m.created_at ASC LIMIT 1
  ) fm ON true
  WHERE c.tenant_id = p_tenant_id AND c.created_at >= p_start AND c.created_at < p_end
    AND (p_phone_number_id IS NULL OR c.phone_number_id = p_phone_number_id)
),
agent_msgs AS (
  SELECT m.sent_by AS agent, m.conversation_id AS cid, count(*) AS n,
    bool_or(c.created_at >= p_start) AS is_new, max(m.created_at) AS last_at
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.tenant_id = p_tenant_id AND m.direction = 'outbound' AND m.sent_by IS NOT NULL
    AND m.created_at >= p_start AND m.created_at < p_end
    AND (p_phone_number_id IS NULL OR c.phone_number_id = p_phone_number_id)
  GROUP BY 1, 2
),
cust AS (
  SELECT m.conversation_id AS cid, max(m.created_at) AS last_at
  FROM public.messages m
  JOIN public.conversations c ON c.id = m.conversation_id
  WHERE m.tenant_id = p_tenant_id AND m.direction = 'inbound'
    AND m.created_at >= p_start AND m.created_at < p_end
    AND c.created_at < p_start
    AND (p_phone_number_id IS NULL OR c.phone_number_id = p_phone_number_id)
  GROUP BY 1
),
first_resp AS (
  SELECT nc.id, r.sent_by AS agent, EXTRACT(EPOCH FROM (r.created_at - fi.t)) AS secs, r.created_at AS at
  FROM new_convs nc
  JOIN LATERAL (
    SELECT min(m.created_at) AS t FROM public.messages m
    WHERE m.conversation_id = nc.id AND m.direction = 'inbound'
  ) fi ON fi.t IS NOT NULL
  JOIN LATERAL (
    SELECT m.created_at, m.sent_by FROM public.messages m
    WHERE m.conversation_id = nc.id AND m.direction = 'outbound' AND m.sent_by IS NOT NULL AND m.created_at >= fi.t
    ORDER BY m.created_at ASC LIMIT 1
  ) r ON true
),
snapshot AS (
  SELECT c.id, c.assigned_to, c.claimed_by, c.claimed_at, c.last_inbound_at
  FROM public.conversations c
  WHERE p_include_snapshot AND c.tenant_id = p_tenant_id AND c.status <> 'closed'
    AND (p_phone_number_id IS NULL OR c.phone_number_id = p_phone_number_id)
)
SELECT nc.first_agent, nc.id, 'new_assigned', 1::bigint, NULL::numeric, nc.created_at FROM new_convs nc
UNION ALL
SELECT nc.first_agent, nc.id,
  CASE WHEN nc.first_dir = 'outbound' THEN 'new_by_agent' ELSE 'new_by_customer' END,
  1::bigint, NULL::numeric, nc.created_at
FROM new_convs nc WHERE nc.first_dir IS NOT NULL
UNION ALL
SELECT am.agent, am.cid, CASE WHEN am.is_new THEN 'new_handled' ELSE 'existing_handled' END, am.n, NULL::numeric, am.last_at
FROM agent_msgs am
UNION ALL
SELECT public.conversation_owner_at(cu.cid, p_end), cu.cid, 'customer_replies', 1::bigint, NULL::numeric, cu.last_at
FROM cust cu
UNION ALL
SELECT fr.agent, fr.id, 'first_response', 1::bigint, fr.secs::numeric, fr.at FROM first_resp fr
UNION ALL
SELECT COALESCE(s.claimed_by, s.assigned_to), s.id, 'pending', 1::bigint, NULL::numeric, s.last_inbound_at
FROM snapshot s
WHERE COALESCE(s.claimed_by, s.assigned_to) IS NOT NULL AND s.last_inbound_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.conversation_id = s.id AND m.direction = 'outbound'
      AND COALESCE(m.is_auto_reply, false) = false AND m.created_at > s.last_inbound_at)
UNION ALL
SELECT NULL::uuid, s.id, 'unassigned', 1::bigint, NULL::numeric, s.last_inbound_at
FROM snapshot s WHERE s.assigned_to IS NULL AND s.claimed_at IS NULL
$$;
REVOKE EXECUTE ON FUNCTION public._agent_perf_rows(uuid, timestamptz, timestamptz, uuid, boolean) FROM PUBLIC, anon, authenticated;

-- Can this person see every agent's numbers?
CREATE OR REPLACE FUNCTION public.can_view_all_agent_reports(p_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL
    AND public.is_tenant_member(auth.uid(), p_tenant_id)
    AND lower(COALESCE(public.get_user_role_name(p_tenant_id, auth.uid()), '')) IN ('owner', 'admin', 'manager')
$$;

-- 3. Report: per-agent figures + workspace totals
CREATE OR REPLACE FUNCTION public.agent_performance_report(
  p_tenant_id uuid, p_start timestamptz, p_end timestamptz,
  p_phone_number_id uuid DEFAULT NULL, p_agent_id uuid DEFAULT NULL,
  p_today_start timestamptz DEFAULT NULL, p_yesterday_start timestamptz DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_all boolean;
  v_agent uuid;
  v_recent_start timestamptz;
  v_result jsonb;
BEGIN
  IF v_uid IS NULL OR NOT public.is_tenant_member(v_uid, p_tenant_id) THEN
    RAISE EXCEPTION 'Not a member of this workspace' USING ERRCODE = '42501';
  END IF;
  IF p_start IS NULL OR p_end IS NULL OR p_end <= p_start OR p_end - p_start > interval '400 days' THEN
    RAISE EXCEPTION 'Pick a date range of up to 400 days' USING ERRCODE = '22023';
  END IF;
  IF p_phone_number_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.phone_numbers WHERE id = p_phone_number_id AND tenant_id = p_tenant_id) THEN
    RAISE EXCEPTION 'Unknown WhatsApp number' USING ERRCODE = '22023';
  END IF;

  v_all := public.can_view_all_agent_reports(p_tenant_id);
  v_agent := CASE WHEN v_all THEN p_agent_id ELSE v_uid END;
  v_recent_start := LEAST(COALESCE(p_yesterday_start, now() - interval '24 hours'), now() - interval '24 hours');

  WITH r AS (
    SELECT * FROM public._agent_perf_rows(p_tenant_id, p_start, p_end, p_phone_number_id, true)
  ),
  recent AS (
    SELECT * FROM public._agent_perf_rows(p_tenant_id, v_recent_start, now(), p_phone_number_id, false)
    WHERE metric = 'new_assigned'
  ),
  members AS (
    SELECT tm.user_id AS id,
      COALESCE(NULLIF(a.display_name, ''), NULLIF(p.full_name, ''), p.email) AS name,
      p.email, p.avatar_url, COALESCE(a.is_online, false) AS is_online, a.last_active_at,
      COALESCE(a.is_active, true) AS is_active
    FROM public.tenant_members tm
    JOIN public.profiles p ON p.id = tm.user_id
    LEFT JOIN public.agents a ON a.tenant_id = tm.tenant_id AND a.user_id = tm.user_id
    WHERE tm.tenant_id = p_tenant_id
  ),
  per AS (
    SELECT r.agent_id,
      count(*) FILTER (WHERE metric = 'new_assigned') AS new_assigned,
      count(*) FILTER (WHERE metric = 'new_by_customer') AS new_by_customer,
      count(*) FILTER (WHERE metric = 'new_by_agent') AS new_by_agent,
      count(*) FILTER (WHERE metric = 'new_handled') AS new_handled,
      count(*) FILTER (WHERE metric = 'existing_handled') AS existing_handled,
      COALESCE(sum(n) FILTER (WHERE metric IN ('new_handled', 'existing_handled')), 0) AS agent_replies,
      count(*) FILTER (WHERE metric = 'customer_replies') AS customer_replies,
      count(*) FILTER (WHERE metric = 'pending') AS pending,
      round(avg(seconds) FILTER (WHERE metric = 'first_response')) AS avg_first_response_seconds,
      count(*) FILTER (WHERE metric = 'first_response') AS first_responses
    FROM r WHERE r.agent_id IS NOT NULL GROUP BY r.agent_id
  ),
  rec AS (
    SELECT recent.agent_id,
      count(*) FILTER (WHERE p_today_start IS NOT NULL AND at >= p_today_start) AS today,
      count(*) FILTER (WHERE p_yesterday_start IS NOT NULL AND p_today_start IS NOT NULL AND at >= p_yesterday_start AND at < p_today_start) AS yesterday,
      count(*) FILTER (WHERE at >= now() - interval '24 hours') AS last_24h
    FROM recent WHERE recent.agent_id IS NOT NULL GROUP BY recent.agent_id
  ),
  rows_out AS (
    SELECT m.id, m.name, m.email, m.avatar_url, m.is_online, m.is_active,
      COALESCE(per.new_assigned, 0) AS new_assigned,
      COALESCE(per.new_by_customer, 0) AS new_by_customer,
      COALESCE(per.new_by_agent, 0) AS new_by_agent,
      COALESCE(per.new_handled, 0) AS new_handled,
      COALESCE(per.existing_handled, 0) AS existing_handled,
      COALESCE(per.new_handled, 0) + COALESCE(per.existing_handled, 0) AS total_handled,
      COALESCE(per.agent_replies, 0) AS agent_replies,
      COALESCE(per.customer_replies, 0) AS customer_replies,
      COALESCE(per.pending, 0) AS pending,
      per.avg_first_response_seconds,
      COALESCE(per.first_responses, 0) AS first_responses,
      COALESCE(rec.today, 0) AS new_today,
      COALESCE(rec.yesterday, 0) AS new_yesterday,
      COALESCE(rec.last_24h, 0) AS new_last_24h,
      GREATEST(m.last_active_at, (
        SELECT max(mm.created_at) FROM public.messages mm
        WHERE mm.tenant_id = p_tenant_id AND mm.sent_by = m.id
      )) AS last_activity
    FROM members m
    LEFT JOIN per ON per.agent_id = m.id
    LEFT JOIN rec ON rec.agent_id = m.id
    WHERE (v_agent IS NULL OR m.id = v_agent)
  ),
  scoped AS (
    SELECT * FROM r WHERE v_agent IS NULL OR r.agent_id = v_agent OR r.metric = 'unassigned'
  )
  SELECT jsonb_build_object(
    'can_view_all', v_all,
    'agent_id', v_agent,
    'agents', COALESCE((
      SELECT jsonb_agg(to_jsonb(x) ORDER BY x.total_handled DESC, x.new_assigned DESC, x.name)
      FROM rows_out x
      WHERE x.is_active OR x.total_handled > 0 OR x.new_assigned > 0 OR x.pending > 0
    ), '[]'::jsonb),
    'totals', jsonb_build_object(
      'new_total', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'new_assigned'),
      'new_unassigned', CASE WHEN v_agent IS NULL THEN (SELECT count(*) FROM r WHERE metric = 'new_assigned' AND agent_id IS NULL) ELSE 0 END,
      'new_by_customer', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'new_by_customer'),
      'new_by_agent', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'new_by_agent'),
      'new_handled', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'new_handled'),
      'existing_handled', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'existing_handled'),
      'total_handled', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric IN ('new_handled', 'existing_handled')),
      'agent_replies', (SELECT COALESCE(sum(n), 0) FROM scoped WHERE metric IN ('new_handled', 'existing_handled')),
      'customer_replies', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'customer_replies'),
      'pending', (SELECT count(DISTINCT conversation_id) FROM scoped WHERE metric = 'pending'),
      'unassigned', (SELECT count(*) FROM r WHERE metric = 'unassigned'),
      'avg_first_response_seconds', (SELECT round(avg(seconds)) FROM scoped WHERE metric = 'first_response')
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.agent_performance_report(uuid, timestamptz, timestamptz, uuid, uuid, timestamptz, timestamptz) TO authenticated;

-- 4. Drill-down: the exact chats behind a number
CREATE OR REPLACE FUNCTION public.agent_performance_conversations(
  p_tenant_id uuid, p_start timestamptz, p_end timestamptz, p_metric text,
  p_phone_number_id uuid DEFAULT NULL, p_agent_id uuid DEFAULT NULL,
  p_unassigned_only boolean DEFAULT false, p_limit integer DEFAULT 200)
RETURNS TABLE(
  conversation_id uuid, contact_id uuid, contact_name text, contact_wa_id text,
  phone_number_id uuid, status text, created_at timestamptz,
  assigned_to uuid, assigned_name text, assigned_at timestamptz,
  credited_agent_id uuid, credited_agent_name text,
  last_inbound_at timestamptz, last_message_at timestamptz,
  agent_messages bigint, first_response_seconds numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_all boolean;
  v_agent uuid;
  v_metrics text[];
BEGIN
  IF v_uid IS NULL OR NOT public.is_tenant_member(v_uid, p_tenant_id) THEN
    RAISE EXCEPTION 'Not a member of this workspace' USING ERRCODE = '42501';
  END IF;
  IF p_start IS NULL OR p_end IS NULL OR p_end <= p_start OR p_end - p_start > interval '400 days' THEN
    RAISE EXCEPTION 'Pick a date range of up to 400 days' USING ERRCODE = '22023';
  END IF;

  v_metrics := CASE p_metric
    WHEN 'total_handled' THEN ARRAY['new_handled', 'existing_handled']
    WHEN 'agent_replies' THEN ARRAY['new_handled', 'existing_handled']
    WHEN 'first_response' THEN ARRAY['first_response']
    WHEN 'new_total' THEN ARRAY['new_assigned']
    ELSE ARRAY[p_metric] END;

  v_all := public.can_view_all_agent_reports(p_tenant_id);
  v_agent := CASE WHEN v_all THEN p_agent_id ELSE v_uid END;

  RETURN QUERY
  WITH r AS (
    SELECT * FROM public._agent_perf_rows(p_tenant_id, p_start, p_end, p_phone_number_id,
      p_metric IN ('pending', 'unassigned'))
    WHERE metric = ANY (v_metrics)
  ),
  f AS (
    SELECT r.conversation_id AS cid,
      (array_agg(r.agent_id ORDER BY r.n DESC NULLS LAST))[1] AS credited,
      sum(r.n) FILTER (WHERE r.metric IN ('new_handled', 'existing_handled')) AS msgs,
      max(r.seconds) AS secs
    FROM r
    WHERE CASE
      WHEN p_metric = 'unassigned' THEN true
      WHEN p_unassigned_only THEN r.agent_id IS NULL
      WHEN v_agent IS NOT NULL THEN r.agent_id = v_agent
      ELSE true END
    GROUP BY r.conversation_id
  )
  SELECT c.id, ct.id, ct.name, ct.wa_id, c.phone_number_id, c.status::text, c.created_at,
    c.assigned_to, COALESCE(NULLIF(pa.full_name, ''), pa.email), c.assigned_at,
    f.credited, COALESCE(NULLIF(pc.full_name, ''), pc.email),
    c.last_inbound_at, c.last_message_at, COALESCE(f.msgs, 0)::bigint, f.secs
  FROM f
  JOIN public.conversations c ON c.id = f.cid AND c.tenant_id = p_tenant_id
  LEFT JOIN public.contacts ct ON ct.id = c.contact_id
  LEFT JOIN public.profiles pa ON pa.id = c.assigned_to
  LEFT JOIN public.profiles pc ON pc.id = f.credited
  ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 1000);
END;
$$;
GRANT EXECUTE ON FUNCTION public.agent_performance_conversations(uuid, timestamptz, timestamptz, text, uuid, uuid, boolean, integer) TO authenticated;
