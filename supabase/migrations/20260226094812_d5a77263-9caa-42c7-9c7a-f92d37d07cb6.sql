
-- Update assign_conversation to populate from/to columns
CREATE OR REPLACE FUNCTION public.assign_conversation(p_tenant_id uuid, p_conversation_id uuid, p_assigned_to uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    version = version + 1,
    status = CASE WHEN status::text = 'new' THEN 'open'::conversation_status ELSE status END,
    updated_at = now()
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
  VALUES (p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent', v_prev_assigned, p_assigned_to,
          jsonb_build_object('action', 'assign', 'assigned_to', p_assigned_to, 'previous_assigned_to', v_prev_assigned));

  RETURN jsonb_build_object('ok', true);
END;
$function$;

-- Update transfer_conversation to populate from/to columns
CREATE OR REPLACE FUNCTION public.transfer_conversation(p_tenant_id uuid, p_conversation_id uuid, p_new_assigned_to uuid, p_reset_claim boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update claim_on_reply to populate from/to columns
CREATE OR REPLACE FUNCTION public.claim_on_reply(p_tenant_id uuid, p_conversation_id uuid, p_actor_id uuid, p_takeover boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_assigned uuid;
  v_claimed_by uuid;
BEGIN
  SELECT assigned_to, claimed_by
  INTO v_assigned, v_claimed_by
  FROM public.conversations
  WHERE id = p_conversation_id AND tenant_id = p_tenant_id;

  IF v_claimed_by IS NOT NULL THEN
    IF v_claimed_by <> p_actor_id THEN
      INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
      VALUES (p_tenant_id, p_conversation_id, 'intervened', p_actor_id, 'agent', v_claimed_by, p_actor_id,
              jsonb_build_object('claimed_by', v_claimed_by, 'assigned_to', v_assigned));
    END IF;
    RETURN jsonb_build_object('ok', true, 'mode', 'already_claimed', 'claimed_by', v_claimed_by);
  END IF;

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

    INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
    VALUES (p_tenant_id, p_conversation_id, 'assigned', p_actor_id, 'agent', v_assigned, COALESCE(v_assigned, p_actor_id),
            jsonb_build_object('action', 'claimed_on_reply', 'assigned_to', COALESCE(v_assigned, p_actor_id)));

    RETURN jsonb_build_object('ok', true, 'mode', 'claimed', 'claimed_by', p_actor_id);
  END IF;

  INSERT INTO public.smeksh_conversation_events(tenant_id, conversation_id, event_type, actor_profile_id, actor_type, from_assigned_to, to_assigned_to, details)
  VALUES (p_tenant_id, p_conversation_id, 'intervened', p_actor_id, 'agent', v_assigned, p_actor_id,
          jsonb_build_object('assigned_to', v_assigned, 'reason', 'assigned_to_other'));

  RETURN jsonb_build_object('ok', true, 'mode', 'intervened_only', 'assigned_to', v_assigned);
END;
$function$;

-- Update claim_conversation to populate from/to columns
CREATE OR REPLACE FUNCTION public.claim_conversation(p_tenant_id uuid, p_conversation_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_assigned uuid;
  v_current_status text;
BEGIN
  IF NOT public.is_tenant_member(v_user, p_tenant_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_member');
  END IF;

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
    SELECT assigned_to INTO v_assigned
    FROM public.conversations
    WHERE id = p_conversation_id AND tenant_id = p_tenant_id;
    
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed', 'assigned_to', v_assigned);
  END IF;

  INSERT INTO public.smeksh_conversation_events (
    tenant_id, conversation_id, event_type, actor_profile_id, actor_type, to_assigned_to, details
  ) VALUES (
    p_tenant_id, p_conversation_id, 'assigned', v_user, 'agent', v_assigned,
    jsonb_build_object('action', 'claimed', 'assigned_to', v_assigned)
  );

  RETURN jsonb_build_object('ok', true, 'assigned_to', v_assigned);
END;
$function$;
