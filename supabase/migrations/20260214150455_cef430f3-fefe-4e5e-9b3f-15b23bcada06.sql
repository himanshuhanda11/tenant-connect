
-- Credits balance per workspace
CREATE TABLE public.message_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Credit transaction history
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive = purchase, negative = usage
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'adjustment')),
  description TEXT,
  reference_id TEXT, -- e.g. message_id, payment_id
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS: workspace members can view credits
CREATE POLICY "Members can view workspace credits"
  ON public.message_credits FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- RLS: only platform admins can modify credits directly (edge functions use service role)
CREATE POLICY "Platform admins can manage credits"
  ON public.message_credits FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- RLS: members can view transaction history
CREATE POLICY "Members can view credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_message_credits_updated_at
  BEFORE UPDATE ON public.message_credits
  FOR EACH ROW EXECUTE FUNCTION public.set_wa_updated_at();

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION public.deduct_message_credit(p_tenant_id UUID, p_reference_id TEXT DEFAULT NULL, p_description TEXT DEFAULT 'Template message sent')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Atomically decrement balance, only if > 0
  UPDATE message_credits
  SET balance = balance - 1,
      total_used = total_used + 1,
      updated_at = now()
  WHERE tenant_id = p_tenant_id
    AND balance > 0
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN FALSE; -- Insufficient credits
  END IF;

  -- Log the transaction
  INSERT INTO credit_transactions (tenant_id, amount, balance_after, type, description, reference_id)
  VALUES (p_tenant_id, -1, v_new_balance, 'usage', p_description, p_reference_id);

  RETURN TRUE;
END;
$$;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_message_credits(p_tenant_id UUID, p_amount INTEGER, p_type TEXT DEFAULT 'purchase', p_description TEXT DEFAULT NULL, p_reference_id TEXT DEFAULT NULL, p_created_by UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO message_credits (tenant_id, balance, total_purchased)
  VALUES (p_tenant_id, p_amount, p_amount)
  ON CONFLICT (tenant_id) DO UPDATE
    SET balance = message_credits.balance + p_amount,
        total_purchased = message_credits.total_purchased + p_amount,
        updated_at = now()
  RETURNING balance INTO v_new_balance;

  INSERT INTO credit_transactions (tenant_id, amount, balance_after, type, description, reference_id, created_by)
  VALUES (p_tenant_id, p_amount, v_new_balance, p_type, p_description, p_reference_id, p_created_by);

  RETURN v_new_balance;
END;
$$;
