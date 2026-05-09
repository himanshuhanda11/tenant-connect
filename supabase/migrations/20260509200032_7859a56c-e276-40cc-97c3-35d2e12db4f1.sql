
-- Workspace-based plan refactor: one free trial per user across all workspaces

-- 1. Add trial tracking fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_used_trial boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_workspace_id uuid;

-- 2. Add workspace creation fields to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS business_category text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS team_size text;

-- Backfill has_used_trial for users who already claimed launch offer
UPDATE public.profiles p
SET has_used_trial = true,
    trial_claimed_at = uo.claimed_at
FROM public.user_offers uo
WHERE uo.user_id = p.id
  AND uo.offer_claimed = true
  AND p.has_used_trial = false;

-- 3. Trial eligibility check RPC
CREATE OR REPLACE FUNCTION public.is_trial_eligible()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT COALESCE(
    (SELECT has_used_trial FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_trial_eligible() TO authenticated;

-- 4. Workspace-aware claim_launch_offer overload
-- Enforces ONE free paid trial per user, attached to a specific workspace
CREATE OR REPLACE FUNCTION public.claim_launch_offer(_plan_id text, _workspace_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _normalized_plan text := lower(coalesce(_plan_id, ''));
  _profile public.profiles%ROWTYPE;
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

  -- Free plan: just apply, no trial consumed
  IF _normalized_plan = 'free' THEN
    BEGIN
      _apply := public.apply_launch_offer_to_tenant(_workspace_id);
    EXCEPTION WHEN OTHERS THEN
      _apply := jsonb_build_object('ok', false, 'error', SQLERRM);
    END;
    RETURN jsonb_build_object('ok', true, 'plan_id', 'free', 'workspace_id', _workspace_id, 'applied', _apply);
  END IF;

  -- Paid plan: enforce one-trial-per-user
  SELECT * INTO _profile FROM public.profiles WHERE id = _user_id FOR UPDATE;

  IF _profile.has_used_trial THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'trial_already_used',
      'message', 'You have already used your free trial on another workspace.'
    );
  END IF;

  -- Mark trial used + record workspace
  UPDATE public.profiles
  SET has_used_trial = true,
      trial_claimed_at = now(),
      trial_workspace_id = _workspace_id,
      updated_at = now()
  WHERE id = _user_id;

  -- Sync user_offers (legacy table) so existing UI countdown still works
  INSERT INTO public.user_offers(user_id, offer_claimed, claimed_plan_id, claimed_at)
  VALUES (_user_id, true, _normalized_plan, now())
  ON CONFLICT (user_id) DO UPDATE
    SET offer_claimed = true,
        claimed_plan_id = EXCLUDED.claimed_plan_id,
        claimed_at = now();

  -- Apply the trial subscription/entitlements to the workspace
  BEGIN
    _apply := public.apply_launch_offer_to_tenant(_workspace_id);
  EXCEPTION WHEN OTHERS THEN
    _apply := jsonb_build_object('ok', false, 'error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'ok', true,
    'plan_id', _normalized_plan,
    'workspace_id', _workspace_id,
    'trial_ends_at', now() + interval '30 days',
    'applied', _apply
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_launch_offer(text, uuid) TO authenticated;
