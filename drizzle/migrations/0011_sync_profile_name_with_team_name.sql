CREATE OR REPLACE FUNCTION public.sync_profile_name_from_agent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(btrim(NEW.display_name), '') = '' OR NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.display_name IS NOT DISTINCT FROM OLD.display_name THEN
    RETURN NEW;
  END IF;
  -- Only for people in a single workspace; multi-workspace users keep their own name.
  IF (SELECT count(*) FROM public.tenant_members tm WHERE tm.user_id = NEW.user_id) = 1 THEN
    UPDATE public.profiles
       SET full_name = btrim(NEW.display_name), updated_at = now()
     WHERE id = NEW.user_id
       AND full_name IS DISTINCT FROM btrim(NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_profile_name_from_agent() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_agents_sync_profile_name ON public.agents;
CREATE TRIGGER trg_agents_sync_profile_name
AFTER INSERT OR UPDATE OF display_name ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_name_from_agent();

UPDATE public.profiles p
   SET full_name = btrim(a.display_name), updated_at = now()
  FROM public.agents a
 WHERE a.user_id = p.id
   AND coalesce(btrim(a.display_name), '') <> ''
   AND p.full_name IS DISTINCT FROM btrim(a.display_name)
   AND (SELECT count(*) FROM public.tenant_members tm WHERE tm.user_id = a.user_id) = 1;