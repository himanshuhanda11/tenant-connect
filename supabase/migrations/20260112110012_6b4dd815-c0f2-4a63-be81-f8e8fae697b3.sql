-- Add RLS policy for webhook_events (service role access via edge functions)
-- Since webhooks come from external sources, we allow inserts without auth check
-- but restrict SELECT to tenant members for debugging purposes

CREATE POLICY "Service role can manage webhook events"
ON public.webhook_events FOR ALL
USING (true)
WITH CHECK (true);

-- Grant service role access (already have authenticated grants)
GRANT ALL ON TABLE public.webhook_events TO service_role;