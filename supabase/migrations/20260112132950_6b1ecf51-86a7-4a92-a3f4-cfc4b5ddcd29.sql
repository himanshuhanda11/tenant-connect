-- Fix the security definer view issue by using SECURITY INVOKER
-- This ensures the view uses the RLS policies of the querying user
DROP VIEW IF EXISTS public.waba_accounts_public;

CREATE VIEW public.waba_accounts_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  tenant_id,
  business_id,
  waba_id,
  name,
  status,
  created_at,
  updated_at
FROM public.waba_accounts;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.waba_accounts_public TO authenticated;