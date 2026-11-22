import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { AdAgentLeadRow } from '@/lib/metaAdRouting';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';
import { startOfZonedDay } from '@/lib/workspaceTime';

/** How many leads from each WhatsApp ad each agent actually received (all time and today). */
export function useAdAgentLeadBreakdown() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;
  const timeZone = useWorkspaceTimezone();
  const query = useQuery({
    queryKey: ['ad-agent-lead-breakdown', tenantId, timeZone],
    queryFn: async () => {
      if (!tenantId) return [] as AdAgentLeadRow[];
      const { data, error } = await supabase.rpc('get_ad_agent_lead_breakdown', {
        _tenant_id: tenantId,
        _since: startOfZonedDay(new Date(), timeZone).toISOString(),
      });
      if (error) throw error;
      return (data || []) as AdAgentLeadRow[];
    },
    enabled: !!tenantId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  return { rows: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
}
