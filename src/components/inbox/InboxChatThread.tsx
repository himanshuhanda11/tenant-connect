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
  ArrowLeft,
  Info,
  Camera,
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
  isMobile?: boolean;
  onBack?: () => void;
  onShowInfo?: () => void;
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
  isMobile = false,
  onBack,
  onShowInfo,
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
      <div className={cn(
        "flex-1 flex items-center justify-center",
        isMobile ? "bg-background" : "bg-muted/30"
      )}>
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
      {/* Header - WhatsApp Style */}
      <div className={cn(
        "border-b flex items-center justify-between bg-primary text-primary-foreground",
        isMobile ? "h-14 px-2" : "h-16 px-4"
      )}>
        <div className="flex items-center gap-2">
          {/* Back button for mobile */}
          {isMobile && onBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="h-9 w-9 text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <Avatar className={cn(
            "border-2 border-white/20",
            isMobile ? "h-9 w-9" : "h-10 w-10"
          )}>
            <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
            <AvatarFallback className="bg-white/20 text-primary-foreground">
              {getInitials(conversation.contact?.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold truncate",
                isMobile ? "text-sm max-w-[120px]" : ""
              )}>
                {conversation.contact?.name || conversation.contact?.wa_id}
              </h3>
              {!isMobile && (
                <>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs border-0 bg-white/20 text-primary-foreground")}
                  >
                    {STATUS_CONFIG[conversation.status].label}
                  </Badge>
                  {conversation.is_intervened && (
                    <Badge variant="outline" className="text-xs bg-amber-400 text-amber-900 border-0">
                      <Hand className="h-3 w-3 mr-1" />
                      Bot Paused
                    </Badge>
                  )}
                  <IntentBadge intent={aiIntent} />
                  <HealthDot health={aiHealth} />
                </>
              )}
            </div>
            <div className={cn(
              "text-xs text-primary-foreground/70",
              isMobile ? "text-[10px]" : "flex items-center gap-2"
            )}>
              {isMobile ? (
                <span>tap for contact info</span>
              ) : (
                <>
                  <span>+{conversation.contact?.wa_id}</span>
                  {conversation.assigned_agent && (
                    <> • Assigned to {conversation.assigned_agent.full_name}</>
                  )}
                  <SLATimer
                    firstResponseDue={conversation.sla_first_response_due}
                    firstResponseAt={conversation.first_response_at}
                    slaBreached={conversation.sla_breached}
                    createdAt={conversation.created_at}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile: Info button */}
          {isMobile && onShowInfo && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onShowInfo}
              className="h-9 w-9 text-primary-foreground hover:bg-white/10"
            >
              <Info className="h-5 w-5" />
            </Button>
          )}
          
          {/* Desktop controls */}
          {!isMobile && (
            <>
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
            </>
          )}
          
          {/* Mobile: More menu */}
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-primary-foreground hover:bg-white/10"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSetStatus('open')}>
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  Mark as Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetStatus('pending')}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetStatus('closed')}>
                  <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                  Close
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSetIntervene(!conversation.is_intervened)}>
                  {conversation.is_intervened ? (
                    <><Bot className="h-4 w-4 mr-2" /> Resume Bot</>
                  ) : (
                    <><Hand className="h-4 w-4 mr-2" /> Take Over</>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 24h Window Warning */}
      {isOutside24hWindow && (
        <div className={cn(
          "bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-amber-800",
          isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{isMobile ? "24h window closed. Use template." : "Outside 24-hour window. Only approved templates can be sent."}</span>
          <Button variant="link" size="sm" className="text-amber-800 p-0 h-auto" onClick={() => setShowTemplates(true)}>
            Template
          </Button>
        </div>
      )}

      {/* Messages Area - WhatsApp style background */}
      <ScrollArea 
        className={cn(
          "flex-1 bg-[#e5ddd5]",
          isMobile ? "p-2" : "p-4"
        )} 
        ref={scrollRef}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8bfb6\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <div className={cn(
          "space-y-3",
          isMobile ? "max-w-full" : "max-w-3xl mx-auto space-y-4"
        )}>
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

      {/* AI Reply Suggestions - hide on mobile for cleaner look */}
      {!isSupervisorMode && !isMobile && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <AIReplySuggestions
            messages={messages}
            onSelectSuggestion={(text) => setMessageText(text)}
            isPro={true}
          />
        </div>
      )}

      {/* Composer - WhatsApp style */}
      <div className={cn(
        "border-t bg-card",
        isMobile ? "p-2" : "p-4"
      )}>
        <div className={cn(
          isMobile ? "" : "max-w-3xl mx-auto"
        )}>
          {isSupervisorMode ? (
            <div className="text-center py-4 text-muted-foreground">
              <Eye className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Supervisor mode - viewing only</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                {/* Mobile: Attachment button */}
                {isMobile && (
                  <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                )}
                
                <div className="flex-1 relative">
                  <Textarea
                    placeholder={isOutside24hWindow ? "Select template..." : "Type a message"}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isOutside24hWindow}
                    className={cn(
                      "resize-none",
                      isMobile 
                        ? "min-h-[40px] max-h-24 pr-12 rounded-full py-2 px-4" 
                        : "min-h-[44px] max-h-32 pr-20"
                    )}
                    rows={1}
                  />
                  <div className={cn(
                    "absolute bottom-1 flex items-center gap-1",
                    isMobile ? "right-1" : "right-2 bottom-2"
                  )}>
                    <Button variant="ghost" size="icon" className={cn(isMobile ? "h-8 w-8" : "h-7 w-7")}>
                      <Smile className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                    </Button>
                    {!isMobile && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Template button */}
                {!isMobile && (
                  <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setShowTemplates(true)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                )}

                {/* Send button - WhatsApp green circle on mobile */}
                <Button 
                  size="icon" 
                  className={cn(
                    isMobile 
                      ? "h-10 w-10 rounded-full bg-primary hover:bg-primary/90" 
                      : "h-11 w-11"
                  )}
                  onClick={handleSend}
                  disabled={!messageText.trim() && !isOutside24hWindow}
                >
                  {messageText.trim() ? (
                    <Send className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                  ) : (
                    <Mic className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                  )}
                </Button>
              </div>

              {/* Quick Replies - desktop only */}
              {!isMobile && (
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
