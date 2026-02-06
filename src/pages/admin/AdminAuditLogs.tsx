import React, { useEffect, useState, useCallback } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action: string;
  workspace_id: string | null;
  target_table: string | null;
  note: string | null;
  created_at: string;
}

export default function AdminAuditLogs() {
  const { get, loading } = useAdminApi();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const data = await get(`audit-logs?page=${page}`);
    setLogs(data.logs || []);
    setTotal(data.total || 0);
  }, [page]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const totalPages = Math.ceil(total / 50);

  const actionColor = (action: string) => {
    if (action.includes('SUSPEND')) return 'destructive';
    if (action.includes('PAUSE') || action.includes('SENDING')) return 'outline';
    return 'secondary';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{log.actor_user_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{log.actor_role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionColor(log.action) as any}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.note || '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
