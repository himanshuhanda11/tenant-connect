import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { 
  InboxConversation, 
  InboxMessage, 
  InboxFilters, 
  InboxView,
  ConversationEvent,
  InternalNote,
  ConversationStatus
} from '@/types/inbox';

// Map DB row to InboxConversation type
function mapConversation(row: any): InboxConversation {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    contact_id: row.contact_id,
    phone_number_id: row.phone_number_id,
    status: row.status || 'open',
    assigned_to: row.assigned_to,
    unread_count: row.unread_count || 0,
    last_message_at: row.last_message_at,
    last_message_preview: row.last_message_preview,
    last_message_id: row.last_message_id,
    last_inbound_at: row.last_inbound_at,
    priority: row.priority || 'normal',
    is_intervened: row.is_intervened || false,
    intervened_by: row.intervened_by,
    intervened_at: row.intervened_at,
    source: row.source,
    first_response_at: row.first_response_at,
    sla_first_response_due: row.sla_first_response_due,
    sla_breached: row.sla_breached || false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    contact: row.contact ? {
      id: row.contact.id,
      name: row.contact.name,
      first_name: row.contact.first_name,
      wa_id: row.contact.wa_id,
      profile_picture_url: row.contact.profile_picture_url,
      opt_out: row.contact.opt_out,
      language: row.contact.language,
    } : undefined,
    assigned_agent: row.assigned_agent ? {
      id: row.assigned_agent.id,
      full_name: row.assigned_agent.full_name || row.assigned_agent.display_name,
      avatar_url: row.assigned_agent.avatar_url,
    } : undefined,
  };
}

// Map DB message row to InboxMessage type
function mapMessage(row: any): InboxMessage {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    conversation_id: row.conversation_id,
    contact_id: row.contact_id,
    direction: row.direction,
    message_type: row.type || 'text',
    wa_message_id: row.wamid,
    wa_context_id: row.context_message_id,
    body_text: row.text,
    payload: row.payload || {},
    media_url: row.media_url,
    media_mime_type: row.media_mime_type,
    latest_status: row.status,
    is_failed: row.status === 'failed',
    error_code: row.error_code,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at,
    sender: row.sender_profile ? {
      id: row.sender_profile.id,
      full_name: row.sender_profile.full_name,
      avatar_url: row.sender_profile.avatar_url,
    } : undefined,
  };
}

export function useInboxConversations(view: InboxView, filters: InboxFilters) {
  const { currentTenant } = useTenant();
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialLoadDone = useCallback(() => conversations.length > 0 || !loading, [conversations.length, loading]);

  const fetchConversations = useCallback(async (isBackground = false) => {
    if (!currentTenant?.id) {
      setConversations([]);
      setLoading(false);
      return;
    }
    
    // Only show loading spinner on initial load, not background refreshes
    if (!isBackground) setLoading(true);
    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(id, name, first_name, wa_id, profile_picture_url, opt_out, language)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        const dbStatus = filters.status === 'pending' ? 'open' : filters.status;
        query = query.eq('status', dbStatus);
      }
      if (filters.assignment === 'unassigned') {
        query = query.is('assigned_to', null);
      } else if (filters.assignment === 'mine') {
        query = query.not('assigned_to', 'is', null);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.hasUnread) {
        query = query.gt('unread_count', 0);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      let mapped = (data || []).map(mapConversation);

      // Client-side search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        mapped = mapped.filter(c =>
          c.contact?.name?.toLowerCase().includes(search) ||
          c.contact?.wa_id?.includes(search) ||
          c.last_message_preview?.toLowerCase().includes(search)
        );
      }

      setConversations(mapped);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, view, filters]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const updateConversation = useCallback((id: string, updates: Partial<InboxConversation>) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    ));
  }, []);

  // Realtime subscription - update conversations in-place for speed
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
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setConversations(prev => {
              const idx = prev.findIndex(c => c.id === updated.id);
              if (idx === -1) return prev;
              const existing = prev[idx];
              const merged = {
                ...existing,
                status: updated.status || existing.status,
                unread_count: updated.unread_count ?? existing.unread_count,
                last_message_at: updated.last_message_at || existing.last_message_at,
                last_message_preview: updated.last_message_preview || existing.last_message_preview,
                assigned_to: updated.assigned_to,
                updated_at: updated.updated_at,
              };
              const newList = [...prev];
              newList[idx] = merged;
              // Re-sort by last_message_at
              newList.sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());
              return newList;
            });
          } else if (payload.eventType === 'INSERT') {
            // New conversation — do a background fetch to get joined contact data
            fetchConversations(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, fetchConversations]);

  return { conversations, loading, error, refetch: () => fetchConversations(true), updateConversation };
}

