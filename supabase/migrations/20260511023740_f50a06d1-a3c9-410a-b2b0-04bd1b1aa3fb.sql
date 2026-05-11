-- Patch apply_launch_offer_to_tenant: only Free is applied server-side.
-- Paid plans must go through Stripe checkout to capture a card.
CREATE OR REPLACE FUNCTION public.apply_launch_offer_to_tenant(_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _offer public.user_offers%ROWTYPE;
  _plan_text text;
  _now timestamptz := now();
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

  -- ONLY free plan is auto-applied. Paid plans must go through Stripe checkout
  -- so a card is captured and the subscription/trial is provisioned by the webhook.
  IF _plan_text <> 'free' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'requires_checkout',
      'plan', _plan_text,
      'tenant_id', _tenant_id,
      'message', 'Paid plans require card details via Stripe Checkout to start the 30-day trial.'
    );
  END IF;

  UPDATE public.user_offers
     SET applied_to_tenant_id = _tenant_id,
         applied_at = _now
   WHERE user_id = _user_id;

  RETURN jsonb_build_object('ok', true, 'plan', 'free', 'tenant_id', _tenant_id);
END;
$function$;

-- Patch claim_launch_offer (1-arg): paid plans no longer mark trial used or
-- activate anything; they return requires_checkout so the UI redirects to Stripe.
CREATE OR REPLACE FUNCTION public.claim_launch_offer(_plan_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _row public.user_offers%ROWTYPE;
  _normalized_plan text := lower(coalesce(_plan_id, ''));
  _tenant_id uuid;
  _apply jsonb := NULL;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _normalized_plan NOT IN ('free','basic','pro','business') THEN
    RAISE EXCEPTION 'invalid plan_id';
  END IF;

  -- Paid plans MUST go through Stripe Checkout. Do not write anything.
  IF _normalized_plan <> 'free' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'requires_checkout',
      'plan_id', _normalized_plan,
      'message', 'Paid plans require card details via Stripe Checkout.'
    );
  END IF;

  -- FREE plan: ensure offer row + mark as claimed (idempotent).
  SELECT * INTO _row FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.user_offers(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO _row FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;
  END IF;

  IF NOT _row.offer_claimed THEN
    UPDATE public.user_offers
       SET offer_claimed = true,
           claimed_plan_id = 'free',
           claimed_at = now()
     WHERE user_id = _user_id;
  END IF;

  -- Apply to first owned workspace if any
  SELECT tenant_id INTO _tenant_id
  FROM public.tenant_members
  WHERE user_id = _user_id AND role = 'owner'
  ORDER BY created_at ASC NULLS LAST
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
    'plan_id', 'free',
    'applied', _apply
  );
END;
$function$;

-- Patch claim_launch_offer (2-arg): paid plans return requires_checkout
-- without consuming the trial flag or writing subscription/entitlement rows.
CREATE OR REPLACE FUNCTION public.claim_launch_offer(_plan_id text, _workspace_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _normalized_plan text := lower(coalesce(_plan_id, ''));
  _apply jsonb := NULL;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _workspace_id IS NULL THEN
    RAISE EXCEPTION 'workspace_id required';
  END IF;

  IF _normalized_plan NOT IN ('free','basic','pro','business') THEN
    RAISE EXCEPTION 'invalid plan_id';
  END IF;

  -- Verify caller is owner/admin of this workspace
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = _workspace_id
      AND user_id = _user_id
      AND role IN ('owner','admin')
  ) THEN
    RAISE EXCEPTION 'not authorized for this workspace';
  END IF;

  -- PAID plans → no DB writes. UI must redirect to Stripe Checkout.
  IF _normalized_plan <> 'free' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'requires_checkout',
      'plan_id', _normalized_plan,
      'workspace_id', _workspace_id,
      'message', 'Paid plans require card details via Stripe Checkout to start the 30-day trial.'
    );
  END IF;

  -- FREE plan: apply now, no trial consumed.
  BEGIN
    _apply := public.apply_launch_offer_to_tenant(_workspace_id);
  EXCEPTION WHEN OTHERS THEN
    _apply := jsonb_build_object('ok', false, 'error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'ok', true,
    'plan_id', 'free',
    'workspace_id', _workspace_id,
    'applied', _apply
  );
END;
$function$;