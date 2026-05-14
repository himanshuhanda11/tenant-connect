// Hook for premium Stripe-backed billing UX per workspace.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export type WorkspaceBillingStatus = {
  workspace_id: string;
  plan_id: string | null;
  plan_name: string | null;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'trialing' | 'past_due' | 'unpaid' | 'cancelled' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'inactive';
  trial_status: 'none' | 'active' | 'ended';
  is_trialing: boolean;
  trial_days_left: number;
  trial_end: string | null;
  current_period_end: string | null;
  next_billing_date: string | null;
  cancel_at_period_end: boolean;
  last_payment_status: string | null;
  stripe_customer_id: string | null;
  has_subscription: boolean;
  has_selected_plan?: boolean;
  /** How the plan was assigned: stripe checkout, manual super-admin, or default free */
  plan_source?: 'stripe' | 'manual_admin' | 'free';
  /** True when a Super Admin manually assigned this plan (no Stripe required) */
  assigned_by_admin?: boolean;
  /** True when Stripe checkout still needs to happen to activate a paid plan */
  stripe_required?: boolean;
  /** True when the workspace is on an active paid plan (manual or Stripe) */
  is_paid?: boolean;
  pending_plan_id: string | null;
  pending_billing_cycle: 'monthly' | 'yearly' | null;
  scheduled_change_at: string | null;
  next_plan_message: string | null;
  role: 'owner' | 'admin' | 'member' | string;
  entitlements: Record<string, any> | null;
};

export function useWorkspaceBilling(workspaceIdOverride?: string) {
  const { currentTenant } = useTenant();
  const workspaceId = workspaceIdOverride ?? currentTenant?.id ?? null;

  return useQuery({
    queryKey: ['workspace-billing-status', workspaceId],
    enabled: !!workspaceId,
    refetchInterval: 30_000,
    retry: (count, err: any) => {
      const status = err?.context?.status ?? err?.status;
      if (status === 401 || status === 403) return false;
      return count < 2;
    },
    queryFn: async (): Promise<WorkspaceBillingStatus | null> => {
      if (!workspaceId) return null;
      // Ensure we have a fresh session token before invoking
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return null;

      const { data, error } = await supabase.functions.invoke('get-workspace-billing-status', {
        body: { workspaceId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 401 || status === 403) return null;
        throw error;
      }
      return data as WorkspaceBillingStatus;
    },
  });
}

export function useStartCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      workspaceId: string;
      planId: string;
      billingCycle: 'monthly' | 'yearly';
      region?: 'IN' | 'GULF' | 'OTHER';
      country?: string;
      successPath?: string;
      cancelPath?: string;
    }) => {
      const origin = window.location.origin;
      const { data, error } = await supabase.functions.invoke('billing-create-checkout', {
        body: {
          workspaceId: input.workspaceId,
          planId: input.planId,
          billingCycle: input.billingCycle,
          provider: 'stripe',
          region: input.region,
          country: input.country,
          successUrl: input.successPath
            ? `${origin}${input.successPath}?session_id={CHECKOUT_SESSION_ID}`
            : undefined,
          cancelUrl: input.cancelPath ? `${origin}${input.cancelPath}` : undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { free?: boolean; checkout_url?: string; session_id?: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-billing-status'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['entitlements'] });
    },
  });
}

export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: { workspaceId, returnUrl: `${window.location.origin}/billing` },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      window.location.href = (data as any).portal_url;
      return data;
    },
    onError: (e: any) => toast.error(e?.message || 'Could not open billing portal'),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { workspaceId: string; planId: string; billingCycle: 'monthly' | 'yearly' }) => {
      const { data, error } = await supabase.functions.invoke('change-workspace-plan', {
        body: input,
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as {
        ok?: boolean;
        action?: 'checkout_required';
        kind?: 'upgrade' | 'downgrade';
        effective?: 'immediate' | 'next_period' | 'trial_end';
        target?: string;
        scheduled_at?: string | null;
        trial_end?: string | null;
        proration?: boolean;
        noop?: boolean;
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-billing-status'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['entitlements'] });
    },
  });
}
