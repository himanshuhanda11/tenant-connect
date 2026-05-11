import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LaunchOffer {
  user_id: string;
  offer_started_at: string;
  offer_expires_at: string;
  offer_claimed: boolean;
  claimed_plan_id: string | null;
  claimed_at: string | null;
}

export function useLaunchOffer() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [now, setNow] = useState(() => Date.now());

  const offerQuery = useQuery({
    queryKey: ['launch-offer', user?.id],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async (): Promise<LaunchOffer | null> => {
      const { data, error } = await supabase
        .from('user_offers')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as LaunchOffer | null) ?? null;
    },
  });

  const offer = offerQuery.data;
  // Active for guests (no user) AND for logged-in users until they claim a plan.
  // Guests see the offer everywhere on the marketing site and the dialog
  // redirects them to /signup when they pick a plan.
  const isActive = user ? !!offer && !offer.offer_claimed : true;

  // Rolling 24-hour display countdown — purely visual urgency.
  // For logged-in users it anchors to their `offer_started_at`.
  // For guests it anchors to the current UTC day so everyone sees the same
  // ticking countdown that resets every 24 hours.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const guestAnchor = Math.floor(now / DAY_MS) * DAY_MS;
  const startedAt = offer ? new Date(offer.offer_started_at).getTime() : guestAnchor;
  const elapsedInCycle = ((now - startedAt) % DAY_MS + DAY_MS) % DAY_MS;
  const secondsLeft = isActive ? Math.max(0, Math.floor((DAY_MS - elapsedInCycle) / 1000)) : 0;

  // 1s ticker while the offer is active
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const claim = useMutation({
    mutationFn: async (input: string | { planId: string; workspaceId?: string | null }) => {
      const planId = typeof input === 'string' ? input : input.planId;
      const workspaceId = typeof input === 'string' ? null : (input.workspaceId ?? null);
      const args: any = workspaceId
        ? { _plan_id: planId, _workspace_id: workspaceId }
        : { _plan_id: planId };
      const { data, error } = await supabase.rpc('claim_launch_offer', args);
      if (error) throw error;
      if ((data as any)?.ok === false) {
        const reason = (data as any)?.reason ?? (data as any)?.error ?? 'Could not activate offer';
        const message = (data as any)?.message ?? reason;
        const err: any = new Error(message);
        err.reason = reason;
        err.planId = (data as any)?.plan_id ?? planId;
        err.workspaceId = (data as any)?.workspace_id ?? workspaceId ?? null;
        throw err;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['launch-offer'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['entitlements'] });
    },
  });

  return {
    offer,
    isLoading: offerQuery.isLoading,
    isActive,
    secondsLeft,
    claim: claim.mutateAsync,
    isClaiming: claim.isPending,
    refetch: offerQuery.refetch,
  };
}

export function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return {
    h,
    m,
    s: sec,
    text: `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`,
    isCritical: totalSeconds < 3 * 3600,
  };
}

/**
 * Server-authoritative check: can the current user still claim a free
 * paid trial? Returns false once they've used it on any workspace.
 */
export function useTrialEligibility() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['trial-eligible', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc('is_trial_eligible' as any);
      if (error) return false;
      return Boolean(data);
    },
  });
}

export function useTodayClaimCount() {
  return useQuery({
    queryKey: ['offer-claims-today'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_offer_claim_count_today');
      if (error) return 0;
      return Number(data ?? 0);
    },
  });
}
