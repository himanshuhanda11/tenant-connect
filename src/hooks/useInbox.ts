import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { 
  InboxConversation, 
  InboxMessage, 
  InboxFilters, 
  InboxView,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  ConversationEvent,
  InternalNote 
} from '@/types/inbox';

export function useInboxConversations(view: InboxView, filters: InboxFilters) {
  const { currentTenant } = useTenant();
  const [conversations, setConversations] = useState<InboxConversation[]>(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!currentTenant?.id) return;
    
    setLoading(true);
    try {
      // For now using mock data - will integrate with real DB
      let filtered = [...MOCK_CONVERSATIONS];
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      if (filters.assignment === 'mine') {
        filtered = filtered.filter(c => c.assigned_to === 'u1'); // Current user
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

  return { conversations, loading, error, refetch: fetchConversations };
}

export function useInboxMessages(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!currentTenant?.id || !conversationId) {
      setMessages([]);
      return;
    }
    
    setLoading(true);
    try {
      // For now using mock data filtered by conversation
      const filtered = MOCK_MESSAGES.filter(m => m.conversation_id === conversationId);
      setMessages(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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

  return { messages, loading, error, refetch: fetchMessages };
}

export function useConversationEvents(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentTenant?.id || !conversationId) {
      setEvents([]);
      return;
    }

    // Mock events for demo
    setEvents([
      {
        id: 'e1',
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
      {
        id: 'e2',
        tenant_id: '1',
        conversation_id: conversationId,
        event_type: 'tag_added',
        actor_profile_id: 'u1',
        actor_type: 'agent',
        tag_name: 'VIP',
        tag_reason: 'manual',
        details: {},
        created_at: new Date(Date.now() - 3000000).toISOString(),
        actor: { id: 'u1', full_name: 'Ahmed Hassan' },
      },
    ]);
  }, [currentTenant?.id, conversationId]);

  return { events, loading };
}

export function useInternalNotes(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentTenant?.id || !conversationId) {
      setNotes([]);
      return;
    }

    // Mock notes for demo
    setNotes([
      {
        id: 'n1',
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
    ]);
  }, [currentTenant?.id, conversationId]);

  const addNote = async (body: string, mentions: string[] = []) => {
    // Add note logic here
    console.log('Adding note:', body, mentions);
  };

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

  const setTyping = async (isTyping: boolean) => {
    // Set typing state logic
  };

  return { typingUsers, setTyping };
}

export function useInboxActions() {
  const { currentTenant } = useTenant();

  const assignConversation = async (conversationId: string, profileId: string | null) => {
    console.log('Assigning conversation:', conversationId, profileId);
  };

  const setConversationStatus = async (conversationId: string, status: string) => {
    console.log('Setting status:', conversationId, status);
  };

  const setInterveneMode = async (conversationId: string, intervene: boolean) => {
    console.log('Setting intervene mode:', conversationId, intervene);
  };

  const snoozeConversation = async (conversationId: string, until: Date, reason?: string) => {
    console.log('Snoozing conversation:', conversationId, until, reason);
  };

  const addTag = async (conversationId: string, tagId: string) => {
    console.log('Adding tag:', conversationId, tagId);
  };

  const removeTag = async (conversationId: string, tagId: string) => {
    console.log('Removing tag:', conversationId, tagId);
  };

  const sendMessage = async (conversationId: string, message: { text?: string; template?: string; media?: File }) => {
    console.log('Sending message:', conversationId, message);
  };

  const markAsRead = async (conversationId: string) => {
    console.log('Marking as read:', conversationId);
  };

  return {
    assignConversation,
    setConversationStatus,
    setInterveneMode,
    snoozeConversation,
    addTag,
    removeTag,
    sendMessage,
    markAsRead,
  };
}
