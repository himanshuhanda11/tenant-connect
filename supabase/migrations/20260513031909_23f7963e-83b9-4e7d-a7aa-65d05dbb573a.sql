
-- Extend message_credits
ALTER TABLE public.message_credits
  ADD COLUMN IF NOT EXISTS last_topup_at timestamptz;

-- Extend credit_transactions
ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS balance_before integer,
  ADD COLUMN IF NOT EXISTS related_campaign_id uuid,
  ADD COLUMN IF NOT EXISTS related_message_id uuid,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Idempotency: only one row per checkout session
CREATE UNIQUE INDEX IF NOT EXISTS credit_tx_checkout_session_uq
  ON public.credit_transactions (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS credit_tx_tenant_created_idx
  ON public.credit_transactions (tenant_id, created_at DESC);

-- Status check
DO $$ BEGIN
  ALTER TABLE public.credit_transactions
    ADD CONSTRAINT credit_tx_status_check
    CHECK (status IN ('pending','completed','failed','refunded'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Top-up packages
CREATE TABLE IF NOT EXISTS public.credit_topup_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL,
  region text NOT NULL CHECK (region IN ('IN','GULF','OTHER')),
  stripe_price_id text,
  recommended boolean NOT NULL DEFAULT false,
  best_value boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_topup_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active packages" ON public.credit_topup_packages;
CREATE POLICY "Anyone can view active packages"
  ON public.credit_topup_packages FOR SELECT
  USING (active = true);

DROP POLICY IF EXISTS "Platform admins manage packages" ON public.credit_topup_packages;
CREATE POLICY "Platform admins manage packages"
  ON public.credit_topup_packages FOR ALL
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE TRIGGER trg_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_topup_packages
  FOR EACH ROW EXECUTE FUNCTION set_wa_updated_at();

-- Seed packages (one set per region). Stripe price IDs left null;
-- checkout uses price_data fallback when not set.
INSERT INTO public.credit_topup_packages (package_name, credits, price, currency, region, recommended, best_value, sort_order)
VALUES
  -- INDIA (INR)
  ('Starter',  100,   199,  'INR', 'IN',    false, false, 10),
  ('Growth',   250,   449,  'INR', 'IN',    true,  false, 20),
  ('Pro',      500,   849,  'INR', 'IN',    false, false, 30),
  ('Scale',   1000,  1599,  'INR', 'IN',    false, true,  40),
  ('Business',2500,  3699,  'INR', 'IN',    false, false, 50),
  ('Enterprise',5000,6999,  'INR', 'IN',    false, false, 60),
  -- GULF (AED)
  ('Starter',  100,    9,   'AED', 'GULF',  false, false, 10),
  ('Growth',   250,   20,   'AED', 'GULF',  true,  false, 20),
  ('Pro',      500,   38,   'AED', 'GULF',  false, false, 30),
  ('Scale',   1000,   72,   'AED', 'GULF',  false, true,  40),
  ('Business',2500,  170,   'AED', 'GULF',  false, false, 50),
  ('Enterprise',5000,320,   'AED', 'GULF',  false, false, 60),
  -- OTHER (USD)
  ('Starter',  100,    2.5, 'USD', 'OTHER', false, false, 10),
  ('Growth',   250,    5.5, 'USD', 'OTHER', true,  false, 20),
  ('Pro',      500,   10,   'USD', 'OTHER', false, false, 30),
  ('Scale',   1000,   19,   'USD', 'OTHER', false, true,  40),
  ('Business',2500,   45,   'USD', 'OTHER', false, false, 50),
  ('Enterprise',5000, 85,   'USD', 'OTHER', false, false, 60)
ON CONFLICT DO NOTHING;

-- Idempotent crediting RPC used by Stripe webhook
CREATE OR REPLACE FUNCTION public.apply_credit_purchase(
  p_tenant_id uuid,
  p_credits integer,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_amount_paid numeric,
  p_currency text,
  p_package_id uuid,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_before integer;
  v_balance_after integer;
  v_existing uuid;
BEGIN
  IF p_credits IS NULL OR p_credits <= 0 THEN
    RAISE EXCEPTION 'Invalid credits amount';
  END IF;

  -- Idempotency: bail if this checkout session already credited
  SELECT id INTO v_existing
    FROM credit_transactions
    WHERE stripe_checkout_session_id = p_checkout_session_id
    LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('duplicate', true, 'transaction_id', v_existing);
  END IF;

  -- Ensure wallet row exists
  INSERT INTO message_credits (tenant_id, balance, total_purchased, total_used)
  VALUES (p_tenant_id, 0, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  SELECT balance INTO v_balance_before FROM message_credits WHERE tenant_id = p_tenant_id FOR UPDATE;
  v_balance_after := COALESCE(v_balance_before,0) + p_credits;

  UPDATE message_credits
    SET balance = v_balance_after,
        total_purchased = total_purchased + p_credits,
        last_topup_at = now(),
        updated_at = now()
    WHERE tenant_id = p_tenant_id;

  INSERT INTO credit_transactions (
    tenant_id, amount, balance_before, balance_after, type, status,
    description, stripe_checkout_session_id, stripe_payment_intent_id,
    created_by, metadata
  ) VALUES (
    p_tenant_id, p_credits, COALESCE(v_balance_before,0), v_balance_after,
    'purchase', 'completed',
    'Credit top-up: ' || p_credits || ' credits',
    p_checkout_session_id, p_payment_intent_id, p_user_id,
    jsonb_build_object(
      'amount_paid', p_amount_paid,
      'currency', p_currency,
      'package_id', p_package_id
    )
  ) RETURNING id INTO v_existing;

  RETURN jsonb_build_object(
    'duplicate', false,
    'transaction_id', v_existing,
    'balance_after', v_balance_after
  );
END;
$$;
