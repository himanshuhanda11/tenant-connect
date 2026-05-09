CREATE OR REPLACE FUNCTION public.apply_launch_offer_to_tenant(_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _offer public.user_offers%ROWTYPE;
  _plan_text text;
  _plan_uuid uuid;
  _sub_id uuid;
  _now timestamptz := now();
  _trial_end timestamptz := now() + interval '30 days';
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.is_tenant_member(_user_id, _tenant_id) THEN
    RAISE EXCEPTION 'not a member of tenant';
  END IF;

  SELECT * INTO _offer
  FROM public.user_offers
  WHERE user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND OR NOT _offer.offer_claimed THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_claimed_offer');
  END IF;

  IF _offer.applied_to_tenant_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', true,
      'reason', 'already_applied',
      'tenant_id', _offer.applied_to_tenant_id,
      'plan', lower(coalesce(_offer.claimed_plan_id, 'free'))
    );
  END IF;

  _plan_text := lower(coalesce(_offer.claimed_plan_id, 'free'));

  IF _plan_text NOT IN ('free', 'basic', 'pro', 'business') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_plan', 'plan', _plan_text);
  END IF;

  SELECT id INTO _plan_uuid
  FROM public.plans
  WHERE lower(name) = CASE _plan_text
    WHEN 'free' THEN 'free'
    WHEN 'basic' THEN 'starter'
    WHEN 'pro' THEN 'professional'
    WHEN 'business' THEN 'enterprise'
  END
  LIMIT 1;

  PERFORM set_config('app.in_offer_grant', 'on', true);

  IF _plan_text = 'free' THEN
    UPDATE public.user_offers
       SET applied_to_tenant_id = _tenant_id,
           applied_at = _now
     WHERE user_id = _user_id;

    PERFORM set_config('app.in_offer_grant', 'off', true);
    RETURN jsonb_build_object('ok', true, 'plan', 'free', 'tenant_id', _tenant_id);
  END IF;

  IF _plan_uuid IS NULL THEN
    PERFORM set_config('app.in_offer_grant', 'off', true);
    RETURN jsonb_build_object('ok', false, 'reason', 'plan_not_found', 'plan', _plan_text);
  END IF;

  INSERT INTO public.subscriptions (
    tenant_id,
    plan_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end
  )
  VALUES (
    _tenant_id,
    _plan_uuid,
    'trialing',
    'monthly',
    _now,
    _trial_end
  )
  ON CONFLICT (tenant_id) DO UPDATE
    SET plan_id = EXCLUDED.plan_id,
        status = 'trialing',
        current_period_start = _now,
        current_period_end = _trial_end,
        billing_cycle = 'monthly',
        updated_at = _now
  RETURNING id INTO _sub_id;

  INSERT INTO public.workspace_entitlements (
    workspace_id,
    plan,
    status,
    sending_paused,
    billing_cycle,
    expires_at,
    trial_ends_at,
    updated_at
  )
  VALUES (
    _tenant_id,
    _plan_text,
    'active',
    false,
    'monthly',
    _trial_end,
    _trial_end,
    _now
  )
  ON CONFLICT (workspace_id) DO UPDATE
    SET plan = EXCLUDED.plan,
        status = 'active',
        sending_paused = false,
        billing_cycle = 'monthly',
        expires_at = _trial_end,
        trial_ends_at = _trial_end,
        updated_at = _now;

  PERFORM set_config('app.in_offer_grant', 'off', true);

  UPDATE public.user_offers
     SET applied_to_tenant_id = _tenant_id,
         subscription_id = _sub_id,
         applied_at = _now
   WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'plan', _plan_text,
    'tenant_id', _tenant_id,
    'subscription_id', _sub_id,
    'trial_ends_at', _trial_end
  );
EXCEPTION WHEN OTHERS THEN
  PERFORM set_config('app.in_offer_grant', 'off', true);
  RAISE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_launch_offer_to_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_launch_offer_to_tenant(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_launch_offer(_plan_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _row public.user_offers%ROWTYPE;
  _tenant_id uuid;
  _apply jsonb := NULL;
  _normalized_plan text := lower(coalesce(_plan_id, ''));
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _normalized_plan NOT IN ('free','basic','pro','business') THEN
    RAISE EXCEPTION 'invalid plan_id';
  END IF;

  SELECT * INTO _row
  FROM public.user_offers
  WHERE user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_offers(user_id)
    VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO _row
    FROM public.user_offers
    WHERE user_id = _user_id
    FOR UPDATE;
  END IF;

  IF _row.offer_claimed THEN
    IF lower(coalesce(_row.claimed_plan_id, '')) = _normalized_plan THEN
      SELECT tenant_id INTO _tenant_id
      FROM public.tenant_members
      WHERE user_id = _user_id AND role = 'owner'
      ORDER BY joined_at ASC NULLS LAST
      LIMIT 1;

      IF _tenant_id IS NOT NULL THEN
        BEGIN
          _apply := public.apply_launch_offer_to_tenant(_tenant_id);
        EXCEPTION WHEN OTHERS THEN
          _apply := jsonb_build_object('ok', false, 'error', SQLERRM);
        END;
      END IF;

      RETURN jsonb_build_object(
        'ok', true,
        'already_claimed', true,
        'plan_id', _normalized_plan,
        'claimed_at', _row.claimed_at,
        'trial_ends_at', coalesce(_row.applied_at, now()) + interval '30 days',
        'applied', _apply
      );
    END IF;

    RAISE EXCEPTION 'offer already claimed';
  END IF;

  IF now() > _row.offer_expires_at THEN
    RAISE EXCEPTION 'offer expired';
  END IF;

  UPDATE public.user_offers
  SET offer_claimed = true,
      claimed_plan_id = _normalized_plan,
      claimed_at = now()
  WHERE user_id = _user_id
  RETURNING * INTO _row;

  SELECT tenant_id INTO _tenant_id
  FROM public.tenant_members
  WHERE user_id = _user_id AND role = 'owner'
  ORDER BY joined_at ASC NULLS LAST
  LIMIT 1;

  IF _tenant_id IS NOT NULL THEN
    BEGIN
      _apply := public.apply_launch_offer_to_tenant(_tenant_id);
    EXCEPTION WHEN OTHERS THEN
      _apply := jsonb_build_object('ok', false, 'error', SQLERRM);
    END;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'plan_id', _normalized_plan,
    'claimed_at', _row.claimed_at,
    'trial_ends_at', now() + interval '30 days',
    'applied', _apply
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_launch_offer(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_launch_offer(text) TO authenticated;