
-- Add claim/lock/version columns to conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS last_opened_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS last_opened_at timestamptz,
ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS locked_at timestamptz,
ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 0;

-- Create claim_conversation RPC
CREATE OR REPLACE FUNCTION public.claim_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_assigned uuid;
  v_current_status text;
BEGIN
  -- Check membership
  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_member');
  END IF;

  -- Attempt atomic claim
  UPDATE public.conversations c
  SET
    assigned_to = COALESCE(c.assigned_to, v_user),
    claimed_by = COALESCE(c.claimed_by, v_user),
    claimed_at = COALESCE(c.claimed_at, now()),
    status = CASE WHEN c.status IN ('new', 'open') THEN 'open' ELSE c.status END,
    version = c.version + 1,
    updated_at = now()
  WHERE c.id = p_conversation_id
    AND c.tenant_id = p_tenant_id
    AND (c.assigned_to IS NULL OR c.assigned_to = v_user)
  RETURNING c.assigned_to INTO v_assigned;

  IF v_assigned IS NULL THEN
    -- Already claimed by someone else
    SELECT assigned_to INTO v_assigned
    FROM public.conversations
    WHERE id = p_conversation_id AND tenant_id = p_tenant_id;
    
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed', 'assigned_to', v_assigned);
  END IF;

  -- Log event
  INSERT INTO public.smeksh_conversation_events (
    tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details
  ) VALUES (
    p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent',
    jsonb_build_object('action', 'claimed', 'assigned_to', v_assigned)
  );

  RETURN jsonb_build_object('ok', true, 'assigned_to', v_assigned);
END;
$$;

-- Create open_conversation RPC (logs open + optional auto-claim)
CREATE OR REPLACE FUNCTION public.open_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid,
  p_auto_claim boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
      status = CASE WHEN c.status IN ('new') THEN 'open' ELSE c.status END,
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

-- Create intervene_conversation RPC
CREATE OR REPLACE FUNCTION public.intervene_conversation(
  p_tenant_id uuid,
  p_conversation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_prev_assigned uuid;
BEGIN
  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_member');
  END IF;

  -- Get current owner
  SELECT assigned_to INTO v_prev_assigned
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  -- Intervene: reassign to this agent
  UPDATE public.conversations
  SET
    assigned_to = v_user,
    is_intervened = true,
    intervened_by = v_user,
    intervened_at = now(),
    version = version + 1,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  -- Log event
  INSERT INTO public.smeksh_conversation_events (
    tenant_id, conversation_id, event_type, actor_profile_id, actor_type, details
  ) VALUES (
    p_tenant_id, p_conversation_id, 'intervened', v_user, 'agent',
    jsonb_build_object('previous_assigned_to', v_prev_assigned, 'new_assigned_to', v_user)
  );

  RETURN jsonb_build_object('ok', true, 'previous_owner', v_prev_assigned);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.claim_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_conversation(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.intervene_conversation(uuid, uuid) TO authenticated;
