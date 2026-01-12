import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { Conversation, Contact, Message } from '@/types/whatsapp';

export interface ConversationWithDetails extends Omit<Conversation, 'phone_number'> {
  contact?: Contact | null;
  last_message?: Message | null;
  phone_number?: {
    display_number: string;
    verified_name?: string | null;
  } | null;
}

export type ConversationFilter = 'all' | 'open' | 'closed' | 'assigned' | 'unassigned';

export function useConversations(phoneNumberId: string | null) {
  const { currentTenant } = useTenant();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = useCallback(async () => {
    if (!currentTenant) return;

    setLoading(true);
    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          phone_number:phone_numbers(display_number, verified_name)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      // Filter by phone number if selected
      if (phoneNumberId) {
        query = query.eq('phone_number_id', phoneNumberId);
      }

      // Apply status filter
      if (filter === 'open') {
        query = query.eq('status', 'open');
      } else if (filter === 'closed') {
        query = query.eq('status', 'closed');
      } else if (filter === 'assigned') {
        query = query.not('assigned_to', 'is', null);
      } else if (filter === 'unassigned') {
        query = query.is('assigned_to', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get last message for each conversation
      const conversationsWithMessages: ConversationWithDetails[] = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = messages?.[0];
          
          return {
            ...conv,
            last_message: lastMessage ? {
              ...lastMessage,
              metadata: lastMessage.metadata as Record<string, unknown> | null,
              raw: lastMessage.raw as Record<string, unknown> | null,
            } : null,
          } as ConversationWithDetails;
        })
      );

      // Apply search filter
      let filtered = conversationsWithMessages;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = conversationsWithMessages.filter((conv) => {
          const contact = conv.contact;
          return (
            contact?.name?.toLowerCase().includes(query) ||
            contact?.wa_id?.includes(query)
          );
        });
      }

      setConversations(filtered);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant, phoneNumberId, filter, searchQuery]);

  // Set up realtime subscription
  useEffect(() => {
    if (!currentTenant) return;

    const channel = supabase
      .channel('conversations-realtime')
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
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
  }, [currentTenant, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch: fetchConversations,
  };
}
