-- Enable RLS on public.flow_templates (read-only public catalog)
ALTER TABLE public.flow_templates ENABLE ROW LEVEL SECURITY;

-- Public read access (templates are not tenant/user specific)
DROP POLICY IF EXISTS "Public can read flow templates" ON public.flow_templates;
CREATE POLICY "Public can read flow templates"
ON public.flow_templates
FOR SELECT
TO public
USING (true);
