CREATE OR REPLACE FUNCTION public.admin_adjust_message_credits(p_tenant_id uuid, p_amount integer, p_reason text, p_admin_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet message_credits%ROWTYPE;
  v_new_balance integer;
  v_tx_id uuid;
BEGIN
  IF p_amount = 0 THEN RAISE EXCEPTION 'Amount cannot be zero'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) < 3 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  SELECT * INTO v_wallet FROM public.message_credits
    WHERE tenant_id = p_tenant_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.message_credits (tenant_id, balance, total_purchased, total_used)
      VALUES (p_tenant_id, 0, 0, 0)
      RETURNING * INTO v_wallet;
  END IF;

  v_new_balance := v_wallet.balance + p_amount;
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance for debit (balance=%, amount=%)', v_wallet.balance, p_amount;
  END IF;

  UPDATE public.message_credits
     SET balance = v_new_balance,
         total_purchased = total_purchased + GREATEST(p_amount, 0),
         updated_at = now(),
         low_balance_alert_sent_at = CASE WHEN v_new_balance >= 50 THEN NULL ELSE low_balance_alert_sent_at END
   WHERE tenant_id = p_tenant_id;

  INSERT INTO public.credit_transactions (
    tenant_id, amount, balance_after, type, description, created_by, status
  ) VALUES (
    p_tenant_id, p_amount, v_new_balance, 'adjustment',
    CASE WHEN p_amount > 0 THEN 'Admin credit: ' ELSE 'Admin debit: ' END || p_reason,
    p_admin_id, 'completed'
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'transaction_id', v_tx_id);
END;
$function$;