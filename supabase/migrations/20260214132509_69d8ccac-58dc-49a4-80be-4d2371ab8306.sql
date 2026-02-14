
-- STEP 1: Add assigned_at column
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- STEP 2: Create claim_on_reply RPC
CREATE OR REPLACE FUNCTION public.claim_on_reply(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_actor_id uuid,
  p_takeover boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_assigned uuid;
  v_claimed_by uuid;
BEGIN
  SELECT assigned_to, claimed_by
  INTO v_assigned, v_claimed_by
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  -- Already claimed
  IF v_claimed_by IS NOT NULL THEN
    IF v_claimed_by <> p_actor_id THEN
      INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details)
      VALUES (p_tenant_id, p_conversation_id, 'intervened', p_actor_id, 'agent',
              jsonb_build_object('claimed_by', v_claimed_by, 'assigned_to', v_assigned));
    END IF;
    RETURN jsonb_build_object('ok', true, 'mode', 'already_claimed', 'claimed_by', v_claimed_by);
  END IF;

  -- Not claimed yet: if unassigned, or assigned to actor, or takeover allowed
  IF v_assigned IS NULL OR v_assigned = p_actor_id OR p_takeover = true THEN
    UPDATE public.conversations
    SET
      assigned_to = COALESCE(assigned_to, p_actor_id),
      assigned_at = COALESCE(assigned_at, now()),
      claimed_by = p_actor_id,
      claimed_at = now(),
      status = CASE WHEN status::text = 'new' THEN 'open'::conversation_status ELSE status END,
      version = version + 1,
      updated_at = now()
    WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

    INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details)
    VALUES (p_tenant_id, p_conversation_id, 'assigned', p_actor_id, 'agent',
            jsonb_build_object('action', 'claimed_on_reply', 'assigned_to', COALESCE(v_assigned, p_actor_id)));

    RETURN jsonb_build_object('ok', true, 'mode', 'claimed', 'claimed_by', p_actor_id);
  END IF;

  -- Assigned to another person, takeover not allowed => log intervened only
  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details)
  VALUES (p_tenant_id, p_conversation_id, 'intervened', p_actor_id, 'agent',
          jsonb_build_object('assigned_to', v_assigned, 'reason', 'assigned_to_other'));

  RETURN jsonb_build_object('ok', true, 'mode', 'intervened_only', 'assigned_to', v_assigned);
END;
$$;

-- Also update assign_conversation to set assigned_at
CREATE OR REPLACE FUNCTION public.assign_conversation(p_tenant_id uuid, p_conversation_id uuid, p_profile_id uuid, p_only_if_unassigned boolean DEFAULT true)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rows_affected int;
BEGIN
  IF p_only_if_unassigned THEN
    UPDATE conversations
    SET assigned_to = p_profile_id,
        assigned_at = now(),
        updated_at = now()
    WHERE id = p_conversation_id
      AND tenant_id = p_tenant_id
      AND assigned_to IS NULL;
  ELSE
    UPDATE conversations
    SET assigned_to = p_profile_id,
        assigned_at = now(),
        updated_at = now()
    WHERE id = p_conversation_id
      AND tenant_id = p_tenant_id;
  END IF;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;
