-- Fix tenants INSERT policy to rely on auth.uid() rather than role mapping
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;
CREATE POLICY "Authenticated users can create tenants"
ON public.tenants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix bootstrap logic for first tenant member (previous policy checked globally, not per-tenant)
DROP POLICY IF EXISTS "Owner/Admin can add members" ON public.tenant_members;
CREATE POLICY "Owner/Admin can add members"
ON public.tenant_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- owner/admin can add anyone
  has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role, 'admin'::tenant_role])
  OR (
    -- bootstrap: first member can self-insert (becoming owner) only if no members exist yet for that tenant
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = tenant_id
    )
  )
);