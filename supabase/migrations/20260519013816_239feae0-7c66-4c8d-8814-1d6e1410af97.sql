CREATE OR REPLACE FUNCTION public.get_broadcast_recipient_limit(p_tenant_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_plan text;
BEGIN
  SELECT COALESCE(plan, 'free') INTO v_plan
  FROM public.workspace_entitlements
  WHERE workspace_id = p_tenant_id;

  RETURN CASE COALESCE(v_plan, 'free')
    WHEN 'free' THEN 1000000
    WHEN 'basic' THEN 5000
    WHEN 'pro' THEN 50000
    WHEN 'business' THEN 1000000
    ELSE 1000000
  END;
END;
$function$;