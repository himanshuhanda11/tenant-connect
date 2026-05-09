CREATE OR REPLACE FUNCTION public.verify_plan_security_invariants()
RETURNS TABLE(check_name text, passed boolean, detail text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_tbl text;
  v_rls_tables text[] := ARRAY[
    'subscriptions','workspace_entitlements','platform_plans',
    'message_credits','user_roles','tenants','tenant_members',
    'campaigns','automation_workflows','templates'
  ];
  v_trigger_tables text[] := ARRAY[
    'tenant_members','automation_workflows','campaigns','templates'
  ];
  v_count int;
BEGIN
  -- 1. RLS enabled on every sensitive table
  FOREACH v_tbl IN ARRAY v_rls_tables LOOP
    SELECT count(*) INTO v_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = v_tbl AND c.relrowsecurity;
    check_name := 'rls_enabled.' || v_tbl;
    passed     := v_count = 1;
    detail     := CASE WHEN passed THEN 'ok' ELSE 'RLS DISABLED or table missing' END;
    RETURN NEXT;
  END LOOP;

  -- 2. Plan-enforcement BEFORE INSERT triggers exist
  FOREACH v_tbl IN ARRAY v_trigger_tables LOOP
    SELECT count(*) INTO v_count
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = v_tbl
       AND NOT t.tgisinternal
       AND t.tgname LIKE '%plan_access%';
    check_name := 'plan_trigger.' || v_tbl;
    passed     := v_count >= 1;
    detail     := CASE WHEN passed THEN 'ok' ELSE 'Missing enforce_plan_access_trigger' END;
    RETURN NEXT;
  END LOOP;

  -- 3. SECURITY DEFINER functions exist
  FOR v_tbl IN SELECT unnest(ARRAY[
      'check_plan_access','enforce_plan_access',
      'enforce_subscription_grace_period'
  ]) LOOP
    SELECT count(*) INTO v_count
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_tbl AND p.prosecdef = true;
    check_name := 'secdef_function.' || v_tbl;
    passed     := v_count >= 1;
    detail     := CASE WHEN passed THEN 'ok' ELSE 'Function missing or not SECURITY DEFINER' END;
    RETURN NEXT;
  END LOOP;

  -- 4. Daily grace-period cron job scheduled
  BEGIN
    SELECT count(*) INTO v_count
      FROM cron.job
     WHERE command ILIKE '%enforce_subscription_grace_period%';
    check_name := 'cron.grace_period_daily';
    passed     := v_count >= 1;
    detail     := CASE WHEN passed THEN 'ok' ELSE 'Cron job not scheduled' END;
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    check_name := 'cron.grace_period_daily';
    passed     := false;
    detail     := 'pg_cron not accessible: ' || SQLERRM;
    RETURN NEXT;
  END;

  -- 5. Webhook idempotency index
  SELECT count(*) INTO v_count
    FROM pg_indexes
   WHERE schemaname = 'public'
     AND indexname = 'uq_billing_events_provider_event_id';
  check_name := 'idempotency.billing_events';
  passed     := v_count = 1;
  detail     := CASE WHEN passed THEN 'ok' ELSE 'Unique index missing' END;
  RETURN NEXT;

  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_plan_security_invariants() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_plan_security_invariants() TO authenticated, service_role;