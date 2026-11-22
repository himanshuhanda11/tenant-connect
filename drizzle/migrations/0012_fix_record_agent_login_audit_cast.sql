CREATE OR REPLACE FUNCTION public.record_agent_login(p_tenant_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_id UUID;
BEGIN
  UPDATE agent_sessions
  SET session_end = now()
  WHERE tenant_id = p_tenant_id
    AND user_id = v_user_id
    AND session_end IS NULL;

  INSERT INTO agent_sessions (tenant_id, user_id)
  VALUES (p_tenant_id, v_user_id)
  RETURNING id INTO v_session_id;

  UPDATE agents
  SET is_online = true, last_active_at = now(), updated_at = now()
  WHERE tenant_id = p_tenant_id AND user_id = v_user_id;

  INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (p_tenant_id, v_user_id, 'login', 'session', v_session_id,
    jsonb_build_object('event', 'agent_login'));

  RETURN v_session_id;
END;
$function$;