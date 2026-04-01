import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import type { TenantRole } from '@/types/tenant';

export const META_ADS_VIEW_PERMISSIONS = ['meta_ads.view', 'meta_ads.manage'] as const;
export const META_ADS_CONNECT_PERMISSIONS = ['meta_ads.connect', 'meta_ads.manage'] as const;
export const META_ADS_ATTRIBUTION_PERMISSIONS = ['meta_ads.attribution', 'meta_ads.manage'] as const;
export const META_ADS_AUTOMATION_PERMISSIONS = ['meta_ads.automations', 'meta_ads.manage'] as const;
export const META_ADS_ANY_PERMISSIONS = [
  'meta_ads.view',
  'meta_ads.manage',
  'meta_ads.connect',
  'meta_ads.attribution',
  'meta_ads.automations',
] as const;

const LEGACY_META_ADS_PERMISSIONS_BY_ROLE: Record<TenantRole, string[]> = {
  owner: [...META_ADS_ANY_PERMISSIONS],
  admin: [...META_ADS_ANY_PERMISSIONS],
  manager: [...META_ADS_ANY_PERMISSIONS],
  agent: [],
};

const normalizePermissionKeys = (rows: any[] | null | undefined) => {
  return (rows || []).flatMap((row) => {
    const permission = Array.isArray(row.permissions) ? row.permissions[0] : row.permissions;
    return permission?.key ? [permission.key as string] : [];
  });
};

export function useCurrentRolePermissions() {
  const { user } = useAuth();
  const { currentTenant, currentRole } = useTenant();
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPermissions = async () => {
      if (!user || !currentTenant?.id || !currentRole) {
        if (!cancelled) {
          setPermissionKeys([]);
          setLoading(false);
        }
        return;
      }

      if (currentRole === 'owner') {
        if (!cancelled) {
          setPermissionKeys(['*']);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        let roleId: string | null = null;

        const { data: assignedRole, error: assignedRoleError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('tenant_id', currentTenant.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (assignedRoleError) {
          console.error('Failed to load user role assignment:', assignedRoleError);
        }

        roleId = assignedRole?.role_id ?? null;

        if (!roleId) {
          const { data: systemRole, error: systemRoleError } = await supabase
            .from('roles')
            .select('id')
            .eq('tenant_id', currentTenant.id)
            .eq('base_role', currentRole)
            .eq('is_system', true)
            .maybeSingle();

          if (systemRoleError) {
            console.error('Failed to load fallback system role:', systemRoleError);
          }

          roleId = systemRole?.id ?? null;
        }

        if (!roleId) {
          if (!cancelled) {
            setPermissionKeys(LEGACY_META_ADS_PERMISSIONS_BY_ROLE[currentRole] || []);
            setLoading(false);
          }
          return;
        }

        const { data: permissionRows, error: permissionsError } = await supabase
          .from('role_permissions')
          .select('permissions(key)')
          .eq('role_id', roleId);

        if (permissionsError) {
          throw permissionsError;
        }

        if (!cancelled) {
          setPermissionKeys(normalizePermissionKeys(permissionRows));
        }
      } catch (error) {
        console.error('Failed to resolve current role permissions:', error);
        if (!cancelled) {
          setPermissionKeys(LEGACY_META_ADS_PERMISSIONS_BY_ROLE[currentRole] || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPermissions();

    return () => {
      cancelled = true;
    };
  }, [currentRole, currentTenant?.id, user]);

  const permissionSet = useMemo(() => new Set(permissionKeys), [permissionKeys]);

  const hasPermission = (permissionKey: string) => permissionSet.has('*') || permissionSet.has(permissionKey);
  const hasAnyPermission = (permissionKeysToCheck: readonly string[]) =>
    permissionSet.has('*') || permissionKeysToCheck.some((permissionKey) => permissionSet.has(permissionKey));

  return {
    loading,
    permissionKeys,
    hasPermission,
    hasAnyPermission,
    canAccessMetaAds: hasAnyPermission(META_ADS_ANY_PERMISSIONS),
  };
}