import { useState, useEffect, useCallback } from 'react';
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

  const fetchPerformance = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('agent_performance_stats', {
      p_tenant_id: currentTenant.id,
      p_days: days,
    });

    if (!error && data) {
      setAgents(data as AgentPerformance[]);
    }
    setLoading(false);
  }, [currentTenant?.id, days]);

  useEffect(() => { fetchPerformance(); }, [fetchPerformance]);

  return { agents, loading, refetch: fetchPerformance };
}

// Track agent session on login
export function useAgentSessionTracker() {
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (!currentTenant?.id) return;

    // Record login
    supabase.rpc('record_agent_login', { p_tenant_id: currentTenant.id }).then(({ error }) => {
      if (error) console.warn('Failed to record login:', error.message);
    });

    // Record logout on page unload
    const handleUnload = () => {
      supabase.rpc('record_agent_logout', { p_tenant_id: currentTenant.id });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [currentTenant?.id]);
}
