-- SMEKSH Meta Ads Module Schema
-- For Click-to-WhatsApp lead tracking, attribution, and automation

-- Create enums
DO $$ BEGIN
  CREATE TYPE smeksh_meta_connection_status AS ENUM ('pending', 'connected', 'disconnected', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_ad_status AS ENUM ('active', 'paused', 'deleted', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE smeksh_attribution_window AS ENUM ('1_day', '7_days', '28_days');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1) Meta Ad Accounts (connected accounts)
CREATE TABLE IF NOT EXISTS smeksh_meta_ad_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  meta_account_id text NOT NULL,
  meta_account_name text,
  meta_user_id text,
  meta_user_name text,
  
  access_token_encrypted text, -- encrypted token
  token_expires_at timestamptz,
  
  facebook_page_id text,
  facebook_page_name text,
  
  whatsapp_phone_number_id text,
  whatsapp_display_number text,
  
  status smeksh_meta_connection_status NOT NULL DEFAULT 'pending',
  last_synced_at timestamptz,
  sync_error text,
  
  is_active boolean NOT NULL DEFAULT true,
  
  connected_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(workspace_id, meta_account_id)
);

CREATE INDEX IF NOT EXISTS smeksh_meta_ad_accounts_ws_idx ON smeksh_meta_ad_accounts(workspace_id);

ALTER TABLE smeksh_meta_ad_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage meta ad accounts in their workspace"
ON smeksh_meta_ad_accounts FOR ALL
USING (is_tenant_member(workspace_id));

-- 2) Meta Ad Campaigns (cached campaign data - read only)
CREATE TABLE IF NOT EXISTS smeksh_meta_ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ad_account_id uuid NOT NULL REFERENCES smeksh_meta_ad_accounts(id) ON DELETE CASCADE,
  
  meta_campaign_id text NOT NULL,
  campaign_name text NOT NULL,
  campaign_objective text,
  
  meta_adset_id text,
  adset_name text,
  
  meta_ad_id text,
  ad_name text,
  ad_creative_id text,
  ad_creative_preview_url text,
  
  status smeksh_ad_status NOT NULL DEFAULT 'active',
  
  -- Metrics (synced from Meta)
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  spend_amount numeric(12,2) DEFAULT 0,
  spend_currency text DEFAULT 'USD',
  leads_count int DEFAULT 0,
  conversations_started int DEFAULT 0,
  
  ctr numeric(8,4), -- Click-through rate
  cpc numeric(12,4), -- Cost per click
  cpl numeric(12,4), -- Cost per lead
  
  start_date date,
  end_date date,
  
  last_synced_at timestamptz,
  raw_meta_data jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(workspace_id, meta_ad_id)
);

CREATE INDEX IF NOT EXISTS smeksh_meta_campaigns_ws_idx ON smeksh_meta_ad_campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS smeksh_meta_campaigns_account_idx ON smeksh_meta_ad_campaigns(ad_account_id);

ALTER TABLE smeksh_meta_ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meta campaigns in their workspace"
ON smeksh_meta_ad_campaigns FOR ALL
USING (is_tenant_member(workspace_id));

-- 3) Meta Ad Leads (leads from ads)
CREATE TABLE IF NOT EXISTS smeksh_meta_ad_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ad_account_id uuid REFERENCES smeksh_meta_ad_accounts(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES smeksh_meta_ad_campaigns(id) ON DELETE SET NULL,
  
  -- Contact reference
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  smeksh_contact_id uuid REFERENCES smeksh_contacts(id) ON DELETE SET NULL,
  
  -- Lead identification
  phone_e164 text,
  wa_id text,
  
  -- Attribution data from Meta
  meta_lead_id text,
  meta_campaign_id text,
  meta_campaign_name text,
  meta_adset_id text,
  meta_adset_name text,
  meta_ad_id text,
  meta_ad_name text,
  
  -- Click & conversion tracking
  ad_clicked_at timestamptz,
  first_message_at timestamptz,
  first_response_at timestamptz,
  converted_at timestamptz,
  
  -- Time metrics
  time_to_first_message_seconds int,
  time_to_first_response_seconds int,
  
  -- Status
  is_converted boolean NOT NULL DEFAULT false,
  conversion_value numeric(12,2),
  conversion_currency text,
  
  -- Attribution
  attribution_source text DEFAULT 'meta_ads',
  attribution_window smeksh_attribution_window DEFAULT '7_days',
  
  -- Automation tracking
  automation_triggered boolean DEFAULT false,
  automation_workflow_id uuid,
  
  raw_meta_data jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_meta_leads_ws_idx ON smeksh_meta_ad_leads(workspace_id);
CREATE INDEX IF NOT EXISTS smeksh_meta_leads_campaign_idx ON smeksh_meta_ad_leads(campaign_id);
CREATE INDEX IF NOT EXISTS smeksh_meta_leads_contact_idx ON smeksh_meta_ad_leads(contact_id);
CREATE INDEX IF NOT EXISTS smeksh_meta_leads_date_idx ON smeksh_meta_ad_leads(workspace_id, created_at DESC);

ALTER TABLE smeksh_meta_ad_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage meta leads in their workspace"
ON smeksh_meta_ad_leads FOR ALL
USING (is_tenant_member(workspace_id));

-- 4) Attribution Rules
CREATE TABLE IF NOT EXISTS smeksh_meta_attribution_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  priority int NOT NULL DEFAULT 0,
  
  -- Source attribution
  source_type text NOT NULL, -- 'meta_ads', 'qr', 'website', 'api', 'manual'
  
  -- Attribution window
  attribution_window smeksh_attribution_window NOT NULL DEFAULT '7_days',
  
  -- Matching rules
  match_conditions jsonb DEFAULT '{}'::jsonb,
  
  -- What to set on contact
  set_source text,
  set_campaign_source text,
  set_tags text[],
  set_priority text,
  
  is_active boolean NOT NULL DEFAULT true,
  
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_attribution_rules_ws_idx ON smeksh_meta_attribution_rules(workspace_id, priority);

