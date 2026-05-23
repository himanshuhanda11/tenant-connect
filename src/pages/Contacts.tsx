import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useContactsCrmSearch, CrmSearchFilters, DEFAULT_CRM_FILTERS } from '@/hooks/useContactsCrmSearch';
import { useContacts } from '@/hooks/useContacts';
import { useAttributeKeys } from '@/hooks/useContactAttributes';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types/contact';
import { SmartView, DEFAULT_SMART_VIEWS, Segment, SegmentFilters } from '@/types/segment';
import { ContactsCrmHeader } from '@/components/contacts/ContactsCrmHeader';
import { ContactsAnalyticsCards } from '@/components/contacts/ContactsAnalyticsCards';
import { ContactsQuickFilters, type ContactsViewMode, type ContactsQuickFilter } from '@/components/contacts/ContactsQuickFilters';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { ContactsAdvancedFilters } from '@/components/contacts/ContactsAdvancedFilters';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactsBulkActionsBar } from '@/components/contacts/ContactsBulkActionsBar';
import { CreateSegmentModal } from '@/components/contacts/CreateSegmentModal';
import { AddContactModal } from '@/components/contacts/AddContactModal';

// Lazy-load the heavy detail drawer (~834 lines with nested tabs) — perf optimization
const ContactDetailDrawer = lazy(() =>
  import('@/components/contacts/ContactDetailDrawer').then((m) => ({ default: m.ContactDetailDrawer }))
);

