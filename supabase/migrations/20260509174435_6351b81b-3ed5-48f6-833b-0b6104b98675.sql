
-- =========================================================
-- 24h Launch Offer system
-- =========================================================

CREATE TABLE IF NOT EXISTS public.user_offers (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_started_at  timestamptz NOT NULL DEFAULT now(),
  offer_expires_at  timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  offer_claimed     boolean     NOT NULL DEFAULT false,
  claimed_plan_id   text,
  claimed_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_offers_claimed_at ON public.user_offers(claimed_at);

ALTER TABLE public.user_offers ENABLE ROW LEVEL SECURITY;

-- Users can read only their own row
DROP POLICY IF EXISTS "user_offers_select_own" ON public.user_offers;
CREATE POLICY "user_offers_select_own" ON public.user_offers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- No direct INSERT/UPDATE/DELETE for clients
DROP POLICY IF EXISTS "user_offers_no_client_writes_insert" ON public.user_offers;
CREATE POLICY "user_offers_no_client_writes_insert" ON public.user_offers
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "user_offers_no_client_writes_update" ON public.user_offers;
CREATE POLICY "user_offers_no_client_writes_update" ON public.user_offers
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user_offers_no_client_writes_delete" ON public.user_offers;
CREATE POLICY "user_offers_no_client_writes_delete" ON public.user_offers
  FOR DELETE TO authenticated USING (false);

-- Auto-create offer on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_offers (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_offer ON auth.users;
CREATE TRIGGER on_auth_user_created_offer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_offer();

-- Backfill rows for existing users
INSERT INTO public.user_offers (user_id, offer_started_at, offer_expires_at)
SELECT id, created_at, created_at + interval '24 hours'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Mutation guard: block edits to immutable timer fields
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
    -- Once claimed, the claim is final
    IF OLD.offer_claimed = true AND NEW.offer_claimed = false THEN
      RAISE EXCEPTION 'cannot un-claim an offer';
    END IF;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_user_offer_mutations ON public.user_offers;
CREATE TRIGGER trg_guard_user_offer_mutations
  BEFORE UPDATE ON public.user_offers
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_offer_mutations();

-- Claim function: SECURITY DEFINER, callable by the logged-in user
CREATE OR REPLACE FUNCTION public.claim_launch_offer(_plan_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _row public.user_offers%ROWTYPE;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _plan_id IS NULL OR _plan_id NOT IN ('free','basic','pro','business') THEN
    RAISE EXCEPTION 'invalid plan_id';
  END IF;

  SELECT * INTO _row FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;

  IF NOT FOUND THEN
    -- Self-heal: create row at signup-equivalent now() (only if not exists)
    INSERT INTO public.user_offers(user_id) VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO _row FROM public.user_offers WHERE user_id = _user_id FOR UPDATE;
  END IF;

  IF _row.offer_claimed THEN
    RAISE EXCEPTION 'offer already claimed';
  END IF;

  IF now() > _row.offer_expires_at THEN
    RAISE EXCEPTION 'offer expired';
  END IF;

  UPDATE public.user_offers
  SET offer_claimed   = true,
      claimed_plan_id = _plan_id,
      claimed_at      = now()
  WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'plan_id', _plan_id,
    'claimed_at', now(),
    'trial_ends_at', now() + interval '30 days'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_launch_offer(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_launch_offer(text) TO authenticated;

-- Social proof counter: total claims today (no PII)
CREATE OR REPLACE FUNCTION public.get_offer_claim_count_today()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.user_offers
  WHERE offer_claimed = true
    AND claimed_at >= date_trunc('day', now());
$$;

REVOKE ALL ON FUNCTION public.get_offer_claim_count_today() FROM public;
GRANT EXECUTE ON FUNCTION public.get_offer_claim_count_today() TO anon, authenticated;
