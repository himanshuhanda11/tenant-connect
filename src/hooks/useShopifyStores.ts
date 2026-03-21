import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { ConnectedStore, StoreSettings } from '@/types/shopify';

export function useShopifyStores() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;

  const storesQuery = useQuery({
    queryKey: ['shopify-stores', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('connected_stores')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('platform', 'shopify')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ConnectedStore[];
    },
    enabled: !!tenantId,
  });

  const storeByIdQuery = (storeId: string | undefined) =>
    useQuery({
      queryKey: ['shopify-store', storeId],
      queryFn: async () => {
        if (!storeId) return null;
        const { data, error } = await supabase
          .from('connected_stores')
          .select('*')
          .eq('id', storeId)
          .single();
        if (error) throw error;
        return data as ConnectedStore;
      },
      enabled: !!storeId,
    });

  const storeSettingsQuery = (storeId: string | undefined) =>
    useQuery({
      queryKey: ['shopify-store-settings', storeId],
      queryFn: async () => {
        if (!storeId) return null;
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('store_id', storeId)
          .maybeSingle();
        if (error) throw error;
        return data as StoreSettings | null;
      },
      enabled: !!storeId,
    });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ storeId, settings }: { storeId: string; settings: Partial<StoreSettings> }) => {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert({ store_id: storeId, ...settings } as any, { onConflict: 'store_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-store-settings', storeId] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const { error } = await supabase
        .from('connected_stores')
        .update({ status: 'disconnected' as any })
        .eq('id', storeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-stores'] });
    },
  });

  const initiateConnect = async (storeDomain: string) => {
    const { data, error } = await supabase.functions.invoke('shopify-connect', {
      body: { storeDomain, tenantId },
    });
    if (error) throw error;
    return data as { authUrl: string };
  };

  return {
    stores: storesQuery.data || [],
    isLoading: storesQuery.isLoading,
    error: storesQuery.error,
    storeByIdQuery,
    storeSettingsQuery,
    updateSettings: updateSettingsMutation.mutateAsync,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    initiateConnect,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['shopify-stores'] }),
  };
}
