import { useState, useEffect, useCallback, useRef } from 'react';
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

// Module-level TTL cache — keeps /contacts instant on revisit
const CONTACTS_TTL_MS = 30_000;
type ContactsCacheEntry = { contacts: CrmContact[]; totalCount: number; ts: number };
const contactsCache = new Map<string, ContactsCacheEntry>();

export function invalidateContactsCrmCache(tenantId?: string) {
  if (!tenantId) { contactsCache.clear(); return; }
  for (const key of contactsCache.keys()) if (key.startsWith(`${tenantId}:`)) contactsCache.delete(key);
}

function contactsCacheKey(tenantId: string, page: number, filters: CrmSearchFilters) {
  return `${tenantId}:${page}:${JSON.stringify(filters)}`;
}

export function useContactsCrmSearch() {
  const { currentTenant } = useTenant();
  const [filters, setFilters] = useState<CrmSearchFilters>(DEFAULT_CRM_FILTERS);
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const cacheKey = currentTenant?.id ? contactsCacheKey(currentTenant.id, page, filters) : null;
  const cached = cacheKey ? contactsCache.get(cacheKey) : undefined;
  const [contacts, setContacts] = useState<CrmContact[]>(cached?.contacts ?? []);
  const [totalCount, setTotalCount] = useState(cached?.totalCount ?? 0);
  const [loading, setLoading] = useState(!cached);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const totalCountRef = useRef(totalCount);
  totalCountRef.current = totalCount;

  const fetchContacts = useCallback(async (isBackground = false) => {
    if (!currentTenant?.id) return;
    if (inFlightRef.current) return inFlightRef.current;

    const run = (async () => {
      if (!isBackground) setLoading(true);
      try {
      const params: Record<string, unknown> = {
        p_tenant_id: currentTenant.id,
        p_limit: pageSize,
        p_offset: page * pageSize,
      };

      if (filters.phoneNumberId) params.p_phone_number_id = filters.phoneNumberId;
      // leadStates now carry Inbox CRM stages (new, contacted, qualified, ...) — same as Inbox.
      // Sent as p_crm_statuses which filters via conversations.crm_status.
      if (filters.leadStates.length > 0) params.p_crm_statuses = filters.leadStates;
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

      // Fetch contacts and count in parallel.
      // Use 'estimated' count to avoid statement timeouts on large tenants.
      const [dataResult, countResult] = await Promise.all([
        (supabase as any).rpc('contacts_crm_search', params),
        supabase
          .from('contacts')
          .select('id', { count: 'estimated', head: true })
          .eq('tenant_id', currentTenant.id),
      ]);

      if (dataResult.error) throw dataResult.error;

      const parsed: CrmContact[] = (dataResult.data || []).map((row: any) => ({
        ...row,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
        attributes: typeof row.attributes === 'string' ? JSON.parse(row.attributes) : (row.attributes || {}),
      }));

      setContacts(parsed);

      // Prefer the exact/estimated count from the count query; if it failed
      // (e.g. statement timeout), keep the previous known total when possible
      // and only fall back to a derived value when we have nothing.
      let nextTotal: number;
      if (countResult.count !== null && countResult.count !== undefined) {
        // Estimated count can be 0 on fresh stats — if we actually got rows,
        // use a derived lower bound instead so the header doesn't show 0.
        const derivedMin = page * pageSize + parsed.length;
        nextTotal = Math.max(countResult.count, derivedMin);
      } else if (totalCount > 0) {
        nextTotal = totalCount;
      } else {
        nextTotal = parsed.length < pageSize
          ? page * pageSize + parsed.length
          : (page + 2) * pageSize;
      }
      setTotalCount(nextTotal);
      if (cacheKey) contactsCache.set(cacheKey, { contacts: parsed, totalCount: nextTotal, ts: Date.now() });
    } catch (error: any) {
      console.error('Error in contacts_crm_search:', error);
      // Don't spam toast on background refetches or transient DB timeouts —
      // the UI keeps showing cached data in those cases.
      const isTimeout = error?.code === '57014' || /timeout/i.test(error?.message || '');
      if (!isBackground && !isTimeout) toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
    })();
    inFlightRef.current = run;
    try { await run; } finally { inFlightRef.current = null; }
  }, [currentTenant?.id, filters, page, cacheKey]);

  useEffect(() => {
    if (!cacheKey) { fetchContacts(); return; }
    const entry = contactsCache.get(cacheKey);
    if (entry && Date.now() - entry.ts < CONTACTS_TTL_MS) {
      setContacts(entry.contacts);
      setTotalCount(entry.totalCount);
      setLoading(false);
      return;
    }
    fetchContacts(!!entry);
  }, [fetchContacts, cacheKey]);

  // Realtime — debounced background refetch (don't spam network on bursts)
  useEffect(() => {
    if (!currentTenant?.id) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tenantId = currentTenant.id;
    const channel = supabase
      .channel('crm_search_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_inbox_summary', filter: `tenant_id=eq.${tenantId}` },
        () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            invalidateContactsCrmCache(tenantId);
            fetchContacts(true);
          }, 1500);
        }
      )
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
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
    totalCount,
    fetchContacts,
    resetFilters,
  };
}
