
-- Add advanced AI bot columns to auto_reply_settings
ALTER TABLE public.auto_reply_settings
  ADD COLUMN IF NOT EXISTS qualification_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ask_missing_max integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS ai_confidence_threshold numeric(3,2) NOT NULL DEFAULT 0.70,
  ADD COLUMN IF NOT EXISTS auto_tag_contacts boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_create_lead boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS lead_objective text NOT NULL DEFAULT 'lead_qualification',
  ADD COLUMN IF NOT EXISTS required_fields_schema text DEFAULT '',
  ADD COLUMN IF NOT EXISTS fallback_template_message text NOT NULL DEFAULT 'Thank you for reaching out! One of our team members will get back to you shortly. 🙏';
