import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

export interface CrmContact {
  tenant_id: string;
  phone_number_id: string;
  contact_id: string;
  open_conversation_id: string | null;

  lead_state: string;
  is_unreplied: boolean;
  last_message_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;

  assigned_to: string | null;
  assigned_at: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  last_replied_by: string | null;
  last_replied_at: string | null;

  contact_name: string | null;
  wa_id: string;
  first_name: string | null;
  profile_picture_url: string | null;

  tags: { id: string; name: string; color: string | null }[];
  attributes: Record<string, string>;
}

export interface CrmSearchFilters {
  search: string;
  phoneNumberId?: string;
  leadStates: string[];
  isUnreplied?: boolean;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  claimedBy?: string;
  lastRepliedBy?: string;
  tagIds: string[];
  tagMatchAll: boolean;
  attributes: { key: string; value: string }[];
}

export const DEFAULT_CRM_FILTERS: CrmSearchFilters = {
  search: '',
  leadStates: [],
  tagIds: [],
  tagMatchAll: false,
  attributes: [],
};

export function useContactsCrmSearch() {
  const { currentTenant } = useTenant();
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CrmSearchFilters>(DEFAULT_CRM_FILTERS);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const fetchContacts = useCallback(async () => {
    if (!currentTenant?.id) return;

    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        p_tenant_id: currentTenant.id,
        p_limit: pageSize,
        p_offset: page * pageSize,
      };

      if (filters.phoneNumberId) params.p_phone_number_id = filters.phoneNumberId;
      if (filters.leadStates.length > 0) params.p_lead_states = filters.leadStates;
      if (filters.isUnreplied !== undefined) params.p_is_unreplied = filters.isUnreplied;
      if (filters.dateFrom) params.p_date_from = filters.dateFrom;
      if (filters.dateTo) params.p_date_to = filters.dateTo;
      if (filters.assignedTo) params.p_assigned_to = filters.assignedTo;
      if (filters.claimedBy) params.p_claimed_by = filters.claimedBy;
      if (filters.lastRepliedBy) params.p_last_replied_by = filters.lastRepliedBy;
      if (filters.search?.trim()) params.p_search = filters.search.trim();
      if (filters.tagIds.length > 0) {
        params.p_tag_ids = filters.tagIds;
        params.p_tag_match_all = filters.tagMatchAll;
      }
      if (filters.attributes.length > 0) {
        const validAttrs = filters.attributes.filter(a => a.key);
        if (validAttrs.length > 0) params.p_attributes = JSON.stringify(validAttrs);
      }

      const { data, error } = await (supabase as any).rpc('contacts_crm_search', params);

      if (error) throw error;

      // Parse tags/attributes from jsonb
      const parsed: CrmContact[] = (data || []).map((row: any) => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
        attributes: typeof row.attributes === 'string' ? JSON.parse(row.attributes) : (row.attributes || {}),
      }));

      setContacts(parsed);
    } catch (error) {
      console.error('Error in contacts_crm_search:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, filters, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Realtime subscription for inbox summary changes
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('crm_search_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_inbox_summary',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => fetchContacts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, fetchContacts]);

  const resetFilters = () => {
    setFilters(DEFAULT_CRM_FILTERS);
    setPage(0);
  };

  return {
    contacts,
    loading,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    fetchContacts,
    resetFilters,
  };
}
