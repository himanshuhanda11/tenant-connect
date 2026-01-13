import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Contact } from '@/types/contact';
import { SmartView, DEFAULT_SMART_VIEWS, Segment, SegmentFilters } from '@/types/segment';
import { SmartViewsSidebar } from '@/components/contacts/SmartViewsSidebar';
import { AdvancedFiltersBar } from '@/components/contacts/AdvancedFiltersBar';
import { ContactListTable } from '@/components/contacts/ContactListTable';
import { ContactDetailDrawer } from '@/components/contacts/ContactDetailDrawer';
import { ContactsBulkActions } from '@/components/contacts/ContactsBulkActions';
import { CreateSegmentModal } from '@/components/contacts/CreateSegmentModal';
import { AddContactModal } from '@/components/contacts/AddContactModal';

export default function Contacts() {
  const navigate = useNavigate();
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

  // Fetch tags and agents for bulk actions
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

  // Calculate view counts
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

  const handleBulkAddTag = async (tagId: string) => {
    for (const id of selectedContactIds) {
      await addTag(id, tagId);
    }
    setSelectedContactIds([]);
  };

  const handleBulkRemoveTag = async (tagId: string) => {
    for (const id of selectedContactIds) {
      await removeTag(id, tagId);
    }
    setSelectedContactIds([]);
  };

  const handleBulkAssign = async (agentId: string | null) => {
    for (const id of selectedContactIds) {
      await assignAgent(id, agentId);
    }
    setSelectedContactIds([]);
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
        {/* Left Sidebar - Smart Views */}
        <SmartViewsSidebar
          activeViewId={activeView.id}
          onViewChange={handleViewChange}
          segments={segments}
          viewCounts={viewCounts}
          onCreateSegment={() => setShowCreateSegment(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="shrink-0 p-6 border-b bg-background">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Contacts
                </h1>
                <p className="text-muted-foreground text-sm">
                  Organize contacts, tags, segments, and engagement
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchContacts} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contacts/imports">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCreateSegment(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Segment
                </Button>
                <Button onClick={() => setShowAddContact(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AdvancedFiltersBar
              filters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onSaveAsSegment={() => setShowCreateSegment(true)}
              onReset={resetFilters}
              availableTags={availableTags}
              sources={['facebook', 'website', 'qr', 'api', 'manual']}
              countries={[]}
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <ContactListTable
              contacts={contacts}
              loading={loading}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onSelectContact={handleContactSelect}
              selectedContactId={selectedContact?.id}
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
      <ContactsBulkActions
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