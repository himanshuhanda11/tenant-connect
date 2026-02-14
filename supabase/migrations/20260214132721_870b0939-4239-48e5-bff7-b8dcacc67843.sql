
-- 1.1 RPC: assign_conversation (admin assigns, does NOT claim)
-- Drop the old simple version first
DROP FUNCTION IF EXISTS public.assign_conversation(uuid, uuid, uuid, boolean);

CREATE OR REPLACE FUNCTION public.assign_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_assigned_to uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  -- Enforce only owner/admin can assign
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = p_tenant_id
      AND tm.user_id = v_user
      AND tm.role IN ('owner','admin')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  UPDATE public.conversations
  SET
    assigned_to = p_assigned_to,
    assigned_at = now(),
    version = version + 1,
    status = CASE WHEN status::text = 'new' THEN 'open'::conversation_status ELSE status END,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details)
  VALUES (p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent',
          jsonb_build_object('action', 'admin_assign', 'assigned_to', p_assigned_to));

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 1.2 RPC: transfer_conversation (changes assigned_to, optionally resets claim)
CREATE OR REPLACE FUNCTION public.transfer_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_new_assigned_to uuid,
  p_reset_claim boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_prev_assigned uuid;
BEGIN
  -- Enforce only owner/admin can transfer
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = p_tenant_id
      AND tm.user_id = v_user
      AND tm.role IN ('owner','admin')
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  SELECT assigned_to INTO v_prev_assigned
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  UPDATE public.conversations
  SET
    assigned_to = p_new_assigned_to,
    assigned_at = now(),
    claimed_by = CASE WHEN p_reset_claim THEN NULL ELSE claimed_by END,
    claimed_at = CASE WHEN p_reset_claim THEN NULL ELSE claimed_at END,
    version = version + 1,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details)
  VALUES (p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent',
          jsonb_build_object('action', 'transferred', 'previous_assigned_to', v_prev_assigned,
                             'assigned_to', p_new_assigned_to, 'reset_claim', p_reset_claim));

  RETURN jsonb_build_object('ok', true);
END;
$$;
