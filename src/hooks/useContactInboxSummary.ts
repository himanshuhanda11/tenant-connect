import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface ContactInboxSummary {
  tenant_id: string;
  contact_id: string;
  phone_number_id: string;
  assigned_to: string | null;
  assigned_at: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  last_replied_by: string | null;
  last_replied_at: string | null;
  last_message_at: string | null;
  open_conversation_id: string | null;
  is_unreplied: boolean;
  lead_state: string;
  updated_at: string;
  // joined
  assigned_agent?: { id: string; full_name: string | null; email: string } | null;
  claiming_agent?: { id: string; full_name: string | null; email: string } | null;
  replying_agent?: { id: string; full_name: string | null; email: string } | null;
}

export function useContactInboxSummary(contactIds: string[]) {
  const { currentTenant } = useTenant();
  const [summaries, setSummaries] = useState<Record<string, ContactInboxSummary>>({});
  const [loading, setLoading] = useState(false);

  const fetchSummaries = useCallback(async () => {
    if (!currentTenant?.id || contactIds.length === 0) {
      setSummaries({});
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('contact_inbox_summary')
        .select(`
          *,
          assigned_agent:profiles!contact_inbox_summary_assigned_to_fkey(id, full_name, email),
          claiming_agent:profiles!contact_inbox_summary_claimed_by_fkey(id, full_name, email),
          replying_agent:profiles!contact_inbox_summary_last_replied_by_fkey(id, full_name, email)
        `)
        .eq('tenant_id', currentTenant.id)
        .in('contact_id', contactIds);

      if (error) throw error;

      const map: Record<string, ContactInboxSummary> = {};
      (data || []).forEach((row: ContactInboxSummary) => {
        map[row.contact_id] = row;
      });
      setSummaries(map);
    } catch (error) {
      console.error('Error fetching inbox summaries:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, contactIds.join(',')]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  // Realtime subscription
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('contact_inbox_summary_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_inbox_summary',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => fetchSummaries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, fetchSummaries]);

  return { summaries, loading };
}
