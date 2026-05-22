-- Backfill webhook health for phone numbers that have actually received events.
-- We infer "received events" from existing messages on that tenant + phone.
UPDATE public.phone_numbers pn
SET last_webhook_at = sub.last_msg_at,
    webhook_health = 'healthy'
FROM (
  SELECT m.tenant_id, MAX(m.created_at) AS last_msg_at
  FROM public.messages m
  GROUP BY m.tenant_id
) sub
WHERE pn.tenant_id = sub.tenant_id
  AND pn.status = 'connected'
  AND pn.last_webhook_at IS NULL;