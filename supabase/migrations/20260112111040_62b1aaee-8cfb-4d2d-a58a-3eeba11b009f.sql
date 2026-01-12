-- STEP 3: Templates, Campaigns & Automation

-- Template status enum
CREATE TYPE template_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED');
CREATE TYPE template_category AS ENUM ('MARKETING', 'UTILITY', 'AUTHENTICATION');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled');

-- Templates table (WhatsApp message templates from Meta)
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  waba_account_id UUID NOT NULL REFERENCES public.waba_accounts(id) ON DELETE CASCADE,
  meta_template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  category template_category NOT NULL DEFAULT 'UTILITY',
  status template_status NOT NULL DEFAULT 'PENDING',
  components_json JSONB NOT NULL DEFAULT '[]',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, meta_template_id)
);

-- Tags for contact segmentation
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Contact tags junction table
CREATE TABLE public.contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_number_id UUID NOT NULL REFERENCES public.phone_numbers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  status campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  target_tags UUID[] DEFAULT '{}',
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  read_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign logs (individual message status per contact)
CREATE TABLE public.campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  status message_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);

-- Automation rules
CREATE TYPE automation_trigger AS ENUM ('new_contact', 'tag_added', 'keyword_received', 'inactivity', 'scheduled');
CREATE TYPE automation_action AS ENUM ('send_template', 'add_tag', 'remove_tag', 'assign_agent', 'webhook');

CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  trigger_type automation_trigger NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_type automation_action NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  execution_count INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STEP 4: Billing & Plans

-- Plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  limits_json JSONB NOT NULL DEFAULT '{
    "max_phone_numbers": 1,
    "max_team_members": 3,
    "monthly_messages": 1000,
    "max_contacts": 500,
    "max_campaigns": 5,
    "features": ["basic_inbox", "basic_templates"]
  }',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'paused');

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage counters (per tenant per month)
CREATE TABLE public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- Format: YYYY-MM
  messages_sent INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  phone_numbers_used INT DEFAULT 0,
  campaigns_created INT DEFAULT 0,
  contacts_added INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, year_month)
);

-- Feature flags per tenant (override plan features)
CREATE TABLE public.tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_key)
);

-- Add suspended status to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX idx_templates_tenant ON public.templates(tenant_id);
CREATE INDEX idx_templates_status ON public.templates(tenant_id, status);
CREATE INDEX idx_tags_tenant ON public.tags(tenant_id);
CREATE INDEX idx_contact_tags_contact ON public.contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag ON public.contact_tags(tag_id);
CREATE INDEX idx_campaigns_tenant ON public.campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(tenant_id, status);
CREATE INDEX idx_campaign_logs_campaign ON public.campaign_logs(campaign_id);
CREATE INDEX idx_campaign_logs_contact ON public.campaign_logs(contact_id);
CREATE INDEX idx_automation_rules_tenant ON public.automation_rules(tenant_id);
CREATE INDEX idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_counters_tenant_month ON public.usage_counters(tenant_id, year_month);
CREATE INDEX idx_tenant_features_tenant ON public.tenant_features(tenant_id);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Users can view templates in their tenant"
ON public.templates FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner/Admin can manage templates"
ON public.templates FOR ALL TO authenticated
USING (has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role, 'admin'::tenant_role]));

-- RLS Policies for tags
CREATE POLICY "Users can view tags in their tenant"
ON public.tags FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Users can manage tags in their tenant"
ON public.tags FOR ALL TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- RLS Policies for contact_tags (via contact)
CREATE POLICY "Users can view contact_tags via contact"
ON public.contact_tags FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.contacts c WHERE c.id = contact_id AND is_tenant_member(auth.uid(), c.tenant_id)
));

CREATE POLICY "Users can manage contact_tags via contact"
ON public.contact_tags FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.contacts c WHERE c.id = contact_id AND is_tenant_member(auth.uid(), c.tenant_id)
));

-- RLS Policies for campaigns
CREATE POLICY "Users can view campaigns in their tenant"
ON public.campaigns FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner/Admin can manage campaigns"
ON public.campaigns FOR ALL TO authenticated
USING (has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role, 'admin'::tenant_role]));

-- RLS Policies for campaign_logs (via campaign)
CREATE POLICY "Users can view campaign_logs via campaign"
ON public.campaign_logs FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND is_tenant_member(auth.uid(), c.tenant_id)
));

CREATE POLICY "System can manage campaign_logs"
ON public.campaign_logs FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND is_tenant_member(auth.uid(), c.tenant_id)
));

-- RLS Policies for automation_rules
CREATE POLICY "Users can view automation_rules in their tenant"
ON public.automation_rules FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner/Admin can manage automation_rules"
ON public.automation_rules FOR ALL TO authenticated
USING (has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role, 'admin'::tenant_role]));

-- RLS Policies for plans (publicly readable)
CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT
USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their tenant subscription"
ON public.subscriptions FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owner can manage subscription"
ON public.subscriptions FOR ALL TO authenticated
USING (has_tenant_role(auth.uid(), tenant_id, ARRAY['owner'::tenant_role]));

-- RLS Policies for usage_counters
CREATE POLICY "Users can view usage in their tenant"
ON public.usage_counters FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- RLS Policies for tenant_features
CREATE POLICY "Users can view features in their tenant"
ON public.tenant_features FOR SELECT TO authenticated
USING (is_tenant_member(auth.uid(), tenant_id));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaign_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.automation_rules TO authenticated;
GRANT SELECT ON TABLE public.plans TO authenticated;
GRANT SELECT ON TABLE public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.usage_counters TO authenticated;
GRANT SELECT ON TABLE public.tenant_features TO authenticated;

