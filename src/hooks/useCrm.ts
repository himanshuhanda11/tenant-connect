import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import type { Pipeline, PipelineStage, Deal, DealActivity, DealNote } from '@/types/crm';

/**
 * Ensure default pipeline exists for the workspace and return its id.
 */
export function useDefaultPipeline() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.rpc('crm_ensure_default_pipeline', {
          _tenant_id: tenantId,
        });
        if (cancelled) return;
        if (error) throw error;
        setPipelineId(data as string);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load pipeline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tenantId]);

  return { pipelineId, loading, error };
}

export function usePipelines() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const { data } = await supabase
      .from('pipelines' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true });
    setPipelines((data as any) || []);
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { pipelines, loading, refetch };
}

export function usePipelineStages(pipelineId: string | null) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!pipelineId) { setStages([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('pipeline_stages' as any)
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('stage_order', { ascending: true });
    setStages((data as any) || []);
    setLoading(false);
  }, [pipelineId]);

  useEffect(() => { refetch(); }, [refetch]);
  return { stages, loading, refetch };
}

export function useDeals(pipelineId: string | null) {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!tenantId || !pipelineId) { setDeals([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('deals' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('pipeline_id', pipelineId)
      .order('position', { ascending: true });
    if (error) toast.error(error.message);
    setDeals((data as any) || []);
    setLoading(false);
  }, [tenantId, pipelineId]);

  useEffect(() => { refetch(); }, [refetch]);

  const moveDeal = useCallback(async (dealId: string, newStageId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage_id: newStageId } : d));
    const { error } = await supabase
      .from('deals' as any)
      .update({ stage_id: newStageId, last_activity_at: new Date().toISOString() })
      .eq('id', dealId);
    if (error) { toast.error('Failed to move deal'); refetch(); }
  }, [refetch]);

  const createDeal = useCallback(async (input: Partial<Deal> & { title: string; stage_id: string; pipeline_id: string }) => {
    if (!tenantId) return null;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('deals' as any)
      .insert({ ...input, tenant_id: tenantId, created_by: user?.id })
      .select()
      .single();
    if (error) { toast.error(error.message); return null; }
    toast.success('Deal created');
    refetch();
    return data as any as Deal;
  }, [tenantId, refetch]);

  const updateDeal = useCallback(async (id: string, patch: Partial<Deal>) => {
    const { error } = await supabase.from('deals' as any).update(patch).eq('id', id);
    if (error) { toast.error(error.message); return false; }
    refetch();
    return true;
  }, [refetch]);

  const deleteDeal = useCallback(async (id: string) => {
    const { error } = await supabase.from('deals' as any).delete().eq('id', id);
    if (error) { toast.error(error.message); return false; }
    toast.success('Deal deleted');
    refetch();
    return true;
  }, [refetch]);

  return { deals, loading, refetch, moveDeal, createDeal, updateDeal, deleteDeal };
}

export function useDealActivities(dealId: string | null) {
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dealId) { setActivities([]); return; }
    setLoading(true);
    supabase.from('deal_activities' as any).select('*').eq('deal_id', dealId)
      .order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setActivities((data as any) || []); setLoading(false); });
  }, [dealId]);

  return { activities, loading };
}

export function useDealNotes(dealId: string | null) {
  const { currentTenant } = useTenant();
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!dealId) { setNotes([]); return; }
    setLoading(true);
    const { data } = await supabase.from('deal_notes' as any).select('*').eq('deal_id', dealId)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    setNotes((data as any) || []); setLoading(false);
  }, [dealId]);

  useEffect(() => { refetch(); }, [refetch]);

  const addNote = useCallback(async (content: string) => {
    if (!dealId || !currentTenant?.id || !content.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('deal_notes' as any).insert({
      tenant_id: currentTenant.id, deal_id: dealId, author_id: user?.id, content: content.trim(),
    });
    if (error) { toast.error(error.message); return; }
    refetch();
  }, [dealId, currentTenant?.id, refetch]);

  const deleteNote = useCallback(async (id: string) => {
    await supabase.from('deal_notes' as any).delete().eq('id', id);
    refetch();
  }, [refetch]);

  return { notes, loading, addNote, deleteNote };
}

export function useDealMetrics(deals: Deal[]) {
  return useMemo(() => {
    const total = deals.length;
    const open = deals.filter(d => d.status === 'open').length;
    const won = deals.filter(d => d.status === 'won').length;
    const lost = deals.filter(d => d.status === 'lost').length;
    const value = deals.filter(d => d.status === 'open').reduce((s, d) => s + Number(d.value || 0), 0);
    const wonValue = deals.filter(d => d.status === 'won').reduce((s, d) => s + Number(d.value || 0), 0);
    return { total, open, won, lost, value, wonValue };
  }, [deals]);
}
