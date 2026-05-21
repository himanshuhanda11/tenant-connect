
CREATE TABLE public.qr_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  prefilled_message TEXT NOT NULL DEFAULT '',
  cta_text TEXT DEFAULT 'Scan to Chat on WhatsApp',
  qr_link TEXT NOT NULL,
  qr_design_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  qr_image_url TEXT,
  scan_count INTEGER NOT NULL DEFAULT 0,
  lead_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qr_campaigns_tenant ON public.qr_campaigns(tenant_id);
CREATE INDEX idx_qr_campaigns_slug ON public.qr_campaigns(slug);

ALTER TABLE public.qr_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view qr campaigns"
  ON public.qr_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = qr_campaigns.tenant_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read active qr campaigns by slug"
  ON public.qr_campaigns FOR SELECT
  USING (status = 'active');

CREATE POLICY "Workspace members can create qr campaigns"
  ON public.qr_campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = qr_campaigns.tenant_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update qr campaigns"
  ON public.qr_campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = qr_campaigns.tenant_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete qr campaigns"
  ON public.qr_campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = qr_campaigns.tenant_id AND tm.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_qr_campaigns_updated_at
  BEFORE UPDATE ON public.qr_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.qr_scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_campaign_id UUID NOT NULL REFERENCES public.qr_campaigns(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  device_type TEXT,
  browser TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qr_scan_events_campaign ON public.qr_scan_events(qr_campaign_id);
CREATE INDEX idx_qr_scan_events_created ON public.qr_scan_events(created_at);

ALTER TABLE public.qr_scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert qr scan events"
  ON public.qr_scan_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Workspace members can view their qr scan events"
  ON public.qr_scan_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = qr_scan_events.tenant_id AND tm.user_id = auth.uid()
    )
  );
