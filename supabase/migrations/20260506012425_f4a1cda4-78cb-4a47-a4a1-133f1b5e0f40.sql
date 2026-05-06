CREATE TABLE public.tiktok_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tiktok_connection_id uuid REFERENCES public.tiktok_connections(id) ON DELETE SET NULL,
  sync_setting_id uuid REFERENCES public.tiktok_lead_sync_settings(id) ON DELETE SET NULL,
  tiktok_lead_id text NOT NULL,
  advertiser_id text NOT NULL,
  form_id text NOT NULL,
  form_name text,
  campaign_name text,
  ad_name text,
  name text,
  phone text,
  email text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  crm_contact_id uuid,
  whatsapp_message_id text,
  message_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, tiktok_lead_id)
);

CREATE INDEX idx_tiktok_leads_workspace ON public.tiktok_leads(workspace_id, synced_at DESC);
CREATE INDEX idx_tiktok_leads_setting ON public.tiktok_leads(sync_setting_id);
CREATE INDEX idx_tiktok_leads_status ON public.tiktok_leads(workspace_id, message_status);

ALTER TABLE public.tiktok_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view tiktok_leads"
  ON public.tiktok_leads FOR SELECT
  USING (public.is_tenant_member(auth.uid(), workspace_id));

CREATE TABLE public.tiktok_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sync_setting_id uuid REFERENCES public.tiktok_lead_sync_settings(id) ON DELETE SET NULL,
  status text NOT NULL,
  message text,
  error_details jsonb,
  leads_fetched int NOT NULL DEFAULT 0,
  leads_created int NOT NULL DEFAULT 0,
  messages_sent int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tiktok_sync_logs_workspace ON public.tiktok_sync_logs(workspace_id, created_at DESC);

ALTER TABLE public.tiktok_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view tiktok_sync_logs"
  ON public.tiktok_sync_logs FOR SELECT
  USING (public.is_tenant_member(auth.uid(), workspace_id));

ALTER TABLE public.tiktok_lead_sync_settings
  ADD COLUMN IF NOT EXISTS last_sync_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_sync_status text,
  ADD COLUMN IF NOT EXISTS last_sync_error text;