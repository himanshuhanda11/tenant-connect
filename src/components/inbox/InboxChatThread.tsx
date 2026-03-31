import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useGreetingTemplates } from '@/hooks/useGreetingTemplates';
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
  Shield,
  ArrowRightLeft,
  UserPlus,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { InboxConversation, InboxMessage, WAStatus, ConversationEvent, STATUS_CONFIG, PRIORITY_CONFIG, ConversationStatus } from '@/types/inbox';
import { cn } from '@/lib/utils';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Assets
import inboxEmptyChat from '@/assets/inbox-empty-chat.png';
import inboxAiAssistant from '@/assets/inbox-ai-assistant.png';
import inboxDisconnected from '@/assets/inbox-disconnected.png';
import inboxSupervisor from '@/assets/inbox-supervisor.png';

// New AI components
import { AIReplySuggestions } from './AIReplySuggestions';
import { AiDraftBanner } from './AiDraftBanner';
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
  onTransfer?: (profileId: string, resetClaim: boolean) => void;
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
  onTransfer,
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
  const { getRandomMessage } = useGreetingTemplates();
  const [messageText, setMessageText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiDraft, setAiDraft] = useState<any>(null);
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

  // Fetch pending AI drafts for this conversation
  useEffect(() => {
    if (!conversation?.id) { setAiDraft(null); return; }
    const fetchDraft = async () => {
      const { data } = await supabase
        .from('ai_drafts')
        .select('*')
        .eq('conversation_id', conversation.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
      setAiDraft(data?.[0] || null);
    };
    fetchDraft();
    // Subscribe to realtime changes
    const channel = supabase
      .channel(`ai-drafts-${conversation.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_drafts', filter: `conversation_id=eq.${conversation.id}` }, () => fetchDraft())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation?.id]);

  const handleApproveDraft = async (draftId: string, text: string) => {
    // Send the message
    onSendMessage({ text });
    // Update draft status
    await supabase.from('ai_drafts').update({ status: 'approved', reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq('id', draftId);
    setAiDraft(null);
    toast.success('AI draft approved and sent');
  };

  const handleRejectDraft = async (draftId: string) => {
    await supabase.from('ai_drafts').update({ status: 'rejected', reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq('id', draftId);
    setAiDraft(null);
    toast.info('AI draft rejected');
  };

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
        "flex-1 min-w-0 flex items-center justify-center",
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
    <div className="flex flex-col h-full w-full bg-background overflow-hidden min-h-0">
      {/* Header - Premium Glassmorphism Design */}
      <div className="border-b border-border/60 bg-card/90 backdrop-blur-md shadow-sm flex-shrink-0">
        {/* Row 1: Contact Info */}
         <div className={cn(
          "flex items-center justify-between",
          isMobile ? "h-14 px-2 gap-1" : "h-16 px-5"
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
                <a
                  href={`https://wa.me/${conversation.contact?.wa_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-primary hover:underline transition-colors cursor-pointer"
                  title="Open in WhatsApp"
                >
                  +{conversation.contact?.wa_id}
                </a>
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
            {/* Open in WhatsApp button */}
            {conversation.contact?.wa_id && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={(() => {
                      const name = conversation.contact?.name || conversation.contact?.first_name || 'there';
                      const biz = (conversation as any).phone_number?.verified_name || 'our company';
                      const templates = [
                        `Hi ${name}! 👋 Thank you for your enquiry. We are ${biz} — a trusted and registered company. We'd love to assist you. How can we help you today?`,
                        `Hello ${name}! 🌍 We received your enquiry. As a fully registered and trusted agency, ${biz} is here to guide you every step of the way. Shall we schedule a quick consultation?`,
                        `Dear ${name}, thank you for showing interest in our services! 🇪🇺 ${biz} has a proven track record. We'd be happy to discuss the best opportunities available for you.`,
                        `Hi ${name}! 🙌 Great to hear from you. ${biz} is among the most trusted & registered firms. Let us help you explore the right options. When is a good time to talk?`,
                        `Hello ${name}! ✈️ Thanks for reaching out. ${biz} is a fully registered agency, and we specialize in helping people like you. We'd love to understand your needs and guide you further!`,
                        `Hi ${name}! 🌟 We're excited about your interest. ${biz} — a certified and genuine company — has helped hundreds of clients. Let's get started on your journey!`,
                        `Dear ${name}, welcome to ${biz}! 🏢 We're delighted you've reached out. Our team will provide you with genuine guidance and transparent service. How may we assist you?`,
                        `Hi ${name}! 💼 Thank you for your enquiry. ${biz} is a licensed and reputed firm. We believe in 100% transparency and genuine service. Ready to take the next step?`,
                        `Hello ${name}! 🤝 Your interest means a lot to us. ${biz} is committed to providing authentic and professional services. Let's connect and discuss how we can help!`,
                        `Hi ${name}! 🚀 Welcome aboard! ${biz} is here to help you achieve your goals. What questions do you have for us?`,
                      ];
                      const randomMsg = templates[Math.floor(Math.random() * templates.length)];
                      return `https://wa.me/${conversation.contact?.wa_id}?text=${encodeURIComponent(randomMsg)}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Open in Whatsapp
                  </a>
                </TooltipTrigger>
                <TooltipContent>Send pre-filled welcome message via WhatsApp</TooltipContent>
              </Tooltip>
            )}
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
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Status</div>
                  <DropdownMenuItem onClick={() => onSetStatus('open')}>
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetStatus('pending')}>
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" /> Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetStatus('closed')}>
                    <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" /> Close
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowTemplates(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Send Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Row 2: Action Bar (Desktop only) */}
        {!isMobile && (
          <div className="h-10 px-5 flex items-center gap-2 bg-muted/40 backdrop-blur-sm border-t border-border/40 flex-shrink-0">
            {/* Transfer / Assign — single unified dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Assign / Transfer to</div>
                {teamMembers.map(member => (
                  <DropdownMenuItem
                    key={member.id}
                    onClick={() => onTransfer ? onTransfer(member.id, false) : onAssign(member.id)}
                    className={conversation.assigned_to === member.id ? 'bg-muted' : ''}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {member.full_name}
                    {conversation.assigned_to === member.id && <Check className="h-3 w-3 ml-auto" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAssign(null)}>
                  <X className="h-4 w-4 mr-2" /> Unassign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-5 w-px bg-border/60" />

            {/* AI Intent & Health */}
            <IntentBadge intent={aiIntent} />
            <HealthDot health={aiHealth} />

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
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
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
            
            <div className="h-5 w-px bg-border/60" />
            
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border">
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
                  <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" /> Close
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
      {/* Intervention notice - shown to the assigned agent when someone else intervened */}
      {conversation.is_intervened && conversation.assigned_to === user?.id && conversation.intervened_by && conversation.intervened_by !== user?.id && (
        <div className="bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-amber-800 px-4 py-2.5">
          <Hand className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-sm">
            This conversation was intervened by another agent
          </span>
        </div>
      )}
      {/* Intervened by you notice */}
      {conversation.is_intervened && conversation.intervened_by === user?.id && conversation.assigned_to !== user?.id && (
        <div className="bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-amber-800 px-4 py-2.5">
          <Hand className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium">
            You intervened in this conversation — now assigned to <strong>{conversation.assigned_agent?.full_name || 'another agent'}</strong>
          </span>
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
          "flex-1 min-h-0",
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
                        {(event.details as any)?.action === 'transferred' ? (
                          <>
                            {event.actor?.full_name || 'System'} transferred from{' '}
                            <strong>{event.from_agent?.full_name || 'Unassigned'}</strong> → <strong>{event.to_agent?.full_name || 'Unknown'}</strong>
                          </>
                        ) : (event.details as any)?.action === 'claimed_on_reply' ? (
                          <>
                            <strong>{event.to_agent?.full_name || event.actor?.full_name}</strong> claimed on reply
                          </>
                        ) : (event.details as any)?.action === 'claimed' ? (
                          <>
                            <strong>{event.to_agent?.full_name || event.actor?.full_name}</strong> claimed this conversation
                          </>
                        ) : (
                          <>
                            {event.from_agent?.full_name ? (
                              <>
                                {event.actor?.full_name || 'System'} reassigned from{' '}
                                <strong>{event.from_agent.full_name}</strong> → <strong>{event.to_agent?.full_name || 'Unknown'}</strong>
                              </>
                            ) : (
                              <>Assigned to <strong>{event.to_agent?.full_name || event.actor?.full_name}</strong></>
                            )}
                          </>
                        )}
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
                        <strong>{event.actor?.full_name}</strong> took over from{' '}
                        {event.from_agent?.full_name || 'previous agent'}
                      </span>
                    )}
                    {event.event_type === 'status_changed' && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        Status changed to {event.new_value}
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
                {!isOutbound && !isMobile && (
                  <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-primary/10 shadow-md">
                    <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-foreground text-xs font-bold">
                      {getInitials(conversation.contact?.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "space-y-1",
                  isMobile ? "max-w-[85%]" : "max-w-[70%]",
                  isOutbound && "items-end"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 transition-all duration-200",
                    isOutbound 
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm shadow-md shadow-primary/15" 
                      : "bg-card/95 backdrop-blur-sm border border-border/40 rounded-bl-sm shadow-sm hover:shadow-md transition-shadow"
                  )}>
                    {/* Media (WhatsApp-style previews) */}
                    {(message.media_url || message.media_path) && message.message_type !== 'text' && message.message_type !== 'template' && (
                      <MessageMedia message={message} isOutbound={isOutbound} />
                    )}

                    {/* Location message */}
                    {message.message_type === 'location' && (
                      <div className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl mb-1",
                        isOutbound ? "bg-primary-foreground/10" : "bg-muted/50"
                      )}>
                        <span className="text-lg">📍</span>
                        <div className="text-sm">
                          <p className="font-medium">{(message.payload as any)?.name || 'Location'}</p>
                          {(message.payload as any)?.address && (
                            <p className="text-xs text-muted-foreground">{(message.payload as any).address}</p>
                          )}
                          {(message.payload as any)?.latitude && (
                            <a
                              href={`https://maps.google.com/?q=${(message.payload as any).latitude},${(message.payload as any).longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline"
                            >
                              Open in Maps
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact card message */}
                    {message.message_type === 'contact' && (
                      <div className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl mb-1",
                        isOutbound ? "bg-primary-foreground/10" : "bg-muted/50"
                      )}>
                        <User className="h-5 w-5" />
                        <div className="text-sm">
                          <p className="font-medium">
                            {(message.payload as any)?.contacts?.[0]?.name?.formatted_name || 'Contact'}
                          </p>
                          {(message.payload as any)?.contacts?.[0]?.phones?.[0]?.phone && (
                            <p className="text-xs text-muted-foreground">
                              {(message.payload as any).contacts[0].phones[0].phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactive message (buttons/lists) */}
                    {message.message_type === 'interactive' && (
                      <div className="space-y-1">
                        {message.body_text && (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.body_text}</p>
                        )}
                        {(message.payload as any)?.button_reply?.title && (
                          <div className={cn(
                            "inline-block px-3 py-1.5 rounded-lg text-xs font-medium",
                            isOutbound ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
                          )}>
                            {(message.payload as any).button_reply.title}
                          </div>
                        )}
                        {(message.payload as any)?.list_reply?.title && (
                          <div className={cn(
                            "inline-block px-3 py-1.5 rounded-lg text-xs font-medium",
                            isOutbound ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
                          )}>
                            {(message.payload as any).list_reply.title}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Text — skip if media component already renders caption, or interactive already rendered */}
                    {message.body_text && message.message_type !== 'interactive' && (message.message_type === 'text' || message.message_type === 'template' || (!message.media_url && !message.media_path)) && (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.body_text}</p>
                    )}

                    {/* Fallback for unknown types with no body */}
                    {!message.body_text && !message.media_url && !message.media_path && message.message_type !== 'location' && message.message_type !== 'contact' && message.message_type !== 'interactive' && message.message_type !== 'system' && (
                      <p className="text-sm italic text-muted-foreground">
                        [{message.message_type} message]
                      </p>
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

                {isOutbound && !isMobile && (
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

      {/* AI Draft Banner */}
      {aiDraft && !isSupervisorMode && (
        <AiDraftBanner
          draft={aiDraft}
          onApprove={handleApproveDraft}
          onReject={handleRejectDraft}
          isMobile={isMobile}
        />
      )}

      {/* Composer - Premium glassmorphism */}
      <div className={cn(
        "border-t border-border/40 bg-card/70 backdrop-blur-xl flex-shrink-0",
        isMobile ? "p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]" : "p-4"
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
          ) : isOutside24hWindow ? (
            /* Outside 24h window — show template-only composer */
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">24-hour messaging window has closed</span>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-sm">
                You can only send approved templates to re-engage this contact
              </p>
              <Button 
                onClick={() => setShowTemplates(true)}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <FileText className="h-4 w-4" />
                Send Template Message
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                {/* AI Assistant Button */}
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

                {/* Attachment Button */}
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
                    placeholder="Type a message"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (onTyping && e.target.value.length > 0) onTyping(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => onTyping?.(false)}
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

                {/* Send button */}
                <Button 
                  size="icon" 
                  className={cn(
                    isMobile 
                      ? "h-10 w-10 rounded-full bg-primary hover:bg-primary/90" 
                      : "h-11 w-11"
                  )}
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                >
                  {messageText.trim() ? (
                    <Send className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                  ) : (
                    <Mic className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                  )}
                </Button>
              </div>

              {/* Quick Replies */}
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
          try {
            const { data, error } = await supabase.functions.invoke('send-template-message', {
              body: {
                tenant_id: conversation.tenant_id,
                phone_number_id: conversation.phone_number_id,
                to_wa_id: conversation.contact?.wa_id,
                template_name: templateName,
                template_language: language,
                components: components || [],
                contact_name: conversation.contact?.name,
                conversation_id: conversation.id,
              }
            });
            if (error) throw error;
            if (data?.error) {
              toast.error(data.error);
              return;
            }
            toast.success('Template sent');
            window.dispatchEvent(new CustomEvent('inbox-update', { detail: { conversationId: conversation.id } }));
          } catch (err: any) {
            console.error('Template send error:', err);
            toast.error(err.message || 'Failed to send template');
          }
        }}
        contactName={conversation.contact?.name}
        contactWaId={conversation.contact?.wa_id}
      />
    </div>
  );
}
