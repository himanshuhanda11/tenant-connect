import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { ShopifySyncJob, ShopifySyncLog, SyncResource } from '@/types/shopify';

export function useShopifySync(storeId: string | undefined) {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;

  const syncJobsQuery = useQuery({
    queryKey: ['shopify-sync-jobs', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('shopify_sync_jobs')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ShopifySyncJob[];
    },
    enabled: !!storeId,
  });

  const syncLogsQuery = (jobId: string | undefined) =>
    useQuery({
      queryKey: ['shopify-sync-logs', jobId],
      queryFn: async () => {
        if (!jobId) return [];
        const { data, error } = await supabase
          .from('shopify_sync_logs')
          .select('*')
          .eq('job_id', jobId)
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return data as ShopifySyncLog[];
      },
      enabled: !!jobId,
    });

  const triggerSyncMutation = useMutation({
    mutationFn: async (resource: SyncResource) => {
      if (!storeId || !tenantId) throw new Error('Missing store or tenant');
      
      const jobTypeMap: Record<SyncResource, string> = {
        all: 'initial_sync',
        products: 'products_sync',
        collections: 'collections_sync',
        customers: 'customers_sync',
        orders: 'orders_sync',
        abandoned_checkouts: 'abandoned_checkouts_sync',
      };

      const { data, error } = await supabase
        .from('shopify_sync_jobs')
        .insert({
          tenant_id: tenantId,
          store_id: storeId,
          job_type: jobTypeMap[resource] as any,
          resource_type: resource,
          status: 'queued' as any,
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Invoke sync edge function
      await supabase.functions.invoke('shopify-sync', {
        body: { jobId: data.id, storeId, resource },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-sync-jobs', storeId] });
    },
  });

  const retrySyncMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('shopify_sync_jobs')
        .update({ status: 'queued' as any } as any)
        .eq('id', jobId);
      if (error) throw error;

      await supabase.functions.invoke('shopify-sync', {
        body: { jobId, storeId, retry: true },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-sync-jobs', storeId] });
    },
  });

  return {
    syncJobs: syncJobsQuery.data || [],
    isLoading: syncJobsQuery.isLoading,
    syncLogsQuery,
    triggerSync: triggerSyncMutation.mutateAsync,
    retrySync: retrySyncMutation.mutateAsync,
    isSyncing: triggerSyncMutation.isPending,
    isRetrying: retrySyncMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['shopify-sync-jobs', storeId] }),
  };
}
