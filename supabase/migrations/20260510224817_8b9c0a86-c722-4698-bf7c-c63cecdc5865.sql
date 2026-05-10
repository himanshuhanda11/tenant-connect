
-- 1. Add Stripe price columns to platform_plans
ALTER TABLE public.platform_plans
  ADD COLUMN IF NOT EXISTS stripe_price_monthly text,
  ADD COLUMN IF NOT EXISTS stripe_price_yearly text;

-- 2. Add Stripe-specific tracking to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS trial_start timestamptz,
  ADD COLUMN IF NOT EXISTS trial_end timestamptz,
  ADD COLUMN IF NOT EXISTS trial_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS last_payment_status text,
  ADD COLUMN IF NOT EXISTS latest_invoice_id text;

-- 3. Expand subscription_status enum to include all Stripe states
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'trialing'
                 AND enumtypid = 'subscription_status'::regtype) THEN
    ALTER TYPE subscription_status ADD VALUE 'trialing';
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'past_due'
                 AND enumtypid = 'subscription_status'::regtype) THEN
    ALTER TYPE subscription_status ADD VALUE 'past_due';
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'unpaid'
                 AND enumtypid = 'subscription_status'::regtype) THEN
    ALTER TYPE subscription_status ADD VALUE 'unpaid';
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'incomplete'
                 AND enumtypid = 'subscription_status'::regtype) THEN
    ALTER TYPE subscription_status ADD VALUE 'incomplete';
  END IF;
END$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'incomplete_expired'
                 AND enumtypid = 'subscription_status'::regtype) THEN
    ALTER TYPE subscription_status ADD VALUE 'incomplete_expired';
  END IF;
END$$;

-- 4. Helper: is current user an admin/owner of the workspace?
CREATE OR REPLACE FUNCTION public.is_workspace_admin(_workspace_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members tm
    WHERE tm.tenant_id = _workspace_id
      AND tm.user_id   = _user_id
      AND tm.role IN ('owner', 'admin')
  );
$$;

-- 5. RLS: members can SELECT their own subscription (read-only)
DROP POLICY IF EXISTS "members_can_read_subscription" ON public.subscriptions;
CREATE POLICY "members_can_read_subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = subscriptions.tenant_id
      AND tm.user_id   = auth.uid()
  )
);
