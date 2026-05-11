
ALTER TABLE public.support_widget_settings
  ADD COLUMN IF NOT EXISTS book_demo_label text NOT NULL DEFAULT 'Book a Demo',
  ADD COLUMN IF NOT EXISTS book_demo_url text NOT NULL DEFAULT '/book-demo',
  ADD COLUMN IF NOT EXISTS book_demo_subtext text NOT NULL DEFAULT 'Need help choosing a plan? Talk with an Aireatro expert.',
  ADD COLUMN IF NOT EXISTS show_demo_in_compact boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_demo_for_paid_users boolean NOT NULL DEFAULT false;

ALTER TABLE public.support_widget_events
  DROP CONSTRAINT IF EXISTS support_widget_events_event_type_check;
ALTER TABLE public.support_widget_events
  ADD CONSTRAINT support_widget_events_event_type_check
  CHECK (event_type = ANY (ARRAY['view'::text, 'click'::text, 'demo_click'::text]));
