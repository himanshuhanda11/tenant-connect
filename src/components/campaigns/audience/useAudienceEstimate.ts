import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SELECT_SENTINELS } from '@/lib/inboxLeadStatus';
import type { AudienceFilters } from '../CampaignAudienceBuilder';

export interface EstimateResult {
  total: number;
  sampleIds: string[];
  contactIds: string[]; // full list for submission
  loading: boolean;
  error: string | null;
  updatedAt: number | null;
}

const cache = new Map<string, { value: Omit<EstimateResult, 'loading' | 'error'>; ts: number }>();
const CACHE_TTL = 30_000;

function buildParams(tenantId: string, f: AudienceFilters, segmentNameById: Map<string, string>) {
  const includeSegmentNames = f.include_segments
    .map((id) => segmentNameById.get(id))
    .filter((v): v is string => Boolean(v));
  const excludeSegmentNames = f.exclude_segments
    .map((id) => segmentNameById.get(id))
    .filter((v): v is string => Boolean(v));

  const isUnassigned = f.assigned_agent === SELECT_SENTINELS.unassigned;
  const specificAgent =
    f.assigned_agent && f.assigned_agent !== SELECT_SENTINELS.unassigned && f.assigned_agent !== SELECT_SENTINELS.all
      ? f.assigned_agent
      : null;

  const validAttrs = (f.attributes || []).filter((a) => a.key && a.value);

  return {
    p_tenant_id: tenantId,
    p_assigned_agent: specificAgent,
    p_unassigned_only: isUnassigned,
    p_lead_statuses: f.lead_states.length ? f.lead_states : null,
    p_contact_sources: f.contact_source ? [f.contact_source] : null,
    p_include_tag_ids: f.include_tags.length ? f.include_tags : null,
    p_exclude_tag_ids: f.exclude_tags.length ? f.exclude_tags : null,
    p_tag_match_all: false,
    p_include_segment_names: includeSegmentNames.length ? includeSegmentNames : null,
    p_exclude_segment_names: excludeSegmentNames.length ? excludeSegmentNames : null,
    p_flow_id: f.flow_source || null,
    p_meta_campaign_id: f.meta_campaign_source || null,
    p_date_from: f.date_from ? new Date(f.date_from + 'T00:00:00').toISOString() : null,
    p_date_to: f.date_to ? new Date(new Date(f.date_to + 'T00:00:00').getTime() + 86_400_000).toISOString() : null,
    p_last_active_from: null,
    p_last_active_to: null,
    p_attributes: validAttrs.length ? JSON.stringify(validAttrs) : null,
    p_is_unreplied: f.is_unreplied === 'all' ? null : f.is_unreplied === 'yes',
    p_exclude_recent_days: f.exclude_recent_days || 0,
    p_opt_in_only: f.opt_in_only,
    p_exclude_blocked: true,
    p_sample_limit: 50_000, // returns full list for submission
  };
}

export function useAudienceEstimate(
  tenantId: string | undefined,
  filters: AudienceFilters,
  segmentNameById: Map<string, string>,
  enabled: boolean = true,
) {
  const [state, setState] = useState<EstimateResult>({
    total: 0,
    sampleIds: [],
    contactIds: [],
    loading: false,
    error: null,
    updatedAt: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const key = tenantId ? `${tenantId}:${JSON.stringify(buildParams(tenantId, filters, segmentNameById))}` : null;

  useEffect(() => {
    if (!tenantId || !enabled) return;

    // Serve cached value instantly
    const cached = key ? cache.get(key) : null;
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setState({ ...cached.value, loading: false, error: null });
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setState((s) => ({ ...s, loading: true, error: null }));

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const params = buildParams(tenantId, filters, segmentNameById);
        const { data, error } = await (supabase as any).rpc('campaign_audience_estimate', params);
        if (ac.signal.aborted) return;
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        const total = Number(row?.total ?? 0);
        const ids: string[] = (row?.sample_ids ?? []) as string[];
        const value = {
          total,
          sampleIds: ids.slice(0, 8),
          contactIds: ids,
          updatedAt: Date.now(),
        };
        if (key) cache.set(key, { value, ts: Date.now() });
        setState({ ...value, loading: false, error: null });
      } catch (err: any) {
        if (ac.signal.aborted) return;
        console.error('Audience estimate failed:', err);
        setState((s) => ({ ...s, loading: false, error: err?.message ?? 'Estimate failed' }));
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [key, tenantId, enabled]);

  return state;
}

export function clearAudienceEstimateCache() {
  cache.clear();
}
