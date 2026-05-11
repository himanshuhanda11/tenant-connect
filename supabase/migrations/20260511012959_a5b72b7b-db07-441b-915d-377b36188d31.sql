
-- 1. Add missing limit columns
ALTER TABLE public.workspace_entitlements
  ADD COLUMN IF NOT EXISTS automation_limit integer,
  ADD COLUMN IF NOT EXISTS widget_limit integer,
  ADD COLUMN IF NOT EXISTS integration_limit integer;

-- 2. plan_defaults() returns canonical limits per plan
CREATE OR REPLACE FUNCTION public.plan_defaults(p_plan text)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE lower(coalesce(p_plan, 'free'))
    WHEN 'free' THEN jsonb_build_object(
      'team_member_limit', 1, 'automation_limit', 1, 'monthly_flow_limit', 0,
      'widget_limit', 1, 'integration_limit', 0, 'campaign_limit', 1,
      'monthly_broadcast_limit', 0, 'monthly_template_limit', 5,
      'monthly_conversation_limit', 100, 'ai_usage_limit', 0,
      'enable_ai', false, 'enable_ads', false,
      'enable_integrations', false, 'enable_autoforms', false
    )
    WHEN 'basic' THEN jsonb_build_object(
      'team_member_limit', 5, 'automation_limit', 5, 'monthly_flow_limit', 3,
      'widget_limit', 3, 'integration_limit', 2, 'campaign_limit', 5,
      'monthly_broadcast_limit', 1000, 'monthly_template_limit', 25,
      'monthly_conversation_limit', 1000, 'ai_usage_limit', 500,
      'enable_ai', true, 'enable_ads', false,
      'enable_integrations', true, 'enable_autoforms', true
    )
    WHEN 'pro' THEN jsonb_build_object(
      'team_member_limit', 10, 'automation_limit', 25, 'monthly_flow_limit', 15,
      'widget_limit', 10, 'integration_limit', 10, 'campaign_limit', 25,
      'monthly_broadcast_limit', 10000, 'monthly_template_limit', 100,
      'monthly_conversation_limit', 10000, 'ai_usage_limit', 5000,
      'enable_ai', true, 'enable_ads', true,
      'enable_integrations', true, 'enable_autoforms', true
    )
    WHEN 'business' THEN jsonb_build_object(
      'team_member_limit', 25, 'automation_limit', -1, 'monthly_flow_limit', -1,
      'widget_limit', -1, 'integration_limit', -1, 'campaign_limit', -1,
      'monthly_broadcast_limit', -1, 'monthly_template_limit', -1,
      'monthly_conversation_limit', -1, 'ai_usage_limit', -1,
      'enable_ai', true, 'enable_ads', true,
      'enable_integrations', true, 'enable_autoforms', true
    )
    ELSE jsonb_build_object(
      'team_member_limit', 1, 'automation_limit', 1, 'monthly_flow_limit', 0,
      'widget_limit', 1, 'integration_limit', 0, 'campaign_limit', 1,
      'monthly_broadcast_limit', 0, 'monthly_template_limit', 5,
      'monthly_conversation_limit', 100, 'ai_usage_limit', 0,
      'enable_ai', false, 'enable_ads', false,
      'enable_integrations', false, 'enable_autoforms', false
    )
  END;
$$;

-- 3. Backfill all workspaces — fill NULL or zeroed limits from plan_defaults
UPDATE public.workspace_entitlements e
SET
  team_member_limit       = COALESCE(e.team_member_limit, (public.plan_defaults(e.plan)->>'team_member_limit')::int),
  automation_limit        = COALESCE(e.automation_limit, (public.plan_defaults(e.plan)->>'automation_limit')::int),
  monthly_flow_limit      = COALESCE(e.monthly_flow_limit, (public.plan_defaults(e.plan)->>'monthly_flow_limit')::int),
  widget_limit            = COALESCE(e.widget_limit, (public.plan_defaults(e.plan)->>'widget_limit')::int),
  integration_limit       = COALESCE(e.integration_limit, (public.plan_defaults(e.plan)->>'integration_limit')::int),
  campaign_limit          = COALESCE(e.campaign_limit, (public.plan_defaults(e.plan)->>'campaign_limit')::int),
  monthly_broadcast_limit = COALESCE(e.monthly_broadcast_limit, (public.plan_defaults(e.plan)->>'monthly_broadcast_limit')::int),
  monthly_template_limit  = COALESCE(e.monthly_template_limit, (public.plan_defaults(e.plan)->>'monthly_template_limit')::int),
  monthly_conversation_limit = COALESCE(e.monthly_conversation_limit, (public.plan_defaults(e.plan)->>'monthly_conversation_limit')::int),
  ai_usage_limit          = COALESCE(e.ai_usage_limit, (public.plan_defaults(e.plan)->>'ai_usage_limit')::int),
  enable_ai               = COALESCE(e.enable_ai, (public.plan_defaults(e.plan)->>'enable_ai')::bool),
  enable_ads              = COALESCE(e.enable_ads, (public.plan_defaults(e.plan)->>'enable_ads')::bool),
  enable_integrations     = COALESCE(e.enable_integrations, (public.plan_defaults(e.plan)->>'enable_integrations')::bool),
  enable_autoforms        = COALESCE(e.enable_autoforms, (public.plan_defaults(e.plan)->>'enable_autoforms')::bool);

