import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import type { Pipeline, PipelineStage } from '@/types/crm';

const LS_KEY = 'aireatro:crm:selected-pipeline';

const DEFAULT_COLORS = [
  '#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#06b6d4', '#ec4899',
];

/** Manage list of pipelines + persisted selection (per workspace). */
export function useCrmPipelines() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const lsKey = tenantId ? `${LS_KEY}:${tenantId}` : null;

  const refetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    // Ensure default pipeline exists first
    await supabase.rpc('crm_ensure_default_pipeline', { _tenant_id: tenantId });
    const { data } = await supabase
      .from('pipelines' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    const list = (data as any as Pipeline[]) || [];
    setPipelines(list);
    setLoading(false);

    const stored = lsKey ? localStorage.getItem(lsKey) : null;
    const exists = list.some(p => p.id === stored);
    setSelectedId(exists ? stored : (list.find(p => p.is_default)?.id ?? list[0]?.id ?? null));
  }, [tenantId, lsKey]);

  useEffect(() => { refetch(); }, [refetch]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    if (lsKey) localStorage.setItem(lsKey, id);
  }, [lsKey]);

  const createPipeline = useCallback(async (name: string): Promise<string | null> => {
    if (!tenantId || !name.trim()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: p, error } = await supabase
      .from('pipelines' as any)
      .insert({ tenant_id: tenantId, name: name.trim(), is_default: false, created_by: user?.id })
      .select('id')
      .single();
    if (error || !p) { toast.error(error?.message || 'Failed to create pipeline'); return null; }
    // Seed a single starter stage so deals can be added immediately
    await supabase.from('pipeline_stages' as any).insert({
      tenant_id: tenantId, pipeline_id: (p as any).id,
      name: 'New', color: DEFAULT_COLORS[0], stage_order: 0, probability: 10,
    });
    toast.success('Pipeline created');
    await refetch();
    select((p as any).id);
    return (p as any).id;
  }, [tenantId, refetch, select]);

  const renamePipeline = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from('pipelines' as any).update({ name }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    refetch();
  }, [refetch]);

  const deletePipeline = useCallback(async (id: string) => {
    const target = pipelines.find(p => p.id === id);
    if (!target) return;
    if (target.is_default) { toast.error('Cannot delete the default pipeline'); return; }
    if (pipelines.length <= 1) { toast.error('Workspace must keep at least one pipeline'); return; }
    const { error } = await supabase.from('pipelines' as any).delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Pipeline deleted');
    await refetch();
  }, [pipelines, refetch]);

  return { pipelines, loading, selectedId, select, createPipeline, renamePipeline, deletePipeline, refetch };
}

/** Stage mutations for a single pipeline. */
export function useStageMutations(pipelineId: string | null, tenantId: string | undefined) {
  const create = useCallback(async (input: Partial<PipelineStage> & { name: string }) => {
    if (!pipelineId || !tenantId) return;
    // place at end
    const { data: existing } = await supabase
      .from('pipeline_stages' as any).select('stage_order')
      .eq('pipeline_id', pipelineId).order('stage_order', { ascending: false }).limit(1);
    const nextOrder = ((existing as any)?.[0]?.stage_order ?? -1) + 1;
    const { error } = await supabase.from('pipeline_stages' as any).insert({
      tenant_id: tenantId, pipeline_id: pipelineId,
      name: input.name, color: input.color || DEFAULT_COLORS[nextOrder % DEFAULT_COLORS.length],
      stage_order: nextOrder, probability: input.probability ?? 25,
      is_won: input.is_won ?? false, is_lost: input.is_lost ?? false,
    });
    if (error) toast.error(error.message);
  }, [pipelineId, tenantId]);

  const update = useCallback(async (id: string, patch: Partial<PipelineStage>) => {
    const { error } = await supabase.from('pipeline_stages' as any).update(patch).eq('id', id);
    if (error) toast.error(error.message);
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('pipeline_stages' as any).delete().eq('id', id);
    if (error) {
      toast.error(error.code === '23503'
        ? 'Stage has deals — move them first'
        : (error.message || 'Failed to delete'));
      return false;
    }
    return true;
  }, []);

  const reorder = useCallback(async (orderedIds: string[]) => {
    await Promise.all(orderedIds.map((id, idx) =>
      supabase.from('pipeline_stages' as any).update({ stage_order: idx }).eq('id', id)
    ));
  }, []);

  return { create, update, remove, reorder, DEFAULT_COLORS };
}
