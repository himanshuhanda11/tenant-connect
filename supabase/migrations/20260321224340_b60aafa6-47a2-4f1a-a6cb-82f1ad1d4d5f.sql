
-- Cart recovery rules
CREATE TABLE IF NOT EXISTS public.shopify_cart_recovery_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  trigger_type text NOT NULL CHECK (trigger_type IN ('cart_abandoned', 'checkout_abandoned', 'high_value_cart', 'repeat_abandoner', 'returning_visitor')),
  conditions jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '[]',
  delay_minutes integer NOT NULL DEFAULT 30,
  max_attempts integer NOT NULL DEFAULT 3,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'none')),
  discount_value numeric DEFAULT 0,
  discount_code text,
  min_cart_value numeric DEFAULT 0,
  priority integer NOT NULL DEFAULT 0,
  stats_triggered integer NOT NULL DEFAULT 0,
  stats_recovered integer NOT NULL DEFAULT 0,
  stats_revenue_recovered numeric NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_recovery_rules_tenant ON public.shopify_cart_recovery_rules(tenant_id);
CREATE INDEX idx_cart_recovery_rules_store ON public.shopify_cart_recovery_rules(store_id);

-- Cart recovery logs
CREATE TABLE IF NOT EXISTS public.shopify_cart_recovery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.shopify_cart_recovery_rules(id) ON DELETE SET NULL,
  checkout_id uuid REFERENCES public.shopify_abandoned_checkouts(id) ON DELETE SET NULL,
  customer_email text,
  customer_phone text,
  cart_value numeric,
  action_taken text NOT NULL,
  channel text CHECK (channel IN ('whatsapp', 'chat', 'email', 'popup', 'notification')),
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'clicked', 'recovered', 'expired', 'failed')),
  discount_code_used text,
  recovered_value numeric,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_recovery_logs_tenant ON public.shopify_cart_recovery_logs(tenant_id);
CREATE INDEX idx_cart_recovery_logs_store ON public.shopify_cart_recovery_logs(store_id);
CREATE INDEX idx_cart_recovery_logs_status ON public.shopify_cart_recovery_logs(status);

-- Shopify automation rules (visual builder)
CREATE TABLE IF NOT EXISTS public.shopify_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT false,
  trigger_event text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '[]',
  actions jsonb NOT NULL DEFAULT '[]',
  cooldown_minutes integer DEFAULT 60,
  max_executions_per_contact integer DEFAULT 1,
  stats_executions integer NOT NULL DEFAULT 0,
  stats_conversions integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shopify_automation_rules_tenant ON public.shopify_automation_rules(tenant_id);
CREATE INDEX idx_shopify_automation_rules_store ON public.shopify_automation_rules(store_id);

-- Sales analytics snapshots
CREATE TABLE IF NOT EXISTS public.shopify_sales_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  total_conversations integer DEFAULT 0,
  chat_to_cart integer DEFAULT 0,
  cart_to_purchase integer DEFAULT 0,
  carts_recovered integer DEFAULT 0,
  revenue_from_chat numeric DEFAULT 0,
  revenue_recovered numeric DEFAULT 0,
  ai_resolved integer DEFAULT 0,
  agent_resolved integer DEFAULT 0,
  avg_response_minutes numeric DEFAULT 0,
  top_products jsonb DEFAULT '[]',
  top_agents jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, snapshot_date)
);

CREATE INDEX idx_shopify_sales_analytics_store ON public.shopify_sales_analytics(store_id);

-- RLS
ALTER TABLE public.shopify_cart_recovery_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_cart_recovery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_sales_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON public.shopify_cart_recovery_rules
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation" ON public.shopify_cart_recovery_logs
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation" ON public.shopify_automation_rules
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation" ON public.shopify_sales_analytics
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));
