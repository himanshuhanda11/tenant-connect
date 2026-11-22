import { useTenant } from '@/contexts/TenantContext';
import { isValidTimeZone } from '@/lib/workspaceTime';

/** The workspace's reporting timezone (never the device timezone). */
export function useWorkspaceTimezone(): string {
  const { currentTenant } = useTenant();
  const tz = currentTenant?.timezone;
  return isValidTimeZone(tz) ? tz : 'UTC';
}
