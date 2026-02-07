-- Revenue daily view: aggregates billing events by day
CREATE OR REPLACE VIEW public.platform_revenue_daily AS
SELECT
  date_trunc('day', occurred_at)::date AS day,
  currency,
  COALESCE(SUM(CASE WHEN event_type IN ('payment_succeeded', 'invoice_paid', 'checkout_completed') THEN amount ELSE 0 END), 0) AS gross,
  COALESCE(SUM(CASE WHEN event_type = 'refund' THEN amount ELSE 0 END), 0) AS refunds,
  COALESCE(SUM(CASE WHEN event_type IN ('payment_succeeded', 'invoice_paid', 'checkout_completed') THEN amount ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN event_type = 'refund' THEN amount ELSE 0 END), 0) AS net,
  COUNT(*) FILTER (WHERE event_type IN ('payment_succeeded', 'invoice_paid', 'checkout_completed')) AS payments_count
FROM public.platform_billing_events
WHERE status NOT IN ('ignored', 'error')
GROUP BY 1, 2
ORDER BY 1 DESC;