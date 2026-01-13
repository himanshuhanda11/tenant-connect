
-- =====================================================
-- SMEKSH Campaigns Complete Schema (using existing enums)
-- =====================================================

-- Add new enum types that don't exist
DO $$ BEGIN
  CREATE TYPE smeksh_audience_source AS ENUM ('segment','tags','csv','manual','ctwa');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_event_type AS ENUM ('queued','sent','delivered','read','replied','failed','skipped','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_ab_status AS ENUM ('draft','running','completed','winner_selected','stopped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_winner_metric AS ENUM ('reply_rate','read_rate','conversion_rate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_report_status AS ENUM ('generating','ready','failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Helper function for updated_at triggers
CREATE OR REPLACE FUNCTION smeksh_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1) smeksh_campaigns (master campaign record)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  name text NOT NULL,
  description text,

  campaign_type smeksh_campaign_type NOT NULL DEFAULT 'broadcast',
  status smeksh_campaign_status NOT NULL DEFAULT 'draft',

  waba_id text,
  phone_number_id text,

  template_name text NOT NULL DEFAULT '',
  template_language text NOT NULL DEFAULT 'en',
  template_category text,
  template_components jsonb NOT NULL DEFAULT '{}'::jsonb,

  variable_map jsonb NOT NULL DEFAULT '{}'::jsonb,

  send_mode text NOT NULL DEFAULT 'schedule',
  scheduled_at timestamptz,
  timezone text DEFAULT 'UTC',

  business_hours_only boolean NOT NULL DEFAULT false,
  quiet_hours jsonb,

  throttle_per_minute int NOT NULL DEFAULT 60,
  throttle_per_hour int,
  max_per_day int,

  frequency_cap_days int DEFAULT 0,
  exclude_recently_messaged_hours int DEFAULT 0,

  enforce_opt_in boolean NOT NULL DEFAULT true,
  require_opt_in_for_marketing boolean NOT NULL DEFAULT true,

  audience_estimated int NOT NULL DEFAULT 0,
  queued_count int NOT NULL DEFAULT 0,
  sent_count int NOT NULL DEFAULT 0,
  delivered_count int NOT NULL DEFAULT 0,
  read_count int NOT NULL DEFAULT 0,
  replied_count int NOT NULL DEFAULT 0,
  failed_count int NOT NULL DEFAULT 0,
  skipped_count int NOT NULL DEFAULT 0,
  cancelled_count int NOT NULL DEFAULT 0,

  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_campaigns_ws_status_idx
  ON public.smeksh_campaigns(tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS smeksh_campaigns_ws_sched_idx
  ON public.smeksh_campaigns(tenant_id, status, scheduled_at);

DROP TRIGGER IF EXISTS trg_smeksh_campaigns_touch ON public.smeksh_campaigns;
CREATE TRIGGER trg_smeksh_campaigns_touch
BEFORE UPDATE ON public.smeksh_campaigns
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_campaigns_select" ON public.smeksh_campaigns;
CREATE POLICY "smeksh_campaigns_select" ON public.smeksh_campaigns FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "smeksh_campaigns_insert" ON public.smeksh_campaigns;
CREATE POLICY "smeksh_campaigns_insert" ON public.smeksh_campaigns FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "smeksh_campaigns_update" ON public.smeksh_campaigns;
CREATE POLICY "smeksh_campaigns_update" ON public.smeksh_campaigns FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "smeksh_campaigns_delete" ON public.smeksh_campaigns;
CREATE POLICY "smeksh_campaigns_delete" ON public.smeksh_campaigns FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 2) smeksh_campaign_audiences
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_campaign_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.smeksh_campaigns(id) ON DELETE CASCADE,

  source smeksh_audience_source NOT NULL,
  segment_id uuid,
  include_tags text[],
  exclude_tags text[],
  filter_tree jsonb NOT NULL DEFAULT '{}'::jsonb,
  csv_storage_path text,

  estimated_count int NOT NULL DEFAULT 0,
  deduped_count int NOT NULL DEFAULT 0,
  invalid_count int NOT NULL DEFAULT 0,
  excluded_optout_count int NOT NULL DEFAULT 0,
  excluded_frequencycap_count int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_campaign_audiences_campaign_idx
  ON public.smeksh_campaign_audiences(campaign_id);

ALTER TABLE public.smeksh_campaign_audiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_campaign_audiences_all" ON public.smeksh_campaign_audiences;
CREATE POLICY "smeksh_campaign_audiences_all" ON public.smeksh_campaign_audiences FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 3) smeksh_campaign_jobs (queue of messages to send)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_campaign_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.smeksh_campaigns(id) ON DELETE CASCADE,

  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  phone_e164 text NOT NULL,

  status smeksh_job_status NOT NULL DEFAULT 'queued',

  wa_message_id text,
  error_code text,
  error_message text,

  rendered_payload jsonb NOT NULL DEFAULT '{}'::jsonb,

  execute_at timestamptz NOT NULL DEFAULT now(),
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  next_retry_at timestamptz,

  locked_at timestamptz,
  locked_by text,

  ab_variant text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS smeksh_campaign_jobs_unique_idx
  ON public.smeksh_campaign_jobs(campaign_id, phone_e164);

