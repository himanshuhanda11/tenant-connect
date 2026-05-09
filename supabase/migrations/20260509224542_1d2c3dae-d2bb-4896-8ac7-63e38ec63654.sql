ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS whatsapp_profile_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_profile_saved_at timestamp with time zone;