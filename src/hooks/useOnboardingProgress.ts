import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProgress {
  loading: boolean;
  planSelected: boolean;
  whatsappConnected: boolean;
  profileCompleted: boolean;
  planName: string | null;
  planSelectionDismissed: boolean;
  /** First connected phone number id — used to deep-link to WA Profile tab */
  primaryPhoneId: string | null;
  /** 1, 2, 3, or 'done' */
  currentStep: 1 | 2 | 3 | 'done';
  refresh: () => Promise<void>;
  markProfileCompleted: () => void;
  markPlanSelected: (planName: string) => void;
  dismissPlanSelection: () => Promise<void>;
  reopenPlanSelection: () => void;
}

const lsKey = (tenantId: string, k: string) => `aireatro:onboarding:${tenantId}:${k}`;

export function useOnboardingProgress(tenantId: string | null | undefined): OnboardingProgress {
  const [loading, setLoading] = useState(true);
  const [planSelected, setPlanSelected] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [planSelectionDismissed, setPlanSelectionDismissed] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [primaryPhoneId, setPrimaryPhoneId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const lsPlan = localStorage.getItem(lsKey(tenantId, 'planSelected'));
      const lsPlanName = localStorage.getItem(lsKey(tenantId, 'planName'));
      const lsPlanDismissed = localStorage.getItem(lsKey(tenantId, 'planDismissed')) === '1';
      setPlanSelectionDismissed(lsPlanDismissed);

      const [{ data: ent }, { data: sub }, { data: phones }, { data: tenantRow }] = await Promise.all([
        supabase.from('workspace_entitlements').select('plan,status').eq('workspace_id', tenantId).maybeSingle(),
        supabase.from('subscriptions').select('plan_id,status,stripe_subscription_id,plan_source').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('phone_numbers').select('id,status').eq('tenant_id', tenantId).order('is_default', { ascending: false }),
        supabase.from('tenants').select('whatsapp_profile_completed' as any).eq('id', tenantId).maybeSingle(),
      ]);

      const phoneList = (phones as any[]) || [];
      const validPhones = phoneList.filter((p) => !['disconnected', 'banned'].includes(p.status));
      const hasConnectedPhone = validPhones.some((p) => p.status === 'connected');
      setWhatsappConnected(validPhones.length > 0);
      const preferred = validPhones.find((p) => p.status === 'connected') || validPhones[0] || null;
      setPrimaryPhoneId(preferred?.id || null);

      const storedPlan = lsPlan === '1' ? lsPlanName : null;
      // Ignore subscriptions stuck in pre-checkout / failed states — those mean the user
      // started checkout but never completed payment, so the plan is NOT actually selected.
      // Manually-assigned plans (plan_source = 'manual_admin') always count as selected.
      const PENDING_STATUSES = new Set(['incomplete', 'incomplete_expired', 'canceled', 'cancelled']);
      const subStatus = (sub as any)?.status as string | undefined;
      const subPlanSource = (sub as any)?.plan_source as string | undefined;
      const isManualAdminPlan = subPlanSource === 'manual_admin' && subStatus === 'active';
      const normalizedSubPlan = (sub as any)?.plan_id?.replace('plan_', '') || null;
      const rawSubscriptionPlan = subStatus && !PENDING_STATUSES.has(subStatus)
        && (isManualAdminPlan || normalizedSubPlan === 'free' || !!(sub as any)?.stripe_subscription_id)
        ? normalizedSubPlan
        : null;
      const subscriptionPlan = rawSubscriptionPlan || null;
      const entitlementPlan = (ent as any)?.plan && (ent as any).plan !== 'free' ? (ent as any).plan : null;
      const explicitPlan = storedPlan === 'free' || storedPlan === subscriptionPlan || storedPlan === entitlementPlan ? storedPlan : null;
      const detectedPlan = explicitPlan || subscriptionPlan || entitlementPlan;
      // Failsafe: if user already connected WhatsApp, plan choice is implicit (they passed step 1).
      const hasPlan = !!detectedPlan || hasConnectedPhone;
      setPlanSelected(hasPlan);
      setPlanName(detectedPlan ? detectedPlan.charAt(0).toUpperCase() + detectedPlan.slice(1) : (hasConnectedPhone ? 'Free' : null));

      // Source of truth: tenants.whatsapp_profile_completed (auto-set by DB trigger on phone connect).
      // Failsafe: any connected phone implies the WA profile exists on Meta's side.
      const dbProfileDone = !!(tenantRow as any)?.whatsapp_profile_completed;
      const lsProfile = localStorage.getItem(lsKey(tenantId, 'profileCompleted'));
      setProfileCompleted(dbProfileDone || hasConnectedPhone || lsProfile === '1');
    } catch (e) {
      console.error('[useOnboardingProgress] failed:', e);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  // Listen for profile-saved events from PhoneNumberDetails (same tab)
  useEffect(() => {
    if (!tenantId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { tenantId?: string } | undefined;
      if (!detail?.tenantId || detail.tenantId === tenantId) {
        setProfileCompleted(true);
      }
    };
    const refreshHandler = () => { load(); };
    window.addEventListener('aireatro:wa-profile-saved', handler as EventListener);
    window.addEventListener('aireatro:wa-connected', refreshHandler as EventListener);
    window.addEventListener('aireatro:onboarding-refresh', refreshHandler as EventListener);
    return () => {
      window.removeEventListener('aireatro:wa-profile-saved', handler as EventListener);
      window.removeEventListener('aireatro:wa-connected', refreshHandler as EventListener);
      window.removeEventListener('aireatro:onboarding-refresh', refreshHandler as EventListener);
    };
  }, [tenantId, load]);

  const markProfileCompleted = useCallback(async () => {
    if (!tenantId) return;
    setProfileCompleted(true);
    try {
      await supabase
        .from('tenants')
        .update({ whatsapp_profile_completed: true, whatsapp_profile_saved_at: new Date().toISOString() } as any)
        .eq('id', tenantId);
    } catch (e) {
      console.warn('[markProfileCompleted] tenants update failed:', e);
    }
  }, [tenantId]);

  const markPlanSelected = useCallback((name: string) => {
    if (!tenantId) return;
    localStorage.removeItem(lsKey(tenantId, 'planDismissed'));
    localStorage.setItem(lsKey(tenantId, 'planSelected'), '1');
    localStorage.setItem(lsKey(tenantId, 'planName'), name.toLowerCase());
    setPlanSelectionDismissed(false);
    setPlanSelected(true);
    setPlanName(name.charAt(0).toUpperCase() + name.slice(1));
  }, [tenantId]);

  const dismissPlanSelection = useCallback(async () => {
    if (!tenantId) return;
    localStorage.setItem(lsKey(tenantId, 'planDismissed'), '1');
    localStorage.removeItem(lsKey(tenantId, 'planSelected'));
    localStorage.removeItem(lsKey(tenantId, 'planName'));
    try {
      await supabase.from('subscriptions').delete().eq('tenant_id', tenantId);
    } catch (e) {
      console.warn('[dismissPlanSelection] subscription delete failed:', e);
    }
    setPlanSelectionDismissed(true);
    setPlanSelected(false);
    setPlanName(null);
  }, [tenantId]);

  const reopenPlanSelection = useCallback(() => {
    if (!tenantId) return;
    localStorage.removeItem(lsKey(tenantId, 'planDismissed'));
    setPlanSelectionDismissed(false);
  }, [tenantId]);

  let currentStep: 1 | 2 | 3 | 'done' = 'done';
  if (!planSelected) currentStep = 1;
  else if (!whatsappConnected) currentStep = 2;
  else if (!profileCompleted) currentStep = 3;

  return {
    loading,
    planSelected,
    whatsappConnected,
    profileCompleted,
    planName,
    planSelectionDismissed,
    primaryPhoneId,
    currentStep,
    refresh: load,
    markProfileCompleted,
    markPlanSelected,
    dismissPlanSelection,
    reopenPlanSelection,
  };
}
