
CREATE OR REPLACE FUNCTION public.inbox_crm_dashboard_stats(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_tz text;
  v_now timestamptz;
  v_today_start timestamptz;
  v_month_start timestamptz;
BEGIN
  IF NOT public.is_tenant_member(auth.uid(), p_tenant_id) THEN
    RETURN jsonb_build_object('error', 'forbidden');
  END IF;

  SELECT COALESCE(timezone, 'UTC') INTO v_tz FROM tenants WHERE id = p_tenant_id;
  
  v_now := now();
  v_today_start := date_trunc('day', v_now AT TIME ZONE v_tz) AT TIME ZONE v_tz;
  v_month_start := date_trunc('month', v_now AT TIME ZONE v_tz) AT TIME ZONE v_tz;

  SELECT jsonb_build_object(
    'new_today', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND crm_status = 'new' AND created_at >= v_today_start),
    'followup_today', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND next_followup_at IS NOT NULL AND (next_followup_at AT TIME ZONE v_tz)::date = (v_now AT TIME ZONE v_tz)::date AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'overdue', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND next_followup_at IS NOT NULL AND next_followup_at < v_now AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'converted_month', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND crm_status = 'converted' AND updated_at >= v_month_start),
    'total_open', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'unassigned', (SELECT COUNT(*) FROM conversations WHERE tenant_id = p_tenant_id AND assigned_to IS NULL AND crm_status NOT IN ('converted', 'junk', 'not_interested')),
    'workspace_timezone', v_tz
  ) INTO v_result;

  RETURN v_result;
END;
$$;
