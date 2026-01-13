import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Contact, ContactFilters, ContactTimelineEvent } from '@/types/contact';
import { toast } from 'sonner';

const DEFAULT_FILTERS: ContactFilters = {
  search: '',
  leadStatus: [],
  priority: [],
  mauStatus: [],
  tags: [],
  segment: '',
  optInStatus: 'all',
  hasAgent: 'all',
  intervened: 'all',
};

export function useContacts() {
  const { currentTenant } = useTenant();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchContacts = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          assigned_agent:profiles!contacts_assigned_agent_id_fkey(id, full_name, email),
          intervened_by_agent:profiles!contacts_intervened_by_fkey(id, full_name, email)
        `, { count: 'exact' })
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,wa_id.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%`);
      }
      
      if (filters.leadStatus.length > 0) {
        query = query.in('lead_status', filters.leadStatus);
      }
      
      if (filters.priority.length > 0) {
        query = query.in('priority_level', filters.priority);
      }
      
      if (filters.mauStatus.length > 0) {
        query = query.in('mau_status', filters.mauStatus);
      }
      
      if (filters.segment) {
        query = query.eq('segment', filters.segment);
      }
      
      if (filters.optInStatus === 'opted_in') {
        query = query.eq('opt_in_status', true);
      } else if (filters.optInStatus === 'opted_out') {
        query = query.eq('opt_out', true);
      }
      
      if (filters.hasAgent === 'assigned') {
        query = query.not('assigned_agent_id', 'is', null);
      } else if (filters.hasAgent === 'unassigned') {
        query = query.is('assigned_agent_id', null);
      }
      
      if (filters.intervened === 'yes') {
        query = query.eq('intervened', true);
      } else if (filters.intervened === 'no') {
        query = query.eq('intervened', false);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch tags for contacts
      if (data && data.length > 0) {
        const contactIds = data.map(c => c.id);
        const { data: tagData } = await supabase
          .from('contact_tags')
          .select(`
            id,
            contact_id,
            tag_id,
            tag:tags(id, name, color)
          `)
          .in('contact_id', contactIds);

        const contactsWithTags = data.map(contact => ({
          ...contact,
          tags: tagData?.filter(t => t.contact_id === contact.id) || [],
        }));

        setContacts(contactsWithTags as Contact[]);
      } else {
        setContacts([]);
      }
      
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, filters, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateContact = async (contactId: string, updates: Partial<Contact>) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      // Log timeline event
      await supabase.from('contact_timeline').insert({
        contact_id: contactId,
        tenant_id: currentTenant.id,
        event_type: 'attribute_update',
        event_data: { updates },
        actor_type: 'user',
      } as Record<string, unknown>);

      toast.success('Contact updated');
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const assignAgent = async (contactId: string, agentId: string | null) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ assigned_agent_id: agentId })
        .eq('id', contactId)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      // Log timeline event
      await supabase.from('contact_timeline').insert({
        contact_id: contactId,
        tenant_id: currentTenant.id,
        event_type: 'agent_assigned',
        event_data: { agent_id: agentId },
        actor_type: 'user',
      } as Record<string, unknown>);

      toast.success(agentId ? 'Agent assigned' : 'Agent unassigned');
      fetchContacts();
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast.error('Failed to assign agent');
    }
  };

  const addTag = async (contactId: string, tagId: string) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('contact_tags')
        .insert({ contact_id: contactId, tag_id: tagId });

      if (error) throw error;

      // Log timeline event
      await supabase.from('contact_timeline').insert({
        contact_id: contactId,
        tenant_id: currentTenant.id,
        event_type: 'tag_added',
        event_data: { tag_id: tagId },
        actor_type: 'user',
      } as Record<string, unknown>);

      toast.success('Tag added');
      fetchContacts();
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const removeTag = async (contactId: string, tagId: string) => {
    if (!currentTenant?.id) return;

    try {
      const { error } = await supabase
        .from('contact_tags')
        .delete()
        .eq('contact_id', contactId)
        .eq('tag_id', tagId);

      if (error) throw error;

      // Log timeline event
      await supabase.from('contact_timeline').insert({
        contact_id: contactId,
        tenant_id: currentTenant.id,
        event_type: 'tag_removed',
        event_data: { tag_id: tagId },
        actor_type: 'user',
      } as Record<string, unknown>);

      toast.success('Tag removed');
      fetchContacts();
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return {
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
  };
}

export function useContactTimeline(contactId: string | null) {
  const { currentTenant } = useTenant();
  const [events, setEvents] = useState<ContactTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTimeline = useCallback(async () => {
    if (!contactId || !currentTenant?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_timeline')
        .select(`
          *,
          actor:profiles(id, full_name, email)
        `)
        .eq('contact_id', contactId)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents((data || []) as ContactTimelineEvent[]);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  }, [contactId, currentTenant?.id]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const addTimelineEvent = async (
    eventType: ContactTimelineEvent['event_type'],
    eventData: Record<string, unknown>
  ) => {
    if (!contactId || !currentTenant?.id) return;

    try {
      await supabase.from('contact_timeline').insert({
        contact_id: contactId,
        tenant_id: currentTenant.id,
        event_type: eventType,
        event_data: eventData,
        actor_type: 'user',
      } as Record<string, unknown>);
      fetchTimeline();
    } catch (error) {
      console.error('Error adding timeline event:', error);
    }
  };

  return { events, loading, fetchTimeline, addTimelineEvent };
}
