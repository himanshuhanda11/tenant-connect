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

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantWithRole[]>([]);
  const [currentTenant, setCurrentTenantState] = useState<TenantWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
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
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const tenantsWithRoles: TenantWithRole[] = (memberships || [])
        .filter(m => m.tenants)
        .map(m => ({
          ...(m.tenants as unknown as Tenant),
          role: m.role as TenantRole
        }));

      setTenants(tenantsWithRoles);

      // Restore last selected tenant from localStorage
      const savedTenantId = localStorage.getItem(CURRENT_TENANT_KEY);
      if (savedTenantId) {
        const savedTenant = tenantsWithRoles.find(t => t.id === savedTenantId);
        if (savedTenant) {
          setCurrentTenantState(savedTenant);
        } else if (tenantsWithRoles.length > 0) {
          setCurrentTenantState(tenantsWithRoles[0]);
        }
      } else if (tenantsWithRoles.length > 0) {
        setCurrentTenantState(tenantsWithRoles[0]);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
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
