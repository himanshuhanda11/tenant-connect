
CREATE OR REPLACE FUNCTION public.consume_message_credit(
  p_tenant_id uuid,
  p_campaign_id uuid,
  p_message_id uuid,
  p_description text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_before integer;
  v_balance_after integer;
BEGIN
  -- Ensure wallet row exists, lock it
  INSERT INTO message_credits (tenant_id, balance, total_purchased, total_used)
  VALUES (p_tenant_id, 0, 0, 0)
  ON CONFLICT (tenant_id) DO NOTHING;

  SELECT balance INTO v_balance_before
    FROM message_credits
    WHERE tenant_id = p_tenant_id
    FOR UPDATE;

  IF COALESCE(v_balance_before, 0) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_credits', 'balance', COALESCE(v_balance_before, 0));
  END IF;

  v_balance_after := v_balance_before - 1;

  UPDATE message_credits
    SET balance = v_balance_after,
        total_used = total_used + 1,
        updated_at = now()
    WHERE tenant_id = p_tenant_id;

  INSERT INTO credit_transactions (
    tenant_id, amount, balance_before, balance_after, type, status,
    description, related_campaign_id, related_message_id, metadata
  ) VALUES (
    p_tenant_id, -1, v_balance_before, v_balance_after,
    'usage', 'completed',
    COALESCE(p_description, 'Template message sent'),
    p_campaign_id, p_message_id,
    '{}'::jsonb
  );

  RETURN jsonb_build_object('ok', true, 'balance_after', v_balance_after);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_message_credit(uuid,uuid,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_message_credit(uuid,uuid,uuid,text) TO service_role;

CREATE OR REPLACE FUNCTION public.check_workspace_credits(
  p_tenant_id uuid,
  p_required integer
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available integer;
BEGIN
  SELECT COALESCE(balance, 0) INTO v_available
    FROM message_credits WHERE tenant_id = p_tenant_id;
  v_available := COALESCE(v_available, 0);
  RETURN jsonb_build_object(
    'available', v_available,
    'required', p_required,
    'sufficient', v_available >= p_required
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_workspace_credits(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_workspace_credits(uuid,integer) TO authenticated, service_role;
