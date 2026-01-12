import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, Loader2, Check, CheckCheck, Clock, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation, Message, Contact, MessageStatus } from '@/types/whatsapp';

interface ConversationWithDetails extends Conversation {
  contact: Contact;
  messages?: Message[];
}

export default function Inbox() {
  const { currentTenant } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTenant) {
      fetchConversations();
      setupRealtimeSubscription();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [currentTenant]);

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        selectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setupRealtimeSubscription = () => {
    if (!currentTenant) return;

    // Subscribe to conversation updates
    const conversationChannel = supabase
      .channel('conversations-changes')
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

    // Subscribe to message updates
    const messageChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages((prev) => [...prev, newMessage]);
          }
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  };

  const fetchConversations = async () => {
    if (!currentTenant) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*)
        `)
        .eq('tenant_id', currentTenant.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setConversations((data || []) as ConversationWithDetails[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    setSearchParams({ conversation: conversation.id });
    setMessagesLoading(true);

    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((messagesData || []) as Message[]);

      // Mark as read (reset unread count)
      if (conversation.unread_count > 0) {
        await supabase
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', conversation.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !messageText.trim() || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-message', {
        body: {
          conversation_id: selectedConversation.id,
          type: 'text',
          text: messageText.trim(),
        },
      });

      if (error) throw error;

      if (data.success) {
        setMessageText('');
        // Message will appear via realtime subscription
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name?: string, waId?: string) => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return waId?.slice(-2) || '??';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.contact?.name?.toLowerCase().includes(query) ||
      conv.contact?.wa_id.includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Conversation List */}
        <div className="w-80 flex flex-col border rounded-lg bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-3">Inbox</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-4">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <p>No conversations matching "{searchQuery}"</p>
                ) : (
                  <>
                    <p>No conversations yet</p>
                    <p className="text-sm">Messages will appear here</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={cn(
                      'w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left',
                      selectedConversation?.id === conv.id && 'bg-muted'
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.contact?.profile_picture_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(conv.contact?.name, conv.contact?.wa_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {conv.contact?.name || `+${conv.contact?.wa_id}`}
                        </span>
                        {conv.last_message_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground truncate">
                          {conv.status === 'open' ? 'Active' : 'Closed'}
                        </span>
                        {conv.unread_count > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 px-1.5">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col border rounded-lg bg-card">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.contact?.profile_picture_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedConversation.contact?.name, selectedConversation.contact?.wa_id)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedConversation.contact?.name || `+${selectedConversation.contact?.wa_id}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +{selectedConversation.contact?.wa_id}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-4 py-2',
                            msg.direction === 'outbound'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                          {msg.media_url && (
                            <p className="text-sm italic">
                              [{msg.type} attachment]
                            </p>
                          )}
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1 text-xs',
                              msg.direction === 'outbound'
                                ? 'text-primary-foreground/70 justify-end'
                                : 'text-muted-foreground'
                            )}
                          >
                            <span>{formatTime(msg.created_at)}</span>
                            {msg.direction === 'outbound' && getStatusIcon(msg.status)}
                          </div>
                          {msg.status === 'failed' && msg.error_message && (
                            <p className="text-xs text-destructive mt-1">
                              {msg.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[44px] max-h-32 resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    size="icon"
                    className="h-11 w-11"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
