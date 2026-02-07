
-- 1) Payments ledger (tracks all payment attempts across providers)
CREATE TABLE IF NOT EXISTS public.platform_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'manual')),
  provider_payment_id text,
  provider_order_id text,
  provider_invoice_id text,
  provider_subscription_id text,
  plan_id text REFERENCES public.platform_plans(id),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly', 'custom')),
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_payments_workspace ON public.platform_payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_provider ON public.platform_payments(provider, provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON public.platform_payments(status);

-- 2) Enable RLS
ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;

-- Members can read their workspace payments
CREATE POLICY "read own workspace payments"
ON public.platform_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = platform_payments.workspace_id
      AND tm.user_id = auth.uid()
  )
);

-- No client-side writes — all writes via edge functions with service role

-- 3) Add workspace_subscriptions columns if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspace_entitlements' AND column_name = 'plan_id') THEN
    -- Table should already exist from previous migration
    NULL;
  END IF;
END $$;

-- 4) Trigger for updated_at on payments
CREATE OR REPLACE FUNCTION public.update_platform_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_platform_payments_updated_at
BEFORE UPDATE ON public.platform_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_payments_updated_at();
