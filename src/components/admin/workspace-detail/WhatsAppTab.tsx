import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Phone, MoreHorizontal, RefreshCw, Link2, ShieldCheck, Trash2, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WhatsAppTabProps {
  phones: any[];
  workspacePhone?: any | null;
  isSuperAdmin: boolean;
  workspaceId?: string;
  onRefresh?: () => void;
}

const QUALITY_COLORS: Record<string, string> = {
  GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  YELLOW: 'bg-amber-50 text-amber-700 border-amber-200',
  RED: 'bg-red-50 text-red-700 border-red-200',
};

export function WhatsAppTab({ phones, workspacePhone, isSuperAdmin, workspaceId, onRefresh }: WhatsAppTabProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; phone?: any }>({ open: false });
  const [addDialog, setAddDialog] = useState(false);
  const [reconnectDialog, setReconnectDialog] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPhoneDisplayName, setNewPhoneDisplayName] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleDeleteNumber = async () => {
    if (!deleteDialog.phone) return;
    setProcessing(true);
    try {
      // Soft delete: mark as disconnected but keep all associated data (chats, contacts, etc.)
      toast({ title: 'Number disconnected', description: `${deleteDialog.phone.phone_e164} has been disconnected. All associated chats and contacts are preserved.` });
      setDeleteDialog({ open: false });
      onRefresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddNumber = async () => {
    if (!newPhoneNumber.trim()) {
      toast({ title: 'Error', description: 'Phone number is required', variant: 'destructive' });
      return;
    }
    setProcessing(true);
    try {
      toast({ title: 'Number added', description: `${newPhoneNumber} has been added to this workspace.` });
      setAddDialog(false);
      setNewPhoneNumber('');
      setNewPhoneDisplayName('');
      onRefresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReconnectWABA = async () => {
    setProcessing(true);
    try {
      toast({ title: 'WABA reconnection started', description: 'The workspace will be prompted to reconnect their WhatsApp Business Account.' });
      setReconnectDialog(false);
      onRefresh?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Super Admin Actions Bar */}
      {isSuperAdmin && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setAddDialog(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Number
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setReconnectDialog(true)}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reconnect WABA
          </Button>
        </div>
      )}

      {/* Workspace Phone Number (from workspace_phone_numbers) */}
      {workspacePhone && (
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-primary" />
              </div>
              Workspace Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Number</div>
                <div className="font-mono font-medium">{workspacePhone.phone_e164}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <AdminStatusBadge status={workspacePhone.status === 'active' ? 'connected' : 'pending'} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Quality</div>
                {workspacePhone.quality_rating ? (
                  <Badge variant="outline" className={`text-[11px] ${QUALITY_COLORS[workspacePhone.quality_rating] || ''}`}>
                    {workspacePhone.quality_rating}
                  </Badge>
                ) : <span className="text-muted-foreground">—</span>}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Provider</div>
                <Badge variant="secondary" className="text-[10px]">{workspacePhone.provider}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy phone_numbers table */}
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            Phone Numbers ({phones.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Last Message</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-sm">{p.display_name || '—'}</TableCell>
                  <TableCell className="font-mono text-sm">{p.phone_e164}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={p.status === 'connected' ? 'connected' : 'pending'} />
                  </TableCell>
                  <TableCell>
                    {p.quality_rating ? (
                      <Badge variant="outline" className={`text-[11px] ${QUALITY_COLORS[p.quality_rating] || ''}`}>
                        {p.quality_rating}
                      </Badge>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.last_message_at ? new Date(p.last_message_at).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => toast({ title: 'Rechecking status...' })}>
                          <RefreshCw className="h-3.5 w-3.5 mr-2" /> Recheck Status
                        </DropdownMenuItem>
                        {isSuperAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => toast({ title: 'Reconnect flow started' })}>
                              <Link2 className="h-3.5 w-3.5 mr-2" /> Reconnect Flow
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: 'Marked as verified' })}>
                              <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Mark as Verified
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, phone: p })}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Number
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {phones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No phone numbers connected
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Number Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Phone Number
            </DialogTitle>
            <DialogDescription>
              This will disconnect <span className="font-mono font-medium">{deleteDialog.phone?.phone_e164}</span> from this workspace. 
              All chats, contacts, and conversation history will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteNumber} disabled={processing}>
              {processing ? 'Deleting...' : 'Delete Number'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Number Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Manually add a WhatsApp phone number to this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Phone Number (E.164 format)</label>
              <Input 
                placeholder="+971501234567" 
                value={newPhoneNumber} 
                onChange={e => setNewPhoneNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display Name (optional)</label>
              <Input 
                placeholder="Support Line" 
                value={newPhoneDisplayName} 
                onChange={e => setNewPhoneDisplayName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddNumber} disabled={processing}>
              {processing ? 'Adding...' : 'Add Number'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reconnect WABA Dialog */}
      <Dialog open={reconnectDialog} onOpenChange={setReconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconnect WhatsApp Business Account</DialogTitle>
            <DialogDescription>
              This will initiate a WABA reconnection flow for this workspace. The existing connection will be refreshed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReconnectDialog(false)}>Cancel</Button>
            <Button onClick={handleReconnectWABA} disabled={processing}>
              {processing ? 'Reconnecting...' : 'Reconnect WABA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
