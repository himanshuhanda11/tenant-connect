
-- Fix security definer views by making them security invoker
ALTER VIEW public.admin_kpi_overview SET (security_invoker = on);
ALTER VIEW public.admin_workspace_directory SET (security_invoker = on);
