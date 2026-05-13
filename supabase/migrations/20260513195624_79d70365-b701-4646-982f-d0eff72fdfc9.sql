-- Backfill stale entitlement flags for existing workspaces.
-- For any row where the plan grants a capability but the row has it disabled,
-- flip it on. Never downgrades a manually-disabled higher-tier flag back on
-- once disabled by an admin in the future (this is a one-time backfill).
UPDATE public.workspace_entitlements e
SET
  enable_ai           = GREATEST(e.enable_ai::int,           ((public.plan_defaults(e.plan)->>'enable_ai')::bool)::int)::bool,
  enable_ads          = GREATEST(e.enable_ads::int,          ((public.plan_defaults(e.plan)->>'enable_ads')::bool)::int)::bool,
  enable_integrations = GREATEST(e.enable_integrations::int, ((public.plan_defaults(e.plan)->>'enable_integrations')::bool)::int)::bool,
  enable_autoforms    = GREATEST(e.enable_autoforms::int,    ((public.plan_defaults(e.plan)->>'enable_autoforms')::bool)::int)::bool
WHERE e.plan IN ('basic','pro','business');

-- Make the plan-defaults trigger fire on ANY update where plan changes OR
-- where the feature flags are still below what the plan grants.
CREATE OR REPLACE FUNCTION public.apply_plan_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE d jsonb;
BEGIN
  d := public.plan_defaults(NEW.plan);
  NEW.team_member_limit          := COALESCE(NEW.team_member_limit, (d->>'team_member_limit')::int);
  NEW.automation_limit           := COALESCE(NEW.automation_limit, (d->>'automation_limit')::int);
  NEW.monthly_flow_limit         := COALESCE(NEW.monthly_flow_limit, (d->>'monthly_flow_limit')::int);
  NEW.widget_limit               := COALESCE(NEW.widget_limit, (d->>'widget_limit')::int);
  NEW.integration_limit          := COALESCE(NEW.integration_limit, (d->>'integration_limit')::int);
  NEW.campaign_limit             := COALESCE(NEW.campaign_limit, (d->>'campaign_limit')::int);
  NEW.monthly_broadcast_limit    := COALESCE(NEW.monthly_broadcast_limit, (d->>'monthly_broadcast_limit')::int);
  NEW.monthly_template_limit     := COALESCE(NEW.monthly_template_limit, (d->>'monthly_template_limit')::int);
  NEW.monthly_conversation_limit := COALESCE(NEW.monthly_conversation_limit, (d->>'monthly_conversation_limit')::int);
  NEW.ai_usage_limit             := COALESCE(NEW.ai_usage_limit, (d->>'ai_usage_limit')::int);

  IF TG_OP = 'INSERT' OR OLD.plan IS DISTINCT FROM NEW.plan THEN
    -- On plan change, force-grant whatever the plan unlocks (never silently disable).
    NEW.enable_ai           := GREATEST(COALESCE(NEW.enable_ai,false)::int,           ((d->>'enable_ai')::bool)::int)::bool;
    NEW.enable_ads          := GREATEST(COALESCE(NEW.enable_ads,false)::int,          ((d->>'enable_ads')::bool)::int)::bool;
    NEW.enable_integrations := GREATEST(COALESCE(NEW.enable_integrations,false)::int, ((d->>'enable_integrations')::bool)::int)::bool;
    NEW.enable_autoforms    := GREATEST(COALESCE(NEW.enable_autoforms,false)::int,    ((d->>'enable_autoforms')::bool)::int)::bool;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_plan_defaults ON public.workspace_entitlements;
CREATE TRIGGER trg_apply_plan_defaults
  BEFORE INSERT OR UPDATE ON public.workspace_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.apply_plan_defaults();