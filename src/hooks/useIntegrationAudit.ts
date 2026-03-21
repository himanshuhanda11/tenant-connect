import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';

type IntegrationAction = 
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.settings_updated'
  | 'integration.sync_started'
  | 'integration.sync_completed'
  | 'integration.webhook_retried'
  | 'integration.store_connected'
  | 'integration.store_disconnected';

export function useIntegrationAudit() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  const log = async (
    action: IntegrationAction,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ) => {
    if (!currentTenant?.id) return;

    try {
      await supabase.from('audit_logs').insert({
        tenant_id: currentTenant.id,
        user_id: user?.id ?? null,
        action,
        resource_type: resourceType,
        resource_id: resourceId ?? null,
        details: details as any ?? null,
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  };

  return { log };
}
