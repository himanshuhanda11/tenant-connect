import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  UserX,
  Camera,
  Sparkles,
  File,
  MessageSquare,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { InboxConversation, InboxMessage, WAStatus, ConversationEvent, STATUS_CONFIG, PRIORITY_CONFIG, ConversationStatus } from '@/types/inbox';
import { cn } from '@/lib/utils';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';

// Assets
import inboxEmptyChat from '@/assets/inbox-empty-chat.png';
import inboxAiAssistant from '@/assets/inbox-ai-assistant.png';
import inboxDisconnected from '@/assets/inbox-disconnected.png';
import inboxSupervisor from '@/assets/inbox-supervisor.png';

// New AI components
import { AIReplySuggestions } from './AIReplySuggestions';
import { SLATimer } from './SLATimer';
import { TemplatePicker } from './TemplatePicker';
import { IntentBadge, SentimentBadge } from './IntentBadge';
import { MessageMedia } from './media/MessageMedia';
import { ConversationHealthIndicator, HealthDot } from './ConversationHealthIndicator';
import { QuickReplyManager } from './QuickReplyManager';

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
  onClaim?: () => void;
  onIntervene?: () => void;
  onTyping?: (isTyping: boolean) => void;
  loading?: boolean;
  availableTags?: Array<{ id: string; name: string; color: string }>;
  teamMembers?: Array<{ id: string; full_name: string; avatar_url: string | null }>;
  isSupervisorMode?: boolean;
  isMobile?: boolean;
  onBack?: () => void;
  onShowInfo?: () => void;
  viewerName?: string | null;
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
  onClaim,
  onIntervene,
  onTyping,
  loading,
  availableTags = [],
  teamMembers = [],
  isSupervisorMode = false,
  isMobile = false,
  onBack,
  onShowInfo,
  viewerName,
}: InboxChatThreadProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiIntent, setAiIntent] = useState<'sales' | 'support' | 'complaint' | 'inquiry' | 'urgent' | 'spam'>('inquiry');
  const [aiHealth, setAiHealth] = useState<'good' | 'warning' | 'critical'>('good');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessageCount = useRef(0);

  // Scroll to bottom — works with Radix ScrollArea viewport
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      // Find the Radix ScrollArea viewport (the actual scrollable container)
      const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant',
        });
      }
    });
  }, []);

  // Scroll instantly on conversation switch (messages replaced)
  useEffect(() => {
    if (messages.length > 0 && prevMessageCount.current === 0) {
      // Conversation just loaded — instant scroll
      scrollToBottom(false);
    } else if (messages.length > prevMessageCount.current) {
      // New message arrived — smooth scroll
      scrollToBottom(true);
    }
    prevMessageCount.current = messages.length;
  }, [messages, scrollToBottom]);

  // Check if phone number is disconnected
  const isPhoneDisconnected = conversation?.phone_number_status === 'disconnected';

  // Check if outside 24h window
  const isOutside24hWindow = !isPhoneDisconnected && (conversation?.last_inbound_at
    ? differenceInHours(new Date(), new Date(conversation.last_inbound_at)) > 24
    : true);

  const handleSend = () => {
    if (!messageText.trim()) return;
    onSendMessage({ text: messageText });
    setMessageText('');
    onTyping?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 16MB for WhatsApp)
      if (file.size > 16 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 16MB.');
        return;
      }
      onSendMessage({ media: file });
      toast.success(`Sending ${file.name}...`);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachmentClick = (accept?: string, capture?: boolean) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx';
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
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
        isMobile ? "bg-background" : "bg-muted/10"
      )}>
        <div className="text-center max-w-xs">
          <img 
            src={inboxEmptyChat} 
            alt="Select a conversation" 
            className="w-44 h-44 mx-auto mb-6 drop-shadow-lg" 
            loading="lazy"
            decoding="async"
          />
          <h3 className="text-xl font-semibold text-foreground mb-2">Start a Conversation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select a chat from the list to view messages and start replying to your customers.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Real-time</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Zap className="h-3.5 w-3.5" />
              <span>Instant</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden">
      {/* Header - Premium Glassmorphism Design */}
      <div className="border-b border-border/60 bg-card/90 backdrop-blur-md shadow-sm">
        {/* Row 1: Contact Info */}
        <div className={cn(
          "flex items-center justify-between",
          isMobile ? "h-16 px-3" : "h-16 px-5"
        )}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Back button for mobile */}
            {isMobile && onBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="h-9 w-9 text-gray-600 hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <Avatar className={cn(
                "border-2 border-primary/20 ring-2 ring-primary/10",
                isMobile ? "h-10 w-10" : "h-11 w-11"
              )}>
                <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-semibold">
                  {getInitials(conversation.contact?.name)}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-semibold text-gray-900 truncate",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {conversation.contact?.name || conversation.contact?.wa_id}
                </h3>
                {!isMobile && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-medium",
                      conversation.status === 'open' && "bg-green-50 text-green-700 border-green-200",
                      conversation.status === 'pending' && "bg-amber-50 text-amber-700 border-amber-200",
                      conversation.status === 'closed' && "bg-gray-50 text-gray-600 border-gray-200"
                    )}
                  >
                    {STATUS_CONFIG[conversation.status].label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-3 w-3" />
                <span className="truncate">+{conversation.contact?.wa_id}</span>
                {!isMobile && conversation.assigned_agent && (
                  <>
                    <span className="text-gray-300">•</span>
                    <User className="h-3 w-3" />
                    <span>{conversation.assigned_agent.full_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Call button */}
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-primary hover:bg-primary/5">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call contact</TooltipContent>
              </Tooltip>
            )}
            
            {isMobile && onShowInfo && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onShowInfo}
                className="h-9 w-9 text-gray-500 hover:bg-gray-100"
              >
                <Info className="h-5 w-5" />
              </Button>
            )}
            
            {isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-gray-500 hover:bg-gray-100"
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowTemplates(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Send Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Assignment</div>
                  <DropdownMenuItem onClick={() => user?.id && onAssign(user.id)}>
                    <User className="h-4 w-4 mr-2" /> Assign to me
                  </DropdownMenuItem>
                  {teamMembers.map(member => (
                    <DropdownMenuItem 
                      key={member.id} 
                      onClick={() => onAssign(member.id)}
                      className={conversation.assigned_to === member.id ? 'bg-muted' : ''}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {member.full_name}
                      {conversation.assigned_to === member.id && <Check className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={() => onAssign(null)}>
                    <X className="h-4 w-4 mr-2" /> Unassign
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><Clock className="h-4 w-4 mr-2" /> Snooze</DropdownMenuItem>
                  <DropdownMenuItem><Zap className="h-4 w-4 mr-2" /> Run automation</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Row 2: Status Bar with badges and actions (Desktop only) */}
        {!isMobile && (
          <div className="h-11 px-5 flex items-center gap-3 bg-muted/40 backdrop-blur-sm border-t border-border/40 overflow-x-auto">
            {/* AI Intent & Health */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
              <IntentBadge intent={aiIntent} />
              <HealthDot health={aiHealth} />
            </div>
            
            {/* Bot Paused Badge */}
            {conversation.is_intervened && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                <Hand className="h-3 w-3 mr-1" />
                Bot Paused
              </Badge>
            )}
            
            {/* Supervisor Badge */}
            {isSupervisorMode && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                <Eye className="h-3 w-3 mr-1" />
                Watching
              </Badge>
            )}
            
            {/* SLA Timer */}
            <SLATimer
              firstResponseDue={conversation.sla_first_response_due}
              firstResponseAt={conversation.first_response_at}
              slaBreached={conversation.sla_breached}
              createdAt={conversation.created_at}
            />
            
            <div className="flex-1" />
            
            {/* Tags */}
            <div className="flex items-center gap-1.5">
              {conversation.tags?.slice(0, 3).map(tag => (
                <Badge 
                  key={tag.id}
                  variant="outline"
                  className="text-xs font-medium"
                  style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}30` }}
                >
                  {tag.name}
                </Badge>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                    <Tag className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Add Tag</div>
                  {availableTags
                    .filter(tag => !conversation.tags?.some(t => t.id === tag.id))
                    .map(tag => (
                      <DropdownMenuItem key={tag.id} onClick={() => onAddTag(tag.id)}>
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="h-5 w-px bg-gray-200" />
            
            {/* Intervene Toggle */}
            <Button 
              variant={conversation.is_intervened ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs gap-1",
                conversation.is_intervened 
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={() => onSetIntervene(!conversation.is_intervened)}
            >
              {conversation.is_intervened ? (
                <><Bot className="h-3.5 w-3.5" /> Resume Bot</>
              ) : (
                <><Hand className="h-3.5 w-3.5" /> Take Over</>
              )}
            </Button>
            
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-gray-200">
                  Status <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSetStatus('open')}>
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetStatus('pending')}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" /> Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetStatus('closed')}>
                  <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" /> Close
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Viewer Presence Banner */}
      {viewerName && (
        <div className="bg-muted/60 border-b border-border/40 flex items-center gap-2 px-4 py-1.5">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">{viewerName} is viewing this chat</span>
        </div>
      )}

      {/* Claim / Intervene Banner */}
      {!conversation.assigned_to && onClaim && (
        <div className="bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-blue-800 px-4 py-2.5">
          <UserX className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">This conversation is unassigned</span>
          <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={onClaim}>
            <Hand className="h-3.5 w-3.5 mr-1" /> Claim
          </Button>
        </div>
      )}
      {conversation.assigned_to && conversation.assigned_to !== user?.id && onIntervene && (
        <div className="bg-purple-50 border-b border-purple-200 flex items-center gap-2 text-purple-800 px-4 py-2.5">
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-sm">
            Assigned to <strong>{conversation.assigned_agent?.full_name || 'another agent'}</strong>
          </span>
          <Button size="sm" variant="outline" className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-100" onClick={onIntervene}>
            <Hand className="h-3.5 w-3.5 mr-1" /> Intervene
          </Button>
        </div>
      )}

      {/* Phone Disconnected Warning */}
      {isPhoneDisconnected && (
        <div className={cn(
          "bg-destructive/10 border-b border-destructive/20 flex items-center gap-2 text-destructive",
          isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
        )}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 font-medium">
            {isMobile ? "Phone disconnected. Reconnect to send." : "Phone number is disconnected. Reconnect to send or receive messages."}
          </span>
        </div>
      )}

      {/* 24h Window Warning */}
      {!isPhoneDisconnected && isOutside24hWindow && (
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

      {/* Messages Area - Premium immersive background */}
        <ScrollArea 
        className={cn(
          "flex-1",
          isMobile ? "p-2" : "p-4"
        )} 
        ref={scrollRef}
        style={{
          background: `
            radial-gradient(ellipse at 10% 10%, hsl(var(--primary) / 0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 90%, hsl(var(--primary) / 0.04) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, hsl(var(--accent) / 0.08) 0%, transparent 60%),
            linear-gradient(175deg, hsl(var(--muted) / 0.2) 0%, hsl(var(--background)) 20%, hsl(var(--background)) 80%, hsl(var(--muted) / 0.15) 100%)
          `,
          backgroundAttachment: 'fixed',
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
                <div key={event.id} className="flex items-center justify-center gap-3 py-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="text-[11px] text-muted-foreground bg-card border border-border/50 px-3 py-1.5 rounded-full shadow-sm font-medium">
                    {event.event_type === 'assigned' && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Assigned to {event.actor?.full_name}
                      </span>
                    )}
                    {event.event_type === 'tag_added' && (
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3" />
                        Tag "{event.tag_name}" added by {event.actor?.full_name}
                      </span>
                    )}
                    {event.event_type === 'intervened' && (
                      <span className="flex items-center gap-1.5">
                        <Hand className="h-3 w-3" />
                        {event.actor?.full_name} took over
                      </span>
                    )}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-primary/10 shadow-md">
                    <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-foreground text-xs font-bold">
                      {getInitials(conversation.contact?.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "max-w-[70%] space-y-1",
                  isOutbound && "items-end"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 transition-all duration-200",
                    isOutbound 
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm shadow-md shadow-primary/15" 
                      : "bg-card/95 backdrop-blur-sm border border-border/40 rounded-bl-sm shadow-sm hover:shadow-md transition-shadow"
                  )}>
                    {/* Media (WhatsApp-style previews) */}
                    {message.media_url && message.message_type !== 'text' && message.message_type !== 'template' && (
                      <MessageMedia message={message} isOutbound={isOutbound} />
                    )}
                    
                    {/* Text — skip if media component already renders caption */}
                    {message.body_text && (message.message_type === 'text' || message.message_type === 'template' || !message.media_url) && (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.body_text}</p>
                    )}

                    {/* Template indicator */}
                    {message.message_type === 'template' && (
                      <div className="flex items-center gap-1.5 text-xs opacity-70 mt-1.5">
                        <FileText className="h-3 w-3" />
                        <span className="font-medium">Template:</span> {message.template_name}
                      </div>
                    )}
                  </div>

                  {/* Timestamp + Status */}
                  <div className={cn(
                    "flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1",
                    isOutbound && "justify-end"
                  )}>
                    <span>{format(new Date(message.created_at), 'h:mm a')}</span>
                    {isOutbound && message.latest_status && STATUS_ICONS[message.latest_status]}
                    {isOutbound && message.sender?.full_name && (
                      <span className="opacity-70">• {message.sender.full_name}</span>
                    )}
                  </div>
                </div>

                {isOutbound && (
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-primary/20 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xs font-bold">
                      {getInitials(message.sender?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {/* Typing Indicator - Premium */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-3 px-2">
              <div className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl rounded-bl-sm px-5 py-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{typingUsers[0].full_name} is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div style={{ height: 1 }} />
        </div>
      </ScrollArea>

      {/* Hidden file input for attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
      />

      {/* AI Reply Suggestions Panel - Collapsible */}
      {!isSupervisorMode && showAISuggestions && (
        <div className="px-4 py-2 border-t bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <AIReplySuggestions
            messages={messages}
            onSelectSuggestion={(text) => {
              setMessageText(text);
              setShowAISuggestions(false);
            }}
            isPro={true}
          />
        </div>
      )}

      {/* Composer - Premium glassmorphism */}
      <div className={cn(
        "border-t border-border/40 bg-card/70 backdrop-blur-xl",
        isMobile ? "p-2" : "p-4"
      )}>
        <div className={cn(
          isMobile ? "" : "max-w-3xl mx-auto"
        )}>
          {isPhoneDisconnected ? (
            <div className="text-center py-6">
              <img 
                src={inboxDisconnected} 
                alt="Phone disconnected" 
                className="w-20 h-20 mx-auto mb-3 opacity-80 drop-shadow-sm" 
                loading="lazy"
                decoding="async"
              />
              <p className="text-sm font-semibold text-destructive/80">Phone Disconnected</p>
              <p className="text-xs text-muted-foreground mt-1">Reconnect your number to resume messaging</p>
            </div>
          ) : isSupervisorMode ? (
            <div className="text-center py-6">
              <img 
                src={inboxSupervisor} 
                alt="Supervisor mode" 
                className="w-20 h-20 mx-auto mb-3 opacity-80 drop-shadow-sm" 
                loading="lazy"
                decoding="async"
              />
              <p className="text-sm font-semibold text-muted-foreground">Supervisor Mode</p>
              <p className="text-xs text-muted-foreground mt-1">You're observing this conversation</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                {/* AI Assistant Button - Premium Robot */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={showAISuggestions ? "default" : "ghost"} 
                      size="icon" 
                      className={cn(
                        "flex-shrink-0 relative overflow-hidden rounded-xl",
                        isMobile ? "h-10 w-10" : "h-11 w-11",
                        showAISuggestions 
                          ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 ring-2 ring-primary/20" 
                          : "hover:bg-primary/5 hover:ring-2 hover:ring-primary/10"
                      )}
                      onClick={() => setShowAISuggestions(!showAISuggestions)}
                    >
                      <img 
                        src={inboxAiAssistant} 
                        alt="AI Assistant" 
                        className={cn(
                          "object-contain transition-all duration-300",
                          isMobile ? "h-7 w-7" : "h-7 w-7",
                          showAISuggestions ? "brightness-0 invert scale-110 drop-shadow-md" : "drop-shadow-sm"
                        )} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI Assistant</TooltipContent>
                </Tooltip>

                {/* Attachment Button - Dropdown with options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "flex-shrink-0",
                        isMobile ? "h-10 w-10" : "h-11 w-11"
                      )}
                    >
                      <Paperclip className={cn(isMobile ? "h-5 w-5" : "h-4 w-4", "text-muted-foreground")} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => handleAttachmentClick('image/*')}>
                      <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                      Image
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAttachmentClick('video/*')}>
                      <Video className="h-4 w-4 mr-2 text-red-500" />
                      Video
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAttachmentClick('.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx')}>
                      <File className="h-4 w-4 mr-2 text-amber-500" />
                      Document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAttachmentClick('image/*', true)}>
                      <Camera className="h-4 w-4 mr-2 text-green-500" />
                      Camera
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="flex-1 relative">
                  <Textarea
                    placeholder={isOutside24hWindow ? "Select template..." : "Type a message"}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (onTyping && e.target.value.length > 0) onTyping(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => onTyping?.(false)}
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
                    {/* Emoji Picker */}
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(isMobile ? "h-8 w-8" : "h-7 w-7")}
                        >
                          <Smile className={cn(isMobile ? "h-5 w-5" : "h-4 w-4", "text-muted-foreground hover:text-foreground")} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        side="top" 
                        align="end" 
                        className="w-auto p-0 border-0"
                      >
                        <EmojiPicker 
                          onEmojiClick={handleEmojiClick}
                          width={isMobile ? 280 : 350}
                          height={400}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Template button */}
                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setShowTemplates(true)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Template</TooltipContent>
                  </Tooltip>
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

              {/* Quick Replies - editable by agents */}
              <QuickReplyManager 
                onSelectReply={(text) => setMessageText(text)} 
                isMobile={isMobile}
              />
            </>
          )}
        </div>
      </div>

      {/* Template Picker Modal */}
      <TemplatePicker
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSend={async (templateName, language, components) => {
          onSendMessage({ template: templateName });
          toast.success(`Sending template: ${templateName}`);
        }}
        contactName={conversation.contact?.name}
        contactWaId={conversation.contact?.wa_id}
      />
    </div>
  );
}
