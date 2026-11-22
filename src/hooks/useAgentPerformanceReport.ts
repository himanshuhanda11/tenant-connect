import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfZonedDay } from '@/lib/workspaceTime';

export interface AgentPerformanceRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_online: boolean;
  is_active: boolean;
  new_assigned: number;
  new_by_customer: number;
  new_by_agent: number;
  new_handled: number;
  existing_handled: number;
  total_handled: number;
  agent_replies: number;
  customer_replies: number;
  pending: number;
  avg_first_response_seconds: number | null;
  first_responses: number;
  new_today: number;
  new_yesterday: number;
  new_last_24h: number;
  last_activity: string | null;
}

export interface AgentPerformanceTotals {
  new_total: number;
  new_unassigned: number;
  new_by_customer: number;
  new_by_agent: number;
  new_handled: number;
  existing_handled: number;
  total_handled: number;
  agent_replies: number;
  customer_replies: number;
  pending: number;
  unassigned: number;
  avg_first_response_seconds: number | null;
}

export interface AgentPerformanceReport {
  can_view_all: boolean;
  agent_id: string | null;
  agents: AgentPerformanceRow[];
  totals: AgentPerformanceTotals;
}

export interface AgentPerformanceParams {
  tenantId: string | undefined;
  start: Date;
  end: Date;
  /** true when the range ends "now" and should keep moving forward */
  live: boolean;
  phoneNumberId: string | null;
  agentId: string | null;
  timeZone: string;
}

export const agentPerformanceKey = (p: Omit<AgentPerformanceParams, 'timeZone'> & { timeZone?: string }) =>
  ['agent-performance', p.tenantId, p.live ? 'live' : p.end.toISOString(), p.start.toISOString(), p.phoneNumberId, p.agentId] as const;

export function useAgentPerformanceReport(p: AgentPerformanceParams) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: [...agentPerformanceKey(p), p.timeZone],
    enabled: !!p.tenantId,
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<AgentPerformanceReport> => {
      const now = new Date();
      const end = p.live ? now : p.end;
      const { data, error } = await supabase.rpc('agent_performance_report', {
        p_tenant_id: p.tenantId!,
        p_start: p.start.toISOString(),
        p_end: end.toISOString(),
        p_phone_number_id: p.phoneNumberId ?? undefined,
        p_agent_id: p.agentId ?? undefined,
        p_today_start: startOfZonedDay(now, p.timeZone).toISOString(),
        p_yesterday_start: startOfZonedDay(now, p.timeZone, -1).toISOString(),
      });
      if (error) throw error;
      return data as unknown as AgentPerformanceReport;
    },
  });

  // Live updates: refresh (at most every 5s) when chats or messages change in this workspace.
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!p.tenantId) return;
    const bump = () => {
      if (timer.current) return;
      timer.current = window.setTimeout(() => {
        timer.current = null;
        qc.invalidateQueries({ queryKey: ['agent-performance', p.tenantId] });
        qc.invalidateQueries({ queryKey: ['agent-performance-drilldown', p.tenantId] });
      }, 5000);
    };
    const channel = supabase
      .channel(`agent-perf-${p.tenantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${p.tenantId}` }, bump)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `tenant_id=eq.${p.tenantId}` }, bump)
      .subscribe();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
      supabase.removeChannel(channel);
    };
  }, [p.tenantId, qc]);

  return query;
}

export type DrilldownMetric =
  | 'new_total' | 'new_by_customer' | 'new_by_agent'
  | 'new_handled' | 'existing_handled' | 'total_handled'
  | 'customer_replies' | 'agent_replies' | 'pending' | 'unassigned' | 'first_response';

export interface DrilldownRow {
  conversation_id: string;
  contact_id: string | null;
  contact_name: string | null;
  contact_wa_id: string | null;
  phone_number_id: string | null;
  status: string;
  created_at: string;
  assigned_to: string | null;
  assigned_name: string | null;
  assigned_at: string | null;
  credited_agent_id: string | null;
  credited_agent_name: string | null;
  last_inbound_at: string | null;
  last_message_at: string | null;
  agent_messages: number;
  first_response_seconds: number | null;
}

export function useAgentPerformanceDrilldown(
  p: Omit<AgentPerformanceParams, 'timeZone'> & { metric: DrilldownMetric | null; unassignedOnly?: boolean },
) {
  return useQuery({
    queryKey: ['agent-performance-drilldown', p.tenantId, p.metric, p.start.toISOString(), p.live ? 'live' : p.end.toISOString(), p.phoneNumberId, p.agentId, !!p.unassignedOnly],
    enabled: !!p.tenantId && !!p.metric,
    staleTime: 20_000,
    queryFn: async (): Promise<DrilldownRow[]> => {
      const { data, error } = await supabase.rpc('agent_performance_conversations', {
        p_tenant_id: p.tenantId!,
        p_start: p.start.toISOString(),
        p_end: (p.live ? new Date() : p.end).toISOString(),
        p_metric: p.metric!,
        p_phone_number_id: p.phoneNumberId ?? undefined,
        p_agent_id: p.agentId ?? undefined,
        p_unassigned_only: !!p.unassignedOnly,
        p_limit: 500,
      });
      if (error) throw error;
      return (data ?? []) as DrilldownRow[];
    },
  });
}
