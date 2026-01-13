-- Template Versions table for versioning support
CREATE TABLE public.template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  header_type TEXT DEFAULT 'none' CHECK (header_type IN ('none', 'text', 'image', 'video', 'document')),
  header_content TEXT,
  body TEXT NOT NULL,
  footer TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  variable_samples JSONB DEFAULT '{}'::jsonb,
  content_hash TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, version_number)
);

-- Template Approvals table for internal review workflow
CREATE TABLE public.template_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.template_versions(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'changes_requested')),
  comments TEXT,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template Submission Logs for Meta API interactions
CREATE TABLE public.template_submission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.template_versions(id) ON DELETE CASCADE,
  waba_account_id UUID NOT NULL REFERENCES public.waba_accounts(id) ON DELETE CASCADE,
  request_payload JSONB,
  response_payload JSONB,
  meta_template_id TEXT,
  meta_status TEXT DEFAULT 'pending' CHECK (meta_status IN ('pending', 'approved', 'rejected', 'paused', 'disabled')),
  rejection_reason TEXT,
  submitted_by UUID REFERENCES public.profiles(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template Lint Results for validation
CREATE TABLE public.template_lint_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.template_versions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
  rule_code TEXT NOT NULL,
  message TEXT NOT NULL,
  field TEXT,
  suggestion TEXT,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add internal_status and current_version_id to templates table
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'draft' CHECK (internal_status IN ('draft', 'in_review', 'approved', 'changes_requested')),
ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES public.template_versions(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS template_score INTEGER DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_submission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_lint_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_versions
CREATE POLICY "template_versions_select_member" ON public.template_versions
FOR SELECT USING (
  is_tenant_member((SELECT tenant_id FROM public.templates WHERE id = template_id))
);

CREATE POLICY "template_versions_insert_member" ON public.template_versions
FOR INSERT WITH CHECK (
  is_tenant_member((SELECT tenant_id FROM public.templates WHERE id = template_id))
);

CREATE POLICY "template_versions_update_admin" ON public.template_versions
FOR UPDATE USING (
  is_tenant_admin((SELECT tenant_id FROM public.templates WHERE id = template_id))
);

CREATE POLICY "template_versions_delete_admin" ON public.template_versions
FOR DELETE USING (
  is_tenant_admin((SELECT tenant_id FROM public.templates WHERE id = template_id))
);

-- RLS Policies for template_approvals
CREATE POLICY "template_approvals_select_member" ON public.template_approvals
FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "template_approvals_insert_member" ON public.template_approvals
FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "template_approvals_update_admin" ON public.template_approvals
FOR UPDATE USING (is_tenant_admin(tenant_id));

CREATE POLICY "template_approvals_delete_admin" ON public.template_approvals
FOR DELETE USING (is_tenant_admin(tenant_id));

-- RLS Policies for template_submission_logs
CREATE POLICY "template_submission_logs_select_member" ON public.template_submission_logs
FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "template_submission_logs_insert_admin" ON public.template_submission_logs
FOR INSERT WITH CHECK (is_tenant_admin(tenant_id));

CREATE POLICY "template_submission_logs_update_admin" ON public.template_submission_logs
FOR UPDATE USING (is_tenant_admin(tenant_id));

CREATE POLICY "template_submission_logs_delete_disabled" ON public.template_submission_logs
FOR DELETE USING (false);

-- RLS Policies for template_lint_results
CREATE POLICY "template_lint_results_select_member" ON public.template_lint_results
FOR SELECT USING (is_tenant_member(tenant_id));

CREATE POLICY "template_lint_results_insert_member" ON public.template_lint_results
FOR INSERT WITH CHECK (is_tenant_member(tenant_id));

CREATE POLICY "template_lint_results_delete_member" ON public.template_lint_results
FOR DELETE USING (is_tenant_member(tenant_id));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON public.template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_approvals_template_id ON public.template_approvals(template_id);
CREATE INDEX IF NOT EXISTS idx_template_submission_logs_template_id ON public.template_submission_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_template_lint_results_version_id ON public.template_lint_results(version_id);