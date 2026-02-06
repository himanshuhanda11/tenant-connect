import React, { useEffect, useState, useCallback } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminAuditTimeline } from '@/components/admin/AdminAuditTimeline';
import { Loader2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action: string;
  workspace_id: string | null;
  target_table: string | null;
  target_id: string | null;
  note: string | null;
  before_data: any;
  after_data: any;
  created_at: string;
}

export default function AdminAuditLogs() {
  const { get, loading } = useAdminApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: page.toString() });
    const data = await get(`audit-logs?${params}`);
    setLogs(data.logs || []);
    setTotal(data.total || 0);
  }, [page]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const totalPages = Math.ceil(total / 50);

  // Client-side filters for now
  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'all' && !log.action.includes(actionFilter)) return false;
    if (roleFilter !== 'all' && log.actor_role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <Badge variant="outline" className="text-xs">{total} entries</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40 h-9 rounded-xl text-sm">
            <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="SUSPEND">Suspend</SelectItem>
            <SelectItem value="PAUSE">Pause</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="RESET">Reset</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40 h-9 rounded-xl text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <AdminAuditTimeline logs={filteredLogs} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
