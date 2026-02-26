import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  Bell,
  ChevronDown,
  Inbox,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { InboxConversation, InboxView, InboxFilters } from '@/types/inbox';
import { CRMStatusBadge } from './CRMStatusBadge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InboxConversationListV2Props {
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
  unreadNewCount?: number;
  onClearNotifications?: () => void;
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'last_7_days';
type StatusFilter = 'all' | 'new' | 'contacted' | 'follow_up_required' | 'qualified' | 'converted' | 'junk';

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  all: 'All',
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7d',
};

// Country flag emoji from code
const getCountryFlag = (countryCode?: string) => {
  if (!countryCode || countryCode.length !== 2) return null;
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
};

const formatTimestamp = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return formatDistanceToNow(date, { addSuffix: true });
};

const groupByDate = (conversations: InboxConversation[]) => {
  const groups: { label: string; conversations: InboxConversation[] }[] = [];
  const today: InboxConversation[] = [];
  const yesterday: InboxConversation[] = [];
  const older: InboxConversation[] = [];

  conversations.forEach(c => {
    const date = c.last_message_at ? new Date(c.last_message_at) : new Date(c.created_at);
    if (isToday(date)) today.push(c);
    else if (isYesterday(date)) yesterday.push(c);
    else older.push(c);
  });

  if (today.length > 0) groups.push({ label: 'Today', conversations: today });
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', conversations: yesterday });
  if (older.length > 0) groups.push({ label: 'Earlier', conversations: older });

  return groups;
};

