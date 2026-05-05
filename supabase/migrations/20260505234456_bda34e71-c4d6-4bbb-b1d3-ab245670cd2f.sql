CREATE TABLE IF NOT EXISTS public.marketing_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('contact','demo')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  website text,
  industry text,
  team_size text,
  use_case text,
  message text,
  preferred_date date,
  preferred_time text,
  timezone text,
  user_agent text,
  referrer text,
  ip_address text,
  status text NOT NULL DEFAULT 'new',
  internal_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_leads_source ON public.marketing_leads(source);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_created_at ON public.marketing_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_status ON public.marketing_leads(status);

ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit marketing leads"
  ON public.marketing_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Platform admins can view marketing leads"
  ON public.marketing_leads FOR SELECT
  TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Platform admins can update marketing leads"
  ON public.marketing_leads FOR UPDATE
  TO authenticated
  USING (public.is_platform_user(ARRAY['super_admin','support']))
  WITH CHECK (public.is_platform_user(ARRAY['super_admin','support']));

CREATE POLICY "Super admins can delete marketing leads"
  ON public.marketing_leads FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

CREATE TRIGGER trg_marketing_leads_updated_at
  BEFORE UPDATE ON public.marketing_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();