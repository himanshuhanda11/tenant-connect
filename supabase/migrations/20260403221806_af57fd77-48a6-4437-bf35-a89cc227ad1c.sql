
DROP FUNCTION IF EXISTS public.inbox_agent_performance(uuid);

CREATE OR REPLACE FUNCTION public.inbox_agent_performance(p_tenant_id uuid)
RETURNS TABLE(
  agent_id uuid,
  agent_name text,
  assigned_count bigint,
  converted_count bigint,
  pending_count bigint,
  overdue_count bigint,
  today_opened bigint,
  today_replied bigint,
  total_today_assigned bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tz text;
  v_today_start timestamptz;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN;
  END IF;

  SELECT COALESCE(timezone, 'UTC') INTO v_tz FROM tenants WHERE id = p_tenant_id;
  v_today_start := date_trunc('day', now() AT TIME ZONE v_tz) AT TIME ZONE v_tz;

  RETURN QUERY
  SELECT 
    p.id AS agent_id,
    COALESCE(p.full_name, p.email)::text AS agent_name,
    COUNT(c.id) AS assigned_count,
    COUNT(c.id) FILTER (WHERE c.crm_status = 'converted') AS converted_count,
    COUNT(c.id) FILTER (WHERE c.crm_status NOT IN ('converted', 'junk', 'not_interested')) AS pending_count,
    COUNT(c.id) FILTER (WHERE c.next_followup_at IS NOT NULL AND c.next_followup_at < now() AND c.crm_status NOT IN ('converted', 'junk', 'not_interested')) AS overdue_count,
    COUNT(c.id) FILTER (WHERE c.last_opened_by = p.id AND c.last_opened_at >= v_today_start) AS today_opened,
    (SELECT COUNT(*) FROM messages m WHERE m.tenant_id = p_tenant_id AND m.sender_id = p.id AND m.direction = 'outbound' AND m.created_at >= v_today_start AND m.is_auto_reply = false)::bigint AS today_replied,
    COUNT(c.id) FILTER (WHERE c.assigned_to = p.id AND c.created_at >= v_today_start) AS total_today_assigned
  FROM profiles p
  JOIN tenant_members tm ON tm.user_id = p.id AND tm.tenant_id = p_tenant_id
  LEFT JOIN conversations c ON c.assigned_to = p.id AND c.tenant_id = p_tenant_id
  GROUP BY p.id, p.full_name, p.email
  ORDER BY assigned_count DESC;
END;
$$;