CREATE INDEX IF NOT EXISTS smeksh_campaign_jobs_due_idx
  ON public.smeksh_campaign_jobs(status, execute_at);

CREATE INDEX IF NOT EXISTS smeksh_campaign_jobs_ws_idx
  ON public.smeksh_campaign_jobs(tenant_id, campaign_id, status);

CREATE INDEX IF NOT EXISTS smeksh_campaign_jobs_msg_idx
  ON public.smeksh_campaign_jobs(tenant_id, wa_message_id);

DROP TRIGGER IF EXISTS trg_smeksh_campaign_jobs_touch ON public.smeksh_campaign_jobs;
CREATE TRIGGER trg_smeksh_campaign_jobs_touch
BEFORE UPDATE ON public.smeksh_campaign_jobs
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_campaign_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_campaign_jobs_all" ON public.smeksh_campaign_jobs;
CREATE POLICY "smeksh_campaign_jobs_all" ON public.smeksh_campaign_jobs FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 4) smeksh_campaign_events (delivery/read/replied timeline)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.smeksh_campaigns(id) ON DELETE CASCADE,

  job_id uuid REFERENCES public.smeksh_campaign_jobs(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,

  event_type smeksh_event_type NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),

  wa_message_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_campaign_events_ws_time_idx
  ON public.smeksh_campaign_events(tenant_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS smeksh_campaign_events_campaign_idx
  ON public.smeksh_campaign_events(campaign_id, occurred_at);

CREATE INDEX IF NOT EXISTS smeksh_campaign_events_msg_idx
  ON public.smeksh_campaign_events(tenant_id, wa_message_id);

ALTER TABLE public.smeksh_campaign_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_campaign_events_select" ON public.smeksh_campaign_events;
CREATE POLICY "smeksh_campaign_events_select" ON public.smeksh_campaign_events FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "smeksh_campaign_events_insert" ON public.smeksh_campaign_events;
CREATE POLICY "smeksh_campaign_events_insert" ON public.smeksh_campaign_events FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 5) smeksh_campaign_ab_tests (A/B split + winner)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_campaign_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.smeksh_campaigns(id) ON DELETE CASCADE,

  status smeksh_ab_status NOT NULL DEFAULT 'draft',
  winner_metric smeksh_winner_metric NOT NULL DEFAULT 'reply_rate',

  split_ratio_a int NOT NULL DEFAULT 50,
  split_ratio_b int NOT NULL DEFAULT 50,

  template_a_name text NOT NULL DEFAULT '',
  template_a_language text NOT NULL DEFAULT 'en',
  template_a_components jsonb NOT NULL DEFAULT '{}'::jsonb,
  variable_map_a jsonb NOT NULL DEFAULT '{}'::jsonb,

  template_b_name text NOT NULL DEFAULT '',
  template_b_language text NOT NULL DEFAULT 'en',
  template_b_components jsonb NOT NULL DEFAULT '{}'::jsonb,
  variable_map_b jsonb NOT NULL DEFAULT '{}'::jsonb,

  winner_variant text,
  started_at timestamptz,
  ended_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(campaign_id)
);

CREATE INDEX IF NOT EXISTS smeksh_ab_campaign_idx ON public.smeksh_campaign_ab_tests(campaign_id);

