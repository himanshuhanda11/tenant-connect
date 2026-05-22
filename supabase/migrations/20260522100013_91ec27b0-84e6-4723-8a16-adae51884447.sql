
-- Kill-switch on tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS flow_engine_enabled boolean NOT NULL DEFAULT false;

-- 1. flow_runs
CREATE TABLE IF NOT EXISTS public.flow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.flow_versions(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  trigger_type text NOT NULL,
  trigger_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text,
  status text NOT NULL DEFAULT 'running',
  current_node_key text,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  hop_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms integer,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flow_runs_tenant_flow ON public.flow_runs(tenant_id, flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_runs_status ON public.flow_runs(status) WHERE status IN ('running','waiting');
CREATE INDEX IF NOT EXISTS idx_flow_runs_contact ON public.flow_runs(contact_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_flow_runs_idem ON public.flow_runs(tenant_id, flow_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
ALTER TABLE public.flow_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flow_runs_tenant_access" ON public.flow_runs;
CREATE POLICY "flow_runs_tenant_access" ON public.flow_runs FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

-- 2. flow_run_steps
CREATE TABLE IF NOT EXISTS public.flow_run_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.flow_runs(id) ON DELETE CASCADE,
  node_key text NOT NULL,
  node_type text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  retry_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms integer,
  error text
);
CREATE INDEX IF NOT EXISTS idx_flow_run_steps_run ON public.flow_run_steps(run_id, started_at);
CREATE INDEX IF NOT EXISTS idx_flow_run_steps_tenant ON public.flow_run_steps(tenant_id);
ALTER TABLE public.flow_run_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flow_run_steps_tenant_access" ON public.flow_run_steps;
CREATE POLICY "flow_run_steps_tenant_access" ON public.flow_run_steps FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

-- 3. flow_errors
CREATE TABLE IF NOT EXISTS public.flow_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  flow_id uuid REFERENCES public.flows(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.flow_runs(id) ON DELETE SET NULL,
  node_key text,
  severity text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flow_errors_tenant ON public.flow_errors(tenant_id, resolved, created_at DESC);
ALTER TABLE public.flow_errors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flow_errors_select" ON public.flow_errors;
DROP POLICY IF EXISTS "flow_errors_insert" ON public.flow_errors;
DROP POLICY IF EXISTS "flow_errors_update" ON public.flow_errors;
DROP POLICY IF EXISTS "flow_errors_delete" ON public.flow_errors;
CREATE POLICY "flow_errors_select" ON public.flow_errors FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "flow_errors_insert" ON public.flow_errors FOR INSERT WITH CHECK (is_tenant_member(tenant_id));
CREATE POLICY "flow_errors_update" ON public.flow_errors FOR UPDATE USING (is_tenant_member(tenant_id));
CREATE POLICY "flow_errors_delete" ON public.flow_errors FOR DELETE USING (is_tenant_admin(tenant_id));

-- 4. flow_scheduled_jobs
CREATE TABLE IF NOT EXISTS public.flow_scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.flow_runs(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  resume_node_key text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  stop_on_reply boolean NOT NULL DEFAULT true,
  run_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flow_jobs_due ON public.flow_scheduled_jobs(status, run_at) WHERE status='pending';
CREATE INDEX IF NOT EXISTS idx_flow_jobs_contact ON public.flow_scheduled_jobs(contact_id) WHERE status='pending';
ALTER TABLE public.flow_scheduled_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flow_jobs_tenant_access" ON public.flow_scheduled_jobs;
CREATE POLICY "flow_jobs_tenant_access" ON public.flow_scheduled_jobs FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

-- 5. flow_analytics_daily
CREATE TABLE IF NOT EXISTS public.flow_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  date date NOT NULL,
  runs_started integer NOT NULL DEFAULT 0,
  runs_completed integer NOT NULL DEFAULT 0,
  runs_failed integer NOT NULL DEFAULT 0,
  qualified_leads integer NOT NULL DEFAULT 0,
  messages_sent integer NOT NULL DEFAULT 0,
  messages_failed integer NOT NULL DEFAULT 0,
  avg_duration_ms integer NOT NULL DEFAULT 0,
  node_dropoffs jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, flow_id, date)
);
CREATE INDEX IF NOT EXISTS idx_flow_analytics_tenant_date ON public.flow_analytics_daily(tenant_id, date DESC);
ALTER TABLE public.flow_analytics_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flow_analytics_select" ON public.flow_analytics_daily;
DROP POLICY IF EXISTS "flow_analytics_write" ON public.flow_analytics_daily;
CREATE POLICY "flow_analytics_select" ON public.flow_analytics_daily FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "flow_analytics_write" ON public.flow_analytics_daily FOR ALL USING (is_tenant_admin(tenant_id)) WITH CHECK (is_tenant_admin(tenant_id));

-- 6. contact_flow_state
CREATE TABLE IF NOT EXISTS public.contact_flow_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES public.flow_runs(id) ON DELETE CASCADE,
  current_node_key text,
  waiting_for jsonb,
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, contact_id, flow_id)
);
CREATE INDEX IF NOT EXISTS idx_contact_flow_state_lookup ON public.contact_flow_state(tenant_id, contact_id) WHERE waiting_for IS NOT NULL;
ALTER TABLE public.contact_flow_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_flow_state_tenant_access" ON public.contact_flow_state;
CREATE POLICY "contact_flow_state_tenant_access" ON public.contact_flow_state FOR ALL USING (is_tenant_member(tenant_id)) WITH CHECK (is_tenant_member(tenant_id));

-- 7. lead_custom_fields
CREATE TABLE IF NOT EXISTS public.lead_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, field_key)
);
ALTER TABLE public.lead_custom_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lcf_select" ON public.lead_custom_fields;
DROP POLICY IF EXISTS "lcf_insert" ON public.lead_custom_fields;
DROP POLICY IF EXISTS "lcf_update" ON public.lead_custom_fields;
DROP POLICY IF EXISTS "lcf_delete" ON public.lead_custom_fields;
CREATE POLICY "lcf_select" ON public.lead_custom_fields FOR SELECT USING (is_tenant_member(tenant_id));
CREATE POLICY "lcf_insert" ON public.lead_custom_fields FOR INSERT WITH CHECK (is_tenant_member(tenant_id));
CREATE POLICY "lcf_update" ON public.lead_custom_fields FOR UPDATE USING (is_tenant_member(tenant_id));
CREATE POLICY "lcf_delete" ON public.lead_custom_fields FOR DELETE USING (is_tenant_admin(tenant_id));

-- updated_at triggers
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='update_flow_updated_at') THEN
    BEGIN CREATE TRIGGER flow_runs_updated_at BEFORE UPDATE ON public.flow_runs FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE TRIGGER flow_jobs_updated_at BEFORE UPDATE ON public.flow_scheduled_jobs FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE TRIGGER contact_flow_state_updated_at BEFORE UPDATE ON public.contact_flow_state FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE TRIGGER lcf_updated_at BEFORE UPDATE ON public.lead_custom_fields FOR EACH ROW EXECUTE FUNCTION update_flow_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;
