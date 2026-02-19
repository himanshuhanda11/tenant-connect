
-- Drop the overly permissive policy on form_sessions
DROP POLICY IF EXISTS "Service role full access to form sessions" ON public.form_sessions;

-- Add proper write policies for form_sessions
CREATE POLICY "Workspace members can insert form sessions"
  ON public.form_sessions FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace members can update form sessions"
  ON public.form_sessions FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
  ));
