
-- Upsert function for contact_inbox_summary with lead_state computation
CREATE OR REPLACE FUNCTION public.upsert_contact_inbox_summary(
  p_tenant_id uuid,
  p_contact_id uuid,
  p_phone_number_id text,
  p_conversation_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_assigned_to uuid;
  v_assigned_at timestamptz;
  v_claimed_by uuid;
  v_claimed_at timestamptz;
  v_last_inbound_at timestamptz;
  v_last_outbound_at timestamptz;
  v_last_replied_by uuid;
  v_last_replied_at timestamptz;
  v_last_message_at timestamptz;
  v_conv_id uuid;
  v_conv_status text;
  v_is_unreplied boolean;
  v_lead_state text;
BEGIN
  -- Find the open (or most recent) conversation for this contact+phone
  SELECT 
    c.id, c.status, c.assigned_to, c.assigned_at,
    c.claimed_by, c.claimed_at,
    c.last_inbound_at, c.last_message_at
  INTO 
    v_conv_id, v_conv_status, v_assigned_to, v_assigned_at,
    v_claimed_by, v_claimed_at,
    v_last_inbound_at, v_last_message_at
  FROM conversations c
  WHERE c.tenant_id = p_tenant_id
    AND c.contact_id = p_contact_id
    AND c.phone_number_id = p_phone_number_id
  ORDER BY 
    CASE WHEN c.status != 'closed' THEN 0 ELSE 1 END,
    c.last_message_at DESC NULLS LAST
  LIMIT 1;

  -- Use passed conversation_id if provided and we didn't find one
  IF v_conv_id IS NULL AND p_conversation_id IS NOT NULL THEN
    SELECT 
      c.id, c.status, c.assigned_to, c.assigned_at,
      c.claimed_by, c.claimed_at,
      c.last_inbound_at, c.last_message_at
    INTO 
      v_conv_id, v_conv_status, v_assigned_to, v_assigned_at,
      v_claimed_by, v_claimed_at,
      v_last_inbound_at, v_last_message_at
    FROM conversations c
    WHERE c.id = p_conversation_id;
  END IF;

  -- If still no conversation, nothing to summarize
  IF v_conv_id IS NULL THEN
    RETURN;
  END IF;

  -- Get last outbound message info
  SELECT m.created_at, m.sender_id
  INTO v_last_outbound_at, v_last_replied_by
  FROM messages m
  WHERE m.conversation_id = v_conv_id
    AND m.direction = 'outbound'
  ORDER BY m.created_at DESC
  LIMIT 1;

  v_last_replied_at := v_last_outbound_at;

  -- Compute is_unreplied
  v_is_unreplied := (
    v_last_inbound_at IS NOT NULL 
    AND (v_last_outbound_at IS NULL OR v_last_outbound_at < v_last_inbound_at)
  );

  -- Compute lead_state
  IF v_conv_status = 'closed' THEN
    v_lead_state := 'closed';
  ELSIF v_is_unreplied THEN
    v_lead_state := 'unreplied';
  ELSIF v_claimed_at IS NOT NULL THEN
    v_lead_state := 'claimed';
  ELSIF v_assigned_to IS NOT NULL AND v_claimed_at IS NULL THEN
    v_lead_state := 'assigned_pending';
  ELSE
    v_lead_state := 'new';
  END IF;

  -- Upsert
  INSERT INTO contact_inbox_summary (
    tenant_id, contact_id, phone_number_id,
    assigned_to, assigned_at, claimed_by, claimed_at,
    last_inbound_at, last_outbound_at, last_replied_by, last_replied_at,
    last_message_at, open_conversation_id,
    is_unreplied, lead_state, updated_at
  ) VALUES (
    p_tenant_id, p_contact_id, p_phone_number_id,
    v_assigned_to, v_assigned_at, v_claimed_by, v_claimed_at,
    v_last_inbound_at, v_last_outbound_at, v_last_replied_by, v_last_replied_at,
    v_last_message_at, v_conv_id,
    v_is_unreplied, v_lead_state, now()
  )
  ON CONFLICT (tenant_id, contact_id, phone_number_id)
  DO UPDATE SET
    assigned_to = EXCLUDED.assigned_to,
    assigned_at = EXCLUDED.assigned_at,
    claimed_by = EXCLUDED.claimed_by,
    claimed_at = EXCLUDED.claimed_at,
    last_inbound_at = EXCLUDED.last_inbound_at,
    last_outbound_at = EXCLUDED.last_outbound_at,
    last_replied_by = EXCLUDED.last_replied_by,
    last_replied_at = EXCLUDED.last_replied_at,
    last_message_at = EXCLUDED.last_message_at,
    open_conversation_id = EXCLUDED.open_conversation_id,
    is_unreplied = EXCLUDED.is_unreplied,
    lead_state = EXCLUDED.lead_state,
    updated_at = now();
END;
$$;

-- Auto-trigger on conversation changes (claim/assign/transfer/close)
CREATE OR REPLACE FUNCTION public.trigger_update_inbox_summary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Get phone_number_id as text for the summary table
  PERFORM upsert_contact_inbox_summary(
    NEW.tenant_id,
    NEW.contact_id,
    NEW.phone_number_id
  );
  RETURN NEW;
END;
$$;

-- Trigger on conversations table for assign/claim/transfer/close
DROP TRIGGER IF EXISTS trg_inbox_summary_on_conv ON public.conversations;
CREATE TRIGGER trg_inbox_summary_on_conv
  AFTER INSERT OR UPDATE OF assigned_to, claimed_by, claimed_at, status, last_message_at, last_inbound_at
  ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_inbox_summary();
