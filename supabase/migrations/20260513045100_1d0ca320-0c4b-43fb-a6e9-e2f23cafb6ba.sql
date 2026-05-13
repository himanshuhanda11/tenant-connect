CREATE OR REPLACE FUNCTION public.admin_adjust_message_credits(
  p_tenant_id uuid,
  p_amount integer,
  p_reason text,
  p_admin_id uuid,
  p_category text DEFAULT 'adjustment'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_before integer;
  v_balance_after integer;
  v_tx_id uuid;
BEGIN
  IF p_amount = 0 THEN
    RAISE EXCEPTION 'Amount must be non-zero';
  END IF;

  -- Ensure wallet exists
  INSERT INTO public.message_credits (tenant_id, balance, total_purchased, total_used)
  VALUES (p_tenant_id, 0, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Lock and read current balance
  SELECT balance INTO v_balance_before
  FROM public.message_credits
  WHERE tenant_id = p_tenant_id
  FOR UPDATE;

  v_balance_after := v_balance_before + p_amount;
  IF v_balance_after < 0 THEN
    RAISE EXCEPTION 'Insufficient balance: would result in %', v_balance_after;
  END IF;

  UPDATE public.message_credits
  SET balance = v_balance_after,
      updated_at = now()
  WHERE tenant_id = p_tenant_id;

  INSERT INTO public.credit_transactions (
    tenant_id, amount, balance_before, balance_after, type, status,
    description, created_by, metadata
  ) VALUES (
    p_tenant_id, p_amount, v_balance_before, v_balance_after,
    'adjustment', 'completed',
    p_reason, p_admin_id,
    jsonb_build_object(
      'category', COALESCE(p_category, 'adjustment'),
      'admin_id', p_admin_id,
      'direction', CASE WHEN p_amount > 0 THEN 'credit' ELSE 'debit' END
    )
  )
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'tx_id', v_tx_id,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'amount', p_amount,
    'category', COALESCE(p_category, 'adjustment')
  );
END;
$$;