DROP TRIGGER IF EXISTS trg_smeksh_ab_touch ON public.smeksh_campaign_ab_tests;
CREATE TRIGGER trg_smeksh_ab_touch
BEFORE UPDATE ON public.smeksh_campaign_ab_tests
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_campaign_ab_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_campaign_ab_tests_all" ON public.smeksh_campaign_ab_tests;
CREATE POLICY "smeksh_campaign_ab_tests_all" ON public.smeksh_campaign_ab_tests FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 6) smeksh_campaign_reports (exports + PDFs)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.smeksh_campaign_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.smeksh_campaigns(id) ON DELETE CASCADE,

  status smeksh_report_status NOT NULL DEFAULT 'generating',
  report_type text NOT NULL DEFAULT 'csv',
  storage_bucket text NOT NULL DEFAULT 'reports',
  storage_path text,

  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,

  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_reports_ws_idx ON public.smeksh_campaign_reports(tenant_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_smeksh_reports_touch ON public.smeksh_campaign_reports;
CREATE TRIGGER trg_smeksh_reports_touch
BEFORE UPDATE ON public.smeksh_campaign_reports
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE public.smeksh_campaign_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smeksh_campaign_reports_all" ON public.smeksh_campaign_reports;
CREATE POLICY "smeksh_campaign_reports_all" ON public.smeksh_campaign_reports FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- =====================================================
-- 7) Operational Functions
-- =====================================================

CREATE OR REPLACE FUNCTION pause_smeksh_campaign(p_campaign_id uuid, p_tenant_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.smeksh_campaigns
  SET status = 'paused'
  WHERE id = p_campaign_id AND tenant_id = p_tenant_id;

  UPDATE public.smeksh_campaign_jobs
  SET status = 'cancelled', updated_at = now()
  WHERE campaign_id = p_campaign_id AND tenant_id = p_tenant_id AND status = 'queued';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_smeksh_campaign(p_campaign_id uuid, p_tenant_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.smeksh_campaigns
  SET status = 'cancelled'
  WHERE id = p_campaign_id AND tenant_id = p_tenant_id;

  UPDATE public.smeksh_campaign_jobs
  SET status = 'cancelled', updated_at = now()
  WHERE campaign_id = p_campaign_id AND tenant_id = p_tenant_id AND status IN ('queued', 'processing');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION lock_smeksh_campaign_jobs(p_worker_id text, p_limit int DEFAULT 50)
RETURNS SETOF public.smeksh_campaign_jobs AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM public.smeksh_campaign_jobs
    WHERE status = 'queued'
      AND execute_at <= now()
    ORDER BY execute_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.smeksh_campaign_jobs j
  SET status = 'processing', locked_at = now(), locked_by = p_worker_id
  FROM due
  WHERE j.id = due.id
  RETURNING j.*;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_smeksh_campaign_job(
  p_job_id uuid,
  p_status smeksh_job_status,
  p_wa_message_id text DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_campaign_id uuid;
  v_tenant_id uuid;
BEGIN
  SELECT campaign_id, tenant_id INTO v_campaign_id, v_tenant_id
  FROM public.smeksh_campaign_jobs WHERE id = p_job_id;

  UPDATE public.smeksh_campaign_jobs
  SET 
    status = p_status,
    wa_message_id = COALESCE(p_wa_message_id, wa_message_id),
    error_code = p_error_code,
    error_message = p_error_message,
    locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
  WHERE id = p_job_id;

  IF p_status = 'sent' THEN
    UPDATE public.smeksh_campaigns SET sent_count = sent_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'delivered' THEN
    UPDATE public.smeksh_campaigns SET delivered_count = delivered_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'read' THEN
    UPDATE public.smeksh_campaigns SET read_count = read_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'replied' THEN
    UPDATE public.smeksh_campaigns SET replied_count = replied_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'failed' THEN
    UPDATE public.smeksh_campaigns SET failed_count = failed_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'skipped' THEN
    UPDATE public.smeksh_campaigns SET skipped_count = skipped_count + 1 WHERE id = v_campaign_id;
  ELSIF p_status = 'cancelled' THEN
    UPDATE public.smeksh_campaigns SET cancelled_count = cancelled_count + 1 WHERE id = v_campaign_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_campaigns;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.smeksh_campaign_jobs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
