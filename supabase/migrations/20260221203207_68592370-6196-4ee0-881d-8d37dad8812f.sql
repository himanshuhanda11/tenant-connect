
-- Add publish tracking columns to campaign drafts
ALTER TABLE public.smeksh_meta_campaign_drafts
  ADD COLUMN IF NOT EXISTS meta_campaign_id text,
  ADD COLUMN IF NOT EXISTS meta_adset_id text,
  ADD COLUMN IF NOT EXISTS meta_creative_id text,
  ADD COLUMN IF NOT EXISTS meta_ad_id text,
  ADD COLUMN IF NOT EXISTS meta_lead_form_id text,
  ADD COLUMN IF NOT EXISTS publish_status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS publish_error text,
  ADD COLUMN IF NOT EXISTS publish_error_code text,
  ADD COLUMN IF NOT EXISTS publish_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS publish_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS publish_log jsonb DEFAULT '[]'::jsonb;

-- Add Meta IDs to the campaigns table for synced campaigns  
ALTER TABLE public.smeksh_meta_ad_campaigns
  ADD COLUMN IF NOT EXISTS meta_adset_id text,
  ADD COLUMN IF NOT EXISTS meta_ad_id text,
  ADD COLUMN IF NOT EXISTS meta_creative_id text,
  ADD COLUMN IF NOT EXISTS draft_id uuid REFERENCES public.smeksh_meta_campaign_drafts(id),
  ADD COLUMN IF NOT EXISTS adset_name text;