export function InboxConversationListV2({
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
  unreadNewCount = 0,
  onClearNotifications,
}: InboxConversationListV2Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Apply local filters
  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.contact?.name?.toLowerCase().includes(q) ||
        c.contact?.wa_id?.includes(q) ||
        c.last_message_preview?.toLowerCase().includes(q)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(c => {
        const date = c.last_message_at ? new Date(c.last_message_at) : new Date(c.created_at);
        if (dateFilter === 'today') return isToday(date);
        if (dateFilter === 'yesterday') return isYesterday(date);
        if (dateFilter === 'last_7_days') {
          const diff = now.getTime() - date.getTime();
          return diff <= 7 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.crm_status === statusFilter);
    }

    return result;
  }, [conversations, searchQuery, dateFilter, statusFilter]);

  const groups = useMemo(() => groupByDate(filteredConversations), [filteredConversations]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border/50",
      isMobile && "border-r-0"
    )}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground tracking-tight">Inbox</h2>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClearNotifications}
            >
              <Bell className="h-4 w-4" />
              {unreadNewCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-0.5">
                  {unreadNewCount > 99 ? '99+' : unreadNewCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex-shrink-0 border-b border-border/30 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 px-3 py-2 w-max min-w-full" style={{ minHeight: '40px' }}>
        {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setDateFilter(key as DateFilter)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
              dateFilter === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
        <div className="w-px h-4 bg-border/50 mx-0.5" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all",
              statusFilter !== 'all'
                ? "bg-primary/10 text-primary"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <SlidersHorizontal className="h-3 w-3" />
              {statusFilter !== 'all' ? statusFilter.replace(/_/g, ' ') : 'Status'}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs">Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              {statusFilter === 'all' && '✓ '}All Statuses
            </DropdownMenuItem>
            {(['new', 'contacted', 'follow_up_required', 'qualified', 'converted', 'junk'] as StatusFilter[]).map(s => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                {statusFilter === s && '✓ '}{s.replace(/_/g, ' ')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
          </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-3 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 px-3 py-2.5">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No conversations</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {searchQuery ? 'Try a different search' : 'Start a conversation to see it here'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Date Group Header */}
                <div className="sticky top-0 z-10 px-4 py-1.5 bg-muted/40 backdrop-blur-sm border-b border-border/20">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label} · {group.conversations.length}
                  </span>
                </div>

                {group.conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ConversationRow
                      conversation={conversation}
                      isSelected={selectedId === conversation.id && !isMobile}
                      onSelect={onSelect}
                      currentUserId={currentUserId}
                      isMobile={isMobile}
                    />
                  </motion.div>
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}
      </ScrollArea>

      {/* Footer Stats */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-border/30 bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          {totalUnread > 0 && ` · ${totalUnread} unread`}
        </p>
      </div>
    </div>
  );
}

// --- Extracted Row Component ---
function ConversationRow({
  conversation,
  isSelected,
  onSelect,
  currentUserId,
  isMobile,
}: {
  conversation: InboxConversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  currentUserId?: string;
  isMobile?: boolean;
}) {
  const hasUnread = conversation.unread_count > 0;
  const initials = (() => {
    const name = conversation.contact?.name;
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  })();

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "group px-3 py-2.5 cursor-pointer transition-colors border-b border-border/10",
        isSelected
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-muted/40 border-l-2 border-l-transparent",
        hasUnread && !isSelected && "bg-primary/[0.02]"
      )}
    >
      <div className="flex gap-2.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className={cn("border border-border/50", isMobile ? "h-11 w-11" : "h-9 w-9")}>
            <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
            <AvatarFallback className="text-[11px] font-semibold bg-gradient-to-br from-primary/15 to-primary/30 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {hasUnread && (
            <span className="absolute -bottom-0.5 -right-0.5 h-4 min-w-[1rem] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-0.5 shadow-sm">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Time */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                "text-[13px] truncate",
                hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90"
              )}>
                {conversation.contact?.name || conversation.contact?.wa_id || 'Unknown'}
              </span>
              {conversation.country_interest && (
                <span className="text-xs flex-shrink-0" title={conversation.country_interest}>
                  {getCountryFlag(conversation.country_interest)}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[11px] flex-shrink-0",
              hasUnread ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              {formatTimestamp(conversation.last_message_at || conversation.created_at)}
            </span>
          </div>

          {/* Row 2: Preview */}
          <p className={cn(
            "text-[12px] truncate mt-0.5 leading-relaxed",
            hasUnread ? "text-foreground/80 font-medium" : "text-muted-foreground"
          )}>
            {conversation.last_message_preview || 'No messages yet'}
          </p>

          {/* Row 3: Status + Agent + Tags */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {/* CRM Status with assigner info */}
            {conversation.crm_status && (() => {
              // If I'm the assigned agent → show who assigned it to me
              // If I'm admin/owner → show who it's assigned to
              const isMyAssignment = conversation.assigned_to === currentUserId;
              let badgeLabel: string | undefined;
              if (isMyAssignment && conversation.assigner?.full_name) {
                badgeLabel = `Assigned by ${conversation.assigner.full_name}`;
              } else if (!isMyAssignment && conversation.assigned_agent?.full_name) {
                badgeLabel = `Assigned to ${conversation.assigned_agent.full_name}`;
              }
              return (
                <CRMStatusBadge 
                  status={conversation.crm_status} 
                  size="sm" 
                  customLabel={badgeLabel}
                />
              );
            })()}

            {/* Follow-up indicator */}
            {conversation.next_followup_at && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-amber-200 bg-amber-50 text-amber-700">
                F/U {format(new Date(conversation.next_followup_at), 'MMM d, h:mm a')}
              </Badge>
            )}

            {/* Assigned agent */}
            {conversation.assigned_to && (
              <Badge variant="outline" className={cn(
                "text-[9px] px-1.5 py-0 h-4 flex items-center gap-1 ml-auto",
                conversation.assigned_to === currentUserId
                  ? "border-primary/30 bg-primary/5 text-primary font-semibold"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}>
                {conversation.assigned_agent?.avatar_url ? (
                  <Avatar className="h-3 w-3">
                    <AvatarImage src={conversation.assigned_agent.avatar_url} />
                    <AvatarFallback className="text-[6px]">
                      {conversation.assigned_agent.full_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                {conversation.assigned_to === currentUserId
                  ? 'You'
                  : conversation.assigned_agent?.full_name || 'Agent'}
              </Badge>
            )}
            {!conversation.assigned_to && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-blue-200 bg-blue-50 text-blue-600 font-semibold ml-auto">
                Unassigned
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
