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

  SELECT * INTO _row FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_offers(user_id) VALUES (_user_id) ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO _row FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;
  END IF;

  IF _row.offer_claimed THEN
    IF lower(coalesce(_row.claimed_plan_id, '')) = _normalized_plan THEN
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
    'plan_id', _normalized_plan,
    'claimed_at', _row.claimed_at,
    'trial_ends_at', now() + interval '30 days',
    'applied', _apply
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_launch_offer(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_launch_offer(text) TO authenticated;