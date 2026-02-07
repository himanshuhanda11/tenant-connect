
-- Fix security definer view by making it SECURITY INVOKER (default for new views, but let's be explicit)
DROP VIEW IF EXISTS public.platform_phone_numbers_view;

CREATE VIEW public.platform_phone_numbers_view
WITH (security_invoker = true) AS
SELECT
  wpn.id,
  wpn.workspace_id,
  t.name AS workspace_name,
  wpn.phone_e164,
  wpn.status,
  wpn.quality_rating,
  wpn.messaging_limit,
  wpn.provider,
  wpn.is_primary,
  wpn.created_at,
  wpn.updated_at
FROM public.workspace_phone_numbers wpn
JOIN public.tenants t ON t.id = wpn.workspace_id;
