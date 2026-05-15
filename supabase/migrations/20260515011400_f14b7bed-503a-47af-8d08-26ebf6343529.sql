DROP TRIGGER IF EXISTS trg_mark_tenant_profile_completed ON public.phone_numbers;

UPDATE public.tenants
SET whatsapp_profile_completed = false,
    whatsapp_profile_saved_at = NULL
WHERE whatsapp_profile_completed = true
  AND whatsapp_profile_saved_at IS NULL;