
-- ============ email_automations ============
CREATE TABLE IF NOT EXISTS public.email_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  trigger jsonb NOT NULL DEFAULT '{}'::jsonb,
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  run_count integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_autom_tenant ON public.email_automations(tenant_id, is_active);

DROP POLICY IF EXISTS autom_select ON public.email_automations;
CREATE POLICY autom_select ON public.email_automations FOR SELECT USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS autom_insert ON public.email_automations;
CREATE POLICY autom_insert ON public.email_automations FOR INSERT WITH CHECK (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS autom_update ON public.email_automations;
CREATE POLICY autom_update ON public.email_automations FOR UPDATE USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS autom_delete ON public.email_automations;
CREATE POLICY autom_delete ON public.email_automations FOR DELETE USING (is_tenant_member(tenant_id));

CREATE TRIGGER trg_email_autom_updated
  BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ email_automation_runs ============
CREATE TABLE IF NOT EXISTS public.email_automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  automation_id uuid REFERENCES public.email_automations(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.email_conversations(id) ON DELETE SET NULL,
  message_id uuid REFERENCES public.email_messages(id) ON DELETE SET NULL,
  trigger_type text,
  matched boolean NOT NULL DEFAULT false,
  actions_taken jsonb NOT NULL DEFAULT '[]'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_automation_runs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_autom_runs_tenant ON public.email_automation_runs(tenant_id, created_at DESC);

DROP POLICY IF EXISTS autom_runs_select ON public.email_automation_runs;
CREATE POLICY autom_runs_select ON public.email_automation_runs FOR SELECT USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS autom_runs_insert ON public.email_automation_runs;
CREATE POLICY autom_runs_insert ON public.email_automation_runs FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

-- ============ email_ai_suggestions ============
CREATE TABLE IF NOT EXISTS public.email_ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  content jsonb NOT NULL,
  model text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_sugg_conv ON public.email_ai_suggestions(conversation_id, created_at DESC);

DROP POLICY IF EXISTS ai_sugg_select ON public.email_ai_suggestions;
CREATE POLICY ai_sugg_select ON public.email_ai_suggestions FOR SELECT USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS ai_sugg_insert ON public.email_ai_suggestions;
CREATE POLICY ai_sugg_insert ON public.email_ai_suggestions FOR INSERT WITH CHECK (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS ai_sugg_delete ON public.email_ai_suggestions;
CREATE POLICY ai_sugg_delete ON public.email_ai_suggestions FOR DELETE USING (is_tenant_member(tenant_id));

-- ============ email_sla_policies ============
CREATE TABLE IF NOT EXISTS public.email_sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  first_response_minutes integer NOT NULL DEFAULT 60,
  resolution_minutes integer NOT NULL DEFAULT 1440,
  business_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_sla_policies ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sla_tenant ON public.email_sla_policies(tenant_id);

DROP POLICY IF EXISTS sla_select ON public.email_sla_policies;
CREATE POLICY sla_select ON public.email_sla_policies FOR SELECT USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS sla_insert ON public.email_sla_policies;
CREATE POLICY sla_insert ON public.email_sla_policies FOR INSERT WITH CHECK (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS sla_update ON public.email_sla_policies;
CREATE POLICY sla_update ON public.email_sla_policies FOR UPDATE USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS sla_delete ON public.email_sla_policies;
CREATE POLICY sla_delete ON public.email_sla_policies FOR DELETE USING (is_tenant_member(tenant_id));

CREATE TRIGGER trg_sla_updated
  BEFORE UPDATE ON public.email_sla_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ email_sla_breaches ============
CREATE TABLE IF NOT EXISTS public.email_sla_breaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  conversation_id uuid NOT NULL REFERENCES public.email_conversations(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES public.email_sla_policies(id) ON DELETE SET NULL,
  breach_type text NOT NULL,
  breached_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.email_sla_breaches ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sla_breach_conv ON public.email_sla_breaches(conversation_id);

DROP POLICY IF EXISTS sla_breach_select ON public.email_sla_breaches;
CREATE POLICY sla_breach_select ON public.email_sla_breaches FOR SELECT USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS sla_breach_insert ON public.email_sla_breaches;
CREATE POLICY sla_breach_insert ON public.email_sla_breaches FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

-- ============ email_analytics_daily ============
CREATE TABLE IF NOT EXISTS public.email_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  account_id uuid,
  day date NOT NULL,
  volume_in integer NOT NULL DEFAULT 0,
  volume_out integer NOT NULL DEFAULT 0,
  conversations_new integer NOT NULL DEFAULT 0,
  conversations_resolved integer NOT NULL DEFAULT 0,
  avg_first_response_seconds integer,
  avg_resolution_seconds integer,
  by_agent jsonb NOT NULL DEFAULT '{}'::jsonb,
  by_tag jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, account_id, day)
);
ALTER TABLE public.email_analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_analytics_day ON public.email_analytics_daily(tenant_id, day DESC);

DROP POLICY IF EXISTS analytics_select ON public.email_analytics_daily;
CREATE POLICY analytics_select ON public.email_analytics_daily FOR SELECT USING (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS analytics_insert ON public.email_analytics_daily;
CREATE POLICY analytics_insert ON public.email_analytics_daily FOR INSERT WITH CHECK (is_tenant_member(tenant_id));
DROP POLICY IF EXISTS analytics_update ON public.email_analytics_daily;
CREATE POLICY analytics_update ON public.email_analytics_daily FOR UPDATE USING (is_tenant_member(tenant_id));

CREATE TRIGGER trg_email_analytics_updated
  BEFORE UPDATE ON public.email_analytics_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
