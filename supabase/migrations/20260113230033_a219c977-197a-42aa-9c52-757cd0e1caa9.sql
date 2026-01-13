-- SMEKSH Contacts Module Schema
-- Complete contacts, attributes, segments, and imports schema

-- 0) Types / Enums
DO $$ BEGIN
  CREATE TYPE smeksh_contact_status AS ENUM ('ACTIVE','ARCHIVED','BLOCKED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_lead_status AS ENUM ('NEW','CONTACTED','QUALIFIED','CONVERTED','LOST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_deal_stage AS ENUM ('OPEN','WON','LOST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_conversation_status AS ENUM ('OPEN','PENDING','CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_mau_status AS ENUM ('ACTIVE','INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_optin_source AS ENUM ('WEBSITE','FORM','WHATSAPP','QR','CRM','IMPORT','API','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_attribute_type AS ENUM ('TEXT','NUMBER','BOOLEAN','DATE','DATETIME','SELECT','MULTISELECT','JSON');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_import_status AS ENUM ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_filter_join AS ENUM ('AND','OR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Helper function for updated_at
CREATE OR REPLACE FUNCTION smeksh_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1) SMEKSH Contacts Table
CREATE TABLE IF NOT EXISTS smeksh_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- identity
  contact_name text,
  first_name text,
  last_name text,
  email text,
  phone_e164 text NOT NULL,
  wa_id text,
  country_code text,
  language text,
  timezone text,
  profile_picture_url text,

  -- acquisition/source
  source text,
  campaign_source text,
  entry_point text,
  referrer_url text,

  -- first message / engagement
  first_message text,
  first_message_at timestamptz,
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,

  -- conversation status snapshot
  whatsapp_conversation_status smeksh_conversation_status,

  -- bot/human intervention
  intervened boolean NOT NULL DEFAULT false,
  intervened_at timestamptz,
  intervened_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  intervention_reason text,

  -- lifecycle / CRM
  requested boolean NOT NULL DEFAULT false,
  request_type text,
  request_time timestamptz,

  lead_status smeksh_lead_status NOT NULL DEFAULT 'NEW',
  deal_stage smeksh_deal_stage NOT NULL DEFAULT 'OPEN',
  closed boolean NOT NULL DEFAULT false,
  closed_reason text,
  closure_time timestamptz,

  -- assignment
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,

  -- MAU/system
  mau_status smeksh_mau_status NOT NULL DEFAULT 'INACTIVE',
  last_active_date date,

  -- WhatsApp system signals
  whatsapp_quality_rating text,
  pricing_category text,
  blocked_by_user boolean NOT NULL DEFAULT false,

  -- compliance
  opt_in_status boolean NOT NULL DEFAULT false,
  opt_in_source smeksh_optin_source,
  opt_in_timestamp timestamptz,
  opt_out boolean NOT NULL DEFAULT false,
  opt_out_timestamp timestamptz,
  data_deletion_requested boolean NOT NULL DEFAULT false,
  data_deletion_requested_at timestamptz,

  -- AI/automation intelligence
  ai_intent_detected text,
  sentiment_score text,
  followup_due timestamptz,
  sla_timer_seconds int,
  next_best_action text,

  -- meta
  status smeksh_contact_status NOT NULL DEFAULT 'ACTIVE',
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(workspace_id, phone_e164)
);

-- Performance indexes for smeksh_contacts
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_name_idx ON smeksh_contacts(workspace_id, contact_name);
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_phone_idx ON smeksh_contacts(workspace_id, phone_e164);
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_assigned_idx ON smeksh_contacts(workspace_id, assigned_to);
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_lead_idx ON smeksh_contacts(workspace_id, lead_status, deal_stage);
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_lastmsg_idx ON smeksh_contacts(workspace_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_optout_idx ON smeksh_contacts(workspace_id, opt_out, blocked_by_user);
CREATE INDEX IF NOT EXISTS smeksh_contacts_ws_mau_idx ON smeksh_contacts(workspace_id, mau_status, last_active_date);

DROP TRIGGER IF EXISTS trg_smeksh_contacts_touch ON smeksh_contacts;
CREATE TRIGGER trg_smeksh_contacts_touch
BEFORE UPDATE ON smeksh_contacts
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

-- Enable RLS
ALTER TABLE smeksh_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts in their workspace"
ON smeksh_contacts FOR SELECT
USING (is_tenant_member(workspace_id));

CREATE POLICY "Users can create contacts in their workspace"
ON smeksh_contacts FOR INSERT
WITH CHECK (is_tenant_member(workspace_id));

CREATE POLICY "Users can update contacts in their workspace"
ON smeksh_contacts FOR UPDATE
USING (is_tenant_member(workspace_id));

CREATE POLICY "Users can delete contacts in their workspace"
ON smeksh_contacts FOR DELETE
USING (is_tenant_member(workspace_id));

-- 2) Contact Attributes (custom typed fields)
CREATE TABLE IF NOT EXISTS smeksh_contact_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES smeksh_contacts(id) ON DELETE CASCADE,

  key text NOT NULL,
  label text,
  type smeksh_attribute_type NOT NULL DEFAULT 'TEXT',

  value_text text,
  value_number numeric,
  value_bool boolean,
  value_date date,
  value_datetime timestamptz,
  value_json jsonb,

  options jsonb,
  is_indexed boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(workspace_id, contact_id, key)
);

CREATE INDEX IF NOT EXISTS smeksh_contact_attrs_ws_contact_idx ON smeksh_contact_attributes(workspace_id, contact_id);
CREATE INDEX IF NOT EXISTS smeksh_contact_attrs_ws_key_idx ON smeksh_contact_attributes(workspace_id, key);

DROP TRIGGER IF EXISTS trg_smeksh_contact_attrs_touch ON smeksh_contact_attributes;
CREATE TRIGGER trg_smeksh_contact_attrs_touch
BEFORE UPDATE ON smeksh_contact_attributes
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE smeksh_contact_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage contact attributes in their workspace"
ON smeksh_contact_attributes FOR ALL
USING (is_tenant_member(workspace_id));

-- 3) Segments (saved views)
CREATE TABLE IF NOT EXISTS smeksh_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name text NOT NULL,
  description text,
  icon text,
  color text,
  is_system boolean NOT NULL DEFAULT false,
  is_smart boolean NOT NULL DEFAULT true,

  filter_tree jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_count int NOT NULL DEFAULT 0,

  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS smeksh_segments_ws_idx ON smeksh_segments(workspace_id);

