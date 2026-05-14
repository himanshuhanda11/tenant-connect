// Centralized access check for WhatsApp API connection.
// Used by /phone-numbers/connect route guard, the WhatsAppConnectBanner,
// quick-action cards, and any other "Connect WhatsApp" entry point.
//
// Rule: a workspace may only connect WhatsApp once it has a valid plan
// (Free activated, Trialing, or Active paid). Abandoned checkouts,
// past_due / unpaid / canceled / incomplete subscriptions are blocked.
import { useMemo } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useWorkspaceBilling, type WorkspaceBillingStatus } from '@/hooks/useWorkspaceBilling';

export type WhatsAppAccessReason =
  | 'no_workspace'
  | 'loading'
  | 'no_plan_selected'
  | 'payment_incomplete'
  | 'subscription_blocked'
  | 'allowed';

export type WhatsAppAccessResult = {
  allowed: boolean;
  isLoading: boolean;
  reason: WhatsAppAccessReason;
  requiredAction: 'choose_plan' | 'complete_payment' | 'resolve_billing' | 'none';
  redirectUrl: string;
  message: string;
  currentPlan: string | null;
  billingStatus: WorkspaceBillingStatus['status'] | null;
  workspaceId: string | null;
};

const ALLOWED_STATUSES = new Set(['active', 'trialing']);
const BLOCKED_STATUSES = new Set([
  'past_due',
  'unpaid',
  'canceled',
  'cancelled',
  'incomplete',
  'incomplete_expired',
  'inactive',
]);

export function evaluateWhatsAppAccess(
  workspaceId: string | null,
  billing: WorkspaceBillingStatus | null | undefined,
  isLoading: boolean,
): WhatsAppAccessResult {
  if (!workspaceId) {
    return {
      allowed: false,
      isLoading: false,
      reason: 'no_workspace',
      requiredAction: 'choose_plan',
      redirectUrl: '/select-workspace',
      message: 'Select a workspace to continue.',
      currentPlan: null,
      billingStatus: null,
      workspaceId: null,
    };
  }

  if (isLoading || !billing) {
    return {
      allowed: false,
      isLoading: true,
      reason: 'loading',
      requiredAction: 'none',
      redirectUrl: '',
      message: 'Checking workspace billing…',
      currentPlan: null,
      billingStatus: null,
      workspaceId,
    };
  }

  const dashboardPlanRedirect = `/dashboard/onboarding?workspace_id=${workspaceId}&step=1&reason=plan_required`;
  const paymentRedirect = `/dashboard/onboarding?workspace_id=${workspaceId}&step=1&reason=payment_required`;
  const billingRedirect = `/billing?workspace_id=${workspaceId}&reason=resolve_billing`;

  // Step 1 not done — no plan picked yet OR abandoned checkout
  if (!billing.has_selected_plan || !billing.plan_id) {
    return {
      allowed: false,
      isLoading: false,
      reason: 'no_plan_selected',
      requiredAction: 'choose_plan',
      redirectUrl: dashboardPlanRedirect,
      message: 'Please choose a plan before connecting WhatsApp API.',
      currentPlan: null,
      billingStatus: billing.status,
      workspaceId,
    };
  }

  // Free plan — always allowed once selected
  if (billing.plan_id === 'free') {
    return {
      allowed: true,
      isLoading: false,
      reason: 'allowed',
      requiredAction: 'none',
      redirectUrl: '/phone-numbers/connect',
      message: '',
      currentPlan: billing.plan_name ?? 'Free',
      billingStatus: billing.status,
      workspaceId,
    };
  }

  // Manual super-admin assigned plan — never require Stripe checkout.
  // The billing-status function already sets has_subscription=true for these,
  // but we double-check here so a missing flag never blocks access.
  const isManualAdmin = billing.plan_source === 'manual_admin' || billing.assigned_by_admin === true;

  // Paid plan picked but Stripe checkout never confirmed (skip for manual admin)
  if (!billing.has_subscription && !isManualAdmin) {
    return {
      allowed: false,
      isLoading: false,
      reason: 'payment_incomplete',
      requiredAction: 'complete_payment',
      redirectUrl: paymentRedirect,
      message: 'Complete checkout to activate your plan, then connect WhatsApp API.',
      currentPlan: billing.plan_name,
      billingStatus: billing.status,
      workspaceId,
    };
  }

  if (ALLOWED_STATUSES.has(billing.status)) {
    return {
      allowed: true,
      isLoading: false,
      reason: 'allowed',
      requiredAction: 'none',
      redirectUrl: '/phone-numbers/connect',
      message: '',
      currentPlan: billing.plan_name,
      billingStatus: billing.status,
      workspaceId,
    };
  }

  if (BLOCKED_STATUSES.has(billing.status)) {
    return {
      allowed: false,
      isLoading: false,
      reason: 'subscription_blocked',
      requiredAction: 'resolve_billing',
      redirectUrl: billingRedirect,
      message: 'Your subscription needs attention before connecting WhatsApp API.',
      currentPlan: billing.plan_name,
      billingStatus: billing.status,
      workspaceId,
    };
  }

  // Default conservative deny
  return {
    allowed: false,
    isLoading: false,
    reason: 'subscription_blocked',
    requiredAction: 'resolve_billing',
    redirectUrl: billingRedirect,
    message: 'Billing status unknown — please review your plan.',
    currentPlan: billing.plan_name,
    billingStatus: billing.status,
    workspaceId,
  };
}

export function useWhatsAppConnectionAccess(workspaceIdOverride?: string): WhatsAppAccessResult {
  const { currentTenant } = useTenant();
  const workspaceId = workspaceIdOverride ?? currentTenant?.id ?? null;
  const { data: billing, isLoading } = useWorkspaceBilling(workspaceId ?? undefined);

  return useMemo(
    () => evaluateWhatsAppAccess(workspaceId, billing, isLoading),
    [workspaceId, billing, isLoading],
  );
}
