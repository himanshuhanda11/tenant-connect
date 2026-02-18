
-- 1) workspace_ai_settings table
CREATE TABLE public.workspace_ai_settings (
  workspace_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  tone text NOT NULL DEFAULT 'professional',
  response_length text NOT NULL DEFAULT 'medium',
  require_agent_approval boolean NOT NULL DEFAULT true,
  fallback_to_template boolean NOT NULL DEFAULT true,
  fallback_message text DEFAULT 'Thank you for reaching out! One of our team members will get back to you shortly. 🙏',
  qualification_mode boolean NOT NULL DEFAULT true,
  retry_missing_questions boolean NOT NULL DEFAULT true,
  max_retries integer NOT NULL DEFAULT 3,
  confidence_threshold numeric(3,2) NOT NULL DEFAULT 0.70,
  lead_objective text NOT NULL DEFAULT 'lead_qualification',
  required_fields_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  knowledge_base text,
  auto_tag boolean NOT NULL DEFAULT true,
  auto_create_lead boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_ai_settings ENABLE ROW LEVEL SECURITY;

-- Members can read their workspace settings
CREATE POLICY "Members can view workspace AI settings"
  ON public.workspace_ai_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_ai_settings.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Only owner/admin can insert/update/delete
CREATE POLICY "Owner/admin can insert workspace AI settings"
  ON public.workspace_ai_settings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_ai_settings.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
  ));

CREATE POLICY "Owner/admin can update workspace AI settings"
  ON public.workspace_ai_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_ai_settings.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
  ));

CREATE POLICY "Owner/admin can delete workspace AI settings"
  ON public.workspace_ai_settings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = workspace_ai_settings.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
  ));

-- Auto-update updated_at
CREATE TRIGGER set_workspace_ai_settings_updated_at
  BEFORE UPDATE ON public.workspace_ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_wa_updated_at();


-- 2) qualified_leads table
CREATE TYPE public.lead_stage AS ENUM ('new', 'qualifying', 'qualified', 'needs_agent', 'unqualified');

CREATE TABLE public.qualified_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  phone_number_id text,
  intent text,
  lead_stage public.lead_stage NOT NULL DEFAULT 'new',
  confidence numeric(3,2),
  captured jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_fields text[] DEFAULT '{}',
  next_question text,
  retry_field text,
  retry_attempt integer NOT NULL DEFAULT 0,
  handoff_reason text,
  last_ai_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qualified_leads ENABLE ROW LEVEL SECURITY;

-- Members can read leads in their workspace
CREATE POLICY "Members can view qualified leads"
  ON public.qualified_leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = qualified_leads.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Members can insert leads
CREATE POLICY "Members can create qualified leads"
  ON public.qualified_leads FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = qualified_leads.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Members can update leads
CREATE POLICY "Members can update qualified leads"
  ON public.qualified_leads FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = qualified_leads.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Members can delete leads
CREATE POLICY "Members can delete qualified leads"
  ON public.qualified_leads FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = qualified_leads.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_qualified_leads_workspace_updated ON public.qualified_leads (workspace_id, updated_at DESC);
CREATE INDEX idx_qualified_leads_intent ON public.qualified_leads (intent);
CREATE INDEX idx_qualified_leads_stage ON public.qualified_leads (lead_stage);

-- Auto-update updated_at
CREATE TRIGGER set_qualified_leads_updated_at
  BEFORE UPDATE ON public.qualified_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_wa_updated_at();


-- 3) ai_drafts table
CREATE TABLE public.ai_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  message_text text NOT NULL,
  lead_update jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_drafts ENABLE ROW LEVEL SECURITY;

-- Members can view drafts for their workspace
CREATE POLICY "Members can view AI drafts"
  ON public.ai_drafts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = ai_drafts.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Members can insert drafts
CREATE POLICY "Members can create AI drafts"
  ON public.ai_drafts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = ai_drafts.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Members can update drafts (approve/reject)
CREATE POLICY "Members can update AI drafts"
  ON public.ai_drafts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = ai_drafts.workspace_id
      AND tm.user_id = auth.uid()
  ));

-- Index for pending drafts lookup
CREATE INDEX idx_ai_drafts_workspace_status ON public.ai_drafts (workspace_id, status);
CREATE INDEX idx_ai_drafts_conversation ON public.ai_drafts (conversation_id);
