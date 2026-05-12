CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_secrets FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_app_secret(p_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM public.app_secrets WHERE key = p_key;
$$;

REVOKE EXECUTE ON FUNCTION public.get_app_secret(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.get_app_secret(text) TO postgres, service_role;