ALTER TABLE smeksh_meta_attribution_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage attribution rules in their workspace"
ON smeksh_meta_attribution_rules FOR ALL
USING (is_tenant_member(workspace_id));

-- 5) Meta Ad Automations
CREATE TABLE IF NOT EXISTS smeksh_meta_ad_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  
  -- Trigger conditions
  trigger_type text NOT NULL, -- 'new_lead', 'first_message', 'ad_click'
  trigger_ad_account_id uuid REFERENCES smeksh_meta_ad_accounts(id) ON DELETE SET NULL,
  trigger_campaign_ids uuid[],
  trigger_conditions jsonb DEFAULT '{}'::jsonb,
  
  -- Actions
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [
  --   { "type": "send_template", "template_id": "..." },
  --   { "type": "add_tag", "tag_id": "..." },
  --   { "type": "assign_agent", "agent_id": "..." },
  --   { "type": "add_to_segment", "segment_id": "..." }
  -- ]
  
  -- Stats
  executions_count int DEFAULT 0,
  last_executed_at timestamptz,
  
  is_active boolean NOT NULL DEFAULT true,
  
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS smeksh_meta_automations_ws_idx ON smeksh_meta_ad_automations(workspace_id);

ALTER TABLE smeksh_meta_ad_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage meta automations in their workspace"
ON smeksh_meta_ad_automations FOR ALL
USING (is_tenant_member(workspace_id));

-- 6) Meta Ads Settings
CREATE TABLE IF NOT EXISTS smeksh_meta_ads_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  
  -- Global settings
  tracking_enabled boolean NOT NULL DEFAULT true,
  
  -- Default lead handling
  default_tags text[],
  default_assigned_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  default_assigned_agent_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Attribution
  default_attribution_window smeksh_attribution_window DEFAULT '7_days',
  attribution_priority jsonb DEFAULT '["meta_ads", "qr", "website", "api", "manual"]'::jsonb,
  
  -- Compliance
  enforce_opt_in boolean NOT NULL DEFAULT true,
  marketing_consent_required boolean NOT NULL DEFAULT true,
  
  -- Sync settings
  auto_sync_enabled boolean NOT NULL DEFAULT true,
  sync_interval_minutes int DEFAULT 60,
  last_full_sync_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE smeksh_meta_ads_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage meta ads settings in their workspace"
ON smeksh_meta_ads_settings FOR ALL
USING (is_tenant_member(workspace_id));

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS trg_smeksh_meta_accounts_touch ON smeksh_meta_ad_accounts;
CREATE TRIGGER trg_smeksh_meta_accounts_touch
BEFORE UPDATE ON smeksh_meta_ad_accounts
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

DROP TRIGGER IF EXISTS trg_smeksh_meta_campaigns_touch ON smeksh_meta_ad_campaigns;
CREATE TRIGGER trg_smeksh_meta_campaigns_touch
BEFORE UPDATE ON smeksh_meta_ad_campaigns
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

DROP TRIGGER IF EXISTS trg_smeksh_meta_leads_touch ON smeksh_meta_ad_leads;
CREATE TRIGGER trg_smeksh_meta_leads_touch
BEFORE UPDATE ON smeksh_meta_ad_leads
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

DROP TRIGGER IF EXISTS trg_smeksh_attribution_rules_touch ON smeksh_meta_attribution_rules;
CREATE TRIGGER trg_smeksh_attribution_rules_touch
BEFORE UPDATE ON smeksh_meta_attribution_rules
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

DROP TRIGGER IF EXISTS trg_smeksh_meta_automations_touch ON smeksh_meta_ad_automations;
CREATE TRIGGER trg_smeksh_meta_automations_touch
BEFORE UPDATE ON smeksh_meta_ad_automations
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();

DROP TRIGGER IF EXISTS trg_smeksh_meta_settings_touch ON smeksh_meta_ads_settings;
CREATE TRIGGER trg_smeksh_meta_settings_touch
BEFORE UPDATE ON smeksh_meta_ads_settings
FOR EACH ROW EXECUTE FUNCTION smeksh_touch_updated_at();