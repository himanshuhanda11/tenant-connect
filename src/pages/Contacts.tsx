import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useContactsCrmSearch, CrmSearchFilters, DEFAULT_CRM_FILTERS } from '@/hooks/useContactsCrmSearch';
import { useContacts } from '@/hooks/useContacts';
import { useAttributeKeys } from '@/hooks/useContactAttributes';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types/contact';
import { SmartView, DEFAULT_SMART_VIEWS, Segment, SegmentFilters } from '@/types/segment';
import { ContactsHeader } from '@/components/contacts/ContactsHeader';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { ContactsAdvancedFilters } from '@/components/contacts/ContactsAdvancedFilters';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactDetailDrawer } from '@/components/contacts/ContactDetailDrawer';
import { ContactsBulkActionsBar } from '@/components/contacts/ContactsBulkActionsBar';
import { CreateSegmentModal } from '@/components/contacts/CreateSegmentModal';
import { AddContactModal } from '@/components/contacts/AddContactModal';

export default function Contacts() {
  const { currentTenant } = useTenant();

  // CRM search (primary data source)
  const {
    contacts: crmContacts,
    loading: crmLoading,
    filters: crmFilters,
    setFilters: setCrmFilters,
    page: crmPage,
    setPage: setCrmPage,
    pageSize: crmPageSize,
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
    setViewCounts({ all: crmContacts.length });
  }, [crmContacts.length]);

  // Convert CRM contacts to Contact shape for table/drawer compatibility
  const contactsForTable = useMemo((): Contact[] => {
    return crmContacts.map(crm => ({
      id: crm.contact_id,
      tenant_id: crm.tenant_id,
      wa_id: crm.wa_id,
      name: crm.contact_name,
      first_name: crm.first_name,
      profile_picture_url: crm.profile_picture_url,
      // CRM-derived fields
      lead_status: 'new' as const,
      priority_level: 'normal' as const,
      mau_status: 'active' as const,
      opt_in_status: false,
      opt_out: false,
      blocked_by_user: false,
      bot_handled: false,
      intervened: false,
      data_deletion_requested: false,
      closed: crm.lead_state === 'closed',
      created_at: crm.last_message_at || new Date().toISOString(),
      updated_at: crm.last_message_at || new Date().toISOString(),
      // Nullable fields
      country: null, language: null, timezone: null,
      source: null, campaign_source: null, first_message: null,
      first_message_time: null, entry_point: null, referrer_url: null,
      segment: null, deal_stage: null, closed_reason: null,
      closure_time: null, request_type: null, request_time: null,
      last_active_date: null, whatsapp_quality_rating: null,
      pricing_category: null, automation_flow: null,
      ai_intent_detected: null, sentiment_score: null,
      followup_due: null, sla_timer: null, next_best_action: null,
      opt_in_source: null, opt_in_timestamp: null, opt_out_timestamp: null,
      notes: null, assigned_agent_id: crm.assigned_to,
      intervened_at: null, intervened_by: null,
      last_seen: crm.last_message_at,
      // Tags from RPC
      tags: crm.tags?.map(t => ({
        id: t.id,
        tag_id: t.id,
        tag: { id: t.id, name: t.name, color: t.color },
      })) || [],
    }));
  }, [crmContacts]);

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

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (contactsForTable.every(c => selectedContactIds.includes(c.id))) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contactsForTable.map(c => c.id));
    }
  };

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

  const totalCount = crmContacts.length;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/10">

          <div className="hidden md:block px-4 pt-4">
            <QuickGuide {...quickGuides.contacts} />
          </div>

          <ContactsHeader
            totalCount={totalCount}
            loading={crmLoading}
            onRefresh={fetchCrmContacts}
            onExport={handleExport}
            onCreateSegment={() => setShowCreateSegment(true)}
            onAddContact={() => setShowAddContact(true)}
          />

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

          <div className="flex-1 overflow-auto">
            <ContactsTable
              contacts={contactsForTable}
              loading={crmLoading}
              totalCount={totalCount}
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
        </div>

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
      </div>

      <ContactsBulkActionsBar
        selectedCount={selectedContactIds.length}
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
