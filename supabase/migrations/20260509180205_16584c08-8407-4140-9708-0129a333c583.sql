
-- 1. Add tracking columns to user_offers
ALTER TABLE public.user_offers
  ADD COLUMN IF NOT EXISTS applied_to_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS applied_at timestamptz;

-- Allow the guard trigger to permit immutability changes for the new bookkeeping columns
CREATE OR REPLACE FUNCTION public.guard_user_offer_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.offer_started_at IS DISTINCT FROM OLD.offer_started_at THEN
      RAISE EXCEPTION 'offer_started_at is immutable';
    END IF;
    IF NEW.offer_expires_at IS DISTINCT FROM OLD.offer_expires_at THEN
      RAISE EXCEPTION 'offer_expires_at is immutable';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'user_id cannot change';
    END IF;
    IF OLD.offer_claimed = true AND NEW.offer_claimed = false THEN
      RAISE EXCEPTION 'cannot un-claim an offer';
    END IF;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Loosen guards to also allow writes inside an explicit offer-grant session
CREATE OR REPLACE FUNCTION public.guard_subscription_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
  v_grant text := current_setting('app.in_offer_grant', true);
BEGIN
  IF v_role = 'service_role' THEN RETURN NEW; END IF;
  IF v_grant = 'on' THEN RETURN NEW; END IF;
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

CREATE OR REPLACE FUNCTION public.guard_entitlement_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
  v_grant text := current_setting('app.in_offer_grant', true);
BEGIN
  IF v_role = 'service_role' THEN RETURN COALESCE(NEW, OLD); END IF;
  IF v_grant = 'on' THEN RETURN COALESCE(NEW, OLD); END IF;
  IF auth.uid() IS NOT NULL AND public.is_super_admin() THEN RETURN COALESCE(NEW, OLD); END IF;
  RAISE EXCEPTION 'Workspace entitlements can only be changed by verified payment webhooks or platform admins';
END;
$$;

-- 3. Apply offer to a workspace
CREATE OR REPLACE FUNCTION public.apply_launch_offer_to_tenant(_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _offer public.user_offers%ROWTYPE;
  _plan_id uuid;
  _plan_text text;
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

  SELECT * INTO _offer FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND OR NOT _offer.offer_claimed THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_claimed_offer');
  END IF;

  -- Already applied somewhere
  IF _offer.applied_to_tenant_id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'reason', 'already_applied',
                              'tenant_id', _offer.applied_to_tenant_id);
  END IF;

  _plan_text := lower(coalesce(_offer.claimed_plan_id, 'free'));

  -- Free claim doesn't create a paid trial — just mark applied
  IF _plan_text = 'free' THEN
    UPDATE public.user_offers
       SET applied_to_tenant_id = _tenant_id,
           applied_at = _now
     WHERE user_id = _user_id;
    RETURN jsonb_build_object('ok', true, 'plan', 'free');
  END IF;

  -- Map slug → row in plans table (best-effort name match)
  SELECT id INTO _plan_id FROM public.plans
   WHERE lower(name) = CASE _plan_text
     WHEN 'basic'    THEN 'starter'
     WHEN 'pro'      THEN 'professional'
     WHEN 'business' THEN 'enterprise'
     ELSE _plan_text
   END
   LIMIT 1;

  IF _plan_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'plan_not_found', 'plan', _plan_text);
  END IF;

  -- Open the privileged window for trigger guards
  PERFORM set_config('app.in_offer_grant', 'on', true);

  -- Upsert the subscription (one per tenant)
  INSERT INTO public.subscriptions (
    tenant_id, plan_id, status, billing_cycle,
    current_period_start, current_period_end
  )
  VALUES (
    _tenant_id, _plan_id, 'trialing', 'monthly', _now, _trial_end
  )
  ON CONFLICT (tenant_id) DO UPDATE
    SET plan_id              = EXCLUDED.plan_id,
        status               = 'trialing',
        current_period_start = _now,
        current_period_end   = _trial_end,
        billing_cycle        = 'monthly',
        updated_at           = _now
  RETURNING id INTO _sub_id;

  -- Upgrade entitlements
  INSERT INTO public.workspace_entitlements (workspace_id, plan, status, sending_paused, expires_at)
  VALUES (_tenant_id, _plan_text, 'active', false, _trial_end)
  ON CONFLICT (workspace_id) DO UPDATE
    SET plan           = EXCLUDED.plan,
        status         = 'active',
        sending_paused = false,
        expires_at     = _trial_end,
        updated_at     = _now;

  -- Close the window
  PERFORM set_config('app.in_offer_grant', 'off', true);

  -- Record application on the offer
  UPDATE public.user_offers
     SET applied_to_tenant_id = _tenant_id,
         subscription_id      = _sub_id,
         applied_at           = _now
   WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'plan', _plan_text,
    'tenant_id', _tenant_id,
    'subscription_id', _sub_id,
    'trial_ends_at', _trial_end
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_launch_offer_to_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_launch_offer_to_tenant(uuid) TO authenticated;

-- 4. Auto-apply on tenant creation via existing helper
CREATE OR REPLACE FUNCTION public.create_tenant_with_owner(_name text, _slug text)
RETURNS public.tenants
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant public.tenants;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.tenants (name, slug)
  VALUES (_name, _slug)
  RETURNING * INTO new_tenant;

  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (new_tenant.id, auth.uid(), 'owner');

  -- Best-effort: apply any unapplied launch-offer claim to this brand-new workspace
  BEGIN
    PERFORM public.apply_launch_offer_to_tenant(new_tenant.id);
  EXCEPTION WHEN OTHERS THEN
    -- Never block tenant creation on offer-application errors
    NULL;
  END;

  RETURN new_tenant;
END;
$$;
