import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import {
  Phone, Search, Loader2, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, MoreHorizontal, Trash2, Power, PowerOff,
  RefreshCw, Copy, ExternalLink, Wifi, WifiOff
} from 'lucide-react';

interface PhoneRecord {
  id: string;
  tenant_id: string;
  waba_account_id: string | null;
  phone_number_id: string | null;
  display_number: string;
  verified_name: string | null;
  quality_rating: string | null;
  status: string;
  messaging_limit: string | null;
  webhook_health: string | null;
  last_webhook_at: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  workspace_name: string | null;
  waba: { id: string; waba_id: string; status: string; name: string } | null;
}

export default function AdminPhoneNumbers() {
  const { role } = useOutletContext<{ role: string }>();
  const { get, post, loading } = useAdminApi();
  const navigate = useNavigate();
  const isSuperAdmin = role === 'super_admin';
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<PhoneRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPhones = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.set('search', search);
      const data = await get(`phone-numbers?${params}`);
      setPhones(data.phones || []);
      setTotal(data.total || 0);
    } catch {}
  }, [page, search]);

  useEffect(() => { loadPhones(); }, [loadPhones]);

  const totalPages = Math.ceil(total / 25);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setActionLoading(deleteDialog.id);
    try {
      await post(`phone-numbers/${deleteDialog.id}/delete`, {});
      toast({ title: 'Phone number deleted', description: `${deleteDialog.display_number} removed successfully` });
      setDeleteDialog(null);
      loadPhones();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (phone: PhoneRecord, newStatus: string) => {
    setActionLoading(phone.id);
    try {
      await post(`phone-numbers/${phone.id}/update-status`, { status: newStatus });
      toast({ title: `Phone ${newStatus === 'connected' ? 'enabled' : newStatus}` });
      loadPhones();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleWaba = async (phone: PhoneRecord, enabled: boolean) => {
    setActionLoading(phone.id);
    try {
      await post(`phone-numbers/${phone.id}/toggle-waba`, { enabled });
      toast({ title: enabled ? 'WABA enabled' : 'WABA disabled' });
      loadPhones();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const copyId = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied' });
  };

  const qualityColor = (q: string | null) => {
    if (!q) return '';
    const map: Record<string, string> = {
      GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      YELLOW: 'bg-amber-50 text-amber-700 border-amber-200',
      RED: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[q] || '';
  };

  const statusIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    if (status === 'disconnected') return <WifiOff className="h-3.5 w-3.5 text-destructive" />;
    if (status === 'suspended') return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
    return <Clock className="h-3.5 w-3.5 text-amber-500" />;
  };

  const activeCount = phones.filter(p => p.status === 'connected').length;
  const disconnectedCount = phones.filter(p => p.status === 'disconnected').length;
  const redQuality = phones.filter(p => p.quality_rating === 'RED').length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Phone Numbers</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={loadPhones}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
          <Badge variant="outline" className="text-xs">{total} total</Badge>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wifi className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Connected</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <WifiOff className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <div className="text-xl font-bold">{disconnectedCount}</div>
              <div className="text-xs text-muted-foreground">Disconnected</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{redQuality}</div>
              <div className="text-xs text-muted-foreground">Red Quality</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by number or name..."
          className="pl-9 h-9 rounded-xl bg-card"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WhatsApp Number</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WABA</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Connected</TableHead>
                  {isSuperAdmin && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {phones.map(p => (
                  <TableRow key={p.id} className={actionLoading === p.id ? 'opacity-50 pointer-events-none' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{p.display_number}</span>
                        <button onClick={() => copyId(p.display_number)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {p.verified_name && (
                        <span className="text-xs text-muted-foreground">{p.verified_name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/control/workspaces/${p.tenant_id}`)}
                        className="text-sm text-primary hover:underline"
                      >
                        {p.workspace_name || p.tenant_id.slice(0, 8)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(p.status)}
                        <span className="text-xs capitalize">{p.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.waba ? (
                        <Badge
                          variant={p.waba.status === 'active' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {p.waba.status === 'active' ? 'Enabled' : 'Disabled'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No WABA</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.quality_rating ? (
                        <Badge variant="outline" className={`text-[11px] ${qualityColor(p.quality_rating)}`}>
                          {p.quality_rating}
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {p.webhook_health === 'healthy' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : p.webhook_health === 'unhealthy' ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span className="text-xs capitalize">{p.webhook_health || 'unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => copyId(p.id)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Copy Phone ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/control/workspaces/${p.tenant_id}`)}>
                              <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Workspace
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {p.status === 'connected' ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(p, 'disconnected')}>
                                <PowerOff className="h-3.5 w-3.5 mr-2" /> Disconnect
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(p, 'connected')}>
                                <Power className="h-3.5 w-3.5 mr-2" /> Reconnect
                              </DropdownMenuItem>
                            )}
                            {p.waba && (
                              <>
                                {p.waba.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleToggleWaba(p, false)}>
                                    <WifiOff className="h-3.5 w-3.5 mr-2" /> Disable WABA
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleToggleWaba(p, true)}>
                                    <Wifi className="h-3.5 w-3.5 mr-2" /> Enable WABA
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteDialog(p)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Number
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {phones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground text-sm">
                      No phone numbers found
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Phone Number
            </DialogTitle>
            <DialogDescription>
              This will permanently remove <span className="font-mono font-medium">{deleteDialog?.display_number}</span> from
              workspace <span className="font-medium">{deleteDialog?.workspace_name}</span>. Chat history will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading === deleteDialog?.id}>
              {actionLoading === deleteDialog?.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
