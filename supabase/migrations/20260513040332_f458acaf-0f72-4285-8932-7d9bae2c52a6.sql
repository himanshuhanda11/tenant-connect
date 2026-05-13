ALTER TABLE public.whatsapp_meta_pricing_rates
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'seed',
  ADD COLUMN IF NOT EXISTS synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS synced_waba_id text,
  ADD COLUMN IF NOT EXISTS sample_size integer;

CREATE TABLE IF NOT EXISTS public.meta_pricing_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  wabas_processed integer NOT NULL DEFAULT 0,
  rates_upserted integer NOT NULL DEFAULT 0,
  error text,
  detail jsonb
);

ALTER TABLE public.meta_pricing_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins read sync runs"
  ON public.meta_pricing_sync_runs FOR SELECT TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins manage sync runs"
  ON public.meta_pricing_sync_runs FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));