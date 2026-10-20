-- 1) Server-only holding table for freshly authorized Facebook tokens (before the admin picks assets)
CREATE TABLE IF NOT EXISTS public.meta_oauth_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  token_expires_at timestamptz,
  meta_user_id text,
  meta_user_name text,
  granted_scopes text[] NOT NULL DEFAULT '{}',
  ad_account_ids text[] NOT NULL DEFAULT '{}',
  page_ids text[] NOT NULL DEFAULT '{}',
  instagram_ids text[] NOT NULL DEFAULT '{}',
  business_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);
CREATE INDEX IF NOT EXISTS idx_meta_oauth_pending_tenant_user ON public.meta_oauth_pending (tenant_id, user_id);
ALTER TABLE public.meta_oauth_pending ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.meta_oauth_pending FROM anon, authenticated;
GRANT ALL ON public.meta_oauth_pending TO service_role;

-- 2) Facebook tokens on connected accounts are server-only: browsers may read/update only non-secret columns
REVOKE ALL ON public.smeksh_meta_ad_accounts FROM anon;
REVOKE SELECT, INSERT, UPDATE ON public.smeksh_meta_ad_accounts FROM authenticated;
GRANT SELECT (
  id, workspace_id, meta_account_id, meta_account_name, meta_user_id, meta_user_name,
  token_expires_at, facebook_page_id, facebook_page_name, whatsapp_phone_number_id,
  whatsapp_display_number, status, last_synced_at, sync_error, is_active, connected_by,
  created_at, updated_at, setup_data, instagram_account_id, instagram_username,
  pixel_id, pixel_name, scopes_granted, business_id, business_name
) ON public.smeksh_meta_ad_accounts TO authenticated;
GRANT UPDATE (
  is_active, status, whatsapp_phone_number_id, whatsapp_display_number,
  pixel_id, pixel_name, updated_at
) ON public.smeksh_meta_ad_accounts TO authenticated;
GRANT DELETE ON public.smeksh_meta_ad_accounts TO authenticated;
GRANT ALL ON public.smeksh_meta_ad_accounts TO service_role;

-- Keep rows inside their own workspace on update
DROP POLICY IF EXISTS "Users can update meta ad accounts" ON public.smeksh_meta_ad_accounts;
CREATE POLICY "Users can update meta ad accounts" ON public.smeksh_meta_ad_accounts
  FOR UPDATE USING (is_tenant_member(auth.uid(), workspace_id))
  WITH CHECK (is_tenant_member(auth.uid(), workspace_id));