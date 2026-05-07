
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS step_signup_at timestamptz,
  ADD COLUMN IF NOT EXISTS step_org_done_at timestamptz,
  ADD COLUMN IF NOT EXISTS step_password_done_at timestamptz,
  ADD COLUMN IF NOT EXISTS step_workspace_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS step_completed_at timestamptz;

-- Backfill signup time for existing rows
UPDATE public.profiles SET step_signup_at = created_at WHERE step_signup_at IS NULL;

-- Backfill completed/org for existing
UPDATE public.profiles
SET step_org_done_at = COALESCE(step_org_done_at, updated_at)
WHERE onboarding_step IN ('org_done','completed') AND step_org_done_at IS NULL;

UPDATE public.profiles
SET step_completed_at = COALESCE(step_completed_at, updated_at)
WHERE onboarding_step = 'completed' AND step_completed_at IS NULL;

-- Trigger to auto-stamp step transitions going forward
CREATE OR REPLACE FUNCTION public.stamp_onboarding_step_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.step_signup_at IS NULL THEN
    NEW.step_signup_at := COALESCE(NEW.created_at, now());
  END IF;
  IF TG_OP = 'INSERT' OR NEW.onboarding_step IS DISTINCT FROM OLD.onboarding_step THEN
    IF NEW.onboarding_step = 'org_done' AND NEW.step_org_done_at IS NULL THEN
      NEW.step_org_done_at := now();
    END IF;
    IF NEW.onboarding_step = 'completed' THEN
      IF NEW.step_org_done_at IS NULL THEN NEW.step_org_done_at := now(); END IF;
      IF NEW.step_password_done_at IS NULL THEN NEW.step_password_done_at := now(); END IF;
      IF NEW.step_completed_at IS NULL THEN NEW.step_completed_at := now(); END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_stamp_onboarding ON public.profiles;
CREATE TRIGGER profiles_stamp_onboarding
BEFORE INSERT OR UPDATE OF onboarding_step ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.stamp_onboarding_step_changes();

-- Stamp password & workspace creation moments
CREATE OR REPLACE FUNCTION public.stamp_workspace_created_for_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'owner' THEN
    UPDATE public.profiles
      SET step_workspace_created_at = COALESCE(step_workspace_created_at, now())
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tenant_members_stamp_workspace ON public.tenant_members;
CREATE TRIGGER tenant_members_stamp_workspace
AFTER INSERT ON public.tenant_members
FOR EACH ROW EXECUTE FUNCTION public.stamp_workspace_created_for_owner();

-- Backfill workspace_created_at from existing memberships
UPDATE public.profiles p
SET step_workspace_created_at = sub.first_owned_at
FROM (
  SELECT user_id, MIN(created_at) AS first_owned_at
  FROM public.tenant_members WHERE role = 'owner'
  GROUP BY user_id
) sub
WHERE p.id = sub.user_id AND p.step_workspace_created_at IS NULL;
