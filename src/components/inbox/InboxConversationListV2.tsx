import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
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
  Check,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { InboxConversation, InboxView, InboxFilters, inboxSortOrder, type InboxSort } from '@/types/inbox';
import { InboxDateTabs, InboxSortMenu, describeInboxCount, DEFAULT_INBOX_TIME_FILTER, type InboxTimeFilterValue } from './InboxTimeFilter';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';
import { useAgentDisplayNames } from '@/hooks/useAgentDisplayNames';
import { formatInZone, startOfZonedDay } from '@/lib/workspaceTime';
import { CRMStatusBadge } from './CRMStatusBadge';
import { InboxWorkSummary } from './InboxWorkSummary';
import { isChatReplied } from '@/lib/inboxReplyState';
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
  totalCount?: number;
  /** Exact sizes of the Today / Yesterday groups */
  dayCounts?: { today: number | null; yesterday: number | null };
  /** Fetch the next batch of chats from the server */
  onLoadMoreFromServer?: () => void;
  listFilters?: InboxListFilters;
  onListFiltersChange?: (f: InboxListFilters) => void;
  onClearNotifications?: () => void;
  timeFilter?: InboxTimeFilterValue;
  onTimeFilterChange?: (v: InboxTimeFilterValue) => void;
}

type StatusFilter = 'all' | 'new' | 'assigned' | 'contacted' | 'follow_up_required' | 'call_scheduled' | 'documents_pending' | 'qualified' | 'converted' | 'not_interested' | 'junk';


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

// Group by Today / Yesterday / Earlier in the workspace time zone, using the sort's time.
const groupByDate = (conversations: InboxConversation[], timeZone: string, sort?: InboxSort) => {
  const groups: { label: string; conversations: InboxConversation[] }[] = [];
  const today: InboxConversation[] = [];
  const yesterday: InboxConversation[] = [];
  const older: InboxConversation[] = [];
  const now = new Date();
  const todayStart = startOfZonedDay(now, timeZone).getTime();
  const yesterdayStart = startOfZonedDay(now, timeZone, -1).getTime();
  const { column } = inboxSortOrder(sort);

  conversations.forEach(c => {
    const t = new Date((column === 'created_at' ? c.created_at : c.last_message_at) || c.created_at).getTime();
    if (t >= todayStart) today.push(c);
    else if (t >= yesterdayStart) yesterday.push(c);
    else older.push(c);
  });

  if (today.length > 0) groups.push({ label: 'Today', conversations: today });
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', conversations: yesterday });
  if (older.length > 0) groups.push({ label: 'Earlier', conversations: older });

  return groups;
};

export interface InboxListFilters {
  search: string;
  crmStatus: StatusFilter;
  owner: 'all' | 'unassigned' | 'assigned';
  /** White (waiting for an agent reply) or green (replied) chats */
  reply: 'all' | 'waiting' | 'replied';
  /** One agent's chats (user id), picked by owners/admins/managers */
  agentId: string | null;
}
export const EMPTY_LIST_FILTERS: InboxListFilters = { search: '', crmStatus: 'all', owner: 'all', reply: 'all', agentId: null };

const REPLY_OPTIONS: { value: InboxListFilters['reply']; label: string; hint: string }[] = [
  { value: 'all', label: 'Any reply', hint: 'Every chat, green and white' },
  { value: 'waiting', label: 'Not replied', hint: 'White chats: customer is waiting for an agent' },
  { value: 'replied', label: 'Replied', hint: 'Green chats: an agent answered the last message' },
];

const STATUS_LABELS: Record<Exclude<StatusFilter, 'all'>, string> = {
  new: 'New', assigned: 'Assigned', contacted: 'Contacted',
  follow_up_required: 'Follow-up', call_scheduled: 'Call scheduled',
  documents_pending: 'Documents pending', qualified: 'Qualified',
  converted: 'Converted', not_interested: 'Not interested', junk: 'Junk',
};
const OWNER_LABELS: Record<InboxListFilters['owner'], string> = {
  all: 'Everyone', unassigned: 'Unassigned', assigned: 'Assigned',
};

