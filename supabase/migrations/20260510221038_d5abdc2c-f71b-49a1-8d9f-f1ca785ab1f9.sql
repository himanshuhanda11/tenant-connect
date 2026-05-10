-- Backfill: any tenant with a connected phone is considered onboarded
UPDATE public.tenants t
SET whatsapp_profile_completed = true,
    whatsapp_profile_saved_at = COALESCE(whatsapp_profile_saved_at, now())
WHERE whatsapp_profile_completed = false
  AND EXISTS (
    SELECT 1 FROM public.phone_numbers pn
    WHERE pn.tenant_id = t.id
      AND pn.status = 'connected'
  );

-- Trigger function: when a phone becomes connected, mark its tenant completed
CREATE OR REPLACE FUNCTION public.mark_tenant_profile_completed_on_connect()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'connected' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'connected') THEN
    UPDATE public.tenants
    SET whatsapp_profile_completed = true,
        whatsapp_profile_saved_at = COALESCE(whatsapp_profile_saved_at, now())
    WHERE id = NEW.tenant_id
      AND whatsapp_profile_completed = false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_tenant_profile_completed ON public.phone_numbers;
CREATE TRIGGER trg_mark_tenant_profile_completed
AFTER INSERT OR UPDATE OF status ON public.phone_numbers
FOR EACH ROW
EXECUTE FUNCTION public.mark_tenant_profile_completed_on_connect();