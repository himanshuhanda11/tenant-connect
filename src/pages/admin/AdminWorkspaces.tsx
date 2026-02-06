import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { AdminStatusBadge, AdminPlanBadge } from '@/components/admin/AdminStatusBadge';
import { AdminWorkspaceCard } from '@/components/admin/AdminWorkspaceCard';
import { AdminSavedViews, defaultViews, type SavedView } from '@/components/admin/AdminSavedViews';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Search, Loader2, Ban, Play, Pause, ChevronLeft, ChevronRight,
  Eye, MoreHorizontal, Copy, Users, Phone, AlertTriangle
} from 'lucide-react';

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
  const isMobile = useIsMobile();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [suspendDialog, setSuspendDialog] = useState<{ id: string; name: string; suspend: boolean } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [activeView, setActiveView] = useState('all');

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
    if (suspendDialog.suspend && confirmText !== 'SUSPEND') {
      toast({ title: 'Type SUSPEND to confirm', variant: 'destructive' });
      return;
    }
    try {
      await post(`workspaces/${suspendDialog.id}/suspend`, {
        suspend: suspendDialog.suspend,
        reason: suspendReason,
      });
      toast({ title: suspendDialog.suspend ? 'Workspace suspended' : 'Workspace unsuspended' });
      setSuspendDialog(null);
      setSuspendReason('');
      setConfirmText('');
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

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: 'ID copied' });
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <Badge variant="outline" className="text-xs">{total} total</Badge>
      </div>

      {/* Saved Views */}
      <AdminSavedViews
        activeView={activeView}
        onViewChange={(view) => { setActiveView(view.id); setPage(1); }}
      />

      {/* Search & Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            className="pl-9 h-9 rounded-xl bg-card"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Mobile: Cards | Desktop: Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : isMobile ? (
        <div className="space-y-3">
          {workspaces.map(w => (
            <AdminWorkspaceCard
              key={w.workspace_id}
              workspace={w}
              isSuperAdmin={isSuperAdmin}
              onView={() => navigate(`/control/workspaces/${w.workspace_id}`)}
              onPauseSending={() => handlePauseSending(w.workspace_id, !w.sending_paused)}
              onSuspend={() => setSuspendDialog({ id: w.workspace_id, name: w.workspace_name, suspend: !w.is_suspended })}
            />
          ))}
          {workspaces.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No workspaces found</div>
          )}
        </div>
      ) : (
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardContent className="p-0">
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
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map(w => (
                  <TableRow key={w.workspace_id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-medium text-sm">{w.workspace_name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">/{w.slug}</span>
                            <button onClick={() => copyId(w.workspace_id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><AdminPlanBadge plan={w.plan_name || w.plan} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <AdminStatusBadge status={w.is_suspended ? 'suspended' : 'active'} />
                        {w.sending_paused && <AdminStatusBadge status="paused" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">{w.members_count}</TableCell>
                    <TableCell className="text-right text-sm">{w.phone_numbers_count}</TableCell>
                    <TableCell className="text-right text-sm">{w.contacts_count.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/control/workspaces/${w.workspace_id}`)}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View workspace
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePauseSending(w.workspace_id, !w.sending_paused)}>
                            {w.sending_paused ? <Play className="h-3.5 w-3.5 mr-2" /> : <Pause className="h-3.5 w-3.5 mr-2" />}
                            {w.sending_paused ? 'Resume sending' : 'Pause sending'}
                          </DropdownMenuItem>
                          {isSuperAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setSuspendDialog({ id: w.workspace_id, name: w.workspace_name, suspend: !w.is_suspended })}
                                className="text-destructive"
                              >
                                <Ban className="h-3.5 w-3.5 mr-2" />
                                {w.is_suspended ? 'Unsuspend' : 'Suspend workspace'}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {workspaces.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No workspaces found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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

      {/* Suspend Confirm Dialog */}
      <Dialog open={!!suspendDialog} onOpenChange={() => { setSuspendDialog(null); setConfirmText(''); setSuspendReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              {suspendDialog?.suspend ? 'Suspend' : 'Unsuspend'} {suspendDialog?.name}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {suspendDialog?.suspend && (
              <>
                <p className="text-sm text-muted-foreground">
                  This will immediately block all sending and API access for this workspace. Type <strong>SUSPEND</strong> to confirm.
                </p>
                <Input
                  placeholder="Type SUSPEND"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  className="font-mono"
                />
              </>
            )}
            <Textarea
              placeholder="Reason (required for auditing)..."
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSuspendDialog(null); setConfirmText(''); setSuspendReason(''); }}>Cancel</Button>
            <Button
              variant={suspendDialog?.suspend ? 'destructive' : 'default'}
              onClick={handleSuspend}
              disabled={suspendDialog?.suspend ? confirmText !== 'SUSPEND' : false}
            >
              {suspendDialog?.suspend ? 'Suspend Workspace' : 'Unsuspend Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
