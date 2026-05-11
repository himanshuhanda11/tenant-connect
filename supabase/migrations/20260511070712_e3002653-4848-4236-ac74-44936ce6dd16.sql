-- Clean up stale 'incomplete' subscription rows that block onboarding when users abandon checkout.
DELETE FROM public.subscriptions
WHERE tenant_id = '6b445f7a-bc8f-441d-bd07-a51d77af0cd7'
  AND status IN ('incomplete', 'incomplete_expired')
  AND stripe_subscription_id IS NULL;