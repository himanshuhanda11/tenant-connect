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
  MessageSquare
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
}

const VIEW_ICONS: Record<InboxView, React.ReactNode> = {
  all: <Inbox className="h-4 w-4" />,
  mine: <User className="h-4 w-4" />,
  unassigned: <UserX className="h-4 w-4" />,
  sla_risk: <AlertTriangle className="h-4 w-4" />,
  vip: <Star className="h-4 w-4" />,
  closed: <CheckCircle className="h-4 w-4" />,
  snoozed: <Clock className="h-4 w-4" />,
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
      mine: conversations.filter(c => c.assigned_to === 'u1').length,
      unassigned: conversations.filter(c => !c.assigned_to).length,
      closed: conversations.filter(c => c.status === 'closed').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Inbox</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Tabs */}
        <Tabs value={view} onValueChange={(v) => onViewChange(v as InboxView)}>
          <TabsList className="w-full grid grid-cols-4 h-8">
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
                  "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedId === conversation.id && "bg-muted",
                  conversation.unread_count > 0 && "bg-primary/5"
                )}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(conversation.contact?.name)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
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
                          conversation.unread_count > 0 && "font-semibold"
                        )}>
                          {conversation.contact?.name || conversation.contact?.wa_id}
                        </span>
                        {conversation.priority === 'urgent' && (
                          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}
                        {conversation.is_intervened && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-amber-100 text-amber-700 border-0">
                            Bot paused
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {conversation.last_message_at && formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })}
                      </span>
                    </div>

                    <p className={cn(
                      "text-sm text-muted-foreground truncate mt-0.5",
                      conversation.unread_count > 0 && "text-foreground"
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

                      {/* Assignment */}
                      {conversation.assigned_agent && (
                        <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {conversation.assigned_agent.full_name?.split(' ')[0]}
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
