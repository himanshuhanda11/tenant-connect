import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { 
  InboxConversation, 
  InboxMessage, 
  InboxFilters, 
  InboxView,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  ConversationEvent,
  InternalNote,
  ConversationStatus
} from '@/types/inbox';

// State store for mock data updates (simulating database)
let conversationsStore = [...MOCK_CONVERSATIONS];
let messagesStore = [...MOCK_MESSAGES];

export function useInboxConversations(view: InboxView, filters: InboxFilters) {
  const { currentTenant } = useTenant();
  const [conversations, setConversations] = useState<InboxConversation[]>(conversationsStore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!currentTenant?.id) {
      // Use mock data when no tenant
      let filtered = [...conversationsStore];
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (filters.assignment === 'mine') {
        filtered = filtered.filter(c => c.assigned_to === 'u1');
      } else if (filters.assignment === 'unassigned') {
        filtered = filtered.filter(c => !c.assigned_to);
      }
      
      if (filters.hasUnread) {
        filtered = filtered.filter(c => c.unread_count > 0);
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.contact?.name?.toLowerCase().includes(search) ||
          c.last_message_preview?.toLowerCase().includes(search)
        );
      }
      
      setConversations(filtered);
      return;
    }
    
    setLoading(true);
    try {
      let filtered = [...conversationsStore];
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (filters.assignment === 'mine') {
        filtered = filtered.filter(c => c.assigned_to === 'u1');
      } else if (filters.assignment === 'unassigned') {
        filtered = filtered.filter(c => !c.assigned_to);
      }
      
      if (filters.hasUnread) {
        filtered = filtered.filter(c => c.unread_count > 0);
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.contact?.name?.toLowerCase().includes(search) ||
          c.last_message_preview?.toLowerCase().includes(search)
        );
      }
      
      setConversations(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, view, filters]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Update conversations when store changes
  const updateConversation = useCallback((id: string, updates: Partial<InboxConversation>) => {
    conversationsStore = conversationsStore.map(c => 
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    ));
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('inbox-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations, updateConversation };
}

export function useInboxMessages(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    setLoading(true);
    try {
      const filtered = messagesStore.filter(m => m.conversation_id === conversationId);
      setMessages(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = useCallback((message: InboxMessage) => {
    messagesStore = [...messagesStore, message];
    setMessages(prev => [...prev, message]);
  }, []);

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!currentTenant?.id || !conversationId) return;

    const channel = supabase
      .channel(`inbox-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'smeksh_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as InboxMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'smeksh_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => 
            prev.map(m => m.id === payload.new.id ? payload.new as InboxMessage : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, conversationId]);

  return { messages, loading, error, refetch: fetchMessages, addMessage };
}

// Store for events
let eventsStore: ConversationEvent[] = [];

export function useConversationEvents(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setEvents([]);
      return;
    }

    // Get events for this conversation
    const conversationEvents = eventsStore.filter(e => e.conversation_id === conversationId);
    
    // Add some default events if none exist
    if (conversationEvents.length === 0) {
      const defaultEvents: ConversationEvent[] = [
        {
          id: `e-${conversationId}-1`,
          tenant_id: '1',
          conversation_id: conversationId,
          event_type: 'assigned',
          actor_profile_id: 'u1',
          actor_type: 'agent',
          to_assigned_to: 'u1',
          details: {},
          created_at: new Date(Date.now() - 3600000).toISOString(),
          actor: { id: 'u1', full_name: 'Ahmed Hassan' },
        },
      ];
      setEvents(defaultEvents);
    } else {
      setEvents(conversationEvents);
    }
  }, [conversationId]);

  const addEvent = useCallback((event: ConversationEvent) => {
    eventsStore = [...eventsStore, event];
    setEvents(prev => [...prev, event]);
  }, []);

  return { events, loading, addEvent };
}

// Store for notes
let notesStore: InternalNote[] = [];

export function useInternalNotes(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setNotes([]);
      return;
    }

    // Get notes for this conversation
    const conversationNotes = notesStore.filter(n => n.conversation_id === conversationId);
    
    // Add a default note if none exist for demo
    if (conversationNotes.length === 0) {
      const defaultNotes: InternalNote[] = [
        {
          id: `n-${conversationId}-1`,
          tenant_id: '1',
          conversation_id: conversationId,
          author_profile_id: 'u1',
          visibility: 'internal',
          body: 'Customer is interested in premium plan. Follow up on enterprise pricing.',
          mentions_profile_ids: [],
          attachments: [],
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          author: { id: 'u1', full_name: 'Ahmed Hassan' },
        },
      ];
      setNotes(defaultNotes);
    } else {
      setNotes(conversationNotes);
    }
  }, [conversationId]);

  const addNote = useCallback(async (body: string, mentions: string[] = []) => {
    if (!conversationId || !body.trim()) return;

    const newNote: InternalNote = {
      id: `n-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      author_profile_id: 'u1',
      visibility: 'internal',
      body: body.trim(),
      mentions_profile_ids: mentions,
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: { id: 'u1', full_name: 'Ahmed Hassan' },
    };

    notesStore = [...notesStore, newNote];
    setNotes(prev => [...prev, newNote]);
    toast.success('Note added successfully');
  }, [conversationId]);

  return { notes, loading, addNote };
}

