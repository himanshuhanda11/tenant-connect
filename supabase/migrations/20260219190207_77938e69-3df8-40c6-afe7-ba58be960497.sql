
-- Table to track active conversational form sessions
CREATE TABLE public.form_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id),
  form_rule_id UUID NOT NULL REFERENCES public.form_rules(id),
  form_version_id UUID NOT NULL REFERENCES public.form_versions(id),
  current_field_index INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups on inbound messages
CREATE INDEX idx_form_sessions_active ON public.form_sessions (tenant_id, contact_id, status) WHERE status = 'active';
CREATE INDEX idx_form_sessions_conversation ON public.form_sessions (conversation_id, status);

-- Enable RLS
ALTER TABLE public.form_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: workspace members can read, service role handles writes from webhook
CREATE POLICY "Workspace members can view form sessions"
  ON public.form_sessions FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role full access to form sessions"
  ON public.form_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER update_form_sessions_updated_at
  BEFORE UPDATE ON public.form_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.smeksh_touch_updated_at();
