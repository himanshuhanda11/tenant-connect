import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  User,
  Tag,
  Bot,
  Hand,
  X,
  ChevronDown,
  Zap,
  Phone,
  Eye,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { InboxConversation, InboxMessage, WAStatus, ConversationEvent, STATUS_CONFIG, PRIORITY_CONFIG, ConversationStatus } from '@/types/inbox';
import { cn } from '@/lib/utils';

// New AI components
import { AIReplySuggestions } from './AIReplySuggestions';
import { SLATimer } from './SLATimer';
import { IntentBadge, SentimentBadge } from './IntentBadge';
import { ConversationHealthIndicator, HealthDot } from './ConversationHealthIndicator';

interface InboxChatThreadProps {
  conversation: InboxConversation | null;
  messages: InboxMessage[];
  events: ConversationEvent[];
  typingUsers: Array<{ profile_id: string; full_name?: string }>;
  onSendMessage: (message: { text?: string; template?: string; media?: File }) => void;
  onAssign: (profileId: string | null) => void;
  onSetStatus: (status: ConversationStatus) => void;
  onSetIntervene: (intervene: boolean) => void;
  onAddTag: (tagId: string) => void;
  loading?: boolean;
  availableTags?: Array<{ id: string; name: string; color: string }>;
  teamMembers?: Array<{ id: string; full_name: string; avatar_url: string | null }>;
  isSupervisorMode?: boolean;
}

const STATUS_ICONS: Record<WAStatus, React.ReactNode> = {
  sent: <Check className="h-3 w-3 text-muted-foreground" />,
  delivered: <CheckCheck className="h-3 w-3 text-muted-foreground" />,
  read: <CheckCheck className="h-3 w-3 text-blue-500" />,
  failed: <AlertCircle className="h-3 w-3 text-red-500" />,
};

