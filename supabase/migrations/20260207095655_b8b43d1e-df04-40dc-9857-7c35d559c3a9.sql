
-- =============================================
-- 1) BILLING EVENTS (canonical event log)
-- =============================================
CREATE TABLE IF NOT EXISTS public.platform_billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text NOT NULL,
  workspace_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'ok',
  provider_event_id text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_events_time ON public.platform_billing_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_billing_events_ws ON public.platform_billing_events(workspace_id);

ALTER TABLE public.platform_billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view billing events"
  ON public.platform_billing_events FOR SELECT
  USING (public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Service role insert billing events"
  ON public.platform_billing_events FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 2) INVOICES
-- =============================================
CREATE TABLE IF NOT EXISTS public.platform_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_invoice_id text,
  invoice_number text NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'paid',
  billed_to jsonb NOT NULL DEFAULT '{}',
  line_items jsonb NOT NULL DEFAULT '[]',
  period_start timestamptz,
  period_end timestamptz,
  pdf_path text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_ws ON public.platform_invoices(workspace_id);

ALTER TABLE public.platform_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view their invoices"
  ON public.platform_invoices FOR SELECT
  USING (public.is_tenant_member(workspace_id) OR public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Service role insert invoices"
  ON public.platform_invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role update invoices"
  ON public.platform_invoices FOR UPDATE
  USING (true);

-- =============================================
-- 3) WORKSPACE CREDITS (for Razorpay proration)
-- =============================================
CREATE TABLE IF NOT EXISTS public.workspace_credits (
  workspace_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.workspace_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view their credits"
  ON public.workspace_credits FOR SELECT
  USING (public.is_tenant_member(workspace_id) OR public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Service role manage credits"
  ON public.workspace_credits FOR ALL
  USING (true);

-- =============================================
-- 4) WORKSPACE PHONE NUMBERS (1:1 mapping)
-- =============================================
CREATE TABLE IF NOT EXISTS public.workspace_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uniq_phone_e164 UNIQUE (phone_e164),
  CONSTRAINT uniq_workspace_one_phone UNIQUE (workspace_id)
);

ALTER TABLE public.workspace_phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view their phone number"
  ON public.workspace_phone_numbers FOR SELECT
  USING (public.is_tenant_member(workspace_id) OR public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Workspace admins can manage phone numbers"
  ON public.workspace_phone_numbers FOR ALL
  USING (public.is_tenant_admin(workspace_id) OR public.is_platform_user(ARRAY['super_admin','support']));

-- =============================================
-- 5) RISK EVENTS (anti-fraud)
-- =============================================
CREATE TABLE IF NOT EXISTS public.platform_risk_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  ip text,
  action text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_actor_time ON public.platform_risk_events(actor_user_id, created_at);

ALTER TABLE public.platform_risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view risk events"
  ON public.platform_risk_events FOR SELECT
  USING (public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Service role insert risk events"
  ON public.platform_risk_events FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 6) HELPER FUNCTIONS
-- =============================================

-- Owner workspace count
CREATE OR REPLACE FUNCTION public.owner_workspace_count(p_owner uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT count(*)::int FROM public.tenant_members WHERE user_id = p_owner AND role = 'owner';
$$;

-- Generate next invoice number
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  seq int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS int)), 0) + 1
  INTO seq FROM public.platform_invoices;
  RETURN 'INV-' || LPAD(seq::text, 6, '0');
END;
$$;

-- Revenue summary for admin dashboard
CREATE OR REPLACE FUNCTION public.platform_revenue_summary(p_days int DEFAULT 30)
RETURNS TABLE(
  gross numeric,
  refunds numeric,
  net numeric,
  payments_count bigint,
  active_subscriptions bigint
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    COALESCE(SUM(CASE WHEN event_type IN ('payment_succeeded','invoice_paid') THEN amount ELSE 0 END), 0) AS gross,
    COALESCE(SUM(CASE WHEN event_type = 'refund' THEN amount ELSE 0 END), 0) AS refunds,
    COALESCE(SUM(CASE WHEN event_type IN ('payment_succeeded','invoice_paid') THEN amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN event_type = 'refund' THEN amount ELSE 0 END), 0) AS net,
    COUNT(*) FILTER (WHERE event_type IN ('payment_succeeded','invoice_paid')) AS payments_count,
    (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active') AS active_subscriptions
  FROM public.platform_billing_events
  WHERE occurred_at >= now() - (p_days || ' days')::interval;
$$;

-- Daily revenue breakdown
CREATE OR REPLACE FUNCTION public.platform_revenue_daily(p_days int DEFAULT 30)
RETURNS TABLE(
  day date,
  gross numeric,
  refunds numeric,
  net numeric,
  payments_count bigint
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    date_trunc('day', occurred_at)::date AS day,
    COALESCE(SUM(CASE WHEN event_type IN ('payment_succeeded','invoice_paid') THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN event_type = 'refund' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN event_type IN ('payment_succeeded','invoice_paid') THEN amount ELSE 0 END), 0)
      - COALESCE(SUM(CASE WHEN event_type = 'refund' THEN amount ELSE 0 END), 0),
    COUNT(*) FILTER (WHERE event_type IN ('payment_succeeded','invoice_paid'))
  FROM public.platform_billing_events
  WHERE occurred_at >= now() - (p_days || ' days')::interval
  GROUP BY 1
  ORDER BY 1;
$$;

-- Check workspace creation velocity
CREATE OR REPLACE FUNCTION public.check_workspace_creation_allowed(p_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  recent_count int;
  owned_count int;
BEGIN
  -- Max 3 workspace creates per hour
  SELECT COUNT(*) INTO recent_count
  FROM public.platform_risk_events
  WHERE actor_user_id = p_user_id
    AND action = 'workspace_create_attempt'
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 3 THEN RETURN FALSE; END IF;

  -- Max 2 free workspaces per owner
  SELECT public.owner_workspace_count(p_user_id) INTO owned_count;
  IF owned_count >= 2 THEN RETURN FALSE; END IF;

  -- Log attempt
  INSERT INTO public.platform_risk_events (actor_user_id, action)
  VALUES (p_user_id, 'workspace_create_attempt');

  RETURN TRUE;
END;
$$;

-- Check payment attempt velocity
CREATE OR REPLACE FUNCTION public.check_payment_attempt_allowed(p_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  recent_fails int;
BEGIN
  SELECT COUNT(*) INTO recent_fails
  FROM public.platform_risk_events
  WHERE actor_user_id = p_user_id
    AND action = 'payment_failed'
    AND created_at > now() - interval '1 hour';

  IF recent_fails >= 5 THEN RETURN FALSE; END IF;

  RETURN TRUE;
END;
$$;
