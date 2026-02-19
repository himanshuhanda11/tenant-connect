
-- ============================================================
-- AUTO FORM RULES ENGINE — Production Schema
-- ============================================================

-- 1. Forms (top-level form definitions)
CREATE TABLE public.forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  active_version_id uuid, -- FK added after form_versions exists
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_forms_tenant ON public.forms(tenant_id);
CREATE INDEX idx_forms_status ON public.forms(tenant_id, status);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view forms"
  ON public.forms FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can insert forms"
  ON public.forms FOR INSERT
  WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can update forms"
  ON public.forms FOR UPDATE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant admins can delete forms"
  ON public.forms FOR DELETE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

-- 2. Form Versions (immutable snapshots for audit)
CREATE TABLE public.form_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  schema_json jsonb DEFAULT '{}',
  published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_id, version)
);

CREATE INDEX idx_form_versions_form ON public.form_versions(form_id);

-- Now add FK for active_version_id
ALTER TABLE public.forms
  ADD CONSTRAINT forms_active_version_fk
  FOREIGN KEY (active_version_id) REFERENCES public.form_versions(id);

ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view form versions"
  ON public.form_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_versions.form_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

CREATE POLICY "Tenant members can insert form versions"
  ON public.form_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_versions.form_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

CREATE POLICY "Tenant members can update form versions"
  ON public.form_versions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = form_versions.form_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

-- 3. Form Steps (multi-step forms)
CREATE TABLE public.form_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_version_id uuid NOT NULL REFERENCES public.form_versions(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Step',
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_steps_version ON public.form_steps(form_version_id);

ALTER TABLE public.form_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view form steps"
  ON public.form_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_steps.form_version_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

CREATE POLICY "Tenant members can manage form steps"
  ON public.form_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_steps.form_version_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

-- 4. Form Fields (builder blocks)
CREATE TABLE public.form_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_version_id uuid NOT NULL REFERENCES public.form_versions(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'text','email','phone','number','long_text',
    'dropdown','radio','checkbox',
    'date','time','datetime','url','location','rating',
    'file','hidden','section','calculated','otp',
    'tag_assignment','lead_score','time_slot'
  )),
  help_text text,
  placeholder text,
  required boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0,
  step_id uuid REFERENCES public.form_steps(id) ON DELETE SET NULL,
  validation_json jsonb DEFAULT '{}',
  default_value jsonb,
  is_system boolean NOT NULL DEFAULT false,
  config_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_version_id, key)
);

CREATE INDEX idx_form_fields_version ON public.form_fields(form_version_id);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view form fields"
  ON public.form_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_fields.form_version_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

CREATE POLICY "Tenant members can manage form fields"
  ON public.form_fields FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_fields.form_version_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

-- 5. Form Field Options (for dropdown/radio/checkbox)
CREATE TABLE public.form_field_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  value text NOT NULL,
  label text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  score int DEFAULT 0,
  tag text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_field_options_field ON public.form_field_options(field_id);

ALTER TABLE public.form_field_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view field options"
  ON public.form_field_options FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.form_fields ff
    JOIN public.form_versions fv ON fv.id = ff.form_version_id
    JOIN public.forms f ON f.id = fv.form_id
    WHERE ff.id = form_field_options.field_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

CREATE POLICY "Tenant members can manage field options"
  ON public.form_field_options FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.form_fields ff
    JOIN public.form_versions fv ON fv.id = ff.form_version_id
    JOIN public.forms f ON f.id = fv.form_id
    WHERE ff.id = form_field_options.field_id
      AND public.is_tenant_member(auth.uid(), f.tenant_id)
  ));

-- 6. Upgrade form_rules — add new columns for the engine
ALTER TABLE public.form_rules
  ADD COLUMN IF NOT EXISTS form_version_id uuid REFERENCES public.form_versions(id),
  ADD COLUMN IF NOT EXISTS trigger text DEFAULT 'on_submit' CHECK (trigger IN ('on_view','on_change','on_submit')),
  ADD COLUMN IF NOT EXISTS conditions_json jsonb DEFAULT '{"all":[]}',
  ADD COLUMN IF NOT EXISTS actions_json jsonb DEFAULT '{"actions":[]}';

-- 7. Form Submissions (store responses)
CREATE TABLE public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  form_version_id uuid REFERENCES public.form_versions(id),
  contact_id uuid,
  conversation_id uuid,
  data_json jsonb NOT NULL DEFAULT '{}',
  lead_score int DEFAULT 0,
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('partial','completed','processed')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_submissions_tenant ON public.form_submissions(tenant_id);
CREATE INDEX idx_form_submissions_form ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_contact ON public.form_submissions(contact_id);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view submissions"
  ON public.form_submissions FOR SELECT
  USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can insert submissions"
  ON public.form_submissions FOR INSERT
  WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can update submissions"
  ON public.form_submissions FOR UPDATE
  USING (public.is_tenant_member(auth.uid(), tenant_id));

-- 8. Reusable Field Library
CREATE TABLE public.form_field_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  field_config jsonb NOT NULL DEFAULT '{}',
  category text DEFAULT 'custom',
  is_global boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_field_library_tenant ON public.form_field_library(tenant_id);

ALTER TABLE public.form_field_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view field library"
  ON public.form_field_library FOR SELECT
  USING (is_global = true OR public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Tenant members can manage field library"
  ON public.form_field_library FOR ALL
  USING (public.is_tenant_member(auth.uid(), tenant_id));

-- 9. Updated_at triggers
CREATE TRIGGER set_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.set_wa_updated_at();

CREATE TRIGGER set_form_field_library_updated_at
  BEFORE UPDATE ON public.form_field_library
  FOR EACH ROW EXECUTE FUNCTION public.set_wa_updated_at();
