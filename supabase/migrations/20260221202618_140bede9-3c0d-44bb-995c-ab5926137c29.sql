
-- Add new columns for extended campaign wizard fields
ALTER TABLE public.smeksh_meta_campaign_drafts
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS cbo_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS flow_id UUID,
  ADD COLUMN IF NOT EXISTS flow_name TEXT,
  ADD COLUMN IF NOT EXISTS lead_form_type TEXT DEFAULT 'more_volume',
  ADD COLUMN IF NOT EXISTS lead_form_questions JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS lead_form_privacy_url TEXT,
  ADD COLUMN IF NOT EXISTS lead_form_thankyou_title TEXT,
  ADD COLUMN IF NOT EXISTS lead_form_thankyou_body TEXT,
  ADD COLUMN IF NOT EXISTS lead_form_thankyou_cta TEXT,
  ADD COLUMN IF NOT EXISTS lead_form_thankyou_url TEXT,
  ADD COLUMN IF NOT EXISTS pixel_name TEXT,
  ADD COLUMN IF NOT EXISTS manual_placements JSONB DEFAULT '[]';
