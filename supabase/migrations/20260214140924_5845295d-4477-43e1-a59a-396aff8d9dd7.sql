
CREATE OR REPLACE FUNCTION public.open_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_auto_claim boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_assigned uuid;
  v_was_unassigned boolean;
BEGIN
  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_member');
  END IF;

  -- Check current assignment
  SELECT assigned_to IS NULL INTO v_was_unassigned
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  -- Update open tracking + soft lock
  UPDATE public.conversations
  SET
    last_opened_at = now(),
    last_opened_by = v_user,
    locked_by = v_user,
    locked_at = now(),
    version = version + 1,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  -- Auto-claim if unassigned
  IF p_auto_claim AND v_was_unassigned THEN
    UPDATE public.conversations c
    SET
      assigned_to = v_user,
      claimed_by = v_user,
      claimed_at = now(),
      status = 'open'::conversation_status,
      version = c.version + 1,
      updated_at = now()
    WHERE c.id = p_conversation_id
      AND c.tenant_id = p_tenant_id
      AND c.assigned_to IS NULL
    RETURNING c.assigned_to INTO v_assigned;

    IF v_assigned IS NOT NULL THEN
      INSERT INTO public.smeksh_conversation_events (
        tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details
      ) VALUES (
        p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent',
        jsonb_build_object('action', 'auto_claimed_on_open', 'assigned_to', v_assigned)
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'auto_claimed', v_assigned IS NOT NULL);
END;
$$;
