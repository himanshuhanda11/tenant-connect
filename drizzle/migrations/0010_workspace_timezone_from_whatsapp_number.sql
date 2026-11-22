
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS timezone_source text NOT NULL DEFAULT 'auto';
DO $$ BEGIN
  ALTER TABLE public.tenants ADD CONSTRAINT tenants_timezone_source_check CHECK (timezone_source IN ('auto', 'manual'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Existing non-default time zones are treated as chosen by the workspace
UPDATE public.tenants SET timezone_source = 'manual'
WHERE timezone IS NOT NULL AND timezone <> 'UTC' AND timezone_source = 'auto';

-- Suggested time zone for a WhatsApp number in any format ("+971 58 551 6542", "917010305004")
CREATE OR REPLACE FUNCTION public.suggest_timezone_for_number(p_number text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN p_number IS NULL OR regexp_replace(p_number, '\D', '', 'g') = '' THEN NULL
    -- Meta test numbers say nothing about where the business is
    WHEN regexp_replace(p_number, '\D', '', 'g') LIKE '1555%' THEN NULL
    ELSE NULLIF(public.detect_timezone_from_phone('+' || regexp_replace(p_number, '\D', '', 'g')), 'UTC')
  END
$$;

CREATE OR REPLACE FUNCTION public.apply_number_timezone_to_workspace()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tz text;
BEGIN
  IF NEW.status::text NOT IN ('connected', 'pending') THEN
    RETURN NEW;
  END IF;
  v_tz := public.suggest_timezone_for_number(NEW.display_number);
  IF v_tz IS NULL THEN
    RETURN NEW;
  END IF;
  UPDATE public.tenants
  SET timezone = v_tz, updated_at = now()
  WHERE id = NEW.tenant_id
    AND timezone_source = 'auto'
    AND timezone IS DISTINCT FROM v_tz;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_phone_numbers_workspace_timezone ON public.phone_numbers;
CREATE TRIGGER trg_phone_numbers_workspace_timezone
AFTER INSERT OR UPDATE OF status, display_number ON public.phone_numbers
FOR EACH ROW EXECUTE FUNCTION public.apply_number_timezone_to_workspace();

-- Backfill workspaces still on the automatic default
UPDATE public.tenants t
SET timezone = s.tz, updated_at = now()
FROM (
  SELECT DISTINCT ON (pn.tenant_id) pn.tenant_id, public.suggest_timezone_for_number(pn.display_number) AS tz
  FROM public.phone_numbers pn
  WHERE pn.status::text = 'connected' AND public.suggest_timezone_for_number(pn.display_number) IS NOT NULL
  ORDER BY pn.tenant_id, pn.updated_at DESC NULLS LAST
) s
WHERE s.tenant_id = t.id AND t.timezone_source = 'auto' AND (t.timezone IS NULL OR t.timezone = 'UTC');
