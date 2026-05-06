
-- Instagram accounts (per workspace)
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instagram_user_id text NOT NULL,
  ig_username text,
  ig_name text,
  profile_picture_url text,
  followers_count integer,
  facebook_page_id text,
  facebook_page_name text,
  facebook_user_id text,
  status text NOT NULL DEFAULT 'connected', -- connected|expired|permission_issue|webhook_inactive|disconnected
  health_status text NOT NULL DEFAULT 'healthy',
  last_error text,
  scopes text[] DEFAULT '{}',
  connected_by uuid REFERENCES auth.users(id),
  connected_at timestamptz NOT NULL DEFAULT now(),
  last_synced_at timestamptz,
  webhook_subscribed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, instagram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_accounts_tenant ON public.instagram_accounts(tenant_id);

ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can view their workspace instagram"
ON public.instagram_accounts FOR SELECT
USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "owners/admins can manage instagram"
ON public.instagram_accounts FOR ALL
USING (public.has_tenant_role(auth.uid(), tenant_id, ARRAY['owner','admin']::tenant_role[]))
WITH CHECK (public.has_tenant_role(auth.uid(), tenant_id, ARRAY['owner','admin']::tenant_role[]));

-- Instagram tokens (service-role only)
CREATE TABLE IF NOT EXISTS public.instagram_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instagram_account_id uuid NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  page_access_token text,
  token_type text DEFAULT 'long_lived',
  expires_at timestamptz,
  refreshed_at timestamptz,
  refresh_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(instagram_account_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_tokens_tenant ON public.instagram_tokens(tenant_id);
CREATE INDEX IF NOT EXISTS idx_instagram_tokens_expires ON public.instagram_tokens(expires_at);

ALTER TABLE public.instagram_tokens ENABLE ROW LEVEL SECURITY;
-- No policies = no client access; only service role bypasses RLS.

-- OAuth state for CSRF protection (10 min TTL)
CREATE TABLE IF NOT EXISTS public.instagram_oauth_states (
  state text PRIMARY KEY,
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE public.instagram_oauth_states ENABLE ROW LEVEL SECURITY;
-- Service-role only.

-- updated_at triggers
CREATE TRIGGER instagram_accounts_updated_at
BEFORE UPDATE ON public.instagram_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER instagram_tokens_updated_at
BEFORE UPDATE ON public.instagram_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