-- Update triggers
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_counters_updated_at BEFORE UPDATE ON public.usage_counters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans
INSERT INTO public.plans (name, description, price_monthly, price_yearly, limits_json, sort_order) VALUES
('Free', 'Get started with basic features', 0, 0, '{
  "max_phone_numbers": 1,
  "max_team_members": 2,
  "monthly_messages": 100,
  "max_contacts": 100,
  "max_campaigns": 2,
  "features": ["basic_inbox"]
}', 1),
('Starter', 'For small teams getting started', 29, 290, '{
  "max_phone_numbers": 2,
  "max_team_members": 5,
  "monthly_messages": 1000,
  "max_contacts": 1000,
  "max_campaigns": 10,
  "features": ["basic_inbox", "templates", "campaigns"]
}', 2),
('Professional', 'For growing businesses', 99, 990, '{
  "max_phone_numbers": 5,
  "max_team_members": 15,
  "monthly_messages": 10000,
  "max_contacts": 10000,
  "max_campaigns": 50,
  "features": ["basic_inbox", "templates", "campaigns", "automation", "analytics"]
}', 3),
('Enterprise', 'For large organizations', 299, 2990, '{
  "max_phone_numbers": 20,
  "max_team_members": 50,
  "monthly_messages": 100000,
  "max_contacts": 100000,
  "max_campaigns": -1,
  "features": ["basic_inbox", "templates", "campaigns", "automation", "analytics", "api_access", "priority_support"]
}', 4);

-- Function to get current usage for a tenant
CREATE OR REPLACE FUNCTION public.get_tenant_usage(p_tenant_id UUID)
RETURNS TABLE (
  phone_numbers_count INT,
  team_members_count INT,
  contacts_count INT,
  monthly_messages INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INT FROM phone_numbers WHERE tenant_id = p_tenant_id)::INT,
    (SELECT COUNT(*)::INT FROM tenant_members WHERE tenant_id = p_tenant_id)::INT,
    (SELECT COUNT(*)::INT FROM contacts WHERE tenant_id = p_tenant_id)::INT,
    COALESCE((SELECT messages_sent FROM usage_counters WHERE tenant_id = p_tenant_id AND year_month = current_month), 0)::INT;
END;
$$;

-- Function to check if tenant can perform action based on limits
CREATE OR REPLACE FUNCTION public.check_tenant_limit(p_tenant_id UUID, p_limit_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_limits JSONB;
  current_usage INT;
  limit_value INT;
  current_month TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get plan limits
  SELECT p.limits_json INTO plan_limits
  FROM subscriptions s
  JOIN plans p ON p.id = s.plan_id
  WHERE s.tenant_id = p_tenant_id AND s.status = 'active';
  
  IF plan_limits IS NULL THEN
    -- No active subscription, use free plan limits
    SELECT limits_json INTO plan_limits FROM plans WHERE name = 'Free';
  END IF;
  
  limit_value := (plan_limits->>p_limit_key)::INT;
  
  -- -1 means unlimited
  IF limit_value = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Get current usage based on limit key
  CASE p_limit_key
    WHEN 'max_phone_numbers' THEN
      SELECT COUNT(*) INTO current_usage FROM phone_numbers WHERE tenant_id = p_tenant_id;
    WHEN 'max_team_members' THEN
      SELECT COUNT(*) INTO current_usage FROM tenant_members WHERE tenant_id = p_tenant_id;
    WHEN 'max_contacts' THEN
      SELECT COUNT(*) INTO current_usage FROM contacts WHERE tenant_id = p_tenant_id;
    WHEN 'monthly_messages' THEN
      SELECT COALESCE(messages_sent, 0) INTO current_usage 
      FROM usage_counters WHERE tenant_id = p_tenant_id AND year_month = current_month;
    WHEN 'max_campaigns' THEN
      SELECT COUNT(*) INTO current_usage FROM campaigns WHERE tenant_id = p_tenant_id;
    ELSE
      RETURN TRUE;
  END CASE;
  
  RETURN current_usage < limit_value;
END;
$$;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage(p_tenant_id UUID, p_counter TEXT, p_amount INT DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO usage_counters (tenant_id, year_month)
  VALUES (p_tenant_id, current_month)
  ON CONFLICT (tenant_id, year_month) DO NOTHING;
  
  CASE p_counter
    WHEN 'messages_sent' THEN
      UPDATE usage_counters SET messages_sent = messages_sent + p_amount 
      WHERE tenant_id = p_tenant_id AND year_month = current_month;
    WHEN 'messages_received' THEN
      UPDATE usage_counters SET messages_received = messages_received + p_amount 
      WHERE tenant_id = p_tenant_id AND year_month = current_month;
    WHEN 'campaigns_created' THEN
      UPDATE usage_counters SET campaigns_created = campaigns_created + p_amount 
      WHERE tenant_id = p_tenant_id AND year_month = current_month;
    WHEN 'contacts_added' THEN
      UPDATE usage_counters SET contacts_added = contacts_added + p_amount 
      WHERE tenant_id = p_tenant_id AND year_month = current_month;
  END CASE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tenant_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_tenant_limit(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, TEXT, INT) TO authenticated;