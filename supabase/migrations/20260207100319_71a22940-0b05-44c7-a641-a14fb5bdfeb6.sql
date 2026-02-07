
-- Drop old workspace_phone_numbers if it exists from previous migration (incomplete version)
DROP TABLE IF EXISTS public.workspace_phone_numbers CASCADE;

-- 1) Full table
CREATE TABLE public.workspace_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  display_name text,
  provider text NOT NULL DEFAULT 'meta',
  status text NOT NULL DEFAULT 'pending',
  quality_rating text,
  messaging_limit integer,
  waba_id text,
  phone_number_id text,
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_one_phone_per_workspace UNIQUE (workspace_id),
  CONSTRAINT uniq_phone_global UNIQUE (phone_e164)
);

-- 2) updated_at trigger
CREATE OR REPLACE FUNCTION public.set_wpn_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = 'public' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_workspace_phone_numbers_updated_at
BEFORE UPDATE ON public.workspace_phone_numbers
FOR EACH ROW EXECUTE FUNCTION public.set_wpn_updated_at();

-- 3) RLS
ALTER TABLE public.workspace_phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read phone number for workspace members"
ON public.workspace_phone_numbers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_phone_numbers.workspace_id
      AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "update phone number for workspace admins"
ON public.workspace_phone_numbers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_phone_numbers.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner','admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_phone_numbers.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner','admin')
  )
);

-- Platform admins can read all
CREATE POLICY "platform admins read all phone numbers"
ON public.workspace_phone_numbers FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- No INSERT/DELETE policies — only edge functions (service role) can insert/delete

-- 4) Onboarding status on tenants
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'new';

-- 5) Control center view
CREATE OR REPLACE VIEW public.platform_phone_numbers_view AS
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
