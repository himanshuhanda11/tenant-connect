
CREATE OR REPLACE FUNCTION public.upsert_contact_inbox_summary(
  p_tenant_id uuid,
  p_contact_id uuid,
  p_phone_number_id uuid,
  p_conversation_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv record;
  v_lead_state text;
BEGIN
  -- Get latest conversation data
  SELECT
    c.id,
    c.status,
    c.assigned_to,
    c.assigned_at,
    c.claimed_by,
    c.claimed_at,
    c.last_message_at,
    c.last_inbound_at,
    c.last_message_preview
  INTO v_conv
  FROM public.conversations c
  WHERE c.tenant_id = p_tenant_id
    AND c.contact_id = p_contact_id
    AND (p_conversation_id IS NULL OR c.id = p_conversation_id)
  ORDER BY c.last_message_at DESC NULLS LAST
  LIMIT 1;

  IF v_conv IS NULL THEN
    RETURN;
  END IF;

  -- Compute lead_state from conversation state
  IF v_conv.status = 'closed' THEN
    v_lead_state := 'closed';
  ELSIF v_conv.claimed_by IS NOT NULL THEN
    v_lead_state := 'claimed';
  ELSIF v_conv.assigned_to IS NOT NULL THEN
    v_lead_state := 'assigned_pending';
  ELSIF v_conv.last_inbound_at IS NOT NULL THEN
    v_lead_state := 'unreplied';
  ELSE
    v_lead_state := 'new';
  END IF;

  -- Upsert contact_inbox_summary
  INSERT INTO public.contact_inbox_summary (
    tenant_id,
    contact_id,
    phone_number_id,
    open_conversation_id,
    lead_state,
    is_unreplied,
    last_message_at,
    last_inbound_at,
    assigned_to,
    assigned_at,
    claimed_by,
    claimed_at,
    updated_at
  ) VALUES (
    p_tenant_id,
    p_contact_id,
    p_phone_number_id::text,
    v_conv.id,
    v_lead_state,
    (v_conv.last_inbound_at IS NOT NULL AND v_lead_state NOT IN ('claimed', 'closed')),
    v_conv.last_message_at,
    v_conv.last_inbound_at,
    v_conv.assigned_to,
    v_conv.assigned_at,
    v_conv.claimed_by,
    v_conv.claimed_at,
    now()
  )
  ON CONFLICT (tenant_id, contact_id, phone_number_id)
  DO UPDATE SET
    open_conversation_id = EXCLUDED.open_conversation_id,
    lead_state = EXCLUDED.lead_state,
    is_unreplied = EXCLUDED.is_unreplied,
    last_message_at = EXCLUDED.last_message_at,
    last_inbound_at = EXCLUDED.last_inbound_at,
    assigned_to = EXCLUDED.assigned_to,
    assigned_at = EXCLUDED.assigned_at,
    claimed_by = EXCLUDED.claimed_by,
    claimed_at = EXCLUDED.claimed_at,
    updated_at = now();
END;
$$;