-- 4. Trigger to apply plan_defaults on new entitlement rows / plan changes
CREATE OR REPLACE FUNCTION public.apply_plan_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE d jsonb;
BEGIN
  d := public.plan_defaults(NEW.plan);
  NEW.team_member_limit       := COALESCE(NEW.team_member_limit, (d->>'team_member_limit')::int);
  NEW.automation_limit        := COALESCE(NEW.automation_limit, (d->>'automation_limit')::int);
  NEW.monthly_flow_limit      := COALESCE(NEW.monthly_flow_limit, (d->>'monthly_flow_limit')::int);
  NEW.widget_limit            := COALESCE(NEW.widget_limit, (d->>'widget_limit')::int);
  NEW.integration_limit       := COALESCE(NEW.integration_limit, (d->>'integration_limit')::int);
  NEW.campaign_limit          := COALESCE(NEW.campaign_limit, (d->>'campaign_limit')::int);
  NEW.monthly_broadcast_limit := COALESCE(NEW.monthly_broadcast_limit, (d->>'monthly_broadcast_limit')::int);
  NEW.monthly_template_limit  := COALESCE(NEW.monthly_template_limit, (d->>'monthly_template_limit')::int);
  NEW.monthly_conversation_limit := COALESCE(NEW.monthly_conversation_limit, (d->>'monthly_conversation_limit')::int);
  NEW.ai_usage_limit          := COALESCE(NEW.ai_usage_limit, (d->>'ai_usage_limit')::int);
  -- enable_* flags: always re-derive from plan unless explicitly overridden in same statement
  IF TG_OP = 'INSERT' OR OLD.plan IS DISTINCT FROM NEW.plan THEN
    NEW.enable_ai            := (d->>'enable_ai')::bool;
    NEW.enable_ads           := (d->>'enable_ads')::bool;
    NEW.enable_integrations  := (d->>'enable_integrations')::bool;
    NEW.enable_autoforms     := (d->>'enable_autoforms')::bool;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_plan_defaults ON public.workspace_entitlements;
CREATE TRIGGER trg_apply_plan_defaults
  BEFORE INSERT OR UPDATE OF plan ON public.workspace_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.apply_plan_defaults();

-- 5. Update feature_catalog: lower meta_ads to pro, add new keys
UPDATE public.feature_catalog SET min_plan_rank = 2, upgrade_to = 'pro' WHERE feature_key = 'meta_ads';

INSERT INTO public.feature_catalog (feature_key, description, min_plan_rank, upgrade_to) VALUES
  ('create_widget',     'Create chat widget',          1, 'basic'),
  ('create_flow',       'Create WhatsApp flow',        1, 'basic'),
  ('create_autoform',   'Create auto-form',            1, 'basic'),
  ('add_team_member',   'Add a team member',           1, 'basic')
ON CONFLICT (feature_key) DO UPDATE
  SET min_plan_rank = EXCLUDED.min_plan_rank,
      upgrade_to    = EXCLUDED.upgrade_to,
      description   = EXCLUDED.description;

