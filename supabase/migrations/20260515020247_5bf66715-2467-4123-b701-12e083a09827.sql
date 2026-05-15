CREATE OR REPLACE FUNCTION public.get_user_role_name(p_tenant_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (
      SELECT r.base_role
      FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.tenant_id = p_tenant_id
        AND ur.user_id = p_user_id
      LIMIT 1
    ),
    (
      SELECT tm.role::text
      FROM public.tenant_members tm
      WHERE tm.tenant_id = p_tenant_id
        AND tm.user_id = p_user_id
      LIMIT 1
    )
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_agent_role(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.get_user_role_name(p_tenant_id, auth.uid()) = 'agent', false)
$function$;