
CREATE OR REPLACE FUNCTION public.guard_subscription_mutations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := current_setting('request.jwt.claim.role', true);
  v_grant text := current_setting('app.in_offer_grant', true);
  v_db_role text := current_user;
BEGIN
  IF v_role = 'service_role' THEN RETURN NEW; END IF;
  IF v_grant = 'on' THEN RETURN NEW; END IF;
  -- Privileged DB roles (covers the new sb_secret_* service key format that
  -- does not populate request.jwt.claim.role).
  IF v_db_role IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS NOT NULL AND public.is_super_admin() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Subscriptions can only be created by verified payment webhooks or platform admins';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.plan_id IS DISTINCT FROM OLD.plan_id
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end
       OR NEW.current_period_start IS DISTINCT FROM OLD.current_period_start
       OR NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle
    THEN
      RAISE EXCEPTION 'Plan, status, or period fields can only be changed by verified payment webhooks or platform admins';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Subscriptions cannot be deleted by clients';
  END IF;

  RETURN NEW;
END;
$$;
