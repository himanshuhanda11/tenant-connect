
-- ============ support_widget_settings ============
CREATE TABLE IF NOT EXISTS public.support_widget_settings (
  id text PRIMARY KEY DEFAULT 'global',
  enabled boolean NOT NULL DEFAULT true,
  whatsapp_number text NOT NULL DEFAULT '+919999999999',
  display_name text NOT NULL DEFAULT 'Aireatro Support',
  welcome_message text NOT NULL DEFAULT 'Hi 👋 How can we help you today?',
  cta_text text NOT NULL DEFAULT 'Chat with Support',
  full_widget_title text NOT NULL DEFAULT 'Need help with WhatsApp API?',
  full_widget_subtitle text NOT NULL DEFAULT 'Our Aireatro team can help you set up your account, connect WhatsApp API, and start automation.',
  full_widget_message text NOT NULL DEFAULT 'Need help setting up? Chat with us on WhatsApp — we usually reply in minutes.',
  icon_only_tooltip text NOT NULL DEFAULT 'Need help?',
  position text NOT NULL DEFAULT 'bottom-right' CHECK (position IN ('bottom-right','bottom-left')),
  brand_color text NOT NULL DEFAULT '#25D366',
  show_on_public_site boolean NOT NULL DEFAULT true,
  show_inside_dashboard boolean NOT NULL DEFAULT true,
  show_inside_onboarding boolean NOT NULL DEFAULT true,
  show_inside_billing boolean NOT NULL DEFAULT true,
  show_for_paid_users boolean NOT NULL DEFAULT true,
  show_for_free_users boolean NOT NULL DEFAULT true,
  show_for_incomplete_users boolean NOT NULL DEFAULT true,
  prefilled_message_paid text NOT NULL DEFAULT 'Hi Aireatro Support, I need help with my account. Email: {{email}}, Workspace: {{workspace}}, Plan: {{plan}}',
  prefilled_message_new text NOT NULL DEFAULT 'Hi Aireatro Support, I need help setting up WhatsApp API for my business.',
  show_book_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_widget_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_widget_settings_public_read" ON public.support_widget_settings;
CREATE POLICY "support_widget_settings_public_read"
  ON public.support_widget_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "support_widget_settings_super_admin_write" ON public.support_widget_settings;
CREATE POLICY "support_widget_settings_super_admin_write"
  ON public.support_widget_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.platform_admins pa
                  WHERE pa.user_id = auth.uid()
                    AND pa.is_active = true
                    AND pa.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins pa
                       WHERE pa.user_id = auth.uid()
                         AND pa.is_active = true
                         AND pa.role = 'super_admin'));

-- timestamp trigger
CREATE OR REPLACE FUNCTION public.touch_support_widget_settings()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_touch_support_widget_settings ON public.support_widget_settings;
CREATE TRIGGER trg_touch_support_widget_settings
  BEFORE UPDATE ON public.support_widget_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_support_widget_settings();

-- seed singleton row
INSERT INTO public.support_widget_settings (id) VALUES ('global')
ON CONFLICT (id) DO NOTHING;

-- ============ support_widget_events ============
CREATE TABLE IF NOT EXISTS public.support_widget_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  widget_mode text NOT NULL CHECK (widget_mode IN ('icon_only','full_widget')),
  event_type text NOT NULL CHECK (event_type IN ('view','click')),
  page_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_swe_created_at ON public.support_widget_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swe_event_type ON public.support_widget_events (event_type);

ALTER TABLE public.support_widget_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_widget_events_anyone_insert" ON public.support_widget_events;
CREATE POLICY "support_widget_events_anyone_insert"
  ON public.support_widget_events FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "support_widget_events_super_admin_read" ON public.support_widget_events;
CREATE POLICY "support_widget_events_super_admin_read"
  ON public.support_widget_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.platform_admins pa
                  WHERE pa.user_id = auth.uid()
                    AND pa.is_active = true
                    AND pa.role IN ('super_admin','support')));
