import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  agent_email: string;
  avatar_url: string | null;
  is_online: boolean;
  last_login_at: string | null;
  total_sessions: number;
  total_hours_worked: number;
  avg_daily_hours: number;
  chats_opened: number;
  chats_replied: number;
  chats_assigned: number;
  leads_clicked: number;
  conversations_claimed: number;
  conversations_converted: number;
  current_open_chats: number;
  avg_response_minutes: number;
}

export function useAgentPerformance(days: number = 7) {
  const { currentTenant } = useTenant();
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevDaysRef = useRef(days);

  const fetchPerformance = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('agent_performance_stats', {
        p_tenant_id: currentTenant.id,
        p_days: days,
      });

      if (rpcError) {
        console.error('[AgentPerformance] RPC error:', rpcError);
        setError(rpcError.message);
        setAgents([]);
      } else {
        setAgents((data as AgentPerformance[]) || []);
      }
    } catch (err) {
      console.error('[AgentPerformance] Fetch error:', err);
      setError('Failed to load performance data');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, days]);

  // Re-fetch whenever tenant or days changes
  useEffect(() => {
    fetchPerformance();
    prevDaysRef.current = days;
  }, [fetchPerformance]);

  return { agents, loading, error, refetch: fetchPerformance };
}

// Track agent session on login
export function useAgentSessionTracker() {
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (!currentTenant?.id) return;

    // Only record login once per tenant per browser session
    const sessionKey = `agent_session_${currentTenant.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, 'active');
    supabase.rpc('record_agent_login', { p_tenant_id: currentTenant.id }).then(({ error }) => {
      if (error) {
        console.warn('Failed to record login:', error.message);
        sessionStorage.removeItem(sessionKey);
      }
    });

    const handleUnload = () => {
      sessionStorage.removeItem(sessionKey);
      supabase.rpc('record_agent_logout', { p_tenant_id: currentTenant.id });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [currentTenant?.id]);
}
