-- =============================================
-- SMEKSH Campaigns Module Schema (Advanced)
-- =============================================

-- Enum types for campaigns
CREATE TYPE smeksh_campaign_type AS ENUM ('broadcast', 'drip', 'retarget', 'ctwa_followup', 'ab_test');
CREATE TYPE smeksh_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'paused', 'completed', 'failed', 'cancelled');
CREATE TYPE smeksh_campaign_goal AS ENUM ('announcement', 'promotion', 'followup', 'education', 'reminder', 'engagement');
CREATE TYPE smeksh_job_status AS ENUM ('queued', 'processing', 'sent', 'delivered', 'read', 'replied', 'failed', 'cancelled', 'skipped');

-- =============================================
-- 1) Enhanced Campaigns Table
-- =============================================
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS campaign_type smeksh_campaign_type DEFAULT 'broadcast';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS goal smeksh_campaign_goal;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS audience_source text; -- segment / tags / csv / ctwa
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS audience_config jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS include_segments uuid[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS exclude_segments uuid[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS include_tags uuid[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS exclude_tags uuid[];
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS template_variables jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS header_media_url text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS header_media_type text; -- image/video/document

-- Delivery settings
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS business_hours_only boolean DEFAULT false;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS quiet_hours_start time;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS quiet_hours_end time;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS messages_per_minute integer DEFAULT 30;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS max_per_hour integer DEFAULT 1000;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS max_per_day integer DEFAULT 10000;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS frequency_cap_days integer DEFAULT 0; -- 0 = no cap

-- A/B Testing
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS is_ab_test boolean DEFAULT false;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS ab_variant text; -- 'A' or 'B' or null for parent
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS ab_parent_id uuid REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS ab_split_ratio integer DEFAULT 50; -- percentage for variant A
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS ab_winner_metric text; -- reply_rate / read_rate / conversion

-- Progress tracking
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS queued_count integer DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS processing_count integer DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS replied_count integer DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS skipped_count integer DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS paused_at timestamptz;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS error_message text;

-- Conversion tracking
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS conversion_tag_id uuid REFERENCES tags(id) ON DELETE SET NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS conversion_count integer DEFAULT 0;

-- =============================================
-- 2) Campaign Jobs Table (Message Queue)
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaign_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  phone_number_id uuid NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
  
  status smeksh_job_status NOT NULL DEFAULT 'queued',
  priority integer DEFAULT 0,
  
  -- Message content (denormalized for worker efficiency)
  template_name text NOT NULL,
  template_language text NOT NULL DEFAULT 'en',
  template_variables jsonb DEFAULT '{}'::jsonb,
  header_media_url text,
  
  -- Recipient info
  recipient_phone text NOT NULL,
  recipient_name text,
  
  -- Processing
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  
  -- Results
  wamid text, -- WhatsApp message ID
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  failed_at timestamptz,
  error_code text,
  error_message text,
  
  -- Skip reasons
  skip_reason text, -- opt_out / invalid_phone / frequency_cap / no_opt_in
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_jobs_tenant_campaign ON campaign_jobs(tenant_id, campaign_id);
CREATE INDEX idx_campaign_jobs_status_scheduled ON campaign_jobs(status, scheduled_at) WHERE status = 'queued';
CREATE INDEX idx_campaign_jobs_contact ON campaign_jobs(contact_id);
CREATE INDEX idx_campaign_jobs_wamid ON campaign_jobs(wamid) WHERE wamid IS NOT NULL;

-- =============================================
-- 3) Campaign Templates (Saved Campaigns Library)
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  category text, -- festival / reminder / promotion / education
  industry text, -- ecommerce / education / healthcare / general
  
  -- Campaign config snapshot
  campaign_type smeksh_campaign_type DEFAULT 'broadcast',
  goal smeksh_campaign_goal,
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  template_variables jsonb DEFAULT '{}'::jsonb,
  audience_config jsonb DEFAULT '{}'::jsonb,
  delivery_config jsonb DEFAULT '{}'::jsonb,
  
  is_public boolean DEFAULT false, -- visible to all workspaces (for system templates)
  use_count integer DEFAULT 0,
  
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_templates_tenant ON campaign_templates(tenant_id);
CREATE INDEX idx_campaign_templates_category ON campaign_templates(category);

-- =============================================
-- 4) Campaign Analytics Snapshots
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  snapshot_hour timestamptz NOT NULL,
  
  -- Counts at this hour
  queued integer DEFAULT 0,
  sent integer DEFAULT 0,
  delivered integer DEFAULT 0,
  read_count integer DEFAULT 0,
  replied integer DEFAULT 0,
  failed integer DEFAULT 0,
  skipped integer DEFAULT 0,
  converted integer DEFAULT 0,
  
  -- Rates
  delivery_rate numeric(5,2),
  read_rate numeric(5,2),
  reply_rate numeric(5,2),
  conversion_rate numeric(5,2),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(campaign_id, snapshot_hour)
);

CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id, snapshot_hour);

