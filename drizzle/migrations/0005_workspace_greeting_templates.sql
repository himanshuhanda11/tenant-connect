CREATE OR REPLACE FUNCTION public.get_workspace_greeting_templates(_tenant_id uuid)
RETURNS SETOF public.whatsapp_greeting_templates
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.*
  FROM public.whatsapp_greeting_templates g
  WHERE g.tenant_id = _tenant_id
    AND g.is_active = true
    AND public.is_tenant_member(_tenant_id)
    AND (
      g.agent_user_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.tenant_members tm
        WHERE tm.tenant_id = _tenant_id
          AND tm.user_id = g.agent_user_id
          AND tm.role IN ('owner', 'admin')
      )
    )
  ORDER BY g.sort_order;
$$;

REVOKE ALL ON FUNCTION public.get_workspace_greeting_templates(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_workspace_greeting_templates(uuid) TO authenticated, service_role;