DROP TRIGGER IF EXISTS trg_smeksh_segments_touch ON smeksh_segments;
CREATE TRIGGER trg_smeksh_segments_touch
BEFORE UPDATE ON smeksh_segments
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE smeksh_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage segments in their workspace"
ON smeksh_segments FOR ALL
USING (is_tenant_member(workspace_id));

-- 4) Segment Filters (normalized filters)
CREATE TABLE IF NOT EXISTS smeksh_segment_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid NOT NULL REFERENCES smeksh_segments(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  group_key text,
  join_type smeksh_filter_join NOT NULL DEFAULT 'AND',
  sort_order int NOT NULL DEFAULT 0,

  field_path text NOT NULL,
  operator text NOT NULL,
  value_type text NOT NULL,
  value jsonb,

  negate boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_seg_filters_segment_idx ON smeksh_segment_filters(segment_id, sort_order);
CREATE INDEX IF NOT EXISTS smeksh_seg_filters_ws_idx ON smeksh_segment_filters(workspace_id);

ALTER TABLE smeksh_segment_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage segment filters in their workspace"
ON smeksh_segment_filters FOR ALL
USING (is_tenant_member(workspace_id));

-- 5) Import Jobs
CREATE TABLE IF NOT EXISTS smeksh_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  status smeksh_import_status NOT NULL DEFAULT 'PENDING',

  storage_bucket text NOT NULL DEFAULT 'imports',
  storage_path text NOT NULL,
  original_filename text,

  column_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,

  dedupe_key text NOT NULL DEFAULT 'phone_e164',
  dedupe_mode text NOT NULL DEFAULT 'MERGE',
  default_source text,
  default_tags text[],

  total_rows int NOT NULL DEFAULT 0,
  processed_rows int NOT NULL DEFAULT 0,
  created_count int NOT NULL DEFAULT 0,
  updated_count int NOT NULL DEFAULT 0,
  skipped_count int NOT NULL DEFAULT 0,
  error_count int NOT NULL DEFAULT 0,

  error_report_path text,

  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  started_at timestamptz,
  finished_at timestamptz,

  last_error text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_import_jobs_ws_status_idx ON smeksh_import_jobs(workspace_id, status, created_at DESC);

DROP TRIGGER IF EXISTS trg_smeksh_import_jobs_touch ON smeksh_import_jobs;
CREATE TRIGGER trg_smeksh_import_jobs_touch
BEFORE UPDATE ON smeksh_import_jobs
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

ALTER TABLE smeksh_import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage import jobs in their workspace"
ON smeksh_import_jobs FOR ALL
USING (is_tenant_member(workspace_id));

-- 6) Import Job Errors
CREATE TABLE IF NOT EXISTS smeksh_import_job_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id uuid NOT NULL REFERENCES smeksh_import_jobs(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  row_number int NOT NULL,
  raw_row jsonb,
  error text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_import_errors_job_idx ON smeksh_import_job_errors(import_job_id, row_number);

ALTER TABLE smeksh_import_job_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view import errors in their workspace"
ON smeksh_import_job_errors FOR ALL
USING (is_tenant_member(workspace_id));

-- 7) Contact Tags Junction (linking to existing tags table)
CREATE TABLE IF NOT EXISTS smeksh_contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES smeksh_contacts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  applied_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_source text, -- 'manual', 'automation', 'import', 'rule'
  
  UNIQUE(contact_id, tag_id)
);

CREATE INDEX IF NOT EXISTS smeksh_contact_tags_contact_idx ON smeksh_contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS smeksh_contact_tags_tag_idx ON smeksh_contact_tags(tag_id);
CREATE INDEX IF NOT EXISTS smeksh_contact_tags_ws_idx ON smeksh_contact_tags(workspace_id);

ALTER TABLE smeksh_contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage contact tags in their workspace"
ON smeksh_contact_tags FOR ALL
USING (is_tenant_member(workspace_id));

-- 8) Data Deletion Requests (compliance)
CREATE TABLE IF NOT EXISTS smeksh_data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES smeksh_contacts(id) ON DELETE SET NULL,
  
  request_type text NOT NULL, -- 'opt_out', 'deletion', 'export'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  
  phone_e164 text,
  wa_id text,
  
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  notes text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_data_requests_ws_idx ON smeksh_data_requests(workspace_id, status);

ALTER TABLE smeksh_data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage data requests in their workspace"
ON smeksh_data_requests FOR ALL
USING (is_tenant_member(workspace_id));