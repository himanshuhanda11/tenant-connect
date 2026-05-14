-- Track how a subscription was assigned: free | stripe | manual_admin
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_source text NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS assigned_by_admin uuid;

-- Backfill: rows with no stripe_subscription_id and plan free => 'free'; rows with stripe_subscription_id => 'stripe'
UPDATE public.subscriptions
SET plan_source = CASE
  WHEN stripe_subscription_id IS NOT NULL THEN 'stripe'
  WHEN plan_id = 'free' OR plan_id IS NULL THEN 'free'
  ELSE plan_source
END
WHERE plan_source = 'stripe';

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_source_chk
  CHECK (plan_source IN ('stripe','manual_admin','free'));