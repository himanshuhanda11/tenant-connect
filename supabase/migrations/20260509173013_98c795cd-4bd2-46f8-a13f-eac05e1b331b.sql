DROP POLICY IF EXISTS "Deny all client access" ON public.instagram_oauth_states;
CREATE POLICY "Deny all client access" ON public.instagram_oauth_states
  AS RESTRICTIVE FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all client access" ON public.instagram_tokens;
CREATE POLICY "Deny all client access" ON public.instagram_tokens
  AS RESTRICTIVE FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "service role full access" ON public.signup_reminder_log;
CREATE POLICY "service role full access" ON public.signup_reminder_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role insert billing events" ON public.platform_billing_events;
CREATE POLICY "Service role insert billing events" ON public.platform_billing_events
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role insert invoices" ON public.platform_invoices;
CREATE POLICY "Service role insert invoices" ON public.platform_invoices
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role update invoices" ON public.platform_invoices;
CREATE POLICY "Service role update invoices" ON public.platform_invoices
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role insert risk events" ON public.platform_risk_events;
CREATE POLICY "Service role insert risk events" ON public.platform_risk_events
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert lead events" ON public.lead_events;
CREATE POLICY "Service role can insert lead events" ON public.lead_events
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert sessions" ON public.agent_sessions;
CREATE POLICY "Service role can insert sessions" ON public.agent_sessions
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update sessions" ON public.agent_sessions;
CREATE POLICY "Service role can update sessions" ON public.agent_sessions
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shopify_webhooks_service_insert" ON public.shopify_webhook_events;
CREATE POLICY "shopify_webhooks_service_insert" ON public.shopify_webhook_events
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "shopify_webhooks_service_update" ON public.shopify_webhook_events;
CREATE POLICY "shopify_webhooks_service_update" ON public.shopify_webhook_events
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manage credits" ON public.workspace_credits;
CREATE POLICY "Service role manage credits" ON public.workspace_credits
  FOR ALL TO service_role USING (true) WITH CHECK (true);