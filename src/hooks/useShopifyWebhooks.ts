import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShopifyWebhookEvent } from '@/types/shopify';

export function useShopifyWebhooks(storeId: string | undefined) {
  const queryClient = useQueryClient();

  const webhookEventsQuery = useQuery({
    queryKey: ['shopify-webhook-events', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('shopify_webhook_events')
        .select('*')
        .eq('store_id', storeId)
        .order('received_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ShopifyWebhookEvent[];
    },
    enabled: !!storeId,
  });

  const retryWebhookMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('shopify_webhook_events')
        .update({ processing_status: 'received' as any, retry_count: 0 } as any)
        .eq('id', eventId);
      if (error) throw error;

      await supabase.functions.invoke('shopify-webhook-retry', {
        body: { eventId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-webhook-events', storeId] });
    },
  });

  return {
    events: webhookEventsQuery.data || [],
    isLoading: webhookEventsQuery.isLoading,
    retryWebhook: retryWebhookMutation.mutateAsync,
    isRetrying: retryWebhookMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['shopify-webhook-events', storeId] }),
  };
}
