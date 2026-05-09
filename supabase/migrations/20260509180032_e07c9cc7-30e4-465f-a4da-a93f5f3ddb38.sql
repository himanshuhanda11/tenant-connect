
-- 1. Pin search_path on functions missing it
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.plan_rank(text) SET search_path = public;
ALTER FUNCTION public.detect_timezone_from_phone(text) SET search_path = public;

-- 2. Force security_invoker on the lone view that lacks it
ALTER VIEW public.platform_kpi_overview SET (security_invoker = true);

-- 3. Restrict launch-offer SECURITY DEFINER RPCs to authenticated users only
REVOKE EXECUTE ON FUNCTION public.claim_launch_offer(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_launch_offer(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_offer_claim_count_today() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_offer_claim_count_today() TO authenticated;

-- 4. Tighten "true" service-role policies — replace permissive `true` with an explicit service-role check
DROP POLICY IF EXISTS "Service role insert billing events" ON public.platform_billing_events;
CREATE POLICY "Service role insert billing events"
  ON public.platform_billing_events FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role insert invoices" ON public.platform_invoices;
CREATE POLICY "Service role insert invoices"
  ON public.platform_invoices FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role update invoices" ON public.platform_invoices;
CREATE POLICY "Service role update invoices"
  ON public.platform_invoices FOR UPDATE TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role insert risk events" ON public.platform_risk_events;
CREATE POLICY "Service role insert risk events"
  ON public.platform_risk_events FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert lead events" ON public.lead_events;
CREATE POLICY "Service role can insert lead events"
  ON public.lead_events FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert sessions" ON public.agent_sessions;
CREATE POLICY "Service role can insert sessions"
  ON public.agent_sessions FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update sessions" ON public.agent_sessions;
CREATE POLICY "Service role can update sessions"
  ON public.agent_sessions FOR UPDATE TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "shopify_webhooks_service_insert" ON public.shopify_webhook_events;
CREATE POLICY "shopify_webhooks_service_insert"
  ON public.shopify_webhook_events FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "shopify_webhooks_service_update" ON public.shopify_webhook_events;
CREATE POLICY "shopify_webhooks_service_update"
  ON public.shopify_webhook_events FOR UPDATE TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
