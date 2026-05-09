
CREATE OR REPLACE FUNCTION public.enforce_subscription_grace_period()
RETURNS TABLE(workspace_id uuid, action text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grace interval := interval '3 days';
BEGIN
  RETURN QUERY
  WITH expired AS (
    SELECT s.tenant_id
    FROM subscriptions s
    WHERE s.current_period_end IS NOT NULL
      AND s.current_period_end < (now() - v_grace)
      AND s.status::text NOT IN ('active','trialing')
  ),
  paused AS (
    UPDATE workspace_entitlements e
    SET sending_paused = true,
        plan = 'free',
        updated_at = now()
    FROM expired x
    WHERE e.workspace_id = x.tenant_id
      AND (e.sending_paused IS DISTINCT FROM true OR e.plan <> 'free')
    RETURNING e.workspace_id
  )
  SELECT p.workspace_id, 'paused_and_downgraded'::text FROM paused p;

  -- Audit log entry per downgrade
  INSERT INTO access_denied_log(tenant_id, user_id, feature_key, reason, current_plan)
  SELECT s.tenant_id, NULL, 'subscription_grace_expired', 'auto_downgrade', 'free'
  FROM subscriptions s
  WHERE s.current_period_end < (now() - v_grace)
    AND s.status::text NOT IN ('active','trialing')
    AND NOT EXISTS (
      SELECT 1 FROM access_denied_log a
      WHERE a.tenant_id = s.tenant_id
        AND a.feature_key = 'subscription_grace_expired'
        AND a.created_at > now() - interval '24 hours'
    );
END;
$$;

-- Schedule daily at 02:00 UTC (uses pg_cron, no HTTP secrets needed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('enforce-subscription-grace-period')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'enforce-subscription-grace-period');
    PERFORM cron.schedule(
      'enforce-subscription-grace-period',
      '0 2 * * *',
      $cmd$ SELECT public.enforce_subscription_grace_period(); $cmd$
    );
  END IF;
END $$;
