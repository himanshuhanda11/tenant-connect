
-- Add assigned_by column to track WHO assigned/transferred the lead
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES public.profiles(id);

-- Update assign_conversation RPC to set assigned_by
CREATE OR REPLACE FUNCTION public.assign_conversation(p_tenant_id uuid, p_conversation_id uuid, p_assigned_to uuid)
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

  UPDATE public.conversations
  SET
    assigned_to = p_assigned_to,
    assigned_at = now(),
    assigned_by = v_user,
    version = version + 1,
    status = CASE WHEN status::text = 'new' THEN 'open'::conversation_status ELSE status END,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
  VALUES (p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent', v_prev_assigned, p_assigned_to,
          jsonb_build_object('action', 'assign', 'assigned_to', p_assigned_to, 'previous_assigned_to', v_prev_assigned));

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Update transfer_conversation RPC to set assigned_by
CREATE OR REPLACE FUNCTION public.transfer_conversation(p_tenant_id uuid, p_conversation_id uuid, p_new_assigned_to uuid, p_reset_claim boolean DEFAULT true)
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

  UPDATE public.conversations
  SET
    assigned_to = p_new_assigned_to,
    assigned_at = now(),
    assigned_by = v_user,
    claimed_by = CASE WHEN p_reset_claim THEN NULL ELSE claimed_by END,
    claimed_at = CASE WHEN p_reset_claim THEN NULL ELSE claimed_at END,
    version = version + 1,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
  VALUES (p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent', v_prev_assigned, p_new_assigned_to,
          jsonb_build_object('action', 'transferred', 'previous_assigned_to', v_prev_assigned,
                             'assigned_to', p_new_assigned_to, 'reset_claim', p_reset_claim));

  RETURN jsonb_build_object('ok', true);
END;
$$;
