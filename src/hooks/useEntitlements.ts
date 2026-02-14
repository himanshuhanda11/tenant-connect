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
        .select('*')
        .eq('workspace_id', currentTenant.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const planId = data.plan || 'free';

      // Fetch platform plan limits to merge
      const { data: planData } = await (supabase as any)
        .from('platform_plans')
        .select('limits')
        .eq('id', planId)
        .maybeSingle();

      const planLimits = planData?.limits ?? {};

      // Map DB columns to the interface, merging platform plan limits
      return {
        workspace_id: data.workspace_id,
        plan_id: planId,
        limits: {
          monthly_messages: data.monthly_conversation_limit,
          monthly_broadcasts: data.monthly_broadcast_limit,
          monthly_templates: data.monthly_template_limit,
          flows: data.monthly_flow_limit,
          ai_credits: data.enable_ai ? 'unlimited' : 0,
          // Merge platform plan resource limits
          team_members: planLimits.team_members,
          max_team_members: planLimits.team_members,
          contacts: planLimits.contacts,
          max_contacts: planLimits.contacts,
          automations: planLimits.automations,
          max_automations: planLimits.automations,
          phone_numbers: planLimits.phone_numbers,
          max_phone_numbers: planLimits.phone_numbers,
          tags: planLimits.tags,
          autoforms: planLimits.autoforms,
          custom_attributes: planLimits.custom_attributes,
        },
        features: [
          ...(data.enable_ai ? ['ai'] : []),
          ...(data.enable_ads ? ['ads_manager'] : []),
          ...(data.enable_integrations ? ['integrations'] : []),
          ...(data.enable_autoforms ? ['autoforms'] : []),
        ],
      } as WorkspaceEntitlements;
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