export function InboxChatThread({
  conversation,
  messages,
  events,
  typingUsers,
  onSendMessage,
  onAssign,
  onSetStatus,
  onSetIntervene,
  onAddTag,
  loading,
  availableTags = [],
  teamMembers = [],
  isSupervisorMode = false,
}: InboxChatThreadProps) {
  const [messageText, setMessageText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiIntent, setAiIntent] = useState<'sales' | 'support' | 'complaint' | 'inquiry' | 'urgent' | 'spam'>('inquiry');
  const [aiHealth, setAiHealth] = useState<'good' | 'warning' | 'critical'>('good');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if outside 24h window
  const isOutside24hWindow = conversation?.last_inbound_at
    ? differenceInHours(new Date(), new Date(conversation.last_inbound_at)) > 24
    : true;

  const handleSend = () => {
    if (!messageText.trim()) return;
    onSendMessage({ text: messageText });
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Merge messages and events for timeline
  const timelineItems = [
    ...messages.map(m => ({ type: 'message' as const, data: m, time: new Date(m.created_at) })),
    ...events.map(e => ({ type: 'event' as const, data: e, time: new Date(e.created_at) })),
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Phone className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a conversation from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 border-b px-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(conversation.contact?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {conversation.contact?.name || conversation.contact?.wa_id}
              </h3>
              <Badge 
                variant="outline" 
                className={cn("text-xs", STATUS_CONFIG[conversation.status].bgColor, STATUS_CONFIG[conversation.status].color, "border-0")}
              >
                {STATUS_CONFIG[conversation.status].label}
              </Badge>
              {conversation.is_intervened && (
                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-0">
                  <Hand className="h-3 w-3 mr-1" />
                  Bot Paused
                </Badge>
              )}
              {/* AI Intent Badge */}
              <IntentBadge intent={aiIntent} />
              {/* Health Indicator */}
              <HealthDot health={aiHealth} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>+{conversation.contact?.wa_id}</span>
              {conversation.assigned_agent && (
                <> • Assigned to {conversation.assigned_agent.full_name}</>
              )}
              {/* SLA Timer */}
              <SLATimer
                firstResponseDue={conversation.sla_first_response_due}
                firstResponseAt={conversation.first_response_at}
                slaBreached={conversation.sla_breached}
                createdAt={conversation.created_at}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Supervisor Mode Indicator */}
          {isSupervisorMode && (
            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-0">
              <Eye className="h-3 w-3 mr-1" />
              Watching
            </Badge>
          )}
          {/* Tags with dropdown */}
          <div className="flex items-center gap-1">
            {conversation.tags?.slice(0, 3).map(tag => (
              <Badge 
                key={tag.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {/* Tag Picker Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Tag className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Add Tag
                </div>
                {availableTags
                  .filter(tag => !conversation.tags?.some(t => t.id === tag.id))
                  .map(tag => (
                    <DropdownMenuItem 
                      key={tag.id} 
                      onClick={() => onAddTag(tag.id)}
                    >
                      <span 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </DropdownMenuItem>
                  ))}
                {availableTags.filter(tag => !conversation.tags?.some(t => t.id === tag.id)).length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    All tags applied
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Intervene Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={conversation.is_intervened ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => onSetIntervene(!conversation.is_intervened)}
              >
                {conversation.is_intervened ? (
                  <>
                    <Bot className="h-4 w-4 mr-1" />
                    Resume Bot
                  </>
                ) : (
                  <>
                    <Hand className="h-4 w-4 mr-1" />
                    Take Over
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {conversation.is_intervened ? 'Resume automation' : 'Pause automation and take over'}
            </TooltipContent>
          </Tooltip>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {STATUS_CONFIG[conversation.status].label}
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSetStatus('open')}>
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetStatus('pending')}>
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetStatus('closed')}>
                <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Actions with Team Assignment */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Assignment
              </div>
              <DropdownMenuItem onClick={() => onAssign('u1')}>
                <User className="h-4 w-4 mr-2" />
                Assign to me
              </DropdownMenuItem>
              {teamMembers.map(member => (
                <DropdownMenuItem 
                  key={member.id} 
                  onClick={() => onAssign(member.id)}
                  className={conversation.assigned_to === member.id ? 'bg-muted' : ''}
                >
                  <User className="h-4 w-4 mr-2" />
                  {member.full_name}
                  {conversation.assigned_to === member.id && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => onAssign(null)}>
                <X className="h-4 w-4 mr-2" />
                Unassign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Clock className="h-4 w-4 mr-2" />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Zap className="h-4 w-4 mr-2" />
                Run automation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 24h Window Warning */}
      {isOutside24hWindow && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <span>Outside 24-hour window. Only approved templates can be sent.</span>
          <Button variant="link" size="sm" className="text-amber-800 p-0 h-auto" onClick={() => setShowTemplates(true)}>
            Use template
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {timelineItems.map((item, index) => {
            if (item.type === 'event') {
              const event = item.data as ConversationEvent;
              return (
                <div key={event.id} className="flex items-center justify-center gap-2 py-2">
                  <div className="flex-1 border-t border-dashed" />
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {event.event_type === 'assigned' && (
                      <>Assigned to {event.actor?.full_name}</>
                    )}
                    {event.event_type === 'tag_added' && (
                      <>Tag "{event.tag_name}" added by {event.actor?.full_name}</>
                    )}
                    {event.event_type === 'intervened' && (
                      <>{event.actor?.full_name} took over the conversation</>
                    )}
                  </span>
                  <div className="flex-1 border-t border-dashed" />
                </div>
              );
            }

            const message = item.data as InboxMessage;
            const isOutbound = message.direction === 'outbound';

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  isOutbound ? "justify-end" : "justify-start"
                )}
              >
                {!isOutbound && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(conversation.contact?.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "max-w-[70%] space-y-1",
                  isOutbound && "items-end"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2",
                    isOutbound 
                      ? "bg-primary text-primary-foreground rounded-br-md" 
                      : "bg-muted rounded-bl-md"
                  )}>
                    {/* Media */}
                    {message.message_type === 'image' && message.media_url && (
                      <img 
                        src={message.media_url} 
                        alt="Shared image" 
                        className="rounded-lg max-w-full mb-2"
                      />
                    )}
                    
                    {/* Text */}
                    {message.body_text && (
                      <p className="text-sm whitespace-pre-wrap">{message.body_text}</p>
                    )}

                    {/* Template indicator */}
                    {message.message_type === 'template' && (
                      <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                        <FileText className="h-3 w-3" />
                        Template: {message.template_name}
                      </div>
                    )}
                  </div>

                  {/* Timestamp + Status */}
                  <div className={cn(
                    "flex items-center gap-1 text-xs text-muted-foreground",
                    isOutbound && "justify-end"
                  )}>
                    <span>{format(new Date(message.created_at), 'h:mm a')}</span>
                    {isOutbound && message.latest_status && STATUS_ICONS[message.latest_status]}
                    {isOutbound && message.sender?.full_name && (
                      <span>• {message.sender.full_name}</span>
                    )}
                  </div>
                </div>

                {isOutbound && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(message.sender?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {typingUsers[0].full_name} is typing...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* AI Reply Suggestions */}
      {!isSupervisorMode && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <AIReplySuggestions
            messages={messages}
            onSelectSuggestion={(text) => setMessageText(text)}
            isPro={true}
          />
        </div>
      )}

      {/* Composer */}
      <div className="border-t p-4 bg-card">
        <div className="max-w-3xl mx-auto">
          {isSupervisorMode ? (
            <div className="text-center py-4 text-muted-foreground">
              <Eye className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Supervisor mode - viewing only</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder={isOutside24hWindow ? "Select a template to send..." : "Type a message..."}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isOutside24hWindow}
                    className="min-h-[44px] max-h-32 resize-none pr-20"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setShowTemplates(true)}>
                  <FileText className="h-4 w-4" />
                </Button>

                <Button 
                  size="icon" 
                  className="h-11 w-11" 
                  onClick={handleSend}
                  disabled={!messageText.trim() && !isOutside24hWindow}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Replies */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Quick:</span>
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setMessageText("Thank you for reaching out!")}>
                  Thanks
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setMessageText("I'll look into this and get back to you shortly.")}>
                  Looking into it
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setMessageText("Is there anything else I can help you with?")}>
                  Anything else?
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
