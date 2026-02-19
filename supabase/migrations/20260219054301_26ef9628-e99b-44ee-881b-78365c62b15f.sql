
CREATE OR REPLACE FUNCTION public.smeksh_auto_route_conversation(p_workspace_id uuid, p_conversation_id uuid, p_trigger_event text DEFAULT 'new_conversation'::text, p_only_if_unassigned boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rule routing_rules;
  v_profile_id uuid;
  v_strategy text;
  v_team_id uuid;
  v_result jsonb;
BEGIN
  SELECT * INTO v_rule
  FROM routing_rules
  WHERE tenant_id = p_workspace_id
    AND is_active = true
    AND (condition_type = p_trigger_event OR condition_type = 'all')
  ORDER BY priority ASC
  LIMIT 1;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_active_rules');
  END IF;

  v_strategy := v_rule.strategy;
  v_team_id := v_rule.assign_to_team_id;

  IF v_rule.assign_to_user_id IS NOT NULL THEN
    v_profile_id := v_rule.assign_to_user_id;
    v_strategy := 'specific_agent';
  ELSIF v_team_id IS NOT NULL THEN
    CASE v_strategy
      WHEN 'round_robin' THEN
        v_profile_id := smeksh_pick_profile_round_robin(p_workspace_id, v_team_id, false);
      WHEN 'least_busy' THEN
        v_profile_id := smeksh_pick_profile_least_busy(p_workspace_id, v_team_id, false, NULL);
      ELSE
        v_profile_id := smeksh_pick_profile_round_robin(p_workspace_id, v_team_id, false);
    END CASE;
    
    IF v_profile_id IS NULL AND v_rule.fallback_strategy IS NOT NULL THEN
      CASE v_rule.fallback_strategy
        WHEN 'round_robin' THEN
          v_profile_id := smeksh_pick_profile_round_robin(p_workspace_id, v_team_id, false);
        WHEN 'least_busy' THEN
          v_profile_id := smeksh_pick_profile_least_busy(p_workspace_id, v_team_id, false, NULL);
        ELSE
          NULL;
      END CASE;
    END IF;
  END IF;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_available_agent');
  END IF;

  IF smeksh_assign_conversation(p_workspace_id, p_conversation_id, v_profile_id, p_only_if_unassigned) THEN
    INSERT INTO audit_logs (tenant_id, action, resource_type, resource_id, user_id, details)
    VALUES (
      p_workspace_id,
      'conversation.assigned',
      'conversation',
      p_conversation_id,
      v_profile_id,
      jsonb_build_object(
        'strategy', v_strategy,
        'assigned_to', v_profile_id,
        'rule_id', v_rule.id,
        'team_id', v_team_id
      )
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'assigned_to', v_profile_id,
      'strategy', v_strategy,
      'rule_id', v_rule.id
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'reason', 'already_assigned');
  END IF;
END;
$function$;
