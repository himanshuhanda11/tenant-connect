
REVOKE SELECT ON public.platform_account_health FROM authenticated, anon;
ALTER VIEW public.platform_account_health SET (security_invoker = true);
GRANT SELECT ON public.platform_account_health TO service_role;
