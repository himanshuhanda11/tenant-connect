
-- =====================================================
-- Meta Lead Forms & Automation Schema
-- =====================================================

-- 1) meta_lead_forms: synced from Meta via Graph API
CREATE TABLE public.meta_lead_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  page_name TEXT,
  form_id TEXT NOT NULL,
  form_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_webhook_subscribed BOOLEAN NOT NULL DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  last_lead_at TIMESTAMPTZ,
  lead_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, form_id)
);

ALTER TABLE public.meta_lead_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view lead forms"
  ON public.meta_lead_forms FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can insert lead forms"
  ON public.meta_lead_forms FOR INSERT
  WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can update lead forms"
  ON public.meta_lead_forms FOR UPDATE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can delete lead forms"
  ON public.meta_lead_forms FOR DELETE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE TRIGGER set_meta_lead_forms_updated_at
  BEFORE UPDATE ON public.meta_lead_forms
  FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- 2) lead_form_rules: simple automation rules for lead forms
CREATE TABLE public.lead_form_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'meta_leadgen',
  page_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  phone_number_id UUID REFERENCES public.phone_numbers(id),
  reply_mode TEXT NOT NULL DEFAULT 'template' CHECK (reply_mode IN ('template', 'session')),
  template_id UUID REFERENCES public.templates(id),
  field_mapping JSONB NOT NULL DEFAULT '{}',
  flow_id UUID,
  flow_trigger_keyword TEXT,
  assignment_mode TEXT NOT NULL DEFAULT 'round_robin' CHECK (assignment_mode IN ('round_robin', 'by_country', 'manual', 'specific_agent')),
  assign_to_user_id UUID,
  assign_to_team_id UUID,
  junk_filter_enabled BOOLEAN NOT NULL DEFAULT true,
  enabled BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_form_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view lead form rules"
  ON public.lead_form_rules FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can manage lead form rules"
  ON public.lead_form_rules FOR INSERT
  WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can update lead form rules"
  ON public.lead_form_rules FOR UPDATE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can delete lead form rules"
  ON public.lead_form_rules FOR DELETE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE TRIGGER set_lead_form_rules_updated_at
  BEFORE UPDATE ON public.lead_form_rules
  FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();

-- 3) lead_events: webhook event log for debugging
CREATE TABLE public.lead_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  form_id TEXT,
  lead_id TEXT,
  page_id TEXT,
  ad_id TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}',
  normalized_data JSONB,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'success', 'failed', 'skipped')),
  error_text TEXT,
  rule_id UUID REFERENCES public.lead_form_rules(id),
  conversation_id UUID,
  contact_id UUID,
  message_id UUID,
  processing_duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view lead events"
  ON public.lead_events FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Service role inserts (from edge functions)
CREATE POLICY "Service role can insert lead events"
  ON public.lead_events FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_lead_events_tenant_created ON public.lead_events (tenant_id, created_at DESC);
CREATE INDEX idx_lead_events_form ON public.lead_events (form_id, created_at DESC);
CREATE INDEX idx_lead_events_status ON public.lead_events (status);

-- 4) webhook_health: track webhook subscription status per page
CREATE TABLE public.meta_webhook_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  page_id TEXT NOT NULL,
  page_name TEXT,
  is_subscribed BOOLEAN NOT NULL DEFAULT false,
  last_event_at TIMESTAMPTZ,
  event_count_24h INTEGER NOT NULL DEFAULT 0,
  failure_count_24h INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  subscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, page_id)
);

ALTER TABLE public.meta_webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view webhook subscriptions"
  ON public.meta_webhook_subscriptions FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can manage webhook subscriptions"
  ON public.meta_webhook_subscriptions FOR ALL
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE TRIGGER set_meta_webhook_subs_updated_at
  BEFORE UPDATE ON public.meta_webhook_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.smeksh_touch_updated_at();