export default function Contacts() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  // CRM search (primary data source)
  const {
    contacts: crmContacts,
    loading: crmLoading,
    filters: crmFilters,
    setFilters: setCrmFilters,
    page: crmPage,
    setPage: setCrmPage,
    pageSize: crmPageSize,
    totalCount: crmTotalCount,
    fetchContacts: fetchCrmContacts,
    resetFilters: resetCrmFilters,
  } = useContactsCrmSearch();

  // Legacy hook for mutations (updateContact, assignAgent, addTag, removeTag)
  const {
    updateContact,
    assignAgent,
    addTag,
    removeTag,
  } = useContacts();

  const attributeKeys = useAttributeKeys();

  const [activeView, setActiveView] = useState<SmartView>(DEFAULT_SMART_VIEWS[0]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string | null }[]>([]);
  const [availableAgents, setAvailableAgents] = useState<{ id: string; full_name: string | null; email: string }[]>([]);
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [contactDetailsMap, setContactDetailsMap] = useState<Record<string, Partial<Contact>>>({});
  const [viewMode, setViewMode] = useState<ContactsViewMode>('table');
  const [quickFilter, setQuickFilter] = useState<ContactsQuickFilter>('all');
  const [sortMode, setSortMode] = useState<string>('recent');
  const [lastSyncAt, setLastSyncAt] = useState<Date>(new Date());

  // Local-only search input (immediate UI) → debounced into crmFilters.search to avoid
  // firing a Supabase query per keystroke. Cleans up timer on unmount.
  const [searchInput, setSearchInput] = useState<string>(crmFilters.search || '');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCrmFilters((prev) => ({ ...prev, search: value }));
      setCrmPage(0);
    }, 300);
  }, [setCrmFilters, setCrmPage]);

  useEffect(() => () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  }, []);


  // Enrich CRM rows with full contact details (country, source, language, opt-in, etc.)
  useEffect(() => {
    if (!currentTenant?.id || crmContacts.length === 0) return;
    const ids = crmContacts.map(c => c.contact_id);
    (async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, country, language, timezone, source, campaign_source, first_message, first_message_time, entry_point, referrer_url, segment, lead_status, priority_level, mau_status, opt_in_status, opt_in_source, opt_in_timestamp, opt_out, notes, last_seen, created_at')
        .eq('tenant_id', currentTenant.id)
        .in('id', ids);
      if (error) { console.error('enrich contacts error', error); return; }
      const map: Record<string, Partial<Contact>> = {};
      (data || []).forEach((c: any) => { map[c.id] = c; });
      setContactDetailsMap(map);
    })();
  }, [crmContacts, currentTenant?.id]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!currentTenant?.id) return;

      const { data: tags } = await supabase
        .from('tags')
        .select('id, name, color')
        .eq('tenant_id', currentTenant.id);
      if (tags) setAvailableTags(tags);

      const { data: members } = await supabase
        .from('tenant_members')
        .select('user_id')
        .eq('tenant_id', currentTenant.id);
      if (members?.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', members.map(m => m.user_id));
        if (profiles) setAvailableAgents(profiles);
      }
    };
    fetchOptions();
  }, [currentTenant?.id]);

  useEffect(() => {
    setViewCounts({ all: crmTotalCount });
  }, [crmTotalCount]);

  // Convert CRM contacts to Contact shape for table/drawer compatibility
  const contactsForTable = useMemo((): Contact[] => {
    return crmContacts.map(crm => {
      const details = contactDetailsMap[crm.contact_id] || {};
      return ({
      id: crm.contact_id,
      tenant_id: crm.tenant_id,
      wa_id: crm.wa_id,
      name: crm.contact_name,
      first_name: crm.first_name,
      profile_picture_url: crm.profile_picture_url,
      // CRM-derived / detail-derived fields (details win)
      lead_status: (details.lead_status as Contact['lead_status']) || 'new',
      priority_level: (details.priority_level as Contact['priority_level']) || 'normal',
      mau_status: (details.mau_status as Contact['mau_status']) || 'active',
      opt_in_status: details.opt_in_status ?? false,
      opt_out: details.opt_out ?? false,
      blocked_by_user: false,
      bot_handled: false,
      intervened: false,
      data_deletion_requested: false,
      closed: crm.lead_state === 'closed',
      created_at: (details.created_at as string) || crm.last_message_at || new Date().toISOString(),
      updated_at: crm.last_message_at || new Date().toISOString(),
      // Detail fields
      country: details.country ?? null,
      language: details.language ?? null,
      timezone: details.timezone ?? null,
      source: details.source ?? null,
      campaign_source: details.campaign_source ?? null,
      first_message: details.first_message ?? null,
      first_message_time: details.first_message_time ?? null,
      entry_point: details.entry_point ?? null,
      referrer_url: details.referrer_url ?? null,
      segment: details.segment ?? null,
      deal_stage: null, closed_reason: null,
      closure_time: null, request_type: null, request_time: null,
      last_active_date: null, whatsapp_quality_rating: null,
      pricing_category: null, automation_flow: null,
      ai_intent_detected: null, sentiment_score: null,
      followup_due: null, sla_timer: null, next_best_action: null,
      opt_in_source: details.opt_in_source ?? null,
      opt_in_timestamp: details.opt_in_timestamp ?? null,
      opt_out_timestamp: null,
      notes: details.notes ?? null,
      assigned_agent_id: crm.assigned_to,
      intervened_at: null, intervened_by: null,
      last_seen: details.last_seen ?? crm.last_message_at,
      // Tags from RPC
      tags: crm.tags?.map(t => ({
        id: t.id,
        tag_id: t.id,
        tag: { id: t.id, name: t.name, color: t.color },
      })) || [],
      });
    });
  }, [crmContacts, contactDetailsMap]);

  // Build inbox summaries map from CRM data (for table columns)
  const inboxSummaries = useMemo(() => {
    const agentMap: Record<string, { id: string; full_name: string | null; email: string }> = {};
    availableAgents.forEach(a => { agentMap[a.id] = a; });

    const map: Record<string, any> = {};
    crmContacts.forEach(crm => {
      map[crm.contact_id] = {
        tenant_id: crm.tenant_id,
        contact_id: crm.contact_id,
        phone_number_id: crm.phone_number_id,
        assigned_to: crm.assigned_to,
        assigned_at: crm.assigned_at,
        claimed_by: crm.claimed_by,
        claimed_at: crm.claimed_at,
        last_inbound_at: crm.last_inbound_at,
        last_outbound_at: crm.last_outbound_at,
        last_replied_by: crm.last_replied_by,
        last_replied_at: crm.last_replied_at,
        last_message_at: crm.last_message_at,
        open_conversation_id: crm.open_conversation_id,
        is_unreplied: crm.is_unreplied,
        lead_state: crm.lead_state,
        updated_at: crm.last_message_at || '',
        // Resolve agent names for table display
        assigned_agent: crm.assigned_to ? agentMap[crm.assigned_to] || { id: crm.assigned_to, full_name: null, email: crm.assigned_to.slice(0, 8) } : null,
        claiming_agent: crm.claimed_by ? agentMap[crm.claimed_by] || { id: crm.claimed_by, full_name: null, email: crm.claimed_by.slice(0, 8) } : null,
        replying_agent: crm.last_replied_by ? agentMap[crm.last_replied_by] || { id: crm.last_replied_by, full_name: null, email: crm.last_replied_by.slice(0, 8) } : null,
      };
    });
    return map;
  }, [crmContacts, availableAgents]);

  // Convert SegmentFilters → CrmSearchFilters
  const handleFiltersChange = (newFilters: SegmentFilters) => {
    const crm: CrmSearchFilters = {
      search: newFilters.search || '',
      leadStates: newFilters.leadState || [],
      isUnreplied: newFilters.isUnreplied === 'yes' ? true : newFilters.isUnreplied === 'no' ? false : undefined,
      dateFrom: newFilters.createdDateFrom,
      dateTo: newFilters.createdDateTo ? newFilters.createdDateTo + 'T23:59:59Z' : undefined,
      assignedTo: newFilters.assignedTo,
      tagIds: newFilters.tags || [],
      tagMatchAll: false,
      attributes: newFilters.attributes || [],
    };
    setCrmFilters(crm);
    setCrmPage(0);
  };

  // Convert CrmSearchFilters back to SegmentFilters for the filter UI
  const currentFilters: SegmentFilters = {
    search: crmFilters.search,
    leadStatus: [],
    priority: [],
    mauStatus: [],
    tags: crmFilters.tagIds,
    optInStatus: 'all',
    hasAgent: 'all',
    intervened: 'all',
    leadState: crmFilters.leadStates,
    assignedTo: crmFilters.assignedTo,
    isUnreplied: crmFilters.isUnreplied === true ? 'yes' : crmFilters.isUnreplied === false ? 'no' : 'all',
    createdDateFrom: crmFilters.dateFrom,
    createdDateTo: crmFilters.dateTo?.replace('T23:59:59Z', ''),
    attributes: crmFilters.attributes,
  };

  const handleViewChange = (view: SmartView) => {
    setActiveView(view);
    resetCrmFilters();
  };

  const handleContactSelect = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  }, []);

  const toggleContactSelection = useCallback((contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedContactIds(prev => {
      const allIds = contactsForTable.map(c => c.id);
      const allSelected = allIds.length > 0 && allIds.every(id => prev.includes(id));
      return allSelected ? [] : allIds;
    });
  }, [contactsForTable]);


  const handleBulkAddTag = async (tagId: string) => {
    for (const id of selectedContactIds) await addTag(id, tagId);
    setSelectedContactIds([]);
    fetchCrmContacts();
    toast.success(`Tag added to ${selectedContactIds.length} contacts`);
  };

  const handleBulkRemoveTag = async (tagId: string) => {
    for (const id of selectedContactIds) await removeTag(id, tagId);
    setSelectedContactIds([]);
    fetchCrmContacts();
    toast.success(`Tag removed from ${selectedContactIds.length} contacts`);
  };

  const handleBulkAssign = async (agentId: string | null) => {
    for (const id of selectedContactIds) await assignAgent(id, agentId);
    setSelectedContactIds([]);
    fetchCrmContacts();
    toast.success(agentId ? `Assigned ${selectedContactIds.length} contacts` : `Unassigned ${selectedContactIds.length} contacts`);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('tenant_id', currentTenant?.id);

      if (error) throw error;

      setDrawerOpen(false);
      setSelectedContact(null);
      fetchCrmContacts();
      toast.success('Contact deleted successfully');
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      if (error?.message?.includes('row-level security')) {
        toast.error('Permission denied: Only owners and admins can delete contacts');
      } else {
        toast.error('Failed to delete contact');
      }
    }
  };

  const handleExport = () => toast.info('Export functionality coming soon');

  const handleMarkOptOut = async () => {
    for (const id of selectedContactIds) {
      await updateContact(id, { opt_out: true, opt_out_timestamp: new Date().toISOString() });
    }
    setSelectedContactIds([]);
    fetchCrmContacts();
    toast.success(`${selectedContactIds.length} contacts marked as opted out`);
  };

  const handleRequestDeletion = async () => {
    for (const id of selectedContactIds) {
      await updateContact(id, { data_deletion_requested: true });
    }
    setSelectedContactIds([]);
    fetchCrmContacts();
    toast.success(`Deletion requested for ${selectedContactIds.length} contacts`);
  };

  const handleSaveSegment = async (name: string, description: string, segmentFilters: SegmentFilters) => {
    toast.success(`Segment "${name}" saved`);
  };

  const totalCount = crmTotalCount;

  // ---- Quick-filter (client-side, applied to current page) ----
  const visibleContacts = useMemo(() => {
    if (quickFilter === 'all') return contactsForTable;
    return contactsForTable.filter((c) => {
      const summary = inboxSummaries[c.id];
      switch (quickFilter) {
        case 'hot':
          return (
            c.priority_level === 'high' ||
            (c.tags || []).some((t: any) => /hot/i.test(t?.tag?.name || ''))
          );
        case 'engaged': {
          const ls = summary?.lead_state as string | undefined;
          return ls === 'engaged' || ls === 'qualified' || ls === 'claimed';
        }
        case 'mine':
          return !!user?.id && summary?.assigned_to === user.id;
        case 'unassigned':
          return !summary?.assigned_to && !summary?.claimed_by;
        default:
          return true;
      }
    });
  }, [contactsForTable, inboxSummaries, quickFilter, user?.id]);

  const quickFilterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: contactsForTable.length };
    let hot = 0, engaged = 0, mine = 0, unassigned = 0;
    contactsForTable.forEach((c) => {
      const s = inboxSummaries[c.id];
      if (c.priority_level === 'high' || (c.tags || []).some((t: any) => /hot/i.test(t?.tag?.name || ''))) hot++;
      const ls = s?.lead_state as string | undefined;
      if (ls === 'engaged' || ls === 'qualified' || ls === 'claimed') engaged++;
      if (user?.id && s?.assigned_to === user.id) mine++;
      if (!s?.assigned_to && !s?.claimed_by) unassigned++;
    });
    counts.hot = hot; counts.engaged = engaged; counts.mine = mine; counts.unassigned = unassigned;
    return counts;
  }, [contactsForTable, inboxSummaries, user?.id]);

  const activeContactsApprox = useMemo(
    () => contactsForTable.filter((c) => c.mau_status === 'active').length,
    [contactsForTable]
  );
  const engagedContactsApprox = quickFilterCounts.engaged || 0;

  const handleRefreshAll = () => {
    setLastSyncAt(new Date());
    fetchCrmContacts();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] relative bg-muted/20">
        {/* Ambient workspace gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_55%)]" />

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">

          <ContactsCrmHeader
            totalCount={totalCount}
            loading={crmLoading}
            lastSyncAt={lastSyncAt}
            onRefresh={handleRefreshAll}
            onExportCsv={handleExport}
            onCreateSegment={() => setShowCreateSegment(true)}
            onAddContact={() => setShowAddContact(true)}
            searchValue={searchInput}
            onSearchChange={handleSearchChange}
          />

          <ContactsAnalyticsCards
            totalContacts={totalCount}
            activeContacts={activeContactsApprox}
            engagedContacts={engagedContactsApprox}
            segmentsCount={segments.length}
            tagsCount={availableTags.length}
          />

          <ContactsQuickFilters
            view={viewMode}
            onViewChange={setViewMode}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            counts={quickFilterCounts as any}
            sort={sortMode}
            onSortChange={setSortMode}
          />

          <div className="px-4 md:px-8">
            <ContactsAdvancedFilters
              filters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onSaveAsSegment={() => setShowCreateSegment(true)}
              onReset={resetCrmFilters}
              availableTags={availableTags}
              availableAgents={availableAgents}
              attributeKeys={attributeKeys}
              sources={['facebook', 'website', 'qr', 'api', 'manual']}
              countries={[]}
            />
          </div>

          <div className="flex-1 overflow-auto px-4 md:px-8 pb-6 pt-4">
            {viewMode === 'kanban' ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center text-sm text-muted-foreground">
                Kanban view is coming in the next step. Use Table or Compact for now.
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                <ContactsTable
                  contacts={visibleContacts}
                  loading={crmLoading}
                  totalCount={quickFilter === 'all' ? totalCount : visibleContacts.length}
                  page={crmPage + 1}
                  pageSize={crmPageSize}
                  onPageChange={(p) => setCrmPage(p - 1)}
                  onSelectContact={handleContactSelect}
                  selectedContactId={selectedContact?.id}
                  selectedContactIds={selectedContactIds}
                  onToggleSelection={toggleContactSelection}
                  onSelectAll={handleSelectAll}
                  inboxSummaries={inboxSummaries}
                />
              </div>
            )}

            <div className="hidden md:block pt-4">
              <QuickGuide {...quickGuides.contacts} />
            </div>
          </div>
        </div>


        {/* Drawer is lazy-loaded; only mount once a contact has actually been opened */}
        {(drawerOpen || selectedContact) && (
          <Suspense fallback={null}>
            <ContactDetailDrawer
              contact={selectedContact}
              open={drawerOpen}
              onClose={() => { setDrawerOpen(false); setSelectedContact(null); }}
              onUpdate={updateContact}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onAssignAgent={assignAgent}
              onDelete={handleDeleteContact}
            />
          </Suspense>
        )}
      </div>

      <ContactsBulkActionsBar
        selectedCount={selectedContactIds.length}
        selectedContactIds={selectedContactIds}
        onClearSelection={() => setSelectedContactIds([])}
        onAddTag={handleBulkAddTag}
        onRemoveTag={handleBulkRemoveTag}
        onAssignAgent={handleBulkAssign}
        onAddToSegment={() => {}}
        onExport={handleExport}
        onMarkOptOut={handleMarkOptOut}
        onRequestDeletion={handleRequestDeletion}
        availableTags={availableTags}
        availableAgents={availableAgents}
        availableSegments={segments}
      />

      <CreateSegmentModal
        open={showCreateSegment}
        onClose={() => setShowCreateSegment(false)}
        onSave={handleSaveSegment}
        filters={currentFilters}
        availableTags={availableTags}
      />

      <AddContactModal
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSuccess={fetchCrmContacts}
      />
    </DashboardLayout>
  );
}
