import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Search, Loader2, Ban, Play, Pause, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Workspace {
  workspace_id: string;
  workspace_name: string;
  slug: string;
  created_at: string;
  is_suspended: boolean;
  plan: string;
  sending_paused: boolean;
  members_count: number;
  phone_numbers_count: number;
  contacts_count: number;
  conversations_count: number;
  plan_name: string | null;
}

export default function AdminWorkspaces() {
  const { role } = useOutletContext<{ role: string }>();
  const { get, post, loading } = useAdminApi();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [suspendDialog, setSuspendDialog] = useState<{ id: string; name: string; suspend: boolean } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const isSuperAdmin = role === 'super_admin';

  const loadWorkspaces = useCallback(async () => {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.set('search', search);
    const data = await get(`workspaces?${params}`);
    setWorkspaces(data.workspaces || []);
    setTotal(data.total || 0);
  }, [page, search]);

  useEffect(() => { loadWorkspaces().catch(() => {}); }, [loadWorkspaces]);

  const handleSuspend = async () => {
    if (!suspendDialog) return;
    try {
      await post(`workspaces/${suspendDialog.id}/suspend`, {
        suspend: suspendDialog.suspend,
        reason: suspendReason,
      });
      toast({ title: suspendDialog.suspend ? 'Workspace suspended' : 'Workspace unsuspended' });
      setSuspendDialog(null);
      setSuspendReason('');
      loadWorkspaces();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handlePauseSending = async (id: string, paused: boolean) => {
    try {
      await post(`workspaces/${id}/pause-sending`, { paused });
      toast({ title: paused ? 'Sending paused' : 'Sending resumed' });
      loadWorkspaces();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Workspaces</h1>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            className="pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Badge variant="outline" className="self-center">{total} total</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Phones</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map(w => (
                  <TableRow key={w.workspace_id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{w.workspace_name}</span>
                        <span className="text-xs text-muted-foreground ml-1">/{w.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{w.plan_name || w.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {w.is_suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        )}
                        {w.sending_paused && <Badge variant="outline" className="text-orange-600">Paused</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{w.members_count}</TableCell>
                    <TableCell className="text-right">{w.phone_numbers_count}</TableCell>
                    <TableCell className="text-right">{w.contacts_count.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/workspaces/${w.workspace_id}`)} title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePauseSending(w.workspace_id, !w.sending_paused)}
                          title={w.sending_paused ? 'Resume sending' : 'Pause sending'}
                        >
                          {w.sending_paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className={w.is_suspended ? 'text-green-600' : 'text-destructive'}
                            onClick={() => setSuspendDialog({ id: w.workspace_id, name: w.workspace_name, suspend: !w.is_suspended })}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {workspaces.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No workspaces found</TableCell></TableRow>
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

      <Dialog open={!!suspendDialog} onOpenChange={() => setSuspendDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendDialog?.suspend ? 'Suspend' : 'Unsuspend'} {suspendDialog?.name}?
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason (optional)..."
            value={suspendReason}
            onChange={e => setSuspendReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog(null)}>Cancel</Button>
            <Button variant={suspendDialog?.suspend ? 'destructive' : 'default'} onClick={handleSuspend}>
              {suspendDialog?.suspend ? 'Suspend' : 'Unsuspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
