import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  FileText, Download, Search, Filter, Calendar,
  LogIn, LogOut, UserPlus, Shield, Zap, Tag, Users
} from 'lucide-react';
import { useAuditLogs, useTeamMembers } from '@/hooks/useTeam';
import { format } from 'date-fns';
import type { AuditAction } from '@/types/team';

const ACTION_ICONS: Partial<Record<AuditAction, React.ReactNode>> = {
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  invite_sent: <UserPlus className="h-4 w-4" />,
  invite_accepted: <UserPlus className="h-4 w-4" />,
  role_changed: <Shield className="h-4 w-4" />,
  permission_changed: <Shield className="h-4 w-4" />,
  automation_activated: <Zap className="h-4 w-4" />,
  automation_paused: <Zap className="h-4 w-4" />,
  tag_added: <Tag className="h-4 w-4" />,
  tag_removed: <Tag className="h-4 w-4" />,
  team_created: <Users className="h-4 w-4" />,
  team_updated: <Users className="h-4 w-4" />,
};

const ACTION_LABELS: Partial<Record<AuditAction, string>> = {
  login: 'Logged In',
  logout: 'Logged Out',
  invite_sent: 'Sent Invite',
  invite_accepted: 'Accepted Invite',
  role_changed: 'Changed Role',
  permission_changed: 'Changed Permissions',
  member_disabled: 'Disabled Member',
  member_enabled: 'Enabled Member',
  team_created: 'Created Team',
  team_updated: 'Updated Team',
  team_deleted: 'Deleted Team',
  routing_changed: 'Changed Routing',
  sla_changed: 'Changed SLA',
  template_submitted: 'Submitted Template',
  template_approved: 'Approved Template',
  template_rejected: 'Rejected Template',
  automation_activated: 'Activated Automation',
  automation_paused: 'Paused Automation',
  automation_deleted: 'Deleted Automation',
  tag_added: 'Added Tag',
  tag_removed: 'Removed Tag',
  assignment_changed: 'Changed Assignment',
  conversation_closed: 'Closed Conversation',
  conversation_reopened: 'Reopened Conversation',
  waba_connected: 'Connected WABA',
  settings_changed: 'Changed Settings',
};

const ACTION_COLORS: Partial<Record<AuditAction, string>> = {
  login: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  logout: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  role_changed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  member_disabled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  member_enabled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  automation_activated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  automation_paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

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

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.user?.email?.toLowerCase().includes(searchLower) ||
      log.user?.full_name?.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower)
    );
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Activity & Audit Logs</h1>
            <p className="text-muted-foreground">
              Track all security and activity events
            </p>
          </div>
          <Button onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Member</label>
                <Select 
                  value={filters.userId || ''} 
                  onValueChange={(v) => setFilters({ ...filters, userId: v || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All members</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.user_id}>
                        {m.display_name || m.profile?.full_name || m.profile?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select 
                  value={filters.action || ''} 
                  onValueChange={(v) => setFilters({ ...filters, action: v || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {ACTION_LABELS[action as AuditAction] || action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logs</CardTitle>
            <CardDescription>{filteredLogs.length} events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No activity logs found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(log.created_at), 'MMM d, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(log.created_at), 'HH:mm:ss')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={log.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {(log.user?.full_name || log.user?.email || 'S')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {log.user?.full_name || 'System'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={ACTION_COLORS[log.action as AuditAction] || 'bg-gray-100 text-gray-700'}
                        >
                          <span className="mr-1">
                            {ACTION_ICONS[log.action as AuditAction]}
                          </span>
                          {ACTION_LABELS[log.action as AuditAction] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="capitalize">{log.resource_type || '-'}</p>
                          {log.resource_id && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {log.resource_id.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] text-sm text-muted-foreground truncate">
                          {Object.keys(log.details || {}).length > 0 
                            ? JSON.stringify(log.details).slice(0, 50) + '...'
                            : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground font-mono">
                          {log.ip_address || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeamAudit;
