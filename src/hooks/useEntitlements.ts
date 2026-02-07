import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface WorkspaceEntitlements {
  workspace_id: string;
  plan_id: 'free' | 'basic' | 'pro' | 'business';
  limits: Record<string, any>;
  features: string[];
}

export interface PlatformPlan {
  id: string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number | null;
  is_custom: boolean;
  highlight: boolean;
  badge: string | null;
  limits: Record<string, any>;
  features: string[];
  addons: string[];
  restrictions: string[] | null;
  sort_order: number;
  is_active: boolean;
}

export function useEntitlements() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ['workspace-entitlements', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await (supabase as any)
        .from('workspace_entitlements')
        .select('workspace_id, plan_id, limits, features')
        .eq('workspace_id', currentTenant.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as WorkspaceEntitlements | null;
    },
    enabled: !!currentTenant?.id,
  });
}

export function usePlatformPlans() {
  return useQuery({
    queryKey: ['platform-plans'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('platform_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data ?? []) as unknown as PlatformPlan[];
    },
  });
}

/** Check if a feature is available */
export function canUseFeature(entitlements: WorkspaceEntitlements | null | undefined, featureKey: string): boolean {
  if (!entitlements) return false;
  const limits = entitlements.limits;
  const val = limits?.[featureKey];
  if (val === 'unlimited') return true;
  if (typeof val === 'number') return val > 0;
  if (typeof val === 'string') return val !== 'preview' && val !== '';
  return !!val;
}

/** Get a limit value */
export function getLimit(entitlements: WorkspaceEntitlements | null | undefined, key: string): number | 'unlimited' {
  if (!entitlements) return 0;
  const val = entitlements.limits?.[key];
  if (val === 'unlimited') return 'unlimited';
  return typeof val === 'number' ? val : 0;
}
