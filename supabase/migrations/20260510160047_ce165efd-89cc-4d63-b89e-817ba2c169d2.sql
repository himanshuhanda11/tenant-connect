
-- WhatsApp Website Chat Widget Builder schema

CREATE TABLE IF NOT EXISTS public.widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  public_key text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  name text NOT NULL DEFAULT 'My WhatsApp Widget',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','paused')),
  whatsapp_number text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_widgets_tenant ON public.widgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_widgets_pk ON public.widgets(public_key);

CREATE TABLE IF NOT EXISTS public.widget_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES public.widgets(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  department text,
  avatar_url text,
  phone_e164 text NOT NULL,
  prefilled_message text,
  priority int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_widget_agents_widget ON public.widget_agents(widget_id);

CREATE TABLE IF NOT EXISTS public.widget_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES public.widgets(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view','open','click','lead','close')),
  page_url text,
  referrer text,
  device text,
  country text,
  session_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_widget_events_widget_time ON public.widget_events(widget_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_widget_events_tenant ON public.widget_events(tenant_id);

CREATE TABLE IF NOT EXISTS public.widget_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES public.widgets(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id uuid,
  name text,
  phone text,
  email text,
  message text,
  page_url text,
  device text,
  country text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_widget_leads_widget ON public.widget_leads(widget_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.widgets_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_widgets_updated_at ON public.widgets;
CREATE TRIGGER trg_widgets_updated_at BEFORE UPDATE ON public.widgets
FOR EACH ROW EXECUTE FUNCTION public.widgets_set_updated_at();

-- Enable RLS
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_leads ENABLE ROW LEVEL SECURITY;

-- Widgets policies
CREATE POLICY "widgets_select_member" ON public.widgets
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widgets_insert_member" ON public.widgets
  FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widgets_update_member" ON public.widgets
  FOR UPDATE TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widgets_delete_member" ON public.widgets
  FOR DELETE TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

-- Widget agents policies
CREATE POLICY "widget_agents_select_member" ON public.widget_agents
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widget_agents_insert_member" ON public.widget_agents
  FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widget_agents_update_member" ON public.widget_agents
  FOR UPDATE TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widget_agents_delete_member" ON public.widget_agents
  FOR DELETE TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

-- Widget events: members read, no anon writes (edge function uses service role)
CREATE POLICY "widget_events_select_member" ON public.widget_events
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));

-- Widget leads
CREATE POLICY "widget_leads_select_member" ON public.widget_leads
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
CREATE POLICY "widget_leads_delete_member" ON public.widget_leads
  FOR DELETE TO authenticated
  USING (public.is_tenant_member(tenant_id, auth.uid()));
