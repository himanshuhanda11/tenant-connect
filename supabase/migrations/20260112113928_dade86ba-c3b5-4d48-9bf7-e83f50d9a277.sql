
-- Fix tenant_members RLS circular dependency
-- Users should be able to SELECT their own memberships directly by user_id

DROP POLICY IF EXISTS "tenant_members_select_if_member" ON public.tenant_members;

-- Allow users to see their own memberships (by user_id) 
-- This avoids circular dependency since we check user_id directly, not via is_tenant_member()
CREATE POLICY "tenant_members_select_own"
ON public.tenant_members FOR SELECT
USING (user_id = auth.uid());

-- Also allow seeing other members in tenants they belong to (for team page)
-- This uses a direct subquery instead of is_tenant_member to avoid recursion
CREATE POLICY "tenant_members_select_same_tenant"
ON public.tenant_members FOR SELECT
USING (
  tenant_id IN (
    SELECT tm.tenant_id 
    FROM public.tenant_members tm 
    WHERE tm.user_id = auth.uid()
  )
);
