
-- Update record_agent_login to also log to audit_logs
CREATE OR REPLACE FUNCTION public.record_agent_login(p_tenant_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_id UUID;
BEGIN
  -- Close any open sessions
  UPDATE agent_sessions
  SET session_end = now()
  WHERE tenant_id = p_tenant_id 
    AND user_id = v_user_id 
    AND session_end IS NULL;

  -- Create new session
  INSERT INTO agent_sessions (tenant_id, user_id)
  VALUES (p_tenant_id, v_user_id)
  RETURNING id INTO v_session_id;

  -- Update agent presence
  UPDATE agents
  SET is_online = true, last_active_at = now(), updated_at = now()
  WHERE tenant_id = p_tenant_id AND user_id = v_user_id;

  -- Log to audit_logs
  INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (p_tenant_id, v_user_id, 'login', 'session', v_session_id::text,
    jsonb_build_object('event', 'agent_login'));

  RETURN v_session_id;
END;
$$;

-- Update record_agent_logout to also log to audit_logs
CREATE OR REPLACE FUNCTION public.record_agent_logout(p_tenant_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Close open sessions
  UPDATE agent_sessions
  SET session_end = now()
  WHERE tenant_id = p_tenant_id 
    AND user_id = v_user_id 
    AND session_end IS NULL;

  -- Update agent presence
  UPDATE agents
  SET is_online = false, updated_at = now()
  WHERE tenant_id = p_tenant_id AND user_id = v_user_id;

  -- Log to audit_logs
  INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, details)
  VALUES (p_tenant_id, v_user_id, 'logout', 'session',
    jsonb_build_object('event', 'agent_logout'));
END;
$$;
