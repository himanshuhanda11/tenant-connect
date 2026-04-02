import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Bell,
  ChevronDown,
  Inbox,
  SlidersHorizontal,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { format, isToday, isYesterday, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
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

// Short relative time like "Now", "5m", "2h", "3d"
const formatShortTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const mins = differenceInMinutes(now, date);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = differenceInHours(now, date);
  if (hrs < 24) return `${hrs}h`;
  const days = differenceInDays(now, date);
  if (days < 7) return `${days}d`;
  return format(date, 'MMM d');
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
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

  const filteredConversations = useMemo(() => {
    let result = conversations;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.contact?.name?.toLowerCase().includes(q) ||
        c.contact?.wa_id?.includes(q) ||
        c.last_message_preview?.toLowerCase().includes(q)
      );
    }

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

    if (statusFilter !== 'all') {
      result = result.filter(c => c.crm_status === statusFilter);
    }

    if (assignmentFilter === 'unassigned') {
      result = result.filter(c => !c.assigned_to);
    } else if (assignmentFilter === 'assigned') {
      result = result.filter(c => !!c.assigned_to);
    }

    return result;
  }, [conversations, searchQuery, dateFilter, statusFilter, assignmentFilter]);

  const PAGE_SIZE = 25;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible count when filters change
  const filterKey = `${searchQuery}-${dateFilter}-${statusFilter}-${assignmentFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setVisibleCount(PAGE_SIZE);
    setPrevFilterKey(filterKey);
  }

  const paginatedConversations = useMemo(() => filteredConversations.slice(0, visibleCount), [filteredConversations, visibleCount]);
  const hasMore = filteredConversations.length > visibleCount;

  const groups = useMemo(() => groupByDate(paginatedConversations), [paginatedConversations]);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border/50 overflow-hidden",
      isMobile && "border-r-0"
    )}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Inbox</h2>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[24px] px-1.5 text-[10px] font-bold rounded-full">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
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
        <p className="text-xs text-muted-foreground mb-3">
          {filteredConversations.length} conversations{totalUnread > 0 && ` · ${totalUnread} unread`}
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/40 border border-border/40 rounded-lg focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex-shrink-0 border-b border-border/30">
        <div className="flex items-center gap-1.5 px-3 py-2.5 flex-wrap">
          {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateFilter(key as DateFilter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                dateFilter === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
              )}
            >
              {label}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border",
                statusFilter !== 'all'
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-border/40"
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
          {/* Assignment filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 border",
                assignmentFilter !== 'all'
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-border/40"
              )}>
                <SlidersHorizontal className="h-3 w-3" />
                {assignmentFilter === 'unassigned' ? 'Unassigned' : assignmentFilter === 'assigned' ? 'Assigned' : 'Assignment'}
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel className="text-xs">Filter by Assignment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAssignmentFilter('all')}>
                {assignmentFilter === 'all' && '✓ '}All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAssignmentFilter('unassigned')}>
                {assignmentFilter === 'unassigned' && '✓ '}Unassigned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAssignmentFilter('assigned')}>
                {assignmentFilter === 'assigned' && '✓ '}Assigned
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/20">
                <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-1/3" />
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
          <div className="px-2 py-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {groups.map((group) => (
                <div key={group.label}>
                  {/* Date Group Header */}
                  <div className="sticky top-0 z-10 px-2 py-2 bg-card/90 backdrop-blur-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label} · {group.conversations.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {group.conversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ConversationCard
                          conversation={conversation}
                          isSelected={selectedId === conversation.id && !isMobile}
                          onSelect={onSelect}
                          currentUserId={currentUserId}
                          isMobile={isMobile}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <div className="px-3 py-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                  className="w-full text-xs font-medium"
                >
                  Load more ({filteredConversations.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Premium Card Component ---
function ConversationCard({
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

  // Determine assignment label
  const isMyAssignment = conversation.assigned_to === currentUserId;
  let assignLabel: string | undefined;
  if (isMyAssignment && conversation.assigner?.full_name) {
    assignLabel = `Assigned by ${conversation.assigner.full_name}`;
  } else if (!isMyAssignment && conversation.assigned_agent?.full_name) {
    assignLabel = `Assigned to ${conversation.assigned_agent.full_name}`;
  }

  // Agent name for the badge
  const agentDisplayName = conversation.assigned_to === currentUserId
    ? 'You'
    : conversation.assigned_agent?.full_name || null;

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "group rounded-xl px-3 py-3 cursor-pointer transition-all duration-150 overflow-hidden",
        "border border-border/30 hover:border-border/60",
        "hover:shadow-sm",
        isSelected
          ? "bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary/10"
          : "bg-card hover:bg-muted/30",
        hasUnread && !isSelected && "bg-primary/[0.02] border-primary/20"
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0 pt-0.5">
          <Avatar className={cn("border-2 border-muted", isMobile ? "h-12 w-12" : "h-11 w-11")}>
            <AvatarImage src={conversation.contact?.profile_picture_url || undefined} />
            <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {hasUnread && (
            <span className="absolute -bottom-0.5 -right-0.5 h-[18px] min-w-[18px] flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1 shadow-sm ring-2 ring-card">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Time */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                "text-sm truncate leading-tight",
                hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
              )}>
                {conversation.contact?.name || conversation.contact?.wa_id || 'Unknown'}
              </span>
            </div>
            <span className={cn(
              "text-[11px] flex-shrink-0 tabular-nums",
              hasUnread ? "text-primary font-bold" : "text-muted-foreground font-medium"
            )}>
              {formatShortTime(conversation.last_message_at || conversation.created_at)}
            </span>
          </div>

          {/* Row 2: Country / Preview */}
          {conversation.country_interest && (
            <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
              {conversation.country_interest}
            </p>
          )}
          {conversation.last_message_preview && (
            <p className={cn(
              "text-[12px] truncate mt-0.5 leading-relaxed",
              hasUnread ? "text-foreground/70 font-medium" : "text-muted-foreground"
            )}>
              {conversation.last_message_preview}
            </p>
          )}

          {/* Row 3: CRM Status + Assignment + Agent */}
          <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
            {/* CRM Status badge */}
            {conversation.crm_status && (
              <CRMStatusBadge 
                status={conversation.crm_status} 
                size="sm" 
              />
            )}

            {/* Assigned by/to label */}
            {assignLabel && (
              <span className="text-[10px] text-muted-foreground truncate min-w-0 flex-1">
                {assignLabel}
              </span>
            )}

            {/* Agent name with blue dot */}
            {agentDisplayName && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0 max-w-[70px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block flex-shrink-0" />
                <span className="truncate">{agentDisplayName}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
