import { useTenant } from '@/contexts/TenantContext';
import type { TenantRole } from '@/types/tenant';

const ADMIN_ROLES: TenantRole[] = ['owner', 'admin'];
const MANAGER_ROLES: TenantRole[] = ['owner', 'admin', 'manager'];

export function useIntegrationPermissions() {
  const { currentRole } = useTenant();

  const canConnect = ADMIN_ROLES.includes(currentRole as TenantRole);
  const canDisconnect = ADMIN_ROLES.includes(currentRole as TenantRole);
  const canSync = MANAGER_ROLES.includes(currentRole as TenantRole);
  const canEditSettings = ADMIN_ROLES.includes(currentRole as TenantRole);
  const canViewData = !!currentRole; // all members
  const canRetryWebhook = MANAGER_ROLES.includes(currentRole as TenantRole);

  return {
    canConnect,
    canDisconnect,
    canSync,
    canEditSettings,
    canViewData,
    canRetryWebhook,
    currentRole,
  };
}