-- 6. Extended check_plan_access — adds quota enforcement for resource features
CREATE OR REPLACE FUNCTION public.check_plan_access(p_tenant_id uuid, p_feature_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_feat feature_catalog%ROWTYPE;
  v_sub  subscriptions%ROWTYPE;
  v_ent  workspace_entitlements%ROWTYPE;
  v_current_plan text;
  v_current_rank int;
  v_active boolean;
  v_limit int;
  v_usage int;
  v_flag boolean;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  END IF;

  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_a_member');
  END IF;

  SELECT * INTO v_feat FROM feature_catalog WHERE feature_key = p_feature_key;
  SELECT * INTO v_sub  FROM subscriptions WHERE tenant_id = p_tenant_id;
  SELECT * INTO v_ent  FROM workspace_entitlements WHERE workspace_id = p_tenant_id;

  v_current_plan := COALESCE(v_ent.plan, 'free');
  v_active := v_sub.status::text IN ('active','trialing')
              AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > now());
  IF v_current_plan = 'free' THEN v_active := true; END IF;
  IF NOT v_active THEN v_current_plan := 'free'; END IF;
  v_current_rank := public.plan_rank(v_current_plan);

  -- Tier check
  IF v_feat.feature_key IS NOT NULL AND v_current_rank < v_feat.min_plan_rank THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', CASE WHEN NOT v_active THEN 'plan_expired' ELSE 'plan_too_low' END,
      'current_plan', v_current_plan,
      'upgrade_to', v_feat.upgrade_to,
      'feature', p_feature_key
    );
  END IF;

  -- Boolean feature gates
  IF p_feature_key IN ('meta_ads','create_meta_ad_account') AND COALESCE(v_ent.enable_ads, false) = false THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'feature_disabled', 'current_plan', v_current_plan, 'upgrade_to', 'pro', 'feature', p_feature_key);
  END IF;
  IF p_feature_key = 'create_integration' AND COALESCE(v_ent.enable_integrations, false) = false THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'feature_disabled', 'current_plan', v_current_plan, 'upgrade_to', 'basic', 'feature', p_feature_key);
  END IF;
  IF p_feature_key = 'create_autoform' AND COALESCE(v_ent.enable_autoforms, false) = false THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'feature_disabled', 'current_plan', v_current_plan, 'upgrade_to', 'basic', 'feature', p_feature_key);
  END IF;
  IF p_feature_key = 'ai_reply' AND COALESCE(v_ent.enable_ai, false) = false THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'feature_disabled', 'current_plan', v_current_plan, 'upgrade_to', 'basic', 'feature', p_feature_key);
  END IF;

  -- Quota checks (count-based)
  IF p_feature_key IN ('add_team_member','invite_member') THEN
    v_limit := COALESCE(v_ent.team_member_limit, 1);
    SELECT count(*) INTO v_usage FROM tenant_members WHERE tenant_id = p_tenant_id;
  ELSIF p_feature_key = 'create_automation' THEN
    v_limit := COALESCE(v_ent.automation_limit, 1);
    SELECT count(*) INTO v_usage FROM automation_workflows WHERE tenant_id = p_tenant_id;
  ELSIF p_feature_key = 'create_flow' THEN
    v_limit := COALESCE(v_ent.monthly_flow_limit, 0);
    SELECT count(*) INTO v_usage FROM flows WHERE tenant_id = p_tenant_id;
  ELSIF p_feature_key = 'create_widget' THEN
    v_limit := COALESCE(v_ent.widget_limit, 1);
    SELECT count(*) INTO v_usage FROM widgets WHERE tenant_id = p_tenant_id;
  ELSIF p_feature_key = 'create_integration' THEN
    v_limit := COALESCE(v_ent.integration_limit, 0);
    SELECT count(*) INTO v_usage FROM tenant_integrations WHERE tenant_id = p_tenant_id;
  ELSIF p_feature_key = 'create_autoform' THEN
    v_limit := COALESCE(v_ent.monthly_flow_limit, 0); -- reuse if no autoform_limit
    SELECT count(*) INTO v_usage FROM forms WHERE tenant_id = p_tenant_id;
  ELSIF p_feature_key = 'send_campaign' THEN
    v_limit := COALESCE(v_ent.campaign_limit, 1);
    SELECT count(*) INTO v_usage FROM campaigns WHERE tenant_id = p_tenant_id;
  ELSE
    v_limit := NULL;
  END IF;

  IF v_limit IS NOT NULL AND v_limit >= 0 AND v_usage >= v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', CASE WHEN v_limit = 0 THEN 'feature_disabled' ELSE 'quota_exceeded' END,
      'current_plan', v_current_plan,
      'upgrade_to', COALESCE(v_feat.upgrade_to,
        CASE v_current_plan WHEN 'free' THEN 'basic' WHEN 'basic' THEN 'pro' ELSE 'business' END),
      'feature', p_feature_key,
      'current_usage', v_usage,
      'plan_limit', v_limit
    );
  END IF;

  IF v_ent.sending_paused IS TRUE AND p_feature_key IN ('send_campaign','ai_reply','create_template') THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'sending_paused', 'current_plan', v_current_plan);
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'current_plan', v_current_plan,
    'current_usage', v_usage,
    'plan_limit', v_limit
  );
END;
$$;

-- 7. Trigger backstop: enforce_plan_quota raises on insert if check fails
CREATE OR REPLACE FUNCTION public.enforce_plan_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant uuid;
  v_feature text := TG_ARGV[0];
  v_user uuid := auth.uid();
  v_ent workspace_entitlements%ROWTYPE;
  v_limit int;
  v_usage int;
  v_plan text;
  v_flag boolean;
