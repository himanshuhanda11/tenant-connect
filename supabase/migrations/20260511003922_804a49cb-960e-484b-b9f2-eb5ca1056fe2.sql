
ALTER TABLE public.support_widget_settings
  ADD COLUMN IF NOT EXISTS collect_lead_before_chat boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS step_name_label text NOT NULL DEFAULT 'What is your full name?',
  ADD COLUMN IF NOT EXISTS step_name_placeholder text NOT NULL DEFAULT 'Your full name',
  ADD COLUMN IF NOT EXISTS step_phone_label text NOT NULL DEFAULT 'What is your mobile number?',
  ADD COLUMN IF NOT EXISTS step_phone_placeholder text NOT NULL DEFAULT '+91 98765 43210',
  ADD COLUMN IF NOT EXISTS step_connect_message text NOT NULL DEFAULT 'Connecting you with our support team on WhatsApp…';

ALTER TABLE public.support_widget_events
  ADD COLUMN IF NOT EXISTS lead_name text,
  ADD COLUMN IF NOT EXISTS lead_phone text;
