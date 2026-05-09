import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProgress {
  loading: boolean;
  planSelected: boolean;
  whatsappConnected: boolean;
  profileCompleted: boolean;
  planName: string | null;
  /** First connected phone number id — used to deep-link to WA Profile tab */
  primaryPhoneId: string | null;
  /** 1, 2, 3, or 'done' */
  currentStep: 1 | 2 | 3 | 'done';
  refresh: () => Promise<void>;
  markProfileCompleted: () => void;
  markPlanSelected: (planName: string) => void;
}

const lsKey = (tenantId: string, k: string) => `aireatro:onboarding:${tenantId}:${k}`;

export function useOnboardingProgress(tenantId: string | null | undefined): OnboardingProgress {
  const [loading, setLoading] = useState(true);
  const [planSelected, setPlanSelected] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
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

      const [{ data: ent }, { data: sub }, { data: phones }] = await Promise.all([
        supabase.from('workspace_entitlements').select('plan').eq('workspace_id', tenantId).maybeSingle(),
        supabase.from('subscriptions').select('plan_id').eq('tenant_id', tenantId).in('status', ['active', 'trialing']).maybeSingle(),
        supabase.from('phone_numbers').select('id,status').eq('tenant_id', tenantId).order('is_default', { ascending: false }),
      ]);

      const detectedPlan = (ent as any)?.plan || (sub as any)?.plan_id?.replace('plan_', '') || (lsPlan ? lsPlanName : null);
      const hasPlan = !!detectedPlan;
      setPlanSelected(hasPlan);
      setPlanName(detectedPlan ? detectedPlan.charAt(0).toUpperCase() + detectedPlan.slice(1) : null);

      const phoneList = (phones as any[]) || [];
      // Workspace is "WhatsApp connected" when at least one phone row exists and is not in
      // a disconnected/banned state (any of: pending, connected — Meta sometimes leaves it pending).
      const validPhones = phoneList.filter((p) => !['disconnected', 'banned'].includes(p.status));
      setWhatsappConnected(validPhones.length > 0);
      const preferred = validPhones.find((p) => p.status === 'connected') || validPhones[0] || null;
      setPrimaryPhoneId(preferred?.id || null);

      const lsProfile = localStorage.getItem(lsKey(tenantId, 'profileCompleted'));
      setProfileCompleted(lsProfile === '1');
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
    window.addEventListener('aireatro:wa-profile-saved', handler as EventListener);
    return () => window.removeEventListener('aireatro:wa-profile-saved', handler as EventListener);
  }, [tenantId]);

  const markProfileCompleted = useCallback(() => {
    if (!tenantId) return;
    localStorage.setItem(lsKey(tenantId, 'profileCompleted'), '1');
    setProfileCompleted(true);
  }, [tenantId]);

  const markPlanSelected = useCallback((name: string) => {
    if (!tenantId) return;
    localStorage.setItem(lsKey(tenantId, 'planSelected'), '1');
    localStorage.setItem(lsKey(tenantId, 'planName'), name.toLowerCase());
    setPlanSelected(true);
    setPlanName(name.charAt(0).toUpperCase() + name.slice(1));
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
    primaryPhoneId,
    currentStep,
    refresh: load,
    markProfileCompleted,
    markPlanSelected,
  };
}