BEGIN
  -- pull tenant id from row (column varies)
  v_tenant := COALESCE(
    (to_jsonb(NEW)->>'tenant_id')::uuid,
    (to_jsonb(NEW)->>'workspace_id')::uuid
  );
  IF v_tenant IS NULL THEN RETURN NEW; END IF;

  -- Skip enforcement if no authenticated user (system / service-role inserts)
  IF v_user IS NULL THEN RETURN NEW; END IF;

  SELECT * INTO v_ent FROM workspace_entitlements WHERE workspace_id = v_tenant;
  IF v_ent IS NULL THEN RETURN NEW; END IF;
  v_plan := COALESCE(v_ent.plan, 'free');

  -- Quota & flag rules
  IF v_feature = 'add_team_member' THEN
    v_limit := COALESCE(v_ent.team_member_limit, 1);
    SELECT count(*) INTO v_usage FROM tenant_members WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'create_automation' THEN
    v_limit := COALESCE(v_ent.automation_limit, 1);
    SELECT count(*) INTO v_usage FROM automation_workflows WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'create_flow' THEN
    v_limit := COALESCE(v_ent.monthly_flow_limit, 0);
    SELECT count(*) INTO v_usage FROM flows WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'create_widget' THEN
    v_limit := COALESCE(v_ent.widget_limit, 1);
    SELECT count(*) INTO v_usage FROM widgets WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'create_integration' THEN
    IF COALESCE(v_ent.enable_integrations, false) = false THEN
      RAISE EXCEPTION 'plan_access_denied:feature_disabled:create_integration:%:basic', v_plan
        USING ERRCODE = 'check_violation';
    END IF;
    v_limit := COALESCE(v_ent.integration_limit, 0);
    SELECT count(*) INTO v_usage FROM tenant_integrations WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'create_autoform' THEN
    IF COALESCE(v_ent.enable_autoforms, false) = false THEN
      RAISE EXCEPTION 'plan_access_denied:feature_disabled:create_autoform:%:basic', v_plan
        USING ERRCODE = 'check_violation';
    END IF;
    v_limit := COALESCE(v_ent.monthly_flow_limit, 0);
    SELECT count(*) INTO v_usage FROM forms WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'send_campaign' THEN
    v_limit := COALESCE(v_ent.campaign_limit, 1);
    SELECT count(*) INTO v_usage FROM campaigns WHERE tenant_id = v_tenant;
  ELSIF v_feature = 'create_meta_ad_account' THEN
    IF COALESCE(v_ent.enable_ads, false) = false THEN
      RAISE EXCEPTION 'plan_access_denied:feature_disabled:meta_ads:%:pro', v_plan
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  ELSE
    RETURN NEW;
  END IF;

  IF v_limit IS NOT NULL AND v_limit >= 0 AND v_usage >= v_limit THEN
    RAISE EXCEPTION 'plan_access_denied:%:%:%:%',
      CASE WHEN v_limit = 0 THEN 'feature_disabled' ELSE 'quota_exceeded' END,
      v_feature, v_plan,
      CASE v_plan WHEN 'free' THEN 'basic' WHEN 'basic' THEN 'pro' ELSE 'business' END
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- 8. Attach triggers
DROP TRIGGER IF EXISTS trg_quota_team_members ON public.tenant_members;
CREATE TRIGGER trg_quota_team_members BEFORE INSERT ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('add_team_member');

DROP TRIGGER IF EXISTS trg_quota_automation ON public.automation_workflows;
CREATE TRIGGER trg_quota_automation BEFORE INSERT ON public.automation_workflows
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('create_automation');

DROP TRIGGER IF EXISTS trg_quota_flows ON public.flows;
CREATE TRIGGER trg_quota_flows BEFORE INSERT ON public.flows
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('create_flow');

DROP TRIGGER IF EXISTS trg_quota_widgets ON public.widgets;
CREATE TRIGGER trg_quota_widgets BEFORE INSERT ON public.widgets
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('create_widget');

DROP TRIGGER IF EXISTS trg_quota_integrations ON public.tenant_integrations;
CREATE TRIGGER trg_quota_integrations BEFORE INSERT ON public.tenant_integrations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('create_integration');

DROP TRIGGER IF EXISTS trg_quota_autoforms ON public.forms;
CREATE TRIGGER trg_quota_autoforms BEFORE INSERT ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('create_autoform');

DROP TRIGGER IF EXISTS trg_quota_campaigns ON public.campaigns;
CREATE TRIGGER trg_quota_campaigns BEFORE INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('send_campaign');

DROP TRIGGER IF EXISTS trg_quota_meta_ads ON public.smeksh_meta_ad_accounts;
CREATE TRIGGER trg_quota_meta_ads BEFORE INSERT ON public.smeksh_meta_ad_accounts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_quota('create_meta_ad_account');
