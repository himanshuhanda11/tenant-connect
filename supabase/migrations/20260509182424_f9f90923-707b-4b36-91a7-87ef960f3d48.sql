-- 1) Relax guard so expires_at can be adjusted (still keep started_at + user_id immutable, claim is still final)
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
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'user_id cannot change';
    END IF;
    IF OLD.offer_claimed = true AND NEW.offer_claimed = false THEN
      RAISE EXCEPTION 'offer claim is final';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2) Change column default to far future (evergreen)
ALTER TABLE public.user_offers
  ALTER COLUMN offer_expires_at SET DEFAULT (TIMESTAMPTZ '2099-12-31 23:59:59+00');

-- 3) Update auto-create trigger to use evergreen expiry explicitly
CREATE OR REPLACE FUNCTION public.handle_new_user_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_offers (user_id, offer_started_at, offer_expires_at)
  VALUES (NEW.id, now(), TIMESTAMPTZ '2099-12-31 23:59:59+00')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4) Backfill: extend every unclaimed offer to the evergreen expiry
UPDATE public.user_offers
SET offer_expires_at = TIMESTAMPTZ '2099-12-31 23:59:59+00',
    updated_at = now()
WHERE offer_claimed = false
  AND offer_expires_at < TIMESTAMPTZ '2099-12-31 23:59:59+00';