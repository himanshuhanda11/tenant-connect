CREATE OR REPLACE FUNCTION public.check_plan_access(p_tenant_id uuid, p_feature_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
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
BEGIN
  -- Service-role / system callers have no auth.uid(); skip membership check for them.
  IF v_user IS NOT NULL AND NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'not_a_member');
  END IF;

  SELECT * INTO v_feat FROM feature_catalog WHERE feature_key = p_feature_key;
  SELECT * INTO v_sub  FROM subscriptions WHERE tenant_id = p_tenant_id;
  SELECT * INTO v_ent  FROM workspace_entitlements WHERE workspace_id = p_tenant_id;

  v_current_plan := COALESCE(v_ent.plan, 'free');
  v_active := v_sub.status::text IN ('active','trialing')
              AND (v_sub.current_period_end IS NULL OR v_sub.current_period_end > now());
  IF v_current_plan = 'free' THEN v_active := true; END IF;
  -- A workspace entitlement marked active (e.g. plan assigned by an admin) counts as active.
  IF COALESCE(v_ent.status, '') IN ('active','trialing') THEN v_active := true; END IF;
  IF NOT COALESCE(v_active, false) THEN v_current_plan := 'free'; END IF;
  v_current_rank := public.plan_rank(v_current_plan);

  IF v_feat.feature_key IS NOT NULL AND v_current_rank < v_feat.min_plan_rank THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', CASE WHEN NOT v_active THEN 'plan_expired' ELSE 'plan_too_low' END,
      'current_plan', v_current_plan,
      'upgrade_to', v_feat.upgrade_to,
      'feature', p_feature_key
    );
  END IF;

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
    v_limit := COALESCE(v_ent.monthly_flow_limit, 0);
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