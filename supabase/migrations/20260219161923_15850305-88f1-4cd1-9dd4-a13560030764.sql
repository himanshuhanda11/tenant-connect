
-- Create lead_forms table for custom form definitions
CREATE TABLE public.lead_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  submission_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_forms ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Workspace members can view lead forms"
  ON public.lead_forms FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace members can create lead forms"
  ON public.lead_forms FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace members can update lead forms"
  ON public.lead_forms FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace members can delete lead forms"
  ON public.lead_forms FOR DELETE
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

-- Create lead_form_submissions table
CREATE TABLE public.lead_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES public.lead_forms(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id),
  conversation_id UUID REFERENCES public.conversations(id),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processed', 'failed')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.lead_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view submissions"
  ON public.lead_form_submissions FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace members can insert submissions"
  ON public.lead_form_submissions FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

-- Updated_at trigger for lead_forms
CREATE TRIGGER set_lead_forms_updated_at
  BEFORE UPDATE ON public.lead_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_wa_updated_at();

-- Indexes
CREATE INDEX idx_lead_forms_tenant ON public.lead_forms(tenant_id);
CREATE INDEX idx_lead_form_submissions_form ON public.lead_form_submissions(form_id);
CREATE INDEX idx_lead_form_submissions_tenant ON public.lead_form_submissions(tenant_id);
