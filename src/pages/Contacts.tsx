import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useContacts } from '@/hooks/useContacts';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types/contact';
import { SmartView, DEFAULT_SMART_VIEWS, Segment, SegmentFilters } from '@/types/segment';
import { ContactsHeader } from '@/components/contacts/ContactsHeader';
import { ContactsSmartViewsSidebar } from '@/components/contacts/ContactsSmartViewsSidebar';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';
import { ContactsAdvancedFilters } from '@/components/contacts/ContactsAdvancedFilters';
import { ContactsTable } from '@/components/contacts/ContactsTable';
import { ContactDetailDrawer } from '@/components/contacts/ContactDetailDrawer';
import { ContactsBulkActionsBar } from '@/components/contacts/ContactsBulkActionsBar';
import { CreateSegmentModal } from '@/components/contacts/CreateSegmentModal';
import { AddContactModal } from '@/components/contacts/AddContactModal';

export default function Contacts() {
  const { currentTenant } = useTenant();
  const {
    contacts,
    loading,
    filters,
    setFilters,
    totalCount,
    page,
    setPage,
    pageSize,
    fetchContacts,
    updateContact,
    assignAgent,
    addTag,
    removeTag,
    resetFilters,
  } = useContacts();

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
    setViewCounts({ all: totalCount });
  }, [totalCount]);

  const handleViewChange = (view: SmartView) => {
    setActiveView(view);
    setFilters({
      search: filters.search,
      leadStatus: view.filters.leadStatus || [],
      priority: view.filters.priority || [],
      mauStatus: view.filters.mauStatus || [],
      tags: view.filters.tags || [],
      segment: '',
      optInStatus: view.filters.optInStatus || 'all',
      hasAgent: view.filters.hasAgent || 'all',
      intervened: view.filters.intervened || 'all',
    });
    setPage(1);
  };

  const handleFiltersChange = (newFilters: SegmentFilters) => {
    setFilters({
      search: newFilters.search || '',
      leadStatus: newFilters.leadStatus || [],
      priority: newFilters.priority || [],
      mauStatus: newFilters.mauStatus || [],
      tags: newFilters.tags || [],
      segment: '',
      optInStatus: newFilters.optInStatus || 'all',
      hasAgent: newFilters.hasAgent || 'all',
      intervened: newFilters.intervened || 'all',
    });
    setPage(1);
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
    if (contacts.every(c => selectedContactIds.includes(c.id))) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(contacts.map(c => c.id));
    }
  };

  const handleBulkAddTag = async (tagId: string) => {
    for (const id of selectedContactIds) {
      await addTag(id, tagId);
    }
    setSelectedContactIds([]);
    toast.success(`Tag added to ${selectedContactIds.length} contacts`);
  };

  const handleBulkRemoveTag = async (tagId: string) => {
    for (const id of selectedContactIds) {
      await removeTag(id, tagId);
    }
    setSelectedContactIds([]);
    toast.success(`Tag removed from ${selectedContactIds.length} contacts`);
  };

  const handleBulkAssign = async (agentId: string | null) => {
    for (const id of selectedContactIds) {
      await assignAgent(id, agentId);
    }
    setSelectedContactIds([]);
    toast.success(agentId ? `Assigned ${selectedContactIds.length} contacts` : `Unassigned ${selectedContactIds.length} contacts`);
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  const handleMarkOptOut = async () => {
    for (const id of selectedContactIds) {
      await updateContact(id, { opt_out: true, opt_out_timestamp: new Date().toISOString() });
    }
    setSelectedContactIds([]);
    toast.success(`${selectedContactIds.length} contacts marked as opted out`);
  };

  const handleRequestDeletion = async () => {
    for (const id of selectedContactIds) {
      await updateContact(id, { data_deletion_requested: true });
    }
    setSelectedContactIds([]);
    toast.success(`Deletion requested for ${selectedContactIds.length} contacts`);
  };

  const handleSaveSegment = async (name: string, description: string, segmentFilters: SegmentFilters) => {
    toast.success(`Segment "${name}" saved`);
  };

  const currentFilters: SegmentFilters = {
    search: filters.search,
    leadStatus: filters.leadStatus,
    priority: filters.priority,
    mauStatus: filters.mauStatus,
    tags: filters.tags,
    optInStatus: filters.optInStatus,
    hasAgent: filters.hasAgent,
    intervened: filters.intervened,
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <ContactsSmartViewsSidebar
          activeViewId={activeView.id}
          onViewChange={handleViewChange}
          segments={segments}
          viewCounts={viewCounts}
          onCreateSegment={() => setShowCreateSegment(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/10">
          {/* Quick Guide */}
          <div className="px-4 pt-4">
            <QuickGuide {...quickGuides.contacts} />
          </div>

          <ContactsHeader
            totalCount={totalCount}
            loading={loading}
            onRefresh={fetchContacts}
            onExport={handleExport}
            onCreateSegment={() => setShowCreateSegment(true)}
            onAddContact={() => setShowAddContact(true)}
          />

          <ContactsAdvancedFilters
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            onSaveAsSegment={() => setShowCreateSegment(true)}
            onReset={resetFilters}
            availableTags={availableTags}
            sources={['facebook', 'website', 'qr', 'api', 'manual']}
            countries={[]}
          />

          <div className="flex-1 overflow-auto">
            <ContactsTable
              contacts={contacts}
              loading={loading}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onSelectContact={handleContactSelect}
              selectedContactId={selectedContact?.id}
              selectedContactIds={selectedContactIds}
              onToggleSelection={toggleContactSelection}
              onSelectAll={handleSelectAll}
            />
          </div>
        </div>

        {/* Contact Detail Drawer */}
        <ContactDetailDrawer
          contact={selectedContact}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedContact(null);
          }}
          onUpdate={updateContact}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onAssignAgent={assignAgent}
        />
      </div>

      {/* Bulk Actions Bar */}
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

      {/* Modals */}
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
        onSuccess={fetchContacts}
      />
    </DashboardLayout>
  );
}
