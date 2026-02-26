import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
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
    assigned_at: row.assigned_at,
    claimed_by: row.claimed_by,
    claimed_at: row.claimed_at,
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
    crm_status: row.crm_status || 'new',
    next_followup_at: row.next_followup_at,
    last_contacted_at: row.last_contacted_at,
    lead_score: row.lead_score || 0,
    country_interest: row.country_interest,
    junk_reason: row.junk_reason,
    followup_notes: row.followup_notes,
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
    phone_number_status: row.phone_number?.status || undefined,
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
    media_bucket: row.media_bucket,
    media_path: row.media_path,
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
  const { user } = useAuth();
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
      // Check if user is an agent (not owner/admin)
      const { data: roleName } = await supabase.rpc('get_user_role_name', {
        p_tenant_id: currentTenant.id,
        p_user_id: user?.id || '',
      });
      const isAgent = roleName === 'agent';

      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(id, name, first_name, wa_id, profile_picture_url, opt_out, language),
          assigned_agent:profiles!conversations_assigned_to_fkey(id, full_name, avatar_url),
          phone_number:phone_numbers(id, status)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      // Agent visibility: only see unassigned OR assigned/claimed to self
      if (isAgent && user?.id) {
        query = query.or(`assigned_to.is.null,assigned_to.eq.${user.id},claimed_by.eq.${user.id}`);
      }

      // Apply filters based on queue model (matches useInboxQueues spec)
      if (filters.status && filters.status !== 'all') {
        const dbStatus = filters.status === 'pending' ? 'open' : filters.status;
        query = query.eq('status', dbStatus);
      }
      if (filters.assignment === 'unassigned') {
        query = query.is('assigned_to', null).is('claimed_at', null).neq('status', 'closed');
      } else if (filters.assignment === 'assigned_pending' && user?.id) {
        query = query.eq('assigned_to', user.id).is('claimed_at', null).neq('status', 'closed');
      } else if (filters.assignment === 'mine' && user?.id) {
        query = query.eq('claimed_by', user.id).not('claimed_at', 'is', null).neq('status', 'closed');
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

      // Fetch lead stages for all contact_ids
      const contactIds = mapped.map(c => c.contact_id).filter(Boolean);
      if (contactIds.length > 0) {
        const { data: leads } = await supabase
          .from('qualified_leads')
          .select('contact_id, lead_stage')
          .eq('workspace_id', currentTenant.id)
          .in('contact_id', contactIds);

        if (leads && leads.length > 0) {
          const stageMap = new Map(leads.map(l => [l.contact_id, l.lead_stage]));
          mapped = mapped.map(c => ({
            ...c,
            lead_stage: stageMap.get(c.contact_id) as InboxConversation['lead_stage'],
          }));
        }
      }

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
              if (idx === -1) {
                // New conversation we don't have — background fetch
                fetchConversations(true);
                return prev;
              }
              const existing = prev[idx];
              const merged = {
                ...existing,
                status: updated.status || existing.status,
                unread_count: updated.unread_count ?? existing.unread_count,
                last_message_at: updated.last_message_at || existing.last_message_at,
                last_message_preview: updated.last_message_preview || existing.last_message_preview,
                assigned_to: updated.assigned_to,
                priority: updated.priority || existing.priority,
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
      .subscribe((status) => {
        console.log(`Realtime conversations channel status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, fetchConversations]);

  // Polling fallback — refresh conversations every 5 seconds for reliability
  useEffect(() => {
    if (!currentTenant?.id) return;

    const interval = setInterval(() => {
      fetchConversations(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTenant?.id, fetchConversations]);

  return { conversations, loading, error, refetch: () => fetchConversations(true), updateConversation };
}

export function useInboxMessages(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevConversationId = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchedAtRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async (isInitial = true) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    
    // Only show loading on conversation switch
    const isSwitch = prevConversationId.current !== conversationId;
    if (isSwitch && isInitial) {
      setLoading(true);
      setMessages([]);
      prevConversationId.current = conversationId;
      lastFetchedAtRef.current = null;
    }
    
    try {
      const { data, error: queryError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (queryError) throw queryError;

      const mapped = (data || []).map(mapMessage);
      setMessages(mapped);
      
      // Track last message timestamp for polling
      if (mapped.length > 0) {
        lastFetchedAtRef.current = mapped[mapped.length - 1].created_at;
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Incremental poll — only fetch new messages since last known
  const pollNewMessages = useCallback(async () => {
    if (!conversationId || !lastFetchedAtRef.current) return;
    
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .gt('created_at', lastFetchedAtRef.current)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const newMapped = data.map(mapMessage);
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMapped.filter(m => !existingIds.has(m.id));
          if (uniqueNew.length === 0) return prev;
          return [...prev, ...uniqueNew];
        });
        lastFetchedAtRef.current = newMapped[newMapped.length - 1].created_at;
      }
    } catch {
      // Silent fail on poll
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  const addMessage = useCallback((message: InboxMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) return prev;
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
            if (withoutOptimistic.some(m => m.id === mapped.id)) return withoutOptimistic;
            const updated = [...withoutOptimistic, mapped];
            // Update last fetched timestamp
            lastFetchedAtRef.current = mapped.created_at;
            return updated;
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
      .subscribe((status) => {
        console.log(`Realtime messages channel status: ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Polling fallback — check for new messages every 3 seconds
  // This ensures messages appear even if Realtime has connection issues
  useEffect(() => {
    if (!conversationId) return;

    pollIntervalRef.current = setInterval(pollNewMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [conversationId, pollNewMessages]);

  return { messages, loading, error, refetch: fetchMessages, addMessage };
}

// Events - fetch from smeksh_conversation_events table with profile joins
export function useConversationEvents(conversationId: string | null) {
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!conversationId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smeksh_conversation_events')
        .select(`
          id, tenant_id, conversation_id, contact_id, event_type,
          actor_profile_id, actor_type, message_id,
          from_assigned_to, to_assigned_to,
          team_id, tag_id, tag_name, tag_reason,
          automation_workflow_id, campaign_id, ctwa_lead_id,
          old_value, new_value, details, created_at,
          actor:profiles!smeksh_conversation_events_actor_profile_id_fkey(id, full_name, avatar_url),
          from_agent:profiles!smeksh_conversation_events_from_assigned_to_fkey(id, full_name),
          to_agent:profiles!smeksh_conversation_events_to_assigned_to_fkey(id, full_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEvents((data || []) as unknown as ConversationEvent[]);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Listen for realtime updates
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`events-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'smeksh_conversation_events',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, fetchEvents]);

  const addEvent = useCallback((event: ConversationEvent) => {
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
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Array<{ profile_id: string; full_name?: string }>>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch current typing users & subscribe to changes
  useEffect(() => {
    if (!currentTenant?.id || !conversationId) {
      setTypingUsers([]);
      return;
    }

    const fetchTyping = async () => {
      const { data } = await supabase
        .from('smeksh_typing_state')
        .select('profile_id, status, expires_at, profiles:profiles!smeksh_typing_state_profile_id_fkey(full_name)')
        .eq('conversation_id', conversationId)
        .eq('status', 'typing')
        .gt('expires_at', new Date().toISOString());

      if (data) {
        setTypingUsers(
          data
            .filter(d => d.profile_id !== user?.id)
            .map(d => ({
              profile_id: d.profile_id,
              full_name: (d.profiles as any)?.full_name || undefined,
            }))
        );
      }
    };

    fetchTyping();

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
        () => fetchTyping()
      )
      .subscribe();

    // Clean up expired typing indicators every 5s
    const cleanupInterval = setInterval(fetchTyping, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
    };
  }, [currentTenant?.id, conversationId, user?.id]);

  // Upsert typing state with auto-expire
  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!currentTenant?.id || !conversationId || !user?.id) return;

    // Clear previous stop-typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const expiresAt = new Date(Date.now() + (isTyping ? 10000 : 0)).toISOString();

    await supabase
      .from('smeksh_typing_state')
      .upsert({
        tenant_id: currentTenant.id,
        conversation_id: conversationId,
        profile_id: user.id,
        status: isTyping ? 'typing' : 'stopped',
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'tenant_id,conversation_id,profile_id' })
      .then(() => {});

    // Auto-stop after 8 seconds if no new keystroke
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 8000);
    }
  }, [currentTenant?.id, conversationId, user?.id]);

  return { typingUsers, setTyping };
}
// Removed hardcoded TEAM_MEMBERS and AVAILABLE_TAGS - now fetched from DB

export function useInboxActions() {
  const { currentTenant } = useTenant();
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; full_name: string; avatar_url: string | null }>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string }>>([]);

  // Fetch real team members from agents table
  useEffect(() => {
    if (!currentTenant?.id) return;
    const fetchTeam = async () => {
      const { data } = await supabase
        .from('agents')
        .select('user_id, display_name, profiles!agents_user_id_fkey(full_name, avatar_url)')
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true);
      if (data) {
        setTeamMembers(data.map(a => ({
          id: a.user_id,
          full_name: a.display_name || (a.profiles as any)?.full_name || 'Unknown',
          avatar_url: (a.profiles as any)?.avatar_url || null,
        })));
      }
    };
    fetchTeam();
  }, [currentTenant?.id]);

  // Fetch real tags
  useEffect(() => {
    if (!currentTenant?.id) return;
    const fetchTags = async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name, color')
        .eq('tenant_id', currentTenant.id)
        .order('name');
      if (data) setAvailableTags(data);
    };
    fetchTags();
  }, [currentTenant?.id]);

  // Assign conversation via RPC (admin only, does NOT claim)
  const assignConversation = useCallback(async (conversationId: string, profileId: string | null) => {
    if (!currentTenant?.id) return;
    try {
      if (profileId) {
        const { data, error } = await supabase.rpc('assign_conversation', {
          p_tenant_id: currentTenant.id,
          p_conversation_id: conversationId,
          p_assigned_to: profileId,
        });
        if (error) throw error;
        const result = data as any;
        if (result?.ok === false) {
          toast.error(result.reason === 'forbidden' ? 'You are not a member of this workspace' : 'Failed to assign');
          return;
        }
      } else {
        // Unassign: direct update (also clear claim)
        const { error } = await supabase
          .from('conversations')
          .update({ assigned_to: null, assigned_at: null, claimed_by: null, claimed_at: null, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
        if (error) throw error;
      }
      toast.success(profileId ? 'Conversation assigned' : 'Conversation unassigned');
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err) {
      toast.error('Failed to assign conversation');
    }
  }, [currentTenant?.id]);

  // Transfer conversation via RPC (admin only, optionally resets claim)
  const transferConversation = useCallback(async (conversationId: string, newAssignedTo: string, resetClaim = false) => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase.rpc('transfer_conversation', {
        p_tenant_id: currentTenant.id,
        p_conversation_id: conversationId,
        p_new_assigned_to: newAssignedTo,
        p_reset_claim: resetClaim,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.ok === false) {
        toast.error(result.reason === 'forbidden' ? 'You are not a member of this workspace' : 'Failed to transfer');
        return;
      }
      toast.success('Conversation transferred');
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err) {
      toast.error('Failed to transfer conversation');
    }
  }, [currentTenant?.id]);

  // Claim conversation (atomic, prevents two agents claiming)
  const claimConversation = useCallback(async (conversationId: string) => {
    if (!currentTenant?.id) return false;
    try {
      const { data, error } = await supabase.rpc('claim_conversation', {
        p_tenant_id: currentTenant.id,
        p_conversation_id: conversationId,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.ok) {
        toast.success('Conversation claimed');
        window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
        return true;
      } else {
        toast.error(result?.reason === 'already_claimed' ? 'Already claimed by another agent' : 'Cannot claim');
        return false;
      }
    } catch (err) {
      toast.error('Failed to claim conversation');
      return false;
    }
  }, [currentTenant?.id]);

  // Open conversation (logs open + optional auto-claim)
  const openConversation = useCallback(async (conversationId: string, autoClaim = true) => {
    if (!currentTenant?.id) return;
    try {
      await supabase.rpc('open_conversation', {
        p_tenant_id: currentTenant.id,
        p_conversation_id: conversationId,
        p_auto_claim: autoClaim,
      });
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    } catch (err) {
      console.error('Failed to open conversation:', err);
    }
  }, [currentTenant?.id]);

  // Intervene on another agent's conversation
  const interveneConversation = useCallback(async (conversationId: string) => {
    if (!currentTenant?.id) return false;
    try {
      const { data, error } = await supabase.rpc('intervene_conversation', {
        p_tenant_id: currentTenant.id,
        p_conversation_id: conversationId,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.ok) {
        toast.success('You have taken over this conversation');
        window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
        return true;
      }
      return false;
    } catch (err) {
      toast.error('Failed to intervene');
      return false;
    }
  }, [currentTenant?.id]);

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
    const tag = availableTags.find(t => t.id === tagId);
    if (tag) {
      toast.success(`Tag "${tag.name}" added`);
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
    }
  }, [availableTags]);

  const removeTag = useCallback(async (conversationId: string, tagId: string) => {
    const tag = availableTags.find(t => t.id === tagId);
    toast.success(`Tag "${tag?.name}" removed`);
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
  }, [availableTags]);

  const sendMessage = useCallback(async (conversationId: string, message: { text?: string; template?: string; media?: File }) => {
    if (!message.text?.trim() && !message.template && !message.media) return;
    if (!currentTenant?.id) return;

    // Check phone number status before sending
    const { data: convCheck } = await supabase
      .from('conversations')
      .select('phone_number:phone_numbers(status)')
      .eq('id', conversationId)
      .single();
    
    if ((convCheck?.phone_number as any)?.status === 'disconnected') {
      toast.error('Phone number is disconnected. Please reconnect to send messages.');
      return;
    }

    // Handle media upload
    if (message.media) {
      // Optimistic: show media immediately with local blob URL
      const blobUrl = URL.createObjectURL(message.media);
      const mediaType = message.media.type.startsWith('image/') ? 'image'
        : message.media.type.startsWith('video/') ? 'video'
        : message.media.type.startsWith('audio/') ? 'audio' : 'document';
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMsg: InboxMessage = {
        id: optimisticId,
        tenant_id: currentTenant.id,
        conversation_id: conversationId,
        direction: 'outbound',
        message_type: mediaType,
        body_text: message.text || null,
        media_url: blobUrl,
        payload: {},
        is_failed: false,
        latest_status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      window.dispatchEvent(new CustomEvent('inbox-message', { detail: { conversationId, message: optimisticMsg } }));

      try {
        // Single call: upload + send combined
        const formData = new FormData();
        formData.append('file', message.media);
        formData.append('tenant_id', currentTenant.id);
        formData.append('conversation_id', conversationId);
        if (message.text) formData.append('caption', message.text);

        const { data: result, error: err } = await supabase.functions.invoke('upload-whatsapp-media', {
          body: formData,
        });

        if (err) throw err;
        if (!result?.ok) throw new Error(result?.error || 'Upload failed');

        window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
        return;
      } catch (err: any) {
        console.error('Send media error:', err);
        toast.error(err.message || 'Failed to send media');
        return;
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    }

    // Handle template sends - no text message needed
    if (message.template && !message.text) {
      // Template send is handled by the TemplatePicker directly via send-template-message
      // Just update the conversation
      window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId } }));
      return;
    }

    // Only proceed with text message if we have text
    if (!message.text?.trim()) return;

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
        if (data.code === 'MISSING_MESSAGING_PERMISSION') {
          toast.error('WhatsApp token expired or missing permissions. Please go to Phone Numbers and reconnect your number.', { duration: 8000 });
        } else if (data.code === 'OUTSIDE_24H') {
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
    transferConversation,
    claimConversation,
    openConversation,
    interveneConversation,
    setConversationStatus,
    setInterveneMode,
    snoozeConversation,
    addTag,
    removeTag,
    sendMessage,
    markAsRead,
    teamMembers,
    availableTags,
  };
}
