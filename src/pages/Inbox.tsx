import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Loader2,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Search,
  Phone,
  User,
  MoreVertical,
  Paperclip,
  Smile,
  FileText,
  X,
  AlertTriangle,
  Tag,
  UserPlus,
  Image,
  Play,
  Music,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';
import type { Conversation, Message, Contact, MessageStatus, PhoneNumber } from '@/types/whatsapp';

interface ConversationWithDetails extends Conversation {
  contact?: Contact | null;
  last_message?: Message | null;
  phone_number?: { display_number: string; verified_name?: string | null } | null;
}

interface ConversationNote {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

type ConversationFilter = 'all' | 'open' | 'closed' | 'assigned' | 'unassigned';

export default function Inbox() {
  const { currentTenant } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  
  // Conversations
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Contact panel
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [notes, setNotes] = useState<ConversationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  
  // Message input
  const [messageText, setMessageText] = useState('');

  // Fetch phone numbers
  useEffect(() => {
    if (currentTenant) {
      fetchPhoneNumbers();
    }
  }, [currentTenant]);

  // Fetch conversations when phone/filter changes
  useEffect(() => {
    if (currentTenant) {
      fetchConversations();
    }
  }, [currentTenant, selectedPhoneId, filter]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!currentTenant) return;

    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
              setMessages((prev) => [...prev, {
                ...newMsg,
                metadata: newMsg.metadata as Record<string, unknown> | null,
                raw: newMsg.raw as Record<string, unknown> | null,
              }]);
            }
            fetchConversations();
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as any;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updatedMsg.id
                  ? { ...updatedMsg, metadata: updatedMsg.metadata as Record<string, unknown> | null, raw: updatedMsg.raw as Record<string, unknown> | null }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant, selectedConversation]);

  // Auto-select conversation from URL
  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (convId && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find((c) => c.id === convId);
      if (conv) handleSelectConversation(conv);
    }
  }, [searchParams, conversations]);

  const fetchPhoneNumbers = async () => {
    if (!currentTenant) return;
    
    const { data } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('tenant_id', currentTenant.id)
      .eq('status', 'connected');
    
    setPhoneNumbers((data || []) as PhoneNumber[]);
  };

  const fetchConversations = async () => {
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

      if (selectedPhoneId) {
        query = query.eq('phone_number_id', selectedPhoneId);
      }

      if (filter === 'open') query = query.eq('status', 'open');
      else if (filter === 'closed') query = query.eq('status', 'closed');
      else if (filter === 'assigned') query = query.not('assigned_to', 'is', null);
      else if (filter === 'unassigned') query = query.is('assigned_to', null);

      const { data, error } = await query;
      if (error) throw error;

      // Get last message for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMsg = msgs?.[0];
          return {
            ...conv,
            last_message: lastMsg ? {
              ...lastMsg,
              metadata: lastMsg.metadata as Record<string, unknown> | null,
              raw: lastMsg.raw as Record<string, unknown> | null,
            } : null,
          } as ConversationWithDetails;
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv: ConversationWithDetails) => {
    setSelectedConversation(conv);
    setSearchParams({ conversation: conv.id });
    setMessagesLoading(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages((data || []).map(m => ({
        ...m,
        metadata: m.metadata as Record<string, unknown> | null,
        raw: m.raw as Record<string, unknown> | null,
      })));

      // Mark as read
      if (conv.unread_count > 0) {
        await supabase
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', conv.id);
      }

      // Fetch notes
      fetchNotes(conv.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchNotes = async (conversationId: string) => {
    const { data } = await supabase
      .from('conversation_notes')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });
    
    setNotes((data || []) as ConversationNote[]);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedConversation || !currentTenant) return;

    setSavingNote(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { error } = await supabase.from('conversation_notes').insert({
        tenant_id: currentTenant.id,
        conversation_id: selectedConversation.id,
        user_id: user.user.id,
        content: newNote.trim(),
      });

      if (error) throw error;

      setNewNote('');
      fetchNotes(selectedConversation.id);
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  const isOutside24HourWindow = () => {
    if (!selectedConversation?.last_inbound_at) return true;
    return differenceInHours(new Date(), new Date(selectedConversation.last_inbound_at)) > 24;
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
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name?: string | null, waId?: string) => {
    if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    return waId?.slice(-2) || '??';
  };

  const getMessagePreview = (conv: ConversationWithDetails) => {
    const msg = conv.last_message;
    if (!msg) return 'No messages yet';
    if (msg.type !== 'text') {
      const labels: Record<string, string> = {
        image: '📷 Photo', video: '🎥 Video', audio: '🎵 Audio',
        document: '📄 Document', sticker: '🎨 Sticker', location: '📍 Location',
      };
      return labels[msg.type] || '📎 Attachment';
    }
    return msg.text?.slice(0, 40) + (msg.text && msg.text.length > 40 ? '...' : '') || '';
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'sent': return <Check className="h-3 w-3" />;
      case 'delivered': return <CheckCheck className="h-3 w-3" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-destructive" />;
      default: return null;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return conv.contact?.name?.toLowerCase().includes(q) || conv.contact?.wa_id?.includes(q);
  });

  const filterButtons: { value: ConversationFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'unassigned', label: 'Unassigned' },
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-5.5rem)] flex -m-6">
        {/* Column 1: Conversation List */}
        <div className="w-80 border-r flex flex-col bg-background">
          {/* Header with phone selector */}
          <div className="p-3 border-b space-y-3">
            <Select
              value={selectedPhoneId || 'all'}
              onValueChange={(v) => setSelectedPhoneId(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Numbers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Numbers</SelectItem>
                {phoneNumbers.map((phone) => (
                  <SelectItem key={phone.id} value={phone.id}>
                    {phone.display_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filters */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {filterButtons.map((f) => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-3 text-xs whitespace-nowrap"
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-2" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-colors hover:bg-accent',
                      selectedConversation?.id === conv.id && 'bg-accent'
                    )}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={conv.contact?.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(conv.contact?.name, conv.contact?.wa_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">
                            {conv.contact?.name || conv.contact?.wa_id}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {conv.last_message_at &&
                              formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message?.direction === 'outbound' && <span className="mr-1">You:</span>}
                            {getMessagePreview(conv)}
                          </p>
                          {conv.unread_count > 0 && (
                            <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Column 2: Chat Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.contact?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(selectedConversation.contact?.name, selectedConversation.contact?.wa_id)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedConversation.contact?.name || selectedConversation.contact?.wa_id}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedConversation.contact?.wa_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Unassigned</DropdownMenuItem>
                      <DropdownMenuItem>Assign to me</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={() => setShowContactPanel(!showContactPanel)}>
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn('flex w-full', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            msg.direction === 'outbound'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          )}
                        >
                          {msg.type !== 'text' && msg.media_url && (
                            <div className="flex items-center gap-2 p-2 bg-background/10 rounded mb-1">
                              {msg.type === 'image' && <Image className="h-4 w-4" />}
                              {msg.type === 'video' && <Play className="h-4 w-4" />}
                              {msg.type === 'audio' && <Music className="h-4 w-4" />}
                              {msg.type === 'document' && <FileText className="h-4 w-4" />}
                              <span className="text-sm capitalize">{msg.type}</span>
                            </div>
                          )}
                          {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                          <div
                            className={cn(
                              'flex items-center justify-end gap-1 mt-1',
                              msg.direction === 'outbound' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}
                          >
                            <span className="text-xs">{format(new Date(msg.created_at), 'HH:mm')}</span>
                            {msg.direction === 'outbound' && getStatusIcon(msg.status)}
                          </div>
                          {msg.status === 'failed' && msg.error_message && (
                            <div className="mt-1 text-xs text-destructive">{msg.error_message}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Composer */}
              <div className="border-t bg-background">
                {isOutside24HourWindow() && (
                  <Alert variant="destructive" className="mx-4 mt-4 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      24-hour window expired. Use a template to re-engage.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="p-4 flex items-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Smile className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Emoji</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Textarea
                    placeholder={isOutside24HourWindow() ? 'Use template to re-engage...' : 'Type a message...'}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isOutside24HourWindow()}
                    className="min-h-[40px] max-h-32 resize-none flex-1"
                    rows={1}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast.info('Template picker coming soon')}>
                          <FileText className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send template</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending || isOutside24HourWindow()}
                    size="icon"
                    className="h-9 w-9"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mb-4" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm">Choose from the list to start messaging</p>
            </div>
          )}
        </div>

        {/* Column 3: Contact Panel */}
        {showContactPanel && selectedConversation && (
          <div className="w-80 border-l flex flex-col bg-background">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Contact Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowContactPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Contact info */}
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={selectedConversation.contact?.profile_picture_url || undefined} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(selectedConversation.contact?.name, selectedConversation.contact?.wa_id)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-lg">
                    {selectedConversation.contact?.name || 'Unknown'}
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedConversation.contact?.wa_id}</p>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Details</h5>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedConversation.contact?.wa_id}</span>
                  </div>
                  {selectedConversation.contact?.last_seen && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Last seen: {format(new Date(selectedConversation.contact.last_seen), 'MMM d, HH:mm')}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Tags</h5>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Tag className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">New Lead</Badge>
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Internal Notes</h5>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                    />
                    <Button size="sm" onClick={addNote} disabled={!newNote.trim() || savingNote}>
                      {savingNote && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                      Add Note
                    </Button>
                  </div>
                  {notes.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-2 bg-muted rounded-lg text-sm">
                          <p className="text-muted-foreground text-xs mb-1">
                            {format(new Date(note.created_at), 'MMM d, HH:mm')}
                          </p>
                          <p>{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
