import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  User, 
  UserX, 
  AlertTriangle, 
  Star, 
  CheckCircle, 
  Clock,
  Inbox,
  ChevronDown,
  Megaphone,
  Globe,
  QrCode,
  MessageSquare,
  CheckCheck,
  Check,
  Sparkles,
  UserCheck,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { InboxConversation, InboxView, InboxFilters, PRIORITY_CONFIG } from '@/types/inbox';
import { cn } from '@/lib/utils';

interface InboxConversationListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: InboxView;
  onViewChange: (view: InboxView) => void;
  filters: InboxFilters;
  onFiltersChange: (filters: InboxFilters) => void;
  loading?: boolean;
  isMobile?: boolean;
  currentUserId?: string;
}

const VIEW_ICONS: Record<InboxView, React.ReactNode> = {
  all: <Inbox className="h-4 w-4" />,
  unassigned: <UserX className="h-4 w-4" />,
  assigned_pending: <Clock className="h-4 w-4" />,
  mine: <User className="h-4 w-4" />,
  sla_risk: <AlertTriangle className="h-4 w-4" />,
  vip: <Star className="h-4 w-4" />,
  closed: <CheckCircle className="h-4 w-4" />,
  
};

const LEAD_STAGE_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  qualified: { label: 'Qualified', icon: <CheckCircle className="h-3 w-3" />, className: 'bg-green-100 text-green-700 border-0' },
  needs_agent: { label: 'Needs Agent', icon: <UserCheck className="h-3 w-3" />, className: 'bg-amber-100 text-amber-700 border-0' },
  qualifying: { label: 'Qualifying', icon: <Sparkles className="h-3 w-3" />, className: 'bg-blue-100 text-blue-700 border-0' },
  unqualified: { label: 'Unqualified', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-700 border-0' },
  new: { label: 'New Lead', icon: <HelpCircle className="h-3 w-3" />, className: 'bg-purple-100 text-purple-700 border-0' },
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  meta_ads: <Megaphone className="h-3 w-3" />,
  website: <Globe className="h-3 w-3" />,
  qr: <QrCode className="h-3 w-3" />,
  direct: <MessageSquare className="h-3 w-3" />,
};

