
-- =========================================================
-- 1. feature_catalog: single source of truth for gating
-- =========================================================
CREATE TABLE IF NOT EXISTS public.feature_catalog (
  feature_key text PRIMARY KEY,
  description text NOT NULL,
  min_plan_rank int NOT NULL,
  upgrade_to text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_catalog_read_all" ON public.feature_catalog
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "feature_catalog_super_admin_write" ON public.feature_catalog
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

INSERT INTO public.feature_catalog (feature_key, description, min_plan_rank, upgrade_to) VALUES
  ('send_campaign',         'Send broadcast / bulk campaigns',     1, 'basic'),
  ('connect_whatsapp_number','Connect a WhatsApp Business number', 1, 'basic'),
  ('invite_member',         'Invite team members',                 2, 'pro'),
  ('create_automation',     'Create automation workflows',         2, 'pro'),
  ('ai_reply',              'Use AI auto-reply',                   2, 'pro'),
  ('import_contacts',       'Bulk import contacts',                2, 'pro'),
  ('create_template',       'Submit message templates',            1, 'basic'),
  ('create_integration',    'Connect Shopify / Zapier / etc.',     2, 'pro'),
  ('advanced_reports',      'Advanced analytics & reports',        3, 'business'),
  ('crm_pipeline',          'CRM pipeline & deals',                2, 'pro'),
  ('meta_ads',              'Meta Ads attribution & manager',      3, 'business')
ON CONFLICT (feature_key) DO NOTHING;

-- =========================================================
-- 2. access_denied_log
-- =========================================================
CREATE TABLE IF NOT EXISTS public.access_denied_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  feature_key text NOT NULL,
  reason text NOT NULL,
  current_plan text,
  required_plan text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_denied_tenant_time
  ON public.access_denied_log(tenant_id, created_at DESC);

ALTER TABLE public.access_denied_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_denied_member_read" ON public.access_denied_log
  FOR SELECT TO authenticated
  USING (tenant_id IS NULL OR public.is_tenant_member(tenant_id) OR public.is_support_or_admin());

CREATE POLICY "access_denied_no_client_write_insert" ON public.access_denied_log
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "access_denied_no_client_write_update" ON public.access_denied_log
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY "access_denied_no_client_write_delete" ON public.access_denied_log
  FOR DELETE TO authenticated USING (false);

-- =========================================================
-- 3. Plan rank helper
-- =========================================================
CREATE OR REPLACE FUNCTION public.plan_rank(p_plan text)
RETURNS int
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(p_plan, 'free'))
    WHEN 'free' THEN 0
    WHEN 'basic' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'enterprise' THEN 4
    ELSE 0
  END
$$;

