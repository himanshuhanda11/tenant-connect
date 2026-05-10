
DROP POLICY IF EXISTS widgets_insert_member ON public.widgets;
DROP POLICY IF EXISTS widgets_select_member ON public.widgets;
DROP POLICY IF EXISTS widgets_update_member ON public.widgets;
DROP POLICY IF EXISTS widgets_delete_member ON public.widgets;

CREATE POLICY widgets_select_member ON public.widgets FOR SELECT USING (public.is_tenant_member(tenant_id));
CREATE POLICY widgets_insert_member ON public.widgets FOR INSERT WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY widgets_update_member ON public.widgets FOR UPDATE USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));
CREATE POLICY widgets_delete_member ON public.widgets FOR DELETE USING (public.is_tenant_member(tenant_id));

-- Same fix for related tables
DROP POLICY IF EXISTS widget_agents_all_member ON public.widget_agents;
CREATE POLICY widget_agents_all_member ON public.widget_agents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.widgets w WHERE w.id = widget_agents.widget_id AND public.is_tenant_member(w.tenant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.widgets w WHERE w.id = widget_agents.widget_id AND public.is_tenant_member(w.tenant_id)));

DROP POLICY IF EXISTS widget_leads_select_member ON public.widget_leads;
CREATE POLICY widget_leads_select_member ON public.widget_leads FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.widgets w WHERE w.id = widget_leads.widget_id AND public.is_tenant_member(w.tenant_id)));

DROP POLICY IF EXISTS widget_events_select_member ON public.widget_events;
CREATE POLICY widget_events_select_member ON public.widget_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.widgets w WHERE w.id = widget_events.widget_id AND public.is_tenant_member(w.tenant_id)));
