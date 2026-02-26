import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export type CRMStatus = 
  | 'new' | 'assigned' | 'contacted' | 'follow_up_required' 
  | 'call_scheduled' | 'documents_pending' | 'qualified' 
  | 'converted' | 'not_interested' | 'junk';

export const CRM_STATUS_CONFIG: Record<CRMStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', dotColor: 'bg-blue-500' },
  assigned: { label: 'Assigned', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', dotColor: 'bg-indigo-500' },
  contacted: { label: 'Contacted', color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200', dotColor: 'bg-cyan-500' },
  follow_up_required: { label: 'Follow-up Required', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', dotColor: 'bg-amber-500' },
  call_scheduled: { label: 'Call Scheduled', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', dotColor: 'bg-purple-500' },
  documents_pending: { label: 'Documents Pending', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', dotColor: 'bg-orange-500' },
  qualified: { label: 'Qualified', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', dotColor: 'bg-emerald-500' },
  converted: { label: 'Converted', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', dotColor: 'bg-green-500' },
  not_interested: { label: 'Not Interested', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200', dotColor: 'bg-slate-400' },
  junk: { label: 'Junk', color: 'text-gray-500', bgColor: 'bg-gray-100 border-gray-300', dotColor: 'bg-gray-400' },
};

export const JUNK_REASONS = [
  { value: 'fake_number', label: 'Fake Number' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'wrong_inquiry', label: 'Wrong Inquiry' },
];

export type InboxCRMView = 'dashboard' | 'all' | 'mine' | 'new_today' | 'followup_today' | 'overdue' | 'converted' | 'junk';

export interface DashboardStats {
  new_today: number;
  followup_today: number;
  overdue: number;
  converted_month: number;
  total_open: number;
  unassigned: number;
}

export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  assigned_count: number;
  converted_count: number;
  pending_count: number;
  overdue_count: number;
}

export function useInboxCRMStats() {
  const { currentTenant } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentTenant?.id) return;
    setLoading(true);
    try {
      const [statsRes, perfRes] = await Promise.all([
        supabase.rpc('inbox_crm_dashboard_stats', { p_tenant_id: currentTenant.id }),
        supabase.rpc('inbox_agent_performance', { p_tenant_id: currentTenant.id }),
      ]);
      if (statsRes.data) setStats(statsRes.data as unknown as DashboardStats);
      if (perfRes.data) setAgentPerformance(perfRes.data as unknown as AgentPerformance[]);
    } catch (err) {
      console.error('Failed to fetch CRM stats:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, agentPerformance, loading, refetch: fetchStats };
}

export function useUpdateCRMStatus() {
  const { currentTenant } = useTenant();

  const updateStatus = useCallback(async (
    conversationId: string,
    newStatus: CRMStatus,
    options?: { junkReason?: string; followupAt?: string; followupNotes?: string }
  ) => {
    if (!currentTenant?.id) return false;
    try {
      const { data, error } = await supabase.rpc('update_crm_status', {
        p_tenant_id: currentTenant.id,
        p_conversation_id: conversationId,
        p_new_status: newStatus,
        p_junk_reason: options?.junkReason || null,
        p_followup_at: options?.followupAt || null,
        p_followup_notes: options?.followupNotes || null,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.ok === false) {
        toast.error('Failed to update status');
        return false;
      }
      toast.success(`Status updated to ${CRM_STATUS_CONFIG[newStatus].label}`);
      window.dispatchEvent(new CustomEvent('inbox-update'));
      return true;
    } catch (err) {
      toast.error('Failed to update status');
      return false;
    }
  }, [currentTenant?.id]);

  return { updateStatus };
}

export function useInboxActivityLogs(conversationId: string | null) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) { setLogs([]); return; }
    setLoading(true);
    supabase
      .from('inbox_activity_logs')
      .select('*, actor:profiles!inbox_activity_logs_actor_id_fkey(id, full_name)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, [conversationId]);

  return { logs, loading };
}
