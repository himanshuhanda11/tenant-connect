import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BroadcastCostBreakdownRow {
  country_code: string;
  country_name: string;
  count: number;
  rate: number;
  total_credits: number;
  unknown: boolean;
}

export interface BroadcastCostEstimate {
  template_category: string;
  breakdown: BroadcastCostBreakdownRow[];
  total_credits: number;
  total_recipients: number;
  available: number;
  remaining_after: number;
  sufficient: boolean;
  shortfall: number;
  unknown_count: number;
}

/**
 * Debounced hook that calls estimate_broadcast_cost server-side
 * whenever audience or template category changes.
 */
export function useBroadcastCostEstimate(params: {
  tenantId: string | null | undefined;
  contactIds: string[];
  templateCategory: string | null | undefined;
  enabled?: boolean;
  debounceMs?: number;
}) {
  const { tenantId, contactIds, templateCategory, enabled = true, debounceMs = 350 } = params;
  const [estimate, setEstimate] = useState<BroadcastCostEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const reqId = useRef(0);

  const key = `${tenantId || ''}|${templateCategory || ''}|${contactIds.length}|${contactIds.slice(0, 5).join(',')}|${contactIds.slice(-5).join(',')}`;

  useEffect(() => {
    if (!enabled || !tenantId || !templateCategory || contactIds.length === 0) {
      setEstimate(null);
      setLoading(false);
      return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    setLoading(true);
    const myReq = ++reqId.current;
    timer.current = window.setTimeout(async () => {
      try {
        const { data, error: err } = await supabase.rpc('estimate_broadcast_cost', {
          p_tenant_id: tenantId,
          p_contact_ids: contactIds,
          p_template_category: templateCategory,
        });
        if (myReq !== reqId.current) return;
        if (err) throw err;
        setEstimate(data as unknown as BroadcastCostEstimate);
        setError(null);
      } catch (e: any) {
        if (myReq !== reqId.current) return;
        setError(e?.message || 'Failed to estimate cost');
        setEstimate(null);
      } finally {
        if (myReq === reqId.current) setLoading(false);
      }
    }, debounceMs);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, debounceMs]);

  return { estimate, loading, error };
}
