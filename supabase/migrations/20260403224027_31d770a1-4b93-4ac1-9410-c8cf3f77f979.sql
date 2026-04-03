CREATE OR REPLACE FUNCTION public.inbox_sidebar_counts(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN jsonb_build_object('error', 'forbidden');
  END IF;

  SELECT jsonb_build_object(
    'unassigned', (
      SELECT COUNT(*) FROM conversations
      WHERE tenant_id = p_tenant_id
        AND assigned_to IS NULL
        AND status != 'closed'
        AND COALESCE(crm_status, 'new') NOT IN ('junk', 'not_interested')
    ),
    'open', (
      SELECT COUNT(*) FROM conversations
      WHERE tenant_id = p_tenant_id
        AND status != 'closed'
        AND COALESCE(crm_status, 'new') NOT IN ('converted', 'junk', 'not_interested')
    ),
    'follow_up', (
      SELECT COUNT(*) FROM conversations
      WHERE tenant_id = p_tenant_id
        AND next_followup_at IS NOT NULL
        AND status != 'closed'
        AND COALESCE(crm_status, 'new') NOT IN ('converted', 'junk', 'not_interested')
    ),
    'resolved', (
      SELECT COUNT(*) FROM conversations
      WHERE tenant_id = p_tenant_id
        AND (status = 'closed' OR crm_status = 'converted')
    ),
    'spam', (
      SELECT COUNT(*) FROM conversations
      WHERE tenant_id = p_tenant_id
        AND crm_status IN ('junk', 'not_interested')
    )
  ) INTO v_result;

  RETURN v_result;
END;
$function$;