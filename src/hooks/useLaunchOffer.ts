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
  // Active until user claims (i.e. picks any plan). Backend keeps the row alive.
  const isActive = !!offer && !offer.offer_claimed;

  // Rolling 24-hour display countdown — purely visual urgency.
  // Anchored to `offer_started_at` so it ticks down from 24:00:00 → 00:00:00,
  // then automatically restarts at 24:00:00 — repeating every day until the
  // user claims a plan.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const startedAt = offer ? new Date(offer.offer_started_at).getTime() : now;
  const elapsedInCycle = ((now - startedAt) % DAY_MS + DAY_MS) % DAY_MS;
  const secondsLeft = offer ? Math.max(0, Math.floor((DAY_MS - elapsedInCycle) / 1000)) : 0;

  // 1s ticker while the offer is active
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const claim = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('claim-launch-offer', {
        body: { plan_id: planId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
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
