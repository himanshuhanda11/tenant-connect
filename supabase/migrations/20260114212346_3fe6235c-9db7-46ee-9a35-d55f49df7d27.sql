-- ===========================================
-- INTEGRATIONS MODULE TABLES
-- ===========================================

-- Integration catalog (available integrations)
CREATE TABLE public.integration_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'shopify', 'zapier', 'razorpay'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'api', 'ecommerce', 'payments', 'crm', 'marketing', 'automation'
  logo_url TEXT,
  auth_type TEXT NOT NULL DEFAULT 'api_key', -- 'api_key', 'oauth', 'webhook'
  setup_time_minutes INTEGER DEFAULT 5,
  documentation_url TEXT,
  supported_events JSONB DEFAULT '[]'::jsonb, -- ['order_created', 'payment_paid']
  is_active BOOLEAN DEFAULT true,
  is_pro_only BOOLEAN DEFAULT false,
  config_schema JSONB, -- JSON schema for required config fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant's connected integrations
CREATE TABLE public.tenant_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_key TEXT NOT NULL REFERENCES public.integration_catalog(key) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'connected', 'error', 'disconnected'
  credentials JSONB, -- encrypted credentials (API keys, tokens)
  config JSONB DEFAULT '{}'::jsonb, -- integration-specific settings
  webhook_url TEXT, -- unique webhook URL for this tenant+integration
  webhook_secret TEXT, -- HMAC secret for signature verification
  last_event_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  health_status TEXT DEFAULT 'unknown', -- 'healthy', 'degraded', 'error', 'unknown'
  connected_by UUID REFERENCES public.profiles(id),
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, integration_key)
);

-- Integration events (webhook logs)
CREATE TABLE public.integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tenant_integration_id UUID NOT NULL REFERENCES public.tenant_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'order_created', 'payment_paid', etc.
  event_id TEXT, -- external event ID for idempotency
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received', -- 'received', 'processing', 'processed', 'failed'
  error_message TEXT,
  processing_started_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event → Action mappings
CREATE TABLE public.event_action_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tenant_integration_id UUID NOT NULL REFERENCES public.tenant_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'order_created', etc.
  action_type TEXT NOT NULL, -- 'send_template', 'trigger_flow', 'assign_agent', 'add_tag'
  action_config JSONB NOT NULL, -- template_id, flow_id, variable mappings
  conditions JSONB, -- conditional routing rules
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- for ordering multiple actions
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_action_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_catalog (readable by all authenticated users)
CREATE POLICY "Anyone can read integration catalog"
  ON public.integration_catalog FOR SELECT
  USING (is_active = true);

-- RLS Policies for tenant_integrations
CREATE POLICY "Users can view their tenant integrations"
  ON public.tenant_integrations FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their tenant integrations"
  ON public.tenant_integrations FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for integration_events
CREATE POLICY "Users can view their integration events"
  ON public.integration_events FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their integration events"
  ON public.integration_events FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for event_action_mappings
CREATE POLICY "Users can view their event mappings"
  ON public.event_action_mappings FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their event mappings"
  ON public.event_action_mappings FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_tenant_integrations_tenant ON public.tenant_integrations(tenant_id);
CREATE INDEX idx_tenant_integrations_status ON public.tenant_integrations(status);
CREATE INDEX idx_integration_events_tenant ON public.integration_events(tenant_id);
CREATE INDEX idx_integration_events_status ON public.integration_events(status);
CREATE INDEX idx_integration_events_created ON public.integration_events(created_at DESC);
CREATE UNIQUE INDEX idx_integration_events_idempotency ON public.integration_events(tenant_integration_id, event_id) WHERE event_id IS NOT NULL;

-- Seed the integration catalog with initial integrations
INSERT INTO public.integration_catalog (key, name, description, category, auth_type, setup_time_minutes, is_pro_only, supported_events) VALUES
  ('api', 'Universal API', 'Build custom integrations with our REST API', 'api', 'api_key', 2, false, '["custom"]'::jsonb),
  ('zapier', 'Zapier', 'Connect with 5,000+ apps through Zapier', 'automation', 'oauth', 3, false, '["trigger", "action"]'::jsonb),
  ('pabbly', 'Pabbly Connect', 'Automate workflows with Pabbly', 'automation', 'webhook', 3, false, '["trigger", "action"]'::jsonb),
  ('integrately', 'Integrately', 'One-click automations for your business', 'automation', 'webhook', 3, false, '["trigger", "action"]'::jsonb),
  ('shopify', 'Shopify', 'Send order updates and cart reminders', 'ecommerce', 'oauth', 5, false, '["order_created", "order_updated", "order_fulfilled", "checkout_abandoned"]'::jsonb),
  ('woocommerce', 'WooCommerce', 'WordPress ecommerce integration', 'ecommerce', 'api_key', 5, false, '["order_created", "order_status_changed", "product_low_stock"]'::jsonb),
  ('opencart', 'OpenCart', 'OpenCart store integration', 'ecommerce', 'api_key', 5, true, '["order_created", "order_updated"]'::jsonb),
  ('razorpay', 'Razorpay', 'Payment notifications and receipts', 'payments', 'webhook', 3, false, '["payment_captured", "payment_failed", "refund_created", "subscription_charged"]'::jsonb),
  ('payu', 'PayU', 'PayU payment gateway integration', 'payments', 'webhook', 3, false, '["payment_success", "payment_failure"]'::jsonb),
  ('webengage', 'WebEngage', 'Customer engagement platform', 'marketing', 'api_key', 5, true, '["segment_entered", "campaign_sent", "journey_triggered"]'::jsonb),
  ('clevertap', 'CleverTap', 'Customer engagement and analytics', 'marketing', 'api_key', 5, true, '["segment_entry", "event_triggered", "campaign_sent"]'::jsonb),
  ('leadsquared', 'LeadSquared', 'Sales CRM and marketing automation', 'crm', 'api_key', 5, false, '["lead_created", "lead_updated", "lead_stage_changed", "task_created"]'::jsonb);

-- Update trigger
CREATE TRIGGER update_tenant_integrations_updated_at
  BEFORE UPDATE ON public.tenant_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_action_mappings_updated_at
  BEFORE UPDATE ON public.event_action_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();