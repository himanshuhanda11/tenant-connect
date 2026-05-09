
-- Generic trigger that reads the feature key from trigger arguments
CREATE OR REPLACE FUNCTION public.enforce_plan_access_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_feature_key text;
  v_tenant_id uuid;
  v_is_service boolean;
BEGIN
  -- Skip enforcement for service_role (webhooks, internal jobs)
  BEGIN
    v_is_service := current_setting('request.jwt.claim.role', true) = 'service_role';
  EXCEPTION WHEN OTHERS THEN
    v_is_service := false;
  END;

  -- Also skip if no auth context (background jobs running as postgres)
  IF auth.uid() IS NULL OR v_is_service THEN
    RETURN NEW;
  END IF;

  v_feature_key := TG_ARGV[0];
  v_tenant_id := NEW.tenant_id;

  IF v_tenant_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM public.enforce_plan_access(v_tenant_id, v_feature_key);
  RETURN NEW;
END;
$$;

-- tenant_members: invite_member
DROP TRIGGER IF EXISTS trg_enforce_plan_invite_member ON public.tenant_members;
CREATE TRIGGER trg_enforce_plan_invite_member
  BEFORE INSERT ON public.tenant_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_access_trigger('invite_member');

-- automation_workflows: create_automation
DROP TRIGGER IF EXISTS trg_enforce_plan_create_automation ON public.automation_workflows;
CREATE TRIGGER trg_enforce_plan_create_automation
  BEFORE INSERT ON public.automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_access_trigger('create_automation');

-- campaigns: send_campaign
DROP TRIGGER IF EXISTS trg_enforce_plan_send_campaign ON public.campaigns;
CREATE TRIGGER trg_enforce_plan_send_campaign
  BEFORE INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_access_trigger('send_campaign');

-- templates: create_template
DROP TRIGGER IF EXISTS trg_enforce_plan_create_template ON public.templates;
CREATE TRIGGER trg_enforce_plan_create_template
  BEFORE INSERT ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_plan_access_trigger('create_template');
