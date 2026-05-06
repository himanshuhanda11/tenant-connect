
CREATE TABLE IF NOT EXISTS public.tiktok_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  connected_by_user_id uuid,
  advertiser_id text NOT NULL,
  advertiser_name text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  status text NOT NULL DEFAULT 'connected',
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, advertiser_id)
);

CREATE INDEX IF NOT EXISTS idx_tiktok_connections_workspace ON public.tiktok_connections(workspace_id);

ALTER TABLE public.tiktok_connections ENABLE ROW LEVEL SECURITY;

-- Safe view exposing connection status WITHOUT tokens
CREATE OR REPLACE VIEW public.tiktok_connections_safe AS
SELECT
  id, workspace_id, connected_by_user_id,
  advertiser_id, advertiser_name,
  token_expires_at, scope, status, last_sync_at,
  created_at, updated_at
FROM public.tiktok_connections;

GRANT SELECT ON public.tiktok_connections_safe TO authenticated;

-- RLS: members can SELECT non-token columns by going through the view (which runs as caller).
-- Policy on base table also allows SELECT for members (needed for the view), but client code MUST use the safe view.
CREATE POLICY "Members can view their workspace tiktok connections"
ON public.tiktok_connections FOR SELECT
TO authenticated
USING (public.is_tenant_member(auth.uid(), workspace_id));

-- Only admins/owners may delete (disconnect)
CREATE POLICY "Admins can disconnect tiktok"
ON public.tiktok_connections FOR DELETE
TO authenticated
USING (public.has_tenant_role(auth.uid(), workspace_id, ARRAY['owner','admin']::tenant_role[]));

-- No INSERT/UPDATE policies for authenticated -> only service role (edge functions) can write tokens.

CREATE TRIGGER trg_tiktok_connections_updated_at
BEFORE UPDATE ON public.tiktok_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
