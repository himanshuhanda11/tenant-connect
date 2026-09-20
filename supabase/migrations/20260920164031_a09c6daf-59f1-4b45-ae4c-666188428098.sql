CREATE OR REPLACE FUNCTION public.my_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.my_agent_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ur.tenant_id
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() AND r.base_role = 'agent'
  UNION
  SELECT tm.tenant_id
  FROM public.tenant_members tm
  WHERE tm.user_id = auth.uid()
    AND tm.role::text = 'agent'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur2
      WHERE ur2.user_id = tm.user_id AND ur2.tenant_id = tm.tenant_id
    )
$$;

GRANT EXECUTE ON FUNCTION public.my_tenant_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_agent_tenant_ids() TO authenticated;

DROP POLICY IF EXISTS conversations_select_member ON public.conversations;

CREATE POLICY conversations_select_member
ON public.conversations
FOR SELECT
USING (
  tenant_id IN (SELECT public.my_tenant_ids())
  AND (
    tenant_id NOT IN (SELECT public.my_agent_tenant_ids())
    OR assigned_to = auth.uid()
    OR claimed_by = auth.uid()
  )
);