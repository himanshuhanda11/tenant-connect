import { useEntitlements } from '@/hooks/useEntitlements';
import { useTeamMembers } from '@/hooks/useTeam';

/**
 * Plan hierarchy: free → basic → pro → business
 * Returns gating info for each feature based on current plan.
 */

const PLAN_ORDER = ['free', 'basic', 'pro', 'business'] as const;
type PlanId = (typeof PLAN_ORDER)[number];

const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  business: 'Business',
};

/** Which plan is needed to unlock a feature */
const FEATURE_MIN_PLAN: Record<string, PlanId> = {
  team_members: 'free',        // free allows 1, but inviting more needs basic+
  automations: 'basic',
  flows: 'basic',
  autoforms: 'basic',
  ai_basic: 'basic',
  ai_full: 'pro',
  ai_enterprise: 'business',
  integrations: 'pro',
  ads_manager: 'pro',
  audit_logs: 'business',
  custom_roles: 'business',
};

/** Plan limits for team members */
const TEAM_LIMITS: Record<PlanId, number> = {
  free: 1,
  basic: 5,
  pro: 10,
  business: 25,
};

function planIndex(plan: string): number {
  const idx = PLAN_ORDER.indexOf(plan as PlanId);
  return idx >= 0 ? idx : 0;
}

export function getNextPlan(currentPlan: string): PlanId | null {
  const idx = planIndex(currentPlan);
  return idx < PLAN_ORDER.length - 1 ? PLAN_ORDER[idx + 1] : null;
}

export function getRequiredPlan(featureKey: string): PlanId {
  return FEATURE_MIN_PLAN[featureKey] ?? 'basic';
}

export function getUpgradePlanFor(currentPlan: string, featureKey: string): PlanId | null {
  const required = getRequiredPlan(featureKey);
  if (planIndex(currentPlan) >= planIndex(required)) return null; // already has access
  return required;
}

export function isFeatureAvailable(currentPlan: string, featureKey: string): boolean {
  return planIndex(currentPlan) >= planIndex(FEATURE_MIN_PLAN[featureKey] ?? 'basic');
}

export function getTeamMemberLimit(currentPlan: string): number {
  return TEAM_LIMITS[(currentPlan as PlanId)] ?? 1;
}

export function getPlanLabel(plan: string): string {
  return PLAN_LABELS[plan as PlanId] ?? plan;
}

export interface PlanGateResult {
  currentPlan: PlanId;
  /** Can invite more team members */
  canInviteMembers: boolean;
  /** Max team members allowed */
  teamMemberLimit: number;
  /** Current team member count */
  teamMemberCount: number;
  /** Check if a specific feature is available */
  hasFeature: (featureKey: string) => boolean;
  /** Get the plan needed to unlock a feature (null if already available) */
  requiredPlanFor: (featureKey: string) => PlanId | null;
  /** Get next plan in hierarchy */
  nextPlan: PlanId | null;
  /** Human-readable plan label */
  planLabel: string;
  /** Loading state */
  loading: boolean;
}

export function usePlanGate(): PlanGateResult {
  const { data: entitlements, isLoading } = useEntitlements();
  const { members } = useTeamMembers();

  const currentPlan = (entitlements?.plan_id ?? 'free') as PlanId;
  const teamLimit = getTeamMemberLimit(currentPlan);
  const teamCount = members.length;

  // Enhanced feature check: also consider entitlements features list from DB
  const hasFeatureCheck = (key: string) => {
    // First check if the plan tier itself unlocks the feature
    if (isFeatureAvailable(currentPlan, key)) return true;
    // Also check if the entitlement explicitly enables the feature
    if (entitlements?.features?.includes(key)) return true;
    return false;
  };

  // Block invites while loading to prevent bypassing limits
  const canInvite = isLoading ? false : teamCount < teamLimit;

  return {
    currentPlan,
    canInviteMembers: canInvite,
    teamMemberLimit: teamLimit,
    teamMemberCount: teamCount,
    hasFeature: hasFeatureCheck,
    requiredPlanFor: (key: string) => {
      if (hasFeatureCheck(key)) return null;
      return getUpgradePlanFor(currentPlan, key);
    },
    nextPlan: getNextPlan(currentPlan),
    planLabel: getPlanLabel(currentPlan),
    loading: isLoading,
  };
}
