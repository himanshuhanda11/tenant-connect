import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useQueryClient } from '@tanstack/react-query';
import type { AvailabilityStatus } from '@/lib/availability';

export interface AgentAvailabilityState {
  agentId: string | null;
  status: AvailabilityStatus;
  pauseUntil: string | null;
  pausedAt: string | null;
  reason: string | null;
  customReason: string | null;
  role: string | null;
  loading: boolean;
}

interface PauseArgs {
  durationMinutes: number;
  reason?: string | null;
  customReason?: string | null;
  agentUserId?: string;
  force?: boolean;
}

export function useAgentAvailability() {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const qc = useQueryClient();
  const [state, setState] = useState<AgentAvailabilityState>({
    agentId: null,
    status: 'available',
    pauseUntil: null,
    pausedAt: null,
    reason: null,
    customReason: null,
    role: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    if (!user || !currentTenant) return;
    const { data } = await supabase
      .from('agents')
      .select('id, availability_status, pause_until, paused_at, pause_reason, pause_custom_reason, role')
      .eq('user_id', user.id)
      .eq('tenant_id', currentTenant.id)
      .maybeSingle();
    if (!data) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    setState({
      agentId: data.id,
      status: (data.availability_status as AvailabilityStatus) || 'available',
      pauseUntil: data.pause_until,
      pausedAt: data.paused_at,
      reason: data.pause_reason,
      customReason: data.pause_custom_reason,
      role: (data as any).role || null,
      loading: false,
    });
  }, [user, currentTenant]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime subscription on own agent row
  useEffect(() => {
    if (!user || !currentTenant) return;
    const channel = supabase
      .channel(`agent-availability-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'agents', filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const row = payload.new;
          if (!row || row.tenant_id !== currentTenant.id) return;
          setState((prev) => ({
            agentId: row.id,
            status: (row.availability_status as AvailabilityStatus) || 'available',
            pauseUntil: row.pause_until,
            pausedAt: row.paused_at,
            reason: row.pause_reason,
            customReason: row.pause_custom_reason,
            role: row.role ?? prev.role,
            loading: false,
          }));
          qc.invalidateQueries({ queryKey: ['team-availability', currentTenant.id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentTenant, qc]);

  // Auto-flip to available when pause_until elapses (UI optimism; backend cron is source of truth)
  useEffect(() => {
    if (state.status !== 'paused' || !state.pauseUntil) return;
    const ms = new Date(state.pauseUntil).getTime() - Date.now();
    if (ms <= 0) {
      refresh();
      return;
    }
    const t = setTimeout(() => refresh(), Math.min(ms + 1000, 2_147_000_000));
    return () => clearTimeout(t);
  }, [state.status, state.pauseUntil, refresh]);

  // Refresh on tab focus / reconnect
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('online', refresh);
    };
  }, [refresh]);

  const pause = useCallback(async (args: PauseArgs) => {
    const { data, error } = await supabase.functions.invoke('agent-availability', {
      body: {
        action: 'pause',
        duration_minutes: args.durationMinutes,
        reason: args.reason,
        custom_reason: args.customReason,
        agent_user_id: args.agentUserId,
        force: args.force,
      },
    });
    if (error) {
      // supabase-js wraps non-2xx into FunctionsHttpError; try to read context body
      const ctx: any = (error as any).context;
      try {
        const body = ctx ? await ctx.json() : null;
        return { ok: false, error: body?.error || error.message, data: body };
      } catch {
        return { ok: false, error: error.message };
      }
    }
    await refresh();
    qc.invalidateQueries({ queryKey: ['team-availability'] });
    return { ok: true, data };
  }, [refresh, qc]);

  const resume = useCallback(async (agentUserId?: string) => {
    const { data, error } = await supabase.functions.invoke('agent-availability', {
      body: { action: 'resume', agent_user_id: agentUserId },
    });
    if (error) return { ok: false, error: error.message };
    await refresh();
    qc.invalidateQueries({ queryKey: ['team-availability'] });
    return { ok: true, data };
  }, [refresh, qc]);

  return { ...state, refresh, pause, resume };
}
