
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
    c.assigned_to,
    COALESCE(NULLIF(aa.display_name, ''), NULLIF(pa.full_name, ''), pa.email),
    c.assigned_at,
    f.credited,
    COALESCE(NULLIF(ac.display_name, ''), NULLIF(pc.full_name, ''), pc.email),
    c.last_inbound_at, c.last_message_at, COALESCE(f.msgs, 0)::bigint, f.secs
  FROM f
  JOIN public.conversations c ON c.id = f.cid AND c.tenant_id = p_tenant_id
  LEFT JOIN public.contacts ct ON ct.id = c.contact_id
  LEFT JOIN public.profiles pa ON pa.id = c.assigned_to
  LEFT JOIN public.agents aa ON aa.tenant_id = p_tenant_id AND aa.user_id = c.assigned_to
  LEFT JOIN public.profiles pc ON pc.id = f.credited
  LEFT JOIN public.agents ac ON ac.tenant_id = p_tenant_id AND ac.user_id = f.credited
  ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 1000);
END;
$$;
GRANT EXECUTE ON FUNCTION public.agent_performance_conversations(uuid, timestamptz, timestamptz, text, uuid, uuid, boolean, integer) TO authenticated;
