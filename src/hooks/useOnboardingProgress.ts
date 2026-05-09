import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingProgress {
  loading: boolean;
  planSelected: boolean;
  whatsappConnected: boolean;
  profileCompleted: boolean;
  planName: string | null;
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

  const load = useCallback(async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Plan: workspace_entitlements OR active subscription OR localStorage flag
      const lsPlan = localStorage.getItem(lsKey(tenantId, 'planSelected'));
      const lsPlanName = localStorage.getItem(lsKey(tenantId, 'planName'));

      const [{ data: ent }, { data: sub }, { data: phones }] = await Promise.all([
        supabase.from('workspace_entitlements').select('plan').eq('workspace_id', tenantId).maybeSingle(),
        supabase.from('subscriptions').select('plan_id').eq('tenant_id', tenantId).eq('status', 'active').maybeSingle(),
        supabase.from('phone_numbers').select('id').eq('tenant_id', tenantId).limit(1),
      ]);

      const detectedPlan = (ent as any)?.plan || (sub as any)?.plan_id?.replace('plan_', '') || (lsPlan ? lsPlanName : null);
      const hasPlan = !!detectedPlan;
      setPlanSelected(hasPlan);
      setPlanName(detectedPlan ? detectedPlan.charAt(0).toUpperCase() + detectedPlan.slice(1) : null);

      setWhatsappConnected((phones || []).length > 0);

      const lsProfile = localStorage.getItem(lsKey(tenantId, 'profileCompleted'));
      setProfileCompleted(lsProfile === '1');
    } catch (e) {
      console.error('[useOnboardingProgress] failed:', e);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

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
    currentStep,
    refresh: load,
    markProfileCompleted,
    markPlanSelected,
  };
}
