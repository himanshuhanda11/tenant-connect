CREATE TABLE public.tiktok_lead_sync_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tiktok_connection_id uuid NOT NULL REFERENCES public.tiktok_connections(id) ON DELETE CASCADE,
  advertiser_id text NOT NULL,
  form_id text NOT NULL,
  form_name text,
  whatsapp_phone_number_id text NOT NULL,
  whatsapp_template_id uuid,
  pipeline_id uuid,
  stage_id uuid,
  assigned_user_id uuid,
  tags text[] DEFAULT '{}'::text[],
  auto_reply_enabled boolean NOT NULL DEFAULT true,
  sync_enabled boolean NOT NULL DEFAULT true,
  sync_frequency_minutes int NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, advertiser_id, form_id)
);

CREATE INDEX idx_tiktok_lead_sync_workspace ON public.tiktok_lead_sync_settings(workspace_id);
CREATE INDEX idx_tiktok_lead_sync_connection ON public.tiktok_lead_sync_settings(tiktok_connection_id);

ALTER TABLE public.tiktok_lead_sync_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view tiktok lead sync settings"
  ON public.tiktok_lead_sync_settings FOR SELECT
  USING (public.is_tenant_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can insert tiktok lead sync settings"
  ON public.tiktok_lead_sync_settings FOR INSERT
  WITH CHECK (public.has_tenant_role(auth.uid(), workspace_id, ARRAY['owner','admin']::tenant_role[]));

CREATE POLICY "Admins can update tiktok lead sync settings"
  ON public.tiktok_lead_sync_settings FOR UPDATE
  USING (public.has_tenant_role(auth.uid(), workspace_id, ARRAY['owner','admin']::tenant_role[]));

CREATE POLICY "Admins can delete tiktok lead sync settings"
  ON public.tiktok_lead_sync_settings FOR DELETE
  USING (public.has_tenant_role(auth.uid(), workspace_id, ARRAY['owner','admin']::tenant_role[]));

CREATE TRIGGER trg_tiktok_lead_sync_updated_at
  BEFORE UPDATE ON public.tiktok_lead_sync_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();