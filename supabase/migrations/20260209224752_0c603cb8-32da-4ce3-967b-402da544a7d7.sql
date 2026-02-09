
-- Drop the existing policy and replace with proper SELECT + INSERT policies
DROP POLICY IF EXISTS "Users can view meta campaigns in their workspace" ON public.smeksh_meta_ad_campaigns;

CREATE POLICY "Users can select meta campaigns in their workspace"
ON public.smeksh_meta_ad_campaigns
FOR SELECT
USING (is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Users can insert meta campaigns in their workspace"
ON public.smeksh_meta_ad_campaigns
FOR INSERT
WITH CHECK (is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Users can update meta campaigns in their workspace"
ON public.smeksh_meta_ad_campaigns
FOR UPDATE
USING (is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Users can delete meta campaigns in their workspace"
ON public.smeksh_meta_ad_campaigns
FOR DELETE
USING (is_tenant_member(auth.uid(), workspace_id));
