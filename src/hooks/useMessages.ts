import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { Message } from '@/types/whatsapp';

export function useMessages(conversationId: string | null) {
  const { currentTenant } = useTenant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !currentTenant) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Cast to Message type
      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        metadata: msg.metadata as Record<string, unknown> | null,
        raw: msg.raw as Record<string, unknown> | null,
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentTenant]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
  }, [conversationId]);

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!conversationId || !currentTenant) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            const typedMsg: Message = {
              ...newMsg,
              metadata: newMsg.metadata as Record<string, unknown> | null,
              raw: newMsg.raw as Record<string, unknown> | null,
            };
            setMessages((prev) => [...prev, typedMsg]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            const typedMsg: Message = {
              ...updatedMsg,
              metadata: updatedMsg.metadata as Record<string, unknown> | null,
              raw: updatedMsg.raw as Record<string, unknown> | null,
            };
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === typedMsg.id ? typedMsg : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentTenant]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return {
    messages,
    loading,
    messagesEndRef,
    markAsRead,
    refetch: fetchMessages,
  };
}
