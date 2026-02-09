
-- Fix RLS policies for smeksh_meta_ad_accounts
DROP POLICY IF EXISTS "Users can manage meta ad accounts in their workspace" ON public.smeksh_meta_ad_accounts;

CREATE POLICY "Users can select meta ad accounts"
ON public.smeksh_meta_ad_accounts FOR SELECT
USING (is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Users can insert meta ad accounts"
ON public.smeksh_meta_ad_accounts FOR INSERT
WITH CHECK (is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Users can update meta ad accounts"
ON public.smeksh_meta_ad_accounts FOR UPDATE
USING (is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Users can delete meta ad accounts"
ON public.smeksh_meta_ad_accounts FOR DELETE
USING (is_tenant_member(auth.uid(), workspace_id));
