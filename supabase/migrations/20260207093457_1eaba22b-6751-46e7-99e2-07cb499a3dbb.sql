
-- 1) Platform Plans (source of truth for pricing)
CREATE TABLE IF NOT EXISTS public.platform_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text,
  price_monthly integer NOT NULL DEFAULT 0,
  price_yearly integer,
  is_custom boolean DEFAULT false,
  highlight boolean DEFAULT false,
  badge text,
  limits jsonb NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '[]',
  addons jsonb NOT NULL DEFAULT '[]',
  restrictions jsonb DEFAULT '[]',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2) Workspace Entitlements (computed snapshot for FAST checks)
CREATE TABLE IF NOT EXISTS public.workspace_entitlements (
  workspace_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.platform_plans(id) DEFAULT 'free',
  limits jsonb NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz DEFAULT now()
);

-- 3) Workspace Add-ons
CREATE TABLE IF NOT EXISTS public.workspace_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  addon_key text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price_per_unit integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_addons_workspace ON public.workspace_addons(workspace_id);

-- RLS
ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_addons ENABLE ROW LEVEL SECURITY;

-- Platform plans are readable by everyone (public pricing)
CREATE POLICY "Anyone can read platform plans"
ON public.platform_plans FOR SELECT USING (true);

-- Entitlements: workspace members can read
CREATE POLICY "Members can read workspace entitlements"
ON public.workspace_entitlements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_entitlements.workspace_id
      AND tm.user_id = auth.uid()
  )
);

-- Addons: workspace members can read
CREATE POLICY "Members can read workspace addons"
ON public.workspace_addons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_addons.workspace_id
      AND tm.user_id = auth.uid()
  )
);

-- Seed platform plans
INSERT INTO public.platform_plans (id, name, tagline, price_monthly, price_yearly, is_custom, highlight, badge, limits, features, addons, restrictions, sort_order)
VALUES
  ('free', 'Free', 'Get started with WhatsApp', 0, 0, false, false, NULL,
   '{"team_members":1,"phone_numbers":1,"contacts":1000,"tags":10,"custom_attributes":10,"flows":0,"autoforms":0,"automations":0,"ai_features":"preview"}',
   '["Official WhatsApp Business API connection","Basic inbox (single owner)","Create & submit message templates","Manual replies","Limited campaigns","Basic analytics"]',
   '[]',
   '["No team members","No flows or automations","No AutoForms","No AI automation"]',
   1),
  ('basic', 'Basic', 'For small teams starting WhatsApp marketing', 1499, 14390, false, false, NULL,
   '{"team_members":5,"phone_numbers":1,"contacts":10000,"tags":10,"custom_attributes":30,"flows":3,"autoforms":3,"automations":10,"ai_features":"basic"}',
   '["Shared team inbox","Round-robin & manual assignment","3 WhatsApp Flows","3 WhatsApp AutoForms","Webhook & Zapier integration","Basic AI replies & template validation","Campaign scheduling"]',
   '["extra_team_members","extra_tags","extra_flows","extra_autoforms"]',
   NULL,
   2),
  ('pro', 'Pro', 'Automation + AI powered growth', 3499, 33590, false, true, 'Most Popular',
   '{"team_members":10,"phone_numbers":1,"contacts":50000,"tags":50,"custom_attributes":100,"flows":20,"autoforms":25,"automations":200,"ai_features":"full"}',
   '["Advanced inbox with SLA & priority routing","20 automation flows","AutoForms with CRM sync","AI inbox assist & summaries","AI insights & recommendations","AI template validator + auto-category","Meta Ads (CTWA) attribution","Shopify, WooCommerce, Razorpay integrations"]',
   '["extra_team_members","extra_phone_numbers","extra_flows","extra_ai_credits"]',
   NULL,
   3),
  ('business', 'Business', 'Scale securely with full control', 0, 0, true, false, NULL,
   '{"team_members":25,"phone_numbers":1,"contacts":"unlimited","tags":"unlimited","custom_attributes":"unlimited","flows":"unlimited","autoforms":"unlimited","automations":"unlimited","ai_features":"enterprise"}',
   '["Unlimited automations & AutoForms","AI Agent Mode (auto-resolve + auto-qualify)","Audit logs & approval workflows","Advanced role permissions","Webhook replay & debugging","Anti-ban guardrails","Dedicated success manager","Priority SLA support"]',
   '["custom_team_members","custom_ai_credits","dedicated_infrastructure"]',
   NULL,
   4)
ON CONFLICT (id) DO NOTHING;

-- Compute entitlements function
CREATE OR REPLACE FUNCTION public.compute_workspace_entitlements(p_workspace_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan_id text;
  v_limits jsonb;
  v_features jsonb;
  v_addons record;
  v_team_extra int := 0;
  v_tags_extra int := 0;
  v_flows_extra int := 0;
BEGIN
  SELECT s.plan_id INTO v_plan_id
  FROM public.subscriptions s
  WHERE s.tenant_id = p_workspace_id AND s.status = 'active'
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    v_plan_id := 'free';
  END IF;

  -- Map old plan IDs to new platform_plans IDs
  IF v_plan_id LIKE 'plan_%' THEN
    v_plan_id := replace(v_plan_id, 'plan_', '');
  END IF;

  SELECT pp.limits, pp.features INTO v_limits, v_features
  FROM public.platform_plans pp WHERE pp.id = v_plan_id;

  IF v_limits IS NULL THEN
    SELECT pp.limits, pp.features INTO v_limits, v_features
    FROM public.platform_plans pp WHERE pp.id = 'free';
    v_plan_id := 'free';
  END IF;

  -- Sum addon quantities
  FOR v_addons IN
    SELECT addon_key, sum(quantity) AS qty
    FROM public.workspace_addons
    WHERE workspace_id = p_workspace_id AND status = 'active'
    GROUP BY addon_key
  LOOP
    IF v_addons.addon_key = 'extra_team_members' THEN v_team_extra := v_addons.qty * 5; END IF;
    IF v_addons.addon_key = 'extra_tags' THEN v_tags_extra := v_addons.qty * 50; END IF;
    IF v_addons.addon_key = 'extra_flows' THEN v_flows_extra := v_addons.qty * 10; END IF;
  END LOOP;

  IF (v_limits->>'team_members') ~ '^[0-9]+$' THEN
    v_limits := jsonb_set(v_limits, '{team_members}', to_jsonb((v_limits->>'team_members')::int + v_team_extra), true);
  END IF;
  IF (v_limits->>'tags') ~ '^[0-9]+$' THEN
    v_limits := jsonb_set(v_limits, '{tags}', to_jsonb((v_limits->>'tags')::int + v_tags_extra), true);
  END IF;
  IF (v_limits->>'flows') ~ '^[0-9]+$' THEN
    v_limits := jsonb_set(v_limits, '{flows}', to_jsonb((v_limits->>'flows')::int + v_flows_extra), true);
  END IF;

  INSERT INTO public.workspace_entitlements(workspace_id, plan_id, limits, features)
  VALUES (p_workspace_id, v_plan_id, v_limits, v_features)
  ON CONFLICT (workspace_id) DO UPDATE
    SET plan_id = EXCLUDED.plan_id,
        limits = EXCLUDED.limits,
        features = EXCLUDED.features,
        computed_at = now();
END;
$$;