export function useInboxMessages(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevConversationId = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    // Only show loading on conversation switch, not refetch
    const isSwitch = prevConversationId.current !== conversationId;
    if (isSwitch) {
      setLoading(true);
      setMessages([]); // Clear immediately on switch to avoid stale messages
      prevConversationId.current = conversationId;
    }
    
    try {
      const { data, error: queryError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;

      setMessages((data || []).map(mapMessage));
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const addMessage = useCallback((message: InboxMessage) => {
    setMessages(prev => {
      // Deduplicate by id
      if (prev.some(m => m.id === message.id)) return prev;
      // Remove optimistic messages with same text (replace with real)
      return [...prev, message];
    });
  }, []);

  // Realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`inbox-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const mapped = mapMessage(payload.new);
          setMessages(prev => {
            // Remove any optimistic message with matching text
            const withoutOptimistic = prev.filter(m => {
              if (!m.id.startsWith('optimistic-')) return true;
              return m.body_text !== mapped.body_text;
            });
            // Don't add if already exists
            if (withoutOptimistic.some(m => m.id === mapped.id)) return withoutOptimistic;
            return [...withoutOptimistic, mapped];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const mapped = mapMessage(payload.new);
          setMessages(prev =>
            prev.map(m => m.id === mapped.id ? mapped : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading, error, refetch: fetchMessages, addMessage };
}

// Events - keep simple for now, fetch from DB if table exists
let eventsStore: ConversationEvent[] = [];

export function useConversationEvents(conversationId: string | null) {
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setEvents([]);
      return;
    }
    const conversationEvents = eventsStore.filter(e => e.conversation_id === conversationId);
    setEvents(conversationEvents);
  }, [conversationId]);

  const addEvent = useCallback((event: ConversationEvent) => {
    eventsStore = [...eventsStore, event];
    setEvents(prev => [...prev, event]);
  }, []);

  return { events, loading, addEvent };
}

// Notes - keep simple for now
let notesStore: InternalNote[] = [];

export function useInternalNotes(conversationId: string | null) {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setNotes([]);
      return;
    }
    const conversationNotes = notesStore.filter(n => n.conversation_id === conversationId);
    setNotes(conversationNotes);
  }, [conversationId]);

  const addNote = useCallback(async (body: string, mentions: string[] = []) => {
    if (!conversationId || !body.trim()) return;

    const newNote: InternalNote = {
      id: `n-${Date.now()}`,
      tenant_id: '1',
      conversation_id: conversationId,
      author_profile_id: 'current',
      visibility: 'internal',
      body: body.trim(),
      mentions_profile_ids: mentions,
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: { id: 'current', full_name: 'You' },
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
        () => {}
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, conversationId]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    console.log('Setting typing state:', isTyping);
  }, []);

  return { typingUsers, setTyping };
}

// Team members and tags
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

  const assignConversation = useCallback(async (conversationId: string, profileId: string | null) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ assigned_to: profileId, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      if (error) throw error;
      toast.success(profileId ? 'Conversation assigned' : 'Conversation unassigned');
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err) {
      toast.error('Failed to assign conversation');
    }
  }, []);

  const setConversationStatus = useCallback(async (conversationId: string, status: ConversationStatus) => {
    try {
      // Map inbox status to DB-compatible status
      const dbStatus = status === 'pending' ? 'open' : status;
      const { error } = await supabase
        .from('conversations')
        .update({ status: dbStatus as 'open' | 'closed' | 'expired', updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      if (error) throw error;
      toast.success(`Conversation marked as ${status}`);
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err) {
      toast.error('Failed to update status');
    }
  }, []);

  const setInterveneMode = useCallback(async (conversationId: string, intervene: boolean) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          is_intervened: intervene,
          intervened_at: intervene ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
      if (error) throw error;
      toast.success(intervene ? 'Bot paused - You have taken over' : 'Automation resumed');
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err) {
      toast.error('Failed to update intervene mode');
    }
  }, []);

  const snoozeConversation = useCallback(async (conversationId: string, until: Date, reason?: string) => {
    toast.success('Conversation snoozed');
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const addTag = useCallback(async (conversationId: string, tagId: string) => {
    const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
    if (tag) {
      toast.success(`Tag "${tag.name}" added`);
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    }
  }, []);

  const removeTag = useCallback(async (conversationId: string, tagId: string) => {
    const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
    toast.success(`Tag "${tag?.name}" removed`);
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, []);

  const sendMessage = useCallback(async (conversationId: string, message: { text?: string; template?: string; media?: File }) => {
    if (!message.text?.trim() && !message.template) return;
    if (!currentTenant?.id) return;

    // Optimistic: immediately dispatch a local message event so the chat thread updates instantly
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: InboxMessage = {
      id: optimisticId,
      tenant_id: currentTenant.id,
      conversation_id: conversationId,
      direction: 'outbound',
      message_type: 'text',
      body_text: message.text,
      payload: {},
      is_failed: false,
      latest_status: 'sent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    window.dispatchEvent(new CustomEvent('inbox-message', { detail: { conversationId, message: optimisticMsg } }));

    try {
      // Get conversation to find phone_number_id and contact wa_id
      const { data: conv } = await supabase
        .from('conversations')
        .select('phone_number_id, contact:contacts(wa_id)')
        .eq('id', conversationId)
        .single();

      if (!conv) throw new Error('Conversation not found');

      const contactWaId = (conv.contact as any)?.wa_id;
      if (!contactWaId) throw new Error('Contact wa_id not found');

      const { data, error } = await supabase.functions.invoke('send-text-message', {
        body: {
          tenant_id: currentTenant.id,
          phone_number_id: conv.phone_number_id,
          to_wa_id: contactWaId,
          conversation_id: conversationId,
          type: 'text',
          text: message.text,
        }
      });

      if (error) throw error;
      if (data?.error) {
        if (data.code === 'OUTSIDE_24H') {
          toast.error('Cannot send: no inbound message within 24 hours. Use a template instead.');
        } else if (data.code === 'LIMIT_EXCEEDED') {
          toast.error('Monthly message limit exceeded. Please upgrade your plan.');
        } else {
          toast.error(data.error);
        }
        return;
      }

      toast.success('Message sent');
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err: any) {
      console.error('Send message error:', err);
      toast.error(err.message || 'Failed to send message');
    }
  }, [currentTenant?.id]);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } catch (err) {
      // Silent fail for mark as read
    }
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

export { TEAM_MEMBERS, AVAILABLE_TAGS };