-- =========================================================
-- 4. check_plan_access (returns jsonb, logs denials)
-- =========================================================
CREATE OR REPLACE FUNCTION public.check_plan_access(
  p_tenant_id uuid,
  p_feature_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_feat feature_catalog%ROWTYPE;
  v_sub subscriptions%ROWTYPE;
  v_ent workspace_entitlements%ROWTYPE;
  v_current_plan text;
  v_current_rank int;
  v_reason text;
  v_active boolean;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  END IF;

  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    INSERT INTO access_denied_log(tenant_id, user_id, feature_key, reason)
    VALUES (p_tenant_id, v_user, p_feature_key, 'not_a_member');
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_a_member');
  END IF;

  SELECT * INTO v_feat FROM feature_catalog WHERE feature_key = p_feature_key;
  IF v_feat IS NULL THEN
    -- Unknown feature: allow but log (so we discover unmapped features rather than break flows)
    RETURN jsonb_build_object('allowed', true, 'reason', 'unmapped_feature');
  END IF;

  SELECT * INTO v_sub FROM subscriptions WHERE tenant_id = p_tenant_id;
  SELECT * INTO v_ent FROM workspace_entitlements WHERE workspace_id = p_tenant_id;

  v_current_plan := COALESCE(v_ent.plan, 'free');
  v_active := v_sub.status::text IN ('active','trialing')
              AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > now());

  -- Free plan is always "active"
  IF v_current_plan = 'free' THEN
    v_active := true;
  END IF;

  IF NOT v_active THEN
    -- Subscription lapsed → treat as free
    v_current_plan := 'free';
  END IF;

  v_current_rank := public.plan_rank(v_current_plan);

  IF v_current_rank < v_feat.min_plan_rank THEN
    INSERT INTO access_denied_log(tenant_id, user_id, feature_key, reason, current_plan, required_plan)
    VALUES (p_tenant_id, v_user, p_feature_key,
            CASE WHEN NOT v_active THEN 'plan_expired' ELSE 'plan_too_low' END,
            v_current_plan, v_feat.upgrade_to);
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', CASE WHEN NOT v_active THEN 'plan_expired' ELSE 'plan_too_low' END,
      'current_plan', v_current_plan,
      'upgrade_to', v_feat.upgrade_to,
      'feature', p_feature_key
    );
  END IF;

  -- Sending paused (e.g. payment past_due grace period exceeded)
  IF v_ent.sending_paused IS TRUE AND p_feature_key IN ('send_campaign','ai_reply','create_template') THEN
    INSERT INTO access_denied_log(tenant_id, user_id, feature_key, reason, current_plan)
    VALUES (p_tenant_id, v_user, p_feature_key, 'sending_paused', v_current_plan);
    RETURN jsonb_build_object('allowed', false, 'reason', 'sending_paused', 'current_plan', v_current_plan);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'current_plan', v_current_plan);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_plan_access(uuid, text) TO authenticated;

-- =========================================================
-- 5. enforce_plan_access (raises on deny)
-- =========================================================
CREATE OR REPLACE FUNCTION public.enforce_plan_access(
  p_tenant_id uuid,
  p_feature_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  v_result := public.check_plan_access(p_tenant_id, p_feature_key);
  IF NOT (v_result->>'allowed')::boolean THEN
    RAISE EXCEPTION 'PLAN_ACCESS_DENIED: %', v_result::text
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.enforce_plan_access(uuid, text) TO authenticated;

-- =========================================================
-- 6. Defense-in-depth: block plan/status edits unless service_role or super_admin
-- =========================================================
CREATE OR REPLACE FUNCTION public.guard_subscription_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  IF v_role = 'service_role' THEN RETURN NEW; END IF;
  IF auth.uid() IS NOT NULL AND public.is_super_admin() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Subscriptions can only be created by verified payment webhooks or platform admins';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.plan_id IS DISTINCT FROM OLD.plan_id
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end
       OR NEW.current_period_start IS DISTINCT FROM OLD.current_period_start
       OR NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle
    THEN
      RAISE EXCEPTION 'Plan, status, or period fields can only be changed by verified payment webhooks or platform admins';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Subscriptions cannot be deleted by clients';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_subscriptions ON public.subscriptions;
CREATE TRIGGER trg_guard_subscriptions
  BEFORE INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.guard_subscription_mutations();

CREATE OR REPLACE FUNCTION public.guard_entitlement_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  IF v_role = 'service_role' THEN RETURN COALESCE(NEW, OLD); END IF;
  IF auth.uid() IS NOT NULL AND public.is_super_admin() THEN RETURN COALESCE(NEW, OLD); END IF;
  RAISE EXCEPTION 'Workspace entitlements can only be changed by verified payment webhooks or platform admins';
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_entitlements ON public.workspace_entitlements;
CREATE TRIGGER trg_guard_entitlements
  BEFORE INSERT OR UPDATE OR DELETE ON public.workspace_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.guard_entitlement_mutations();

-- =========================================================
-- 7. Webhook idempotency: prevent replay on platform_billing_events
-- =========================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_events_provider_event_id
  ON public.platform_billing_events (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;
