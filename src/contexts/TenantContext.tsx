import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { Tenant, TenantRole, TenantWithRole } from '@/types/tenant';

interface TenantContextType {
  tenants: TenantWithRole[];
  currentTenant: TenantWithRole | null;
  currentRole: TenantRole | null;
  loading: boolean;
  setCurrentTenant: (tenant: TenantWithRole | null) => void;
  createTenant: (name: string, slug: string) => Promise<{ error: Error | null; tenant: Tenant | null }>;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const CURRENT_TENANT_KEY = 'whatsapp-isv-current-tenant';

const normalizeTenantRole = (membershipRole: string | null | undefined, assignedBaseRole?: string | null): TenantRole => {
  if (assignedBaseRole === 'owner' || assignedBaseRole === 'admin' || assignedBaseRole === 'manager' || assignedBaseRole === 'agent') {
    return assignedBaseRole;
  }

  if (membershipRole === 'owner' || membershipRole === 'admin' || membershipRole === 'manager' || membershipRole === 'agent') {
    return membershipRole;
  }

  return 'agent';
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantWithRole[]>([]);
  const [currentTenant, setCurrentTenantState] = useState<TenantWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async (showSpinner = false) => {
    // Only show loading spinner when explicitly requested (initial load).
    // Silent refreshes (e.g. token refresh on tab switch) keep the UI mounted.
    if (showSpinner) {
      setLoading(true);
    }

    if (!user) {
      setTenants([]);
      setCurrentTenantState(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch tenant memberships with tenant details
      const { data: memberships, error } = await supabase
        .from('tenant_members')
        .select(`
          role,
          tenants (
            id,
            name,
            slug,
            logo_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const { data: assignedRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('tenant_id, role_id, roles(base_role)')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('Error fetching user_roles:', rolesError);
      }
      console.log('[TenantContext] assignedRoles raw:', JSON.stringify(assignedRoles));

      const assignedRoleMap = new Map<string, string | null>();

      (assignedRoles || []).forEach((assignment: any) => {
        const relatedRole = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles;
        assignedRoleMap.set(assignment.tenant_id, relatedRole?.base_role ?? null);
      });

      const tenantsWithRoles: TenantWithRole[] = (memberships || [])
        .filter(m => m.tenants)
        .map(m => ({
          ...(m.tenants as unknown as Tenant),
          role: normalizeTenantRole(m.role, assignedRoleMap.get((m.tenants as Tenant).id))
        }));

      setTenants(tenantsWithRoles);

      // Auto-select if user has exactly one tenant (e.g. agents added directly)
      if (tenantsWithRoles.length === 1) {
        // Only update state if the tenant id actually changed to avoid unnecessary re-renders
        setCurrentTenantState(prev => {
          if (prev?.id === tenantsWithRoles[0].id && prev?.role === tenantsWithRoles[0].role) return prev;
          localStorage.setItem(CURRENT_TENANT_KEY, tenantsWithRoles[0].id);
          return tenantsWithRoles[0];
        });
      } else {
        // Try to restore from localStorage
        const savedTenantId = localStorage.getItem(CURRENT_TENANT_KEY);
        if (savedTenantId && tenantsWithRoles.length > 0) {
          const savedTenant = tenantsWithRoles.find(t => t.id === savedTenantId);
          if (savedTenant) {
            setCurrentTenantState(prev => {
              if (prev?.id === savedTenant.id && prev?.role === savedTenant.role) return prev;
              return savedTenant;
            });
          } else {
            setCurrentTenantState(null);
            localStorage.removeItem(CURRENT_TENANT_KEY);
          }
        } else {
          setCurrentTenantState(prev => {
            if (prev === null) return prev;
            return null;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show spinner only on initial load (no tenant yet).
    // Subsequent user/token changes refresh silently to preserve UI state (modals, wizards).
    const isInitialLoad = !currentTenant;
    fetchTenants(isInitialLoad);
  }, [user]);

  const setCurrentTenant = (tenant: TenantWithRole | null) => {
    setCurrentTenantState(tenant);
    if (tenant) {
      localStorage.setItem(CURRENT_TENANT_KEY, tenant.id);
    } else {
      localStorage.removeItem(CURRENT_TENANT_KEY);
    }
  };

  const createTenant = async (name: string, slug: string) => {
    if (!user) {
      return { error: new Error('Not authenticated'), tenant: null };
    }

    try {
      // Create tenant + owner membership atomically on the backend.
      // This avoids RLS issues where INSERT ... RETURNING requires SELECT access
      // before the user is a tenant member.
      const { data: tenant, error } = await supabase
        .rpc('create_tenant_with_owner', {
          _name: name,
          _slug: slug,
        })
        .single();

      if (error) throw error;

      // Immediately set the new tenant as current to prevent race conditions
      // where DashboardLayout sees empty tenants and redirects back
      const newTenantWithRole: TenantWithRole = {
        ...(tenant as Tenant),
        role: 'owner' as TenantRole
      };
      setTenants(prev => [...prev, newTenantWithRole]);
      setCurrentTenant(newTenantWithRole);

      return { error: null, tenant: tenant as Tenant };
    } catch (error) {
      return { error: error as Error, tenant: null };
    }
  };

  const refreshTenants = async () => {
    await fetchTenants();
  };

  return (
    <TenantContext.Provider value={{
      tenants,
      currentTenant,
      currentRole: currentTenant?.role ?? null,
      loading,
      setCurrentTenant,
      createTenant,
      refreshTenants
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
