-- Phase 2: A/B testing variants + variant tracking
ALTER TABLE public.widgets ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.widget_events ADD COLUMN IF NOT EXISTS variant_id text;
ALTER TABLE public.widget_leads ADD COLUMN IF NOT EXISTS variant_id text;
CREATE INDEX IF NOT EXISTS idx_widget_events_variant ON public.widget_events(widget_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_widget_leads_variant ON public.widget_leads(widget_id, variant_id);