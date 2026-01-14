import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { 
  IntegrationCatalog, 
  TenantIntegration, 
  IntegrationEvent,
  IntegrationWithStatus,
  IntegrationCategory 
} from '@/types/integration';
import { formatDistanceToNow } from 'date-fns';

export function useIntegrations() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  // Fetch all available integrations from catalog
  const catalogQuery = useQuery({
    queryKey: ['integration-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_catalog')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as IntegrationCatalog[];
    },
  });

  // Fetch tenant's connected integrations
  const tenantIntegrationsQuery = useQuery({
    queryKey: ['tenant-integrations', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      
      const { data, error } = await supabase
        .from('tenant_integrations')
        .select('*')
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;
      return data as TenantIntegration[];
    },
    enabled: !!currentTenant?.id,
  });

  // Combine catalog with tenant status
  const integrationsWithStatus: IntegrationWithStatus[] = (catalogQuery.data || []).map(integration => {
    const tenantIntegration = tenantIntegrationsQuery.data?.find(
      ti => ti.integration_key === integration.key
    );
    
    return {
      ...integration,
      tenantIntegration,
      isConnected: tenantIntegration?.status === 'connected',
      lastEventFormatted: tenantIntegration?.last_event_at 
        ? formatDistanceToNow(new Date(tenantIntegration.last_event_at), { addSuffix: true })
        : undefined,
    };
  });

  // Filter by category
  const getByCategory = (category: IntegrationCategory | 'all') => {
    if (category === 'all') return integrationsWithStatus;
    return integrationsWithStatus.filter(i => i.category === category);
  };

  // Connect an integration
  const connectMutation = useMutation({
    mutationFn: async ({ 
      integrationKey, 
      credentials,
      config 
    }: { 
      integrationKey: string; 
      credentials?: Record<string, unknown>;
      config?: Record<string, unknown>;
    }) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');

      // Generate webhook URL and secret
      const webhookSecret = crypto.randomUUID().replace(/-/g, '');
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-webhook/${currentTenant.id}/${integrationKey}`;

      const { data, error } = await supabase
        .from('tenant_integrations')
        .upsert({
          tenant_id: currentTenant.id,
          integration_key: integrationKey,
          status: 'connected',
          credentials: credentials as any,
          config: (config || {}) as any,
          webhook_url: webhookUrl,
          webhook_secret: webhookSecret,
          connected_at: new Date().toISOString(),
          health_status: 'healthy',
        } as any, {
          onConflict: 'tenant_id,integration_key',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations'] });
    },
  });

  // Disconnect an integration
  const disconnectMutation = useMutation({
    mutationFn: async (integrationKey: string) => {
      if (!currentTenant?.id) throw new Error('No tenant selected');

      const { error } = await supabase
        .from('tenant_integrations')
        .update({ status: 'disconnected' })
        .eq('tenant_id', currentTenant.id)
        .eq('integration_key', integrationKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations'] });
    },
  });

  // Get recent events for an integration
  const useIntegrationEvents = (tenantIntegrationId?: string) => {
    return useQuery({
      queryKey: ['integration-events', tenantIntegrationId],
      queryFn: async () => {
        if (!tenantIntegrationId) return [];

        const { data, error } = await supabase
          .from('integration_events')
          .select('*')
          .eq('tenant_integration_id', tenantIntegrationId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data as IntegrationEvent[];
      },
      enabled: !!tenantIntegrationId,
    });
  };

  return {
    catalog: catalogQuery.data || [],
    tenantIntegrations: tenantIntegrationsQuery.data || [],
    integrationsWithStatus,
    getByCategory,
    isLoading: catalogQuery.isLoading || tenantIntegrationsQuery.isLoading,
    error: catalogQuery.error || tenantIntegrationsQuery.error,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    useIntegrationEvents,
  };
}