-- =============================================
-- 5) Campaign Audience Uploads (CSV imports)
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaign_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  source text NOT NULL, -- csv / segment / tags / ctwa
  
  -- For CSV uploads
  storage_path text,
  original_filename text,
  total_rows integer DEFAULT 0,
  valid_rows integer DEFAULT 0,
  invalid_rows integer DEFAULT 0,
  duplicate_rows integer DEFAULT 0,
  
  -- For segment/tag sources
  segment_ids uuid[],
  tag_ids uuid[],
  
  processing_status text DEFAULT 'pending', -- pending / processing / completed / failed
  processing_error text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_audiences_campaign ON campaign_audiences(campaign_id);

-- =============================================
-- 6) Triggers for updated_at
-- =============================================
DROP TRIGGER IF EXISTS trg_campaign_jobs_updated ON campaign_jobs;
CREATE TRIGGER trg_campaign_jobs_updated
  BEFORE UPDATE ON campaign_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_campaign_templates_updated ON campaign_templates;
CREATE TRIGGER trg_campaign_templates_updated
  BEFORE UPDATE ON campaign_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_campaign_audiences_updated ON campaign_audiences;
CREATE TRIGGER trg_campaign_audiences_updated
  BEFORE UPDATE ON campaign_audiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7) RLS Policies
-- =============================================
ALTER TABLE campaign_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_audiences ENABLE ROW LEVEL SECURITY;

-- Campaign Jobs RLS
CREATE POLICY "campaign_jobs_tenant_isolation" ON campaign_jobs
  FOR ALL USING (is_tenant_member(tenant_id));

-- Campaign Templates RLS
CREATE POLICY "campaign_templates_tenant_read" ON campaign_templates
  FOR SELECT USING (is_tenant_member(tenant_id) OR is_public = true);

CREATE POLICY "campaign_templates_tenant_write" ON campaign_templates
  FOR ALL USING (is_tenant_member(tenant_id));

-- Campaign Analytics RLS
CREATE POLICY "campaign_analytics_tenant_isolation" ON campaign_analytics
  FOR ALL USING (is_tenant_member(tenant_id));

-- Campaign Audiences RLS
CREATE POLICY "campaign_audiences_tenant_isolation" ON campaign_audiences
  FOR ALL USING (is_tenant_member(tenant_id));

-- =============================================
-- 8) Helper Functions
-- =============================================

-- Lock and fetch due campaign jobs for processing
CREATE OR REPLACE FUNCTION lock_campaign_jobs(p_limit integer DEFAULT 50, p_locked_by text DEFAULT 'worker')
RETURNS SETOF campaign_jobs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id FROM campaign_jobs
    WHERE status = 'queued'
      AND scheduled_at <= now()
    ORDER BY priority DESC, scheduled_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE campaign_jobs j
  SET status = 'processing',
      locked_at = now(),
      locked_by = p_locked_by,
      attempts = attempts + 1,
      updated_at = now()
  FROM due
  WHERE j.id = due.id
  RETURNING j.*;
END;
$$;

-- Complete a campaign job with final status
CREATE OR REPLACE FUNCTION complete_campaign_job(
  p_job_id uuid,
  p_status smeksh_job_status,
  p_wamid text DEFAULT NULL,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE campaign_jobs
  SET status = p_status,
      wamid = COALESCE(p_wamid, wamid),
      sent_at = CASE WHEN p_status IN ('sent', 'delivered', 'read', 'replied') THEN COALESCE(sent_at, now()) ELSE sent_at END,
      failed_at = CASE WHEN p_status = 'failed' THEN now() ELSE failed_at END,
      error_code = COALESCE(p_error_code, error_code),
      error_message = COALESCE(p_error_message, error_message),
      locked_at = NULL,
      locked_by = NULL,
      updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- Update campaign progress counters
CREATE OR REPLACE FUNCTION update_campaign_progress(p_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE campaigns c
  SET 
    queued_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status = 'queued'),
    processing_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status = 'processing'),
    sent_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status IN ('sent', 'delivered', 'read', 'replied')),
    delivered_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status IN ('delivered', 'read', 'replied')),
    read_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status IN ('read', 'replied')),
    replied_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status = 'replied'),
    failed_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status = 'failed'),
    skipped_count = (SELECT COUNT(*) FROM campaign_jobs WHERE campaign_id = p_campaign_id AND status = 'skipped'),
    updated_at = now()
  WHERE id = p_campaign_id;
  
  -- Update status to completed if all jobs processed
  UPDATE campaigns
  SET status = 'completed',
      completed_at = now()
  WHERE id = p_campaign_id
    AND status = 'sending'
    AND NOT EXISTS (
      SELECT 1 FROM campaign_jobs 
      WHERE campaign_id = p_campaign_id 
      AND status IN ('queued', 'processing')
    );
END;
$$;

-- Pause campaign - cancel all queued jobs
CREATE OR REPLACE FUNCTION pause_campaign(p_campaign_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cancelled_count integer;
BEGIN
  UPDATE campaign_jobs
  SET status = 'cancelled',
      updated_at = now()
  WHERE campaign_id = p_campaign_id
    AND status = 'queued';
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  
  UPDATE campaigns
  SET status = 'paused',
      paused_at = now(),
      updated_at = now()
  WHERE id = p_campaign_id;
  
  RETURN cancelled_count;
END;
$$;

-- Enable realtime for campaign jobs status
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_jobs;