
DROP POLICY IF EXISTS "Users can view own tenant greeting templates" ON public.whatsapp_greeting_templates;
DROP POLICY IF EXISTS "Users can insert own tenant greeting templates" ON public.whatsapp_greeting_templates;
DROP POLICY IF EXISTS "Users can update own tenant greeting templates" ON public.whatsapp_greeting_templates;
DROP POLICY IF EXISTS "Users can delete own tenant greeting templates" ON public.whatsapp_greeting_templates;

CREATE POLICY "greeting_templates_select" ON public.whatsapp_greeting_templates FOR SELECT TO authenticated USING (is_tenant_member(tenant_id));
CREATE POLICY "greeting_templates_insert" ON public.whatsapp_greeting_templates FOR INSERT TO authenticated WITH CHECK (is_tenant_member(tenant_id));
CREATE POLICY "greeting_templates_update" ON public.whatsapp_greeting_templates FOR UPDATE TO authenticated USING (is_tenant_member(tenant_id));
CREATE POLICY "greeting_templates_delete" ON public.whatsapp_greeting_templates FOR DELETE TO authenticated USING (is_tenant_member(tenant_id));
