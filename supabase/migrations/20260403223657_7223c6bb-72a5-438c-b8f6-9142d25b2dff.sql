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
SET search_path TO 'public'
AS $function$
DECLARE
  v_tz text;
  v_now timestamptz;
  v_today_start timestamptz;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN;
  END IF;

  SELECT COALESCE(timezone, 'UTC')
  INTO v_tz
  FROM public.tenants
  WHERE id = p_tenant_id;

  v_now := now();
  v_today_start := date_trunc('day', v_now AT TIME ZONE v_tz) AT TIME ZONE v_tz;

  RETURN QUERY
  WITH agent_rows AS (
    SELECT
      p.id AS profile_id,
      p.full_name,
      p.email,
      c.id AS conversation_id,
      c.crm_status,
      c.next_followup_at,
      c.assigned_at,
      c.last_opened_at,
      c.last_opened_by
    FROM public.profiles p
    JOIN public.tenant_members tm
      ON tm.user_id = p.id
     AND tm.tenant_id = p_tenant_id
    LEFT JOIN public.conversations c
      ON c.tenant_id = p_tenant_id
     AND c.assigned_to = p.id
  )
  SELECT
    ar.profile_id AS agent_id,
    COALESCE(ar.full_name, ar.email)::text AS agent_name,
    COUNT(ar.conversation_id) AS assigned_count,
    COUNT(ar.conversation_id) FILTER (WHERE ar.crm_status = 'converted') AS converted_count,
    COUNT(ar.conversation_id) FILTER (
      WHERE ar.crm_status NOT IN ('converted', 'junk', 'not_interested')
    ) AS pending_count,
    COUNT(ar.conversation_id) FILTER (
      WHERE ar.next_followup_at IS NOT NULL
        AND ar.next_followup_at < v_now
        AND ar.crm_status NOT IN ('converted', 'junk', 'not_interested')
    ) AS overdue_count,
    COUNT(ar.conversation_id) FILTER (
      WHERE ar.assigned_at >= v_today_start
        AND ar.last_opened_by = ar.profile_id
        AND ar.last_opened_at >= v_today_start
    ) AS today_opened,
    (
      SELECT COUNT(DISTINCT c2.id)
      FROM public.conversations c2
      JOIN public.messages m
        ON m.conversation_id = c2.id
      WHERE c2.tenant_id = p_tenant_id
        AND c2.assigned_to = ar.profile_id
        AND c2.assigned_at >= v_today_start
        AND m.direction = 'outbound'
        AND COALESCE(m.is_auto_reply, false) = false
        AND m.created_at >= v_today_start
    )::bigint AS today_replied,
    COUNT(ar.conversation_id) FILTER (
      WHERE ar.assigned_at >= v_today_start
    ) AS total_today_assigned
  FROM agent_rows ar
  GROUP BY ar.profile_id, ar.full_name, ar.email
  ORDER BY total_today_assigned DESC, assigned_count DESC, agent_name ASC;
END;
$function$;