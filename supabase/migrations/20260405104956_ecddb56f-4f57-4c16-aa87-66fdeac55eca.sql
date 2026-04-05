
CREATE OR REPLACE FUNCTION public.transfer_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_new_assigned_to uuid,
  p_reset_claim boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_prev_assigned uuid;
BEGIN
  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT assigned_to INTO v_prev_assigned
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  -- Always clear claimed_by on transfer so old agent loses visibility
  UPDATE public.conversations
  SET
    assigned_to = p_new_assigned_to,
    assigned_at = now(),
    assigned_by = v_user,
    claimed_by = NULL,
    claimed_at = NULL,
    version = version + 1,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
  VALUES (p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent', v_prev_assigned, p_new_assigned_to,
          jsonb_build_object('action', 'transferred', 'previous_assigned_to', v_prev_assigned,
                             'assigned_to', p_new_assigned_to, 'reset_claim', true));

  RETURN jsonb_build_object('ok', true);
END;
$$;
