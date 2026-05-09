-- Fix: Allow the founding owner row to be inserted into tenant_members for a brand-new tenant.
-- The invite_member plan-gate must not fire on the very first owner insert (otherwise
-- create_tenant_with_owner fails with PLAN_ACCESS_DENIED / not_a_member).
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
  v_existing_members int;
BEGIN
  BEGIN
    v_is_service := current_setting('request.jwt.claim.role', true) = 'service_role';
  EXCEPTION WHEN OTHERS THEN
    v_is_service := false;
  END;

  IF auth.uid() IS NULL OR v_is_service THEN
    RETURN NEW;
  END IF;

  v_feature_key := TG_ARGV[0];
  v_tenant_id := NEW.tenant_id;

  IF v_tenant_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip enforcement when this is the founding owner of a brand-new tenant.
  -- Without this, the very first tenant_members insert (done inside
  -- create_tenant_with_owner) trips the invite_member gate because the user
  -- is not yet a member of the tenant they are creating.
  IF TG_TABLE_NAME = 'tenant_members' AND v_feature_key = 'invite_member' THEN
    SELECT count(*) INTO v_existing_members
      FROM public.tenant_members
     WHERE tenant_id = v_tenant_id;
    IF v_existing_members = 0 THEN
      RETURN NEW;
    END IF;
  END IF;

  PERFORM public.enforce_plan_access(v_tenant_id, v_feature_key);
  RETURN NEW;
END;
$$;