const filterBtn = (active: boolean) => cn(
  'flex min-w-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
  active ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border/60 bg-card text-foreground hover:bg-muted',
);

export function InboxConversationListV2({
  conversations,
  selectedId,
  onSelect,
  loading,
  isMobile = false,
  currentUserId,
  unreadNewCount = 0,
  totalCount,
  dayCounts,
  onLoadMoreFromServer,
  listFilters = EMPTY_LIST_FILTERS,
  onListFiltersChange,
  onClearNotifications,
  timeFilter = DEFAULT_INBOX_TIME_FILTER,
  onTimeFilterChange,
}: InboxConversationListV2Props) {
  const timeZone = useWorkspaceTimezone();
  const agentName = useAgentDisplayNames();
  const setList = (patch: Partial<InboxListFilters>) => onListFiltersChange?.({ ...listFilters, ...patch });
  const statusFilter = listFilters.crmStatus;
  const assignmentFilter = listFilters.owner;
  const replyFilter = listFilters.reply;
  const { currentTenant, currentRole } = useTenant();
  const canPickAgent = !!currentRole && currentRole !== 'agent';
  const { data: teamAgents = [] } = useQuery({
    queryKey: ['inbox-filter-agents', currentTenant?.id],
    enabled: !!currentTenant?.id && canPickAgent,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('agents')
        .select('user_id, display_name, is_active')
        .eq('tenant_id', currentTenant!.id);
      return (data ?? [])
        .filter((a) => a.user_id && a.is_active !== false)
        .map((a) => ({ id: a.user_id as string, name: agentName(a.user_id, a.display_name) || 'Unnamed' }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  });
  const pickedAgentName = listFilters.agentId
    ? teamAgents.find((a) => a.id === listFilters.agentId)?.name || agentName(listFilters.agentId) || 'Agent'
    : null;
  const agentBtnLabel = pickedAgentName || (assignmentFilter === 'all' ? 'Any agent' : OWNER_LABELS[assignmentFilter]);
  const filteredConversations = conversations;

  const PAGE_SIZE = 25;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible count when filters change
  const filterKey = `${JSON.stringify(listFilters)}-${JSON.stringify(timeFilter)}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setVisibleCount(PAGE_SIZE);
    setPrevFilterKey(filterKey);
  }

  const total = typeof totalCount === 'number' ? Math.max(totalCount, filteredConversations.length) : filteredConversations.length;
  const paginatedConversations = useMemo(() => filteredConversations.slice(0, visibleCount), [filteredConversations, visibleCount]);
  const shown = paginatedConversations.length;
  const hasMore = shown < total;
  const loadMore = () => {
    const next = visibleCount + PAGE_SIZE;
    // Ask the server for the next batch before the loaded chats run out.
    if (next > filteredConversations.length - PAGE_SIZE && filteredConversations.length < total) onLoadMoreFromServer?.();
    setVisibleCount(next);
  };

  const groups = useMemo(() => groupByDate(paginatedConversations, timeZone, timeFilter.sort), [paginatedConversations, timeZone, timeFilter.sort]);
  const groupTotal = (label: string, fallback: number) => {
    const t = dayCounts?.today, y = dayCounts?.yesterday;
    if (label === 'Today') return t ?? fallback;
    if (label === 'Yesterday') return y ?? fallback;
    if (t != null && y != null && typeof totalCount === 'number') return Math.max(totalCount - t - y, fallback);
    return fallback;
  };
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const anyFilter = !!listFilters.search || statusFilter !== 'all' || assignmentFilter !== 'all' || replyFilter !== 'all' || !!listFilters.agentId || timeFilter.preset !== 'all';
  const clearAll = () => {
    onListFiltersChange?.(EMPTY_LIST_FILTERS);
    onTimeFilterChange?.({ ...timeFilter, preset: 'all', custom: undefined });
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border/50 overflow-hidden",
      isMobile && "border-r-0"
    )}>
      {/* Header */}
      <div className="flex-shrink-0 space-y-2.5 px-3 pt-3 pb-2.5 border-b border-border/40">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Inbox</h2>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[24px] px-1.5 text-[10px] font-bold rounded-full" title={`${totalUnread} unread messages`}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClearNotifications}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNewCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-0.5">
                {unreadNewCount > 99 ? '99+' : unreadNewCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search (searches every chat, not just the loaded ones) */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or phone"
            value={listFilters.search}
            onChange={(e) => setList({ search: e.target.value })}
            className="pl-9 pr-8 h-9 text-sm bg-muted/40 border border-border/40 rounded-lg focus-visible:ring-1"
          />
          {listFilters.search && (
            <button type="button" aria-label="Clear search" onClick={() => setList({ search: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* When */}
        <InboxDateTabs value={timeFilter} onChange={(v) => onTimeFilterChange?.(v)} timeZone={timeZone} />

        {/* Lead status · Assigned · Sort */}
        <div className="flex flex-wrap items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={filterBtn(statusFilter !== 'all')} aria-label="Filter by lead status">
                <span className="truncate">{statusFilter === 'all' ? 'Any status' : STATUS_LABELS[statusFilter]}</span>
                <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Lead status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setList({ crmStatus: 'all' })}>
                <Check className={cn('mr-2 h-3.5 w-3.5', statusFilter !== 'all' && 'invisible')} />Any status
              </DropdownMenuItem>
              {(Object.keys(STATUS_LABELS) as Exclude<StatusFilter, 'all'>[]).map(s => (
                <DropdownMenuItem key={s} onClick={() => setList({ crmStatus: s })}>
                  <Check className={cn('mr-2 h-3.5 w-3.5', statusFilter !== s && 'invisible')} />{STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={cn(filterBtn(assignmentFilter !== 'all' || !!listFilters.agentId), 'max-w-[9rem]')} aria-label="Filter by assigned agent">
                <span className="truncate">{agentBtnLabel}</span>
                <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] w-52 overflow-y-auto overscroll-contain">
              <DropdownMenuLabel className="text-xs">Assigned to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(OWNER_LABELS) as InboxListFilters['owner'][]).map(o => (
                <DropdownMenuItem key={o} onClick={() => setList({ owner: o, agentId: null })}>
                  <Check className={cn('mr-2 h-3.5 w-3.5', (assignmentFilter !== o || !!listFilters.agentId) && 'invisible')} />{o === 'all' ? 'Any agent' : OWNER_LABELS[o]}
                </DropdownMenuItem>
              ))}
              {canPickAgent && teamAgents.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">One agent</DropdownMenuLabel>
                  {teamAgents.map(a => (
                    <DropdownMenuItem key={a.id} onClick={() => setList({ owner: 'all', agentId: a.id })}>
                      <Check className={cn('mr-2 h-3.5 w-3.5', listFilters.agentId !== a.id && 'invisible')} /><span className="truncate">{a.name}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={filterBtn(replyFilter !== 'all')} aria-label="Filter by replied or not replied">
                {replyFilter !== 'all' && <span aria-hidden className={cn('h-2 w-2 flex-shrink-0 rounded-full border', replyFilter === 'replied' ? 'border-success bg-success' : 'border-border bg-card')} />}
                <span className="truncate">{REPLY_OPTIONS.find(r => r.value === replyFilter)?.label}</span>
                <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-xs">Agent reply</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {REPLY_OPTIONS.map(r => (
                <DropdownMenuItem key={r.value} onClick={() => setList({ reply: r.value })} className="items-start">
                  <Check className={cn('mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0', replyFilter !== r.value && 'invisible')} />
                  <span className="min-w-0">
                    <span className="block text-sm">{r.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{r.hint}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <InboxSortMenu value={timeFilter.sort} onChange={(sort) => onTimeFilterChange?.({ ...timeFilter, sort })} />
        </div>

        {/* New chats / replied / waiting for the picked period */}
        <InboxWorkSummary timeFilter={timeFilter} timeZone={timeZone} agentId={listFilters.agentId} agentLabel={pickedAgentName} />

        {/* Exact count of what's shown */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5">
          <p className="min-w-0 text-xs text-muted-foreground" aria-live="polite">
            {loading && typeof totalCount !== 'number' ? 'Counting…' : (
              <>
                {(() => {
                  const d = describeInboxCount(total, timeFilter, timeZone, {
                    status: statusFilter !== 'all' ? STATUS_LABELS[statusFilter] : undefined,
                    owner: !listFilters.agentId && assignmentFilter !== 'all' ? OWNER_LABELS[assignmentFilter] : undefined,
                    agent: pickedAgentName || undefined,
                    reply: replyFilter !== 'all' ? replyFilter : undefined,
                    search: listFilters.search.trim() || undefined,
                  });
                  return (
                    <>
                      <span className="font-semibold text-foreground">{d.headline}</span>
                      {d.details.map((x) => <span key={x}> · {x}</span>)}
                      {total > shown && <span className="block text-[10.5px]">Showing {shown.toLocaleString('en-US')} · tap Load more below for the rest</span>}
                    </>
                  );
                })()}
              </>
            )}
          </p>
          {anyFilter && (
            <button type="button" onClick={clearAll} className="flex-shrink-0 text-xs font-medium text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div data-scroll-lock-allow className="flex-1 overscroll-contain overflow-y-auto overflow-x-hidden">
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
              {anyFilter ? 'No chats match these filters' : 'Start a conversation to see it here'}
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
                      {group.label} · {groupTotal(group.label, group.conversations.length).toLocaleString('en-US')}
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
                          timeZone={timeZone}
                          agentName={agentName}
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
                  onClick={loadMore}
                  className="w-full text-xs font-medium"
                >
                  Load {Math.min(PAGE_SIZE, total - shown)} more · {shown.toLocaleString('en-US')} of {total.toLocaleString('en-US')} shown
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
  timeZone,
  agentName,
}: {
  conversation: InboxConversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  currentUserId?: string;
  isMobile?: boolean;
  timeZone: string;
  agentName: (userId?: string | null, fallback?: string | null) => string | null;
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
  } else if (!isMyAssignment && conversation.assigned_to) {
    const n = agentName(conversation.assigned_to, conversation.assigned_agent?.full_name);
    if (n) assignLabel = `Assigned to ${n}`;
  }

  const replied = isChatReplied(conversation);

  // Agent name for the badge
  const agentDisplayName = conversation.assigned_to === currentUserId
    ? 'You'
    : agentName(conversation.assigned_to, conversation.assigned_agent?.full_name);

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "group relative rounded-xl px-3 py-3 cursor-pointer transition-all duration-150 overflow-hidden border hover:shadow-sm",
        // Green = an agent answered the customer's latest message; white = still waiting for a reply.
        replied
          ? "bg-success/10 border-success/40 hover:bg-success/15"
          : "bg-card border-border/40 hover:border-border/70 hover:bg-muted/30",
        isSelected && "ring-2 ring-primary/40 shadow-sm"
      )}
      aria-label={replied ? 'Replied chat' : 'Waiting for reply'}
    >
      {replied && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-success" />}
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

          <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground/80 tabular-nums">
            Received {formatInZone(conversation.first_message_at || conversation.created_at, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
            {replied && conversation.last_agent_reply_at && (
              <span className="font-medium text-success"> · Replied {formatInZone(conversation.last_agent_reply_at, timeZone, { hour: 'numeric', minute: '2-digit' })}</span>
            )}
          </p>

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