export function InboxConversationList({
  conversations,
  selectedId,
  onSelect,
  view,
  onViewChange,
  filters,
  onFiltersChange,
  loading,
  isMobile = false,
  currentUserId,
}: InboxConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      c.contact?.name?.toLowerCase().includes(search) ||
      c.contact?.wa_id?.includes(search) ||
      c.last_message_preview?.toLowerCase().includes(search)
    );
  });

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusCounts = () => {
    return {
      all: conversations.length,
      open: conversations.filter(c => c.status === 'open').length,
      mine: conversations.filter(c => c.assigned_to === currentUserId).length,
      unassigned: conversations.filter(c => !c.assigned_to).length,
      closed: conversations.filter(c => c.status === 'closed').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className={cn(
      "flex flex-col h-full border-r bg-card",
      isMobile && "border-r-0"
    )}>
      {/* Header - WhatsApp style */}
      <div className={cn(
        "bg-primary text-primary-foreground",
        isMobile ? "px-4 py-3" : "p-4 border-b"
      )}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-lg"
          )}>
            Chats
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "hover:bg-white/10",
                  isMobile ? "text-primary-foreground" : ""
                )}
              >
                <Filter className="h-4 w-4 mr-1" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, hasUnread: !filters.hasUnread })}>
                {filters.hasUnread ? '✓ ' : ''}Unread only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, slaRisk: !filters.slaRisk })}>
                {filters.slaRisk ? '✓ ' : ''}SLA at risk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search - WhatsApp style */}
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
            isMobile ? "text-primary-foreground/70" : "text-muted-foreground"
          )} />
          <Input
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9",
              isMobile && "bg-white/10 border-0 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:ring-white/20"
            )}
          />
        </div>
      </div>

      {/* View Tabs */}
      <div className={cn(
        "px-2 py-2 border-b bg-muted/30",
        isMobile && "px-3"
      )}>
        <Tabs value={view} onValueChange={(v) => onViewChange(v as InboxView)}>
          <TabsList className={cn(
            "w-full grid h-9",
            isMobile ? "grid-cols-4 gap-1" : "grid-cols-4"
          )}>
            <TabsTrigger value="all" className="text-xs px-2">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="mine" className="text-xs px-2">
              Mine ({counts.mine})
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="text-xs px-2">
              New ({counts.unassigned})
            </TabsTrigger>
            <TabsTrigger value="closed" className="text-xs px-2">
              Closed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No conversations</p>
            <p className="text-sm">Start a conversation to see it here</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted",
                  selectedId === conversation.id && !isMobile && "bg-muted",
                  conversation.unread_count > 0 && "bg-primary/5"
                )}
              >
                <div className="flex gap-3">
                  {/* Avatar - WhatsApp style */}
                  <div className="relative flex-shrink-0">
                    <Avatar className={cn(
                      "border-2 border-background shadow-sm",
                      isMobile ? "h-12 w-12" : "h-10 w-10"
                    )}>
                      <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold">
                        {getInitials(conversation.contact?.name)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm",
                        isMobile ? "h-5 w-5 text-[10px]" : "h-4 w-4 text-[9px]"
                      )}>
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "font-medium truncate",
                          conversation.unread_count > 0 && "font-semibold",
                          isMobile && "text-base"
                        )}>
                          {conversation.contact?.name || conversation.contact?.wa_id}
                        </span>
                        {!conversation.assigned_to && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 border-0 font-semibold">
                            NEW
                          </Badge>
                        )}
                        {conversation.priority === 'urgent' && (
                          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Message status icon - WhatsApp style */}
                        {conversation.unread_count === 0 && (
                          <CheckCheck className="h-4 w-4 text-blue-500" />
                        )}
                        <span className={cn(
                          "text-xs",
                          conversation.unread_count > 0 ? "text-green-600 font-medium" : "text-muted-foreground"
                        )}>
                          {conversation.last_message_at && formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })}
                        </span>
                      </div>
                    </div>

                    <p className={cn(
                      "text-sm text-muted-foreground truncate mt-0.5",
                      conversation.unread_count > 0 && "text-foreground font-medium"
                    )}>
                      {conversation.last_message_preview || 'No messages yet'}
                    </p>

                    {/* Footer: Tags + Source + Assignment */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {/* Source badge */}
                      {conversation.source && SOURCE_ICONS[conversation.source] && (
                        <span className="flex items-center text-muted-foreground">
                          {SOURCE_ICONS[conversation.source]}
                        </span>
                      )}

                      {/* Lead Stage */}
                      {conversation.lead_stage && LEAD_STAGE_CONFIG[conversation.lead_stage] && (
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-semibold flex items-center gap-0.5", LEAD_STAGE_CONFIG[conversation.lead_stage].className)}>
                          {LEAD_STAGE_CONFIG[conversation.lead_stage].icon}
                          {LEAD_STAGE_CONFIG[conversation.lead_stage].label}
                        </Badge>
                      )}

                      {/* Tags */}
                      {conversation.tags?.slice(0, 2).map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0 h-4"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {(conversation.tags?.length || 0) > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{(conversation.tags?.length || 0) - 2}
                        </span>
                      )}

                      {/* SLA Risk */}
                      {conversation.sla_first_response_due && !conversation.first_response_at && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-red-100 text-red-700 border-0">
                          SLA
                        </Badge>
                      )}

                      {/* Intervened indicator */}
                      {conversation.is_intervened && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-0 font-medium">
                          {conversation.intervened_by === currentUserId ? 'Intervened by you' : 'Intervened'}
                        </Badge>
                      )}

                      {/* Assignment */}
                      {conversation.assigned_to && (
                        <span className={cn(
                          "text-[10px] ml-auto flex items-center gap-1",
                          conversation.assigned_to === currentUserId 
                            ? "text-primary font-semibold" 
                            : "text-muted-foreground"
                        )}>
                          <User className="h-3 w-3" />
                          {conversation.assigned_to === currentUserId 
                            ? 'You' 
                            : conversation.assigned_agent?.full_name?.split(' ')[0] || 'Agent'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
