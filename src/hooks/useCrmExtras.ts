import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

// ---------- Owners (team members) ----------
export interface CrmOwner { id: string; name: string; email: string; }

export function useCrmOwners() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [owners, setOwners] = useState<CrmOwner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('tenant_members')
        .select('user_id, profiles:user_id(id, full_name, email)')
        .eq('tenant_id', tenantId);
      const list: CrmOwner[] = (data || [])
        .filter((r: any) => r.profiles)
        .map((r: any) => ({
          id: r.profiles.id,
          name: r.profiles.full_name || r.profiles.email || 'Unknown',
          email: r.profiles.email || '',
        }));
      setOwners(list);
      setLoading(false);
    })();
  }, [tenantId]);

  return { owners, loading };
}

// ---------- Contact picker (lightweight search) ----------
export interface CrmContactLite { id: string; name: string | null; wa_id: string; }

export function useContactSearch(query: string) {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [results, setResults] = useState<CrmContactLite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    const t = setTimeout(async () => {
      setLoading(true);
      let q = supabase.from('contacts').select('id, name, wa_id').eq('tenant_id', tenantId).limit(20);
      if (query.trim()) q = q.or(`name.ilike.%${query}%,wa_id.ilike.%${query}%`);
      const { data } = await q;
      setResults((data as any) || []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [tenantId, query]);

  return { results, loading };
}

// ---------- Tasks ----------
import type { DealTask } from '@/types/crm';

export function useDealTasks(dealId: string | null) {
  const { currentTenant } = useTenant();
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!dealId) { setTasks([]); return; }
    setLoading(true);
    const { data } = await supabase.from('deal_tasks' as any).select('*')
      .eq('deal_id', dealId).order('due_at', { ascending: true, nullsFirst: false });
    setTasks((data as any) || []); setLoading(false);
  }, [dealId]);

  useEffect(() => { refetch(); }, [refetch]);

  const addTask = useCallback(async (title: string, dueAt: string | null) => {
    if (!dealId || !currentTenant?.id || !title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('deal_tasks' as any).insert({
      tenant_id: currentTenant.id, deal_id: dealId,
      title: title.trim(), due_at: dueAt, created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    refetch();
  }, [dealId, currentTenant?.id, refetch]);

  const toggleTask = useCallback(async (task: DealTask) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await supabase.from('deal_tasks' as any).update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    }).eq('id', task.id);
    refetch();
  }, [refetch]);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from('deal_tasks' as any).delete().eq('id', id);
    refetch();
  }, [refetch]);

  return { tasks, loading, addTask, toggleTask, deleteTask };
}

// ---------- Saved Views ----------
export interface CrmSavedView {
  id: string;
  name: string;
  view_type: string;
  filters: Record<string, any>;
  sort: Record<string, any>;
  group_by: string | null;
  is_default: boolean;
  is_shared: boolean;
}

export function useSavedViews() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [views, setViews] = useState<CrmSavedView[]>([]);

  const refetch = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase.from('crm_saved_views' as any).select('*')
      .eq('tenant_id', tenantId).order('created_at', { ascending: false });
    setViews((data as any) || []);
  }, [tenantId]);

  useEffect(() => { refetch(); }, [refetch]);

  const saveView = useCallback(async (input: { name: string; filters: any; view_type?: string }) => {
    if (!tenantId) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('crm_saved_views' as any).insert({
      tenant_id: tenantId, user_id: user?.id,
      name: input.name, filters: input.filters, view_type: input.view_type || 'kanban',
    });
    if (error) { toast.error(error.message); return; }
    toast.success('View saved');
    refetch();
  }, [tenantId, refetch]);

  const deleteView = useCallback(async (id: string) => {
    await supabase.from('crm_saved_views' as any).delete().eq('id', id);
    refetch();
  }, [refetch]);

  return { views, saveView, deleteView };
}