export function useTypingState(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [typingUsers, setTypingUsers] = useState<Array<{ profile_id: string; full_name?: string }>>([]);

  useEffect(() => {
    if (!currentTenant?.id || !conversationId) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smeksh_typing_state',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Refetch typing state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, conversationId]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    // Set typing state logic - for demo just console log
    console.log('Setting typing state:', isTyping);
  }, []);

  return { typingUsers, setTyping };
}

// Available team members and tags for assignment
const TEAM_MEMBERS = [
  { id: 'u1', full_name: 'Ahmed Hassan', avatar_url: null },
  { id: 'u2', full_name: 'Sara Ali', avatar_url: null },
  { id: 'u3', full_name: 'Mohammed Khan', avatar_url: null },
];

const AVAILABLE_TAGS = [
  { id: 't1', name: 'VIP', color: '#FFD700' },
  { id: 't2', name: 'Pricing', color: '#3B82F6' },
  { id: 't3', name: 'Support', color: '#10B981' },
  { id: 't4', name: 'Urgent', color: '#EF4444' },
  { id: 't5', name: 'Follow-up', color: '#8B5CF6' },
];

export function useInboxActions() {
  const { currentTenant } = useTenant();

  const assignConversation = useCallback(async (conversationId: string, profileId: string | null, teamId?: string) => {
    // Find the conversation and update it
    const conversationIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (conversationIndex === -1) {
      toast.error('Conversation not found');
      return;
    }

    const agent = profileId ? TEAM_MEMBERS.find(m => m.id === profileId) : null;
    
    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { 
            ...c, 
            assigned_to: profileId || undefined,
            assigned_agent: agent ? { id: agent.id, full_name: agent.full_name } : undefined,
            updated_at: new Date().toISOString()
          } 
        : c
    );

    // Add event
    const newEvent: ConversationEvent = {
      id: `e-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      event_type: profileId ? 'assigned' : 'unassigned',
      actor_profile_id: 'u1',
      actor_type: 'agent',
      to_assigned_to: profileId || undefined,
      details: { team_id: teamId },
      created_at: new Date().toISOString(),
      actor: { id: 'u1', full_name: 'Ahmed Hassan' },
    };
    eventsStore = [...eventsStore, newEvent];

    if (profileId) {
      toast.success(`Assigned to ${agent?.full_name || 'agent'}`);
    } else {
      toast.success('Conversation unassigned');
    }

    // Trigger re-render
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const setConversationStatus = useCallback(async (conversationId: string, status: ConversationStatus) => {
    const conversationIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (conversationIndex === -1) {
      toast.error('Conversation not found');
      return;
    }

    const oldStatus = conversationsStore[conversationIndex].status;
    
    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { ...c, status, updated_at: new Date().toISOString() } 
        : c
    );

    // Add event
    const newEvent: ConversationEvent = {
      id: `e-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      event_type: 'status_changed',
      actor_profile_id: 'u1',
      actor_type: 'agent',
      old_value: oldStatus,
      new_value: status,
      details: {},
      created_at: new Date().toISOString(),
      actor: { id: 'u1', full_name: 'Ahmed Hassan' },
    };
    eventsStore = [...eventsStore, newEvent];

    toast.success(`Conversation marked as ${status}`);
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const setInterveneMode = useCallback(async (conversationId: string, intervene: boolean) => {
    const conversationIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (conversationIndex === -1) {
      toast.error('Conversation not found');
      return;
    }

    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { 
            ...c, 
            is_intervened: intervene,
            intervened_by: intervene ? 'u1' : undefined,
            intervened_at: intervene ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
          } 
        : c
    );

    // Add event
    const newEvent: ConversationEvent = {
      id: `e-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      event_type: intervene ? 'intervened' : 'bot_resumed',
      actor_profile_id: 'u1',
      actor_type: 'agent',
      details: {},
      created_at: new Date().toISOString(),
      actor: { id: 'u1', full_name: 'Ahmed Hassan' },
    };
    eventsStore = [...eventsStore, newEvent];

    toast.success(intervene ? 'Bot paused - You have taken over' : 'Automation resumed');
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const snoozeConversation = useCallback(async (conversationId: string, until: Date, reason?: string) => {
    const conversationIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (conversationIndex === -1) {
      toast.error('Conversation not found');
      return;
    }

    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { 
            ...c, 
            active_snooze: {
              id: `snooze-${Date.now()}`,
              snooze_until: until.toISOString(),
              reason
            },
            updated_at: new Date().toISOString()
          } 
        : c
    );

    // Add event
    const newEvent: ConversationEvent = {
      id: `e-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      event_type: 'snoozed',
      actor_profile_id: 'u1',
      actor_type: 'agent',
      details: { until: until.toISOString(), reason },
      created_at: new Date().toISOString(),
      actor: { id: 'u1', full_name: 'Ahmed Hassan' },
    };
    eventsStore = [...eventsStore, newEvent];

    toast.success('Conversation snoozed');
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const addTag = useCallback(async (conversationId: string, tagId: string) => {
    const conversationIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (conversationIndex === -1) {
      toast.error('Conversation not found');
      return;
    }

    const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
    if (!tag) {
      toast.error('Tag not found');
      return;
    }

    const conversation = conversationsStore[conversationIndex];
    const existingTags = conversation.tags || [];
    
    // Check if tag already exists
    if (existingTags.some(t => t.id === tagId)) {
      toast.info('Tag already applied');
      return;
    }

    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { 
            ...c, 
            tags: [...existingTags, tag],
            updated_at: new Date().toISOString()
          } 
        : c
    );

    // Add event
    const newEvent: ConversationEvent = {
      id: `e-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      event_type: 'tag_added',
      actor_profile_id: 'u1',
      actor_type: 'agent',
      tag_id: tagId,
      tag_name: tag.name,
      tag_reason: 'manual',
      details: {},
      created_at: new Date().toISOString(),
      actor: { id: 'u1', full_name: 'Ahmed Hassan' },
    };
    eventsStore = [...eventsStore, newEvent];

    toast.success(`Tag "${tag.name}" added`);
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const removeTag = useCallback(async (conversationId: string, tagId: string) => {
    const conversationIndex = conversationsStore.findIndex(c => c.id === conversationId);
    if (conversationIndex === -1) {
      toast.error('Conversation not found');
      return;
    }

    const conversation = conversationsStore[conversationIndex];
    const tag = conversation.tags?.find(t => t.id === tagId);
    
    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { 
            ...c, 
            tags: (c.tags || []).filter(t => t.id !== tagId),
            updated_at: new Date().toISOString()
          } 
        : c
    );

    // Add event
    const newEvent: ConversationEvent = {
      id: `e-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      event_type: 'tag_removed',
      actor_profile_id: 'u1',
      actor_type: 'agent',
      tag_id: tagId,
      tag_name: tag?.name,
      details: {},
      created_at: new Date().toISOString(),
      actor: { id: 'u1', full_name: 'Ahmed Hassan' },
    };
    eventsStore = [...eventsStore, newEvent];

    toast.success(`Tag "${tag?.name}" removed`);
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const sendMessage = useCallback(async (conversationId: string, message: { text?: string; template?: string; media?: File }) => {
    if (!message.text?.trim() && !message.template) {
      return;
    }

    const newMessage: InboxMessage = {
      id: `m-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      direction: 'outbound',
      message_type: message.template ? 'template' : 'text',
      body_text: message.text,
      template_name: message.template,
      payload: {},
      sent_by_profile_id: 'u1',
      latest_status: 'sent',
      latest_status_at: new Date().toISOString(),
      is_failed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: {
        id: 'u1',
        full_name: 'Ahmed Hassan',
      },
    };

    messagesStore = [...messagesStore, newMessage];

    // Update conversation last message
    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { 
            ...c, 
            last_message_at: new Date().toISOString(),
            last_message_preview: message.text || `Template: ${message.template}`,
            last_message_id: newMessage.id,
            updated_at: new Date().toISOString()
          } 
        : c
    );

    toast.success('Message sent');
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    window.dispatchEvent(new CustomEvent('inbox-message', { detail: { conversationId, message: newMessage } }));
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    conversationsStore = conversationsStore.map(c => 
      c.id === conversationId 
        ? { ...c, unread_count: 0, updated_at: new Date().toISOString() } 
        : c
    );
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  return {
    assignConversation,
    setConversationStatus,
    setInterveneMode,
    snoozeConversation,
    addTag,
    removeTag,
    sendMessage,
    markAsRead,
    teamMembers: TEAM_MEMBERS,
    availableTags: AVAILABLE_TAGS,
  };
}

// Export for use in other components
export { TEAM_MEMBERS, AVAILABLE_TAGS };
