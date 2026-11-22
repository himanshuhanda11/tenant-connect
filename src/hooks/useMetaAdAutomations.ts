import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface MetaAdAutomation {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_ad_account_id: string | null;
  trigger_campaign_ids: string[] | null;
  trigger_conditions: Record<string, unknown>;
  actions: Record<string, unknown>[];
  executions_count: number;
  last_executed_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Lead-routing rules for Meta ads, kept live with batched realtime reloads. */
export function useMetaAdAutomations() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;
  const queryKey = ['meta-ad-automations', tenantId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tenantId) return [] as MetaAdAutomation[];
      const { data, error } = await supabase
        .from('smeksh_meta_ad_automations')
        .select('*')
        .eq('workspace_id', tenantId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as MetaAdAutomation[];
    },
    enabled: !!tenantId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!tenantId) return;
    let timer: number | undefined;
    const channel = supabase
      .channel(`meta-automations-live-${tenantId}-${Math.random().toString(36).slice(2, 8)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'smeksh_meta_ad_automations', filter: `workspace_id=eq.${tenantId}` }, () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => void queryClient.invalidateQueries({ queryKey: ['meta-ad-automations', tenantId] }), 1000);
      })
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  const setLocal = (updater: (rows: MetaAdAutomation[]) => MetaAdAutomation[]) =>
    queryClient.setQueryData<MetaAdAutomation[]>(queryKey, rows => updater(rows || []));

  const toggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('smeksh_meta_ad_automations').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;
    setLocal(rows => rows.map(r => (r.id === id ? { ...r, is_active: isActive } : r)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('smeksh_meta_ad_automations').delete().eq('id', id);
    if (error) throw error;
    setLocal(rows => rows.filter(r => r.id !== id));
  };

  return {
    automations: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
    toggle,
    remove,
  };
}
