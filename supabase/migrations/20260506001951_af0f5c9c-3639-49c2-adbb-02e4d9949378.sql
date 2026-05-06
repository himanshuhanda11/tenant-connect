
-- 1) Fix SECURITY DEFINER view: enforce caller's RLS
ALTER VIEW public.platform_revenue_daily SET (security_invoker = on);

-- 2) Tighten smeksh_wabas: restrict SELECT to admins only (sensitive credentials)
DROP POLICY IF EXISTS "Users can view their tenant WABAs" ON public.smeksh_wabas;
CREATE POLICY "Admins can view tenant WABAs"
  ON public.smeksh_wabas FOR SELECT
  USING (public.is_tenant_admin(tenant_id));

-- 3) Conversations: prevent agents from seeing unassigned/unclaimed conversations
DROP POLICY IF EXISTS conversations_select_member ON public.conversations;
CREATE POLICY conversations_select_member
  ON public.conversations FOR SELECT
  USING (
    is_tenant_member(tenant_id)
    AND (
      NOT is_agent_role(tenant_id)
      OR assigned_to = auth.uid()
      OR claimed_by = auth.uid()
    )
  );

-- 4) form_sessions: limit insert/update to admins or service role
DROP POLICY IF EXISTS "Workspace members can insert form sessions" ON public.form_sessions;
DROP POLICY IF EXISTS "Workspace members can update form sessions" ON public.form_sessions;
CREATE POLICY "Admins or service role can insert form sessions"
  ON public.form_sessions FOR INSERT
  WITH CHECK (
    public.is_tenant_admin(tenant_id)
    OR auth.role() = 'service_role'
  );
CREATE POLICY "Admins or service role can update form sessions"
  ON public.form_sessions FOR UPDATE
  USING (
    public.is_tenant_admin(tenant_id)
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    public.is_tenant_admin(tenant_id)
    OR auth.role() = 'service_role'
  );

-- 5) Restrict permissive service-role policies to actual service_role grantee
-- platform_billing_events
DROP POLICY IF EXISTS "Service role insert billing events" ON public.platform_billing_events;
CREATE POLICY "Service role insert billing events"
  ON public.platform_billing_events FOR INSERT TO service_role
  WITH CHECK (true);

-- platform_invoices
DROP POLICY IF EXISTS "Service role insert invoices" ON public.platform_invoices;
DROP POLICY IF EXISTS "Service role update invoices" ON public.platform_invoices;
CREATE POLICY "Service role insert invoices"
  ON public.platform_invoices FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Service role update invoices"
  ON public.platform_invoices FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- platform_risk_events
DROP POLICY IF EXISTS "Service role insert risk events" ON public.platform_risk_events;
CREATE POLICY "Service role insert risk events"
  ON public.platform_risk_events FOR INSERT TO service_role
  WITH CHECK (true);

-- lead_events
DROP POLICY IF EXISTS "Service role can insert lead events" ON public.lead_events;
CREATE POLICY "Service role can insert lead events"
  ON public.lead_events FOR INSERT TO service_role
  WITH CHECK (true);

-- agent_sessions
DROP POLICY IF EXISTS "Service role can insert sessions" ON public.agent_sessions;
DROP POLICY IF EXISTS "Service role can update sessions" ON public.agent_sessions;
CREATE POLICY "Service role can insert sessions"
  ON public.agent_sessions FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Service role can update sessions"
  ON public.agent_sessions FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- shopify_webhook_events
DROP POLICY IF EXISTS shopify_webhooks_service_insert ON public.shopify_webhook_events;
DROP POLICY IF EXISTS shopify_webhooks_service_update ON public.shopify_webhook_events;
CREATE POLICY shopify_webhooks_service_insert
  ON public.shopify_webhook_events FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY shopify_webhooks_service_update
  ON public.shopify_webhook_events FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);
