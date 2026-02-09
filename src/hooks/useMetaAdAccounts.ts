import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export function useMetaAdAccounts() {
  const { currentTenant } = useTenant();

  const accountsQuery = useQuery({
    queryKey: ['meta-ad-accounts', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('smeksh_meta_ad_accounts')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const campaignsQuery = useQuery({
    queryKey: ['meta-ad-campaigns', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from('smeksh_meta_ad_campaigns')
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .order('campaign_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id,
  });

  const connectedAccounts = accountsQuery.data?.filter(a => a.status === 'connected') || [];
  const isConnected = connectedAccounts.length > 0;

  // Format campaigns for FlowStartPanel consumption
  const campaignsForFlows = (campaignsQuery.data || []).map(c => ({
    id: c.id,
    name: c.campaign_name,
    status: c.status,
    clicks: c.clicks || 0,
    adset: c.adset_name || 'Unknown',
  }));

  return {
    accounts: accountsQuery.data || [],
    connectedAccounts,
    campaigns: campaignsQuery.data || [],
    campaignsForFlows,
    isConnected,
    isLoading: accountsQuery.isLoading || campaignsQuery.isLoading,
    error: accountsQuery.error || campaignsQuery.error,
    refetch: async () => {
      await Promise.all([
        accountsQuery.refetch(),
        campaignsQuery.refetch(),
      ]);
    },
  };
}
