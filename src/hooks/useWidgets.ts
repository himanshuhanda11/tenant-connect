import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { Widget, WidgetAgent, WidgetConfig, WidgetEvent, WidgetLead, WidgetStatus } from '@/types/widget';
import { DEFAULT_WIDGET_CONFIG } from '@/types/widget';
import { toast } from '@/hooks/use-toast';

export function useWidgets() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tenantId) { setWidgets([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('widgets' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false });
    if (error) toast({ title: 'Failed to load widgets', description: error.message, variant: 'destructive' });
    setWidgets(((data as any) ?? []) as Widget[]);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (name: string) => {
    if (!tenantId) return null;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('widgets' as any)
      .insert({ tenant_id: tenantId, name, status: 'draft', config: DEFAULT_WIDGET_CONFIG, created_by: user?.id })
      .select('*').single();
    if (error) { toast({ title: 'Could not create widget', description: error.message, variant: 'destructive' }); return null; }
    await refresh();
    return data as unknown as Widget;
  }, [tenantId, refresh]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('widgets' as any).delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Widget deleted' }); await refresh(); }
  }, [refresh]);

  return { widgets, loading, refresh, create, remove };
}

export function useWidget(id?: string) {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [agents, setAgents] = useState<WidgetAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: w } = await supabase.from('widgets' as any).select('*').eq('id', id).maybeSingle();
    setWidget((w as any) ?? null);
    const { data: ag } = await supabase.from('widget_agents' as any).select('*').eq('widget_id', id).order('priority', { ascending: false });
    setAgents(((ag as any) ?? []) as WidgetAgent[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (patch: Partial<Pick<Widget, 'name' | 'status' | 'whatsapp_number'>> & { config?: WidgetConfig; variants?: any }) => {
    if (!id) return;
    const { error } = await supabase.from('widgets' as any).update(patch as any).eq('id', id);
    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else { setWidget(w => w ? ({ ...w, ...(patch as any) }) : w); }
  }, [id]);

  const setStatus = useCallback((status: WidgetStatus) => save({ status }), [save]);

  const upsertAgent = useCallback(async (agent: Partial<WidgetAgent>) => {
    if (!widget) return;
    if (agent.id) {
      const { error } = await supabase.from('widget_agents' as any).update(agent as any).eq('id', agent.id);
      if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    } else {
      const { error } = await supabase.from('widget_agents' as any).insert({ ...agent, widget_id: widget.id, tenant_id: widget.tenant_id } as any);
      if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    }
    await refresh();
  }, [widget, refresh]);

  const removeAgent = useCallback(async (agentId: string) => {
    await supabase.from('widget_agents' as any).delete().eq('id', agentId);
    await refresh();
  }, [refresh]);

  return { widget, agents, loading, refresh, save, setStatus, upsertAgent, removeAgent };
}

export function useWidgetLeads(widgetId?: string) {
  const [leads, setLeads] = useState<WidgetLead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!widgetId) return;
    setLoading(true);
    supabase.from('widget_leads' as any).select('*').eq('widget_id', widgetId).order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => { setLeads(((data as any) ?? []) as WidgetLead[]); setLoading(false); });
  }, [widgetId]);
  return { leads, loading };
}

export function useWidgetEvents(widgetId?: string, days = 30) {
  const [events, setEvents] = useState<WidgetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!widgetId) return;
    setLoading(true);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    supabase.from('widget_events' as any).select('*').eq('widget_id', widgetId).gte('created_at', since).order('created_at', { ascending: false }).limit(5000)
      .then(({ data }) => { setEvents(((data as any) ?? []) as WidgetEvent[]); setLoading(false); });
  }, [widgetId, days]);
  return { events, loading };
}
