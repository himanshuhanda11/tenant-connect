import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  FileText, Download, Search, ChevronLeft, ChevronRight,
  LogIn, LogOut, UserPlus, Shield, Zap, Tag, Users,
  Loader2, Bot, Hand, ArrowRightLeft, RefreshCw, Globe,
  MessageSquare, Settings, Workflow
} from 'lucide-react';
import { useAuditLogs, useTeamMembers } from '@/hooks/useTeam';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { format, formatDistanceToNow } from 'date-fns';
import type { AuditAction } from '@/types/team';

const PAGE_SIZE = 30;

// Human-readable descriptions for each action
function getActionDescription(action: string, details: any, userName: string): string {
  const d = details || {};
  switch (action) {
    case 'login': return `${userName} signed in to the workspace`;
    case 'logout': return `${userName} signed out`;
    case 'invite_sent': return `${userName} sent an invite to a new member`;
    case 'invite_accepted': return `${userName} accepted a workspace invite`;
    case 'role_changed': return `${userName} changed a team member's role`;
    case 'permission_changed': return `${userName} updated permissions`;
    case 'member_disabled': return `${userName} disabled a team member`;
    case 'member_enabled': return `${userName} enabled a team member`;
    case 'team_created': return `${userName} created a new team group`;
    case 'team_updated': return `${userName} updated team settings`;
    case 'team_deleted': return `${userName} deleted a team group`;
    case 'routing_changed': return `${userName} updated conversation routing rules`;
    case 'sla_changed': return `${userName} modified SLA policies`;
    case 'template_submitted': return `${userName} submitted a template for review`;
    case 'template_approved': return `${userName} approved a message template`;
    case 'template_rejected': return `${userName} rejected a message template`;
    case 'automation_activated': return `${userName} activated an automation workflow`;
    case 'automation_paused': return `${userName} paused an automation`;
    case 'automation_deleted': return `${userName} deleted an automation`;
    case 'tag_added': return `${userName} added a tag to a contact`;
    case 'tag_removed': return `${userName} removed a tag from a contact`;
    case 'assignment_changed': return `${userName} reassigned a conversation`;
    case 'conversation.assigned':
      return d.strategy === 'round_robin'
        ? `System auto-assigned a conversation via round-robin`
        : `Conversation was assigned to an agent`;
    case 'conversation_intervened': return `${userName} took over a bot conversation`;
    case 'bot_resumed': return `${userName} resumed bot handling`;
    case 'conversation_closed': return `${userName} closed a conversation`;
    case 'conversation_reopened': return `${userName} reopened a conversation`;
    case 'waba_connected': return `${userName} connected a WhatsApp Business account`;
    case 'settings_changed': return `${userName} updated workspace settings`;
    default: return `${userName} performed: ${action}`;
  }
}

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string; category: string }> = {
  login: { icon: <LogIn className="h-4 w-4" />, label: 'Sign In', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', category: 'Security' },
  logout: { icon: <LogOut className="h-4 w-4" />, label: 'Sign Out', color: 'bg-muted text-muted-foreground', category: 'Security' },
  invite_sent: { icon: <UserPlus className="h-4 w-4" />, label: 'Invite Sent', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', category: 'Team' },
  invite_accepted: { icon: <UserPlus className="h-4 w-4" />, label: 'Invite Accepted', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', category: 'Team' },
  role_changed: { icon: <Shield className="h-4 w-4" />, label: 'Role Changed', color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', category: 'Team' },
  permission_changed: { icon: <Shield className="h-4 w-4" />, label: 'Permissions', color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', category: 'Team' },
  member_disabled: { icon: <Users className="h-4 w-4" />, label: 'Member Off', color: 'bg-red-500/15 text-red-600 dark:text-red-400', category: 'Team' },
  member_enabled: { icon: <Users className="h-4 w-4" />, label: 'Member On', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', category: 'Team' },
  team_created: { icon: <Users className="h-4 w-4" />, label: 'Team Created', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', category: 'Team' },
  team_updated: { icon: <Users className="h-4 w-4" />, label: 'Team Updated', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', category: 'Team' },
  team_deleted: { icon: <Users className="h-4 w-4" />, label: 'Team Deleted', color: 'bg-red-500/15 text-red-600 dark:text-red-400', category: 'Team' },
  routing_changed: { icon: <ArrowRightLeft className="h-4 w-4" />, label: 'Routing', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', category: 'Settings' },
  sla_changed: { icon: <Settings className="h-4 w-4" />, label: 'SLA Policy', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', category: 'Settings' },
  template_submitted: { icon: <MessageSquare className="h-4 w-4" />, label: 'Template Submit', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', category: 'Templates' },
  template_approved: { icon: <MessageSquare className="h-4 w-4" />, label: 'Template OK', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', category: 'Templates' },
  template_rejected: { icon: <MessageSquare className="h-4 w-4" />, label: 'Template Rejected', color: 'bg-red-500/15 text-red-600 dark:text-red-400', category: 'Templates' },
  automation_activated: { icon: <Workflow className="h-4 w-4" />, label: 'Automation On', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', category: 'Automation' },
  automation_paused: { icon: <Zap className="h-4 w-4" />, label: 'Automation Paused', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', category: 'Automation' },
  automation_deleted: { icon: <Zap className="h-4 w-4" />, label: 'Automation Deleted', color: 'bg-red-500/15 text-red-600 dark:text-red-400', category: 'Automation' },
  tag_added: { icon: <Tag className="h-4 w-4" />, label: 'Tag Added', color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', category: 'Contacts' },
  tag_removed: { icon: <Tag className="h-4 w-4" />, label: 'Tag Removed', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400', category: 'Contacts' },
  assignment_changed: { icon: <ArrowRightLeft className="h-4 w-4" />, label: 'Reassigned', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', category: 'Inbox' },
  'conversation.assigned': { icon: <ArrowRightLeft className="h-4 w-4" />, label: 'Auto-Assigned', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', category: 'Inbox' },
  conversation_intervened: { icon: <Hand className="h-4 w-4" />, label: 'Took Over', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', category: 'Inbox' },
  bot_resumed: { icon: <Bot className="h-4 w-4" />, label: 'Bot Resumed', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', category: 'Inbox' },
  conversation_closed: { icon: <LogOut className="h-4 w-4" />, label: 'Chat Closed', color: 'bg-muted text-muted-foreground', category: 'Inbox' },
  conversation_reopened: { icon: <RefreshCw className="h-4 w-4" />, label: 'Chat Reopened', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', category: 'Inbox' },
  waba_connected: { icon: <Globe className="h-4 w-4" />, label: 'WABA Connected', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', category: 'Settings' },
  settings_changed: { icon: <Settings className="h-4 w-4" />, label: 'Settings', color: 'bg-muted text-muted-foreground', category: 'Settings' },
};

const defaultMeta = { icon: <FileText className="h-4 w-4" />, label: 'Activity', color: 'bg-muted text-muted-foreground', category: 'Other' };

const TeamAudit = () => {
  const [filters, setFilters] = useState<{
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});
  const { logs, loading, exportLogs } = useAuditLogs(filters);
  const { members } = useTeamMembers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const s = search.toLowerCase();
    const meta = ACTION_META[log.action as AuditAction] || defaultMeta;
    const desc = getActionDescription(log.action, log.details, log.user?.full_name || 'System');
    return (
      log.user?.email?.toLowerCase().includes(s) ||
      log.user?.full_name?.toLowerCase().includes(s) ||
      meta.label.toLowerCase().includes(s) ||
      desc.toLowerCase().includes(s) ||
      log.resource_type?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedLogs = filteredLogs.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const uniqueActions = [...new Set(logs.map(l => l.action))].sort();

  // Reset page when filters change
  const updateFilter = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <TeamBreadcrumb currentPage="Audit Logs" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Activity Log</h1>
            <p className="text-sm text-muted-foreground">
              See who did what and when — {filteredLogs.length.toLocaleString()} events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/help/team">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Guide
              </Button>
            </Link>
            <Button onClick={exportLogs} size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Filters — stacked on mobile, row on desktop */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activity..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select
                value={filters.userId || 'all'}
                onValueChange={(v) => updateFilter({ ...filters, userId: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.user_id}>
                      {m.display_name || m.profile?.full_name || m.profile?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.action || 'all'}
                onValueChange={(v) => updateFilter({ ...filters, action: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {uniqueActions.map(action => {
                    const meta = ACTION_META[action as AuditAction] || defaultMeta;
                    return (
                      <SelectItem key={action} value={action}>
                        {meta.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter({ ...filters, dateFrom: e.target.value || undefined })}
                  className="flex-1 h-9 text-sm"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter({ ...filters, dateTo: e.target.value || undefined })}
                  className="flex-1 h-9 text-sm"
                  placeholder="To"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading activity...</span>
              </div>
            ) : pagedLogs.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No activity found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pagedLogs.map((log) => {
                  const meta = ACTION_META[log.action as AuditAction] || defaultMeta;
                  const userName = log.user?.full_name || 'System';
                  const description = getActionDescription(log.action, log.details, userName);
                  const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
                  const fullDate = format(new Date(log.created_at), 'MMM d, yyyy · h:mm a');

                  return (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      {/* Icon */}
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">
                          {description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground" title={fullDate}>
                            {timeAgo}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {meta.category}
                          </Badge>
                          {log.resource_type && log.resource_type !== '-' && (
                            <span className="text-[10px] text-muted-foreground/70 capitalize">
                              {log.resource_type}
                            </span>
                          )}
                          {log.ip_address && (
                            <span className="text-[10px] text-muted-foreground/50 font-mono">
                              {log.ip_address}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* User avatar — hidden on very small screens */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={log.user?.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {(userName)[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                          <p className="text-xs font-medium truncate max-w-[100px]">{userName}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{log.user?.email}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {filteredLogs.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  {safePage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeamAudit;
