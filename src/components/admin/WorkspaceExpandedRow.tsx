import React, { useEffect, useState } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  Loader2, Users, Phone, Crown, Shield, UserCog, Trash2, ArrowRightLeft,
  WifiOff, RefreshCw, Copy, Mail, Clock,
} from 'lucide-react';

interface Props {
  workspaceId: string;
  workspaceName: string;
  isSuperAdmin: boolean;
  onChanged?: () => void;
}

const ROLE_BADGE: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700 border-amber-200',
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  agent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  owner: <Crown className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  agent: <UserCog className="h-3 w-3" />,
};

export function WorkspaceExpandedRow({ workspaceId, workspaceName, isSuperAdmin, onChanged }: Props) {
  const { get, post } = useAdminApi();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [waba, setWaba] = useState<any>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [removeMember, setRemoveMember] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [ws, team] = await Promise.all([
        get(`workspaces/${workspaceId}`),
        get(`workspaces/${workspaceId}/team-detail`).catch(() => ({ members: null })),
      ]);
      setMembers(team.members || ws.members || []);
      setPhones(ws.phones || []);
      setWaba(ws.waba || null);
    } catch (e: any) {
      toast({ title: 'Failed to load', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [workspaceId]);

  const copy = (txt: string) => { navigator.clipboard.writeText(txt); toast({ title: 'Copied' }); };

  const changeRole = async (m: any, role: string) => {
    if (m.role === role) return;
    setBusyId(m.id);
    try {
      await post(`workspaces/${workspaceId}/members/${m.id}/change-role`, { role });
      toast({ title: 'Role updated' });
      load();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setBusyId(null); }
  };

  const doRemove = async () => {
    if (!removeMember) return;
    setBusyId(removeMember.id);
    try {
      await post(`workspaces/${workspaceId}/members/${removeMember.id}/remove`, {});
      toast({ title: 'Member removed' });
      setRemoveMember(null);
      load();
      onChanged?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setBusyId(null); }
  };

  const doTransfer = async () => {
    if (!transferTo) return;
    try {
      await post(`workspaces/${workspaceId}/transfer-ownership`, { new_owner_user_id: transferTo });
      toast({ title: 'Ownership transferred' });
      setTransferOpen(false); setTransferTo('');
      load(); onChanged?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const doReset = async () => {
    try {
      await post(`workspaces/${workspaceId}/reset-settings`, {});
      toast({ title: 'Workspace settings reset to defaults' });
      setResetOpen(false);
      onChanged?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const doDisconnect = async () => {
    try {
      const r = await post(`workspaces/${workspaceId}/disconnect-whatsapp`, {});
      toast({ title: `Disconnected ${r.disconnected} number(s)` });
      setDisconnectOpen(false);
      load(); onChanged?.();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const owner = members.find((m: any) => m.role === 'owner');
  const nonOwners = members.filter((m: any) => m.role !== 'owner');

  return (
    <div className="bg-gradient-to-br from-muted/30 to-background p-4 sm:p-5 rounded-xl space-y-4 animate-fade-in">
      {/* Quick Admin Actions */}
      {isSuperAdmin && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-lg gap-1.5" onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer ownership
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg gap-1.5" onClick={() => setResetOpen(true)}>
            <RefreshCw className="h-3.5 w-3.5" /> Reset settings
          </Button>
          {phones.length > 0 && (
            <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-amber-700 border-amber-200" onClick={() => setDisconnectOpen(true)}>
              <WifiOff className="h-3.5 w-3.5" /> Disconnect WhatsApp
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Members */}
        <Card className="rounded-xl border-border/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold">Team ({members.length})</h3>
              </div>
            </div>
            <div className="space-y-2">
              {[owner, ...nonOwners].filter(Boolean).map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/50 hover:border-border transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                    {(m.profiles?.full_name || m.profiles?.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">
                      {m.profiles?.full_name || <span className="text-muted-foreground">No name</span>}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <Mail className="h-2.5 w-2.5 flex-shrink-0" />
                      <span className="truncate">{m.profiles?.email || '—'}</span>
                    </div>
                    {m.last_sign_in_at && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        Active {new Date(m.last_sign_in_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-[10px] gap-1 ${ROLE_BADGE[m.role] || ''}`}>
                    {ROLE_ICON[m.role]}
                    {m.role}
                  </Badge>
                  {isSuperAdmin && m.role !== 'owner' && (
                    <div className="flex items-center gap-1">
                      <Select value={m.role} onValueChange={(v) => changeRole(m, v)}>
                        <SelectTrigger className="h-7 w-[88px] text-[11px] rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRemoveMember(m)}
                        disabled={busyId === m.id}
                      >
                        {busyId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">No members yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Details */}
        <Card className="rounded-xl border-border/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold">WhatsApp</h3>
            </div>

            {phones.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No WhatsApp number connected.</p>
            ) : (
              <div className="space-y-2">
                {phones.map((p: any) => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-background border border-border/50 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-medium">{p.display_number}</span>
                      <Badge variant="outline" className={`text-[10px] ${p.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {p.status}
                      </Badge>
                    </div>
                    {p.verified_name && (
                      <div className="text-[11px] text-muted-foreground">Business: <span className="text-foreground">{p.verified_name}</span></div>
                    )}
                    <div className="grid grid-cols-1 gap-0.5 text-[10px] text-muted-foreground font-mono">
                      <div className="flex items-center justify-between gap-1">
                        <span>Phone ID: {p.phone_number_id || '—'}</span>
                        {p.phone_number_id && (
                          <button onClick={() => copy(p.phone_number_id)}><Copy className="h-2.5 w-2.5" /></button>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span>WABA ID: {p.waba_account_id || '—'}</span>
                        {p.waba_account_id && (
                          <button onClick={() => copy(p.waba_account_id)}><Copy className="h-2.5 w-2.5" /></button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {p.messaging_limit && (
                        <Badge variant="secondary" className="text-[10px]">Limit: {p.messaging_limit}</Badge>
                      )}
                      {p.quality_rating && (
                        <Badge variant="outline" className="text-[10px]">Quality: {p.quality_rating}</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {waba?.name && (
                  <div className="text-[11px] text-muted-foreground pt-1 border-t">
                    WABA: <span className="text-foreground font-medium">{waba.name}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transfer Ownership Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer ownership of {workspaceName}</DialogTitle>
            <DialogDescription>
              The current owner will be demoted to admin. The new owner must already be a member.
            </DialogDescription>
          </DialogHeader>
          <Select value={transferTo} onValueChange={setTransferTo}>
            <SelectTrigger><SelectValue placeholder="Select new owner" /></SelectTrigger>
            <SelectContent>
              {members.filter((m: any) => m.role !== 'owner').map((m: any) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.profiles?.full_name || m.profiles?.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button onClick={doTransfer} disabled={!transferTo}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset {workspaceName}?</DialogTitle>
            <DialogDescription>
              This resets the plan to <strong>free</strong> and disables all premium features (AI, Ads, Integrations, Auto-forms). Members and chats are preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doReset}>Reset to defaults</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect WhatsApp Dialog */}
      <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect WhatsApp from {workspaceName}?</DialogTitle>
            <DialogDescription>
              All connected phone numbers will be marked disconnected and unmapped from this workspace. Chat history and contacts are preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doDisconnect}>Disconnect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={!!removeMember} onOpenChange={(o) => !o && setRemoveMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removeMember?.profiles?.full_name || removeMember?.profiles?.email}?</DialogTitle>
            <DialogDescription>
              They will lose access to this workspace immediately. Their account itself is not deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMember(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doRemove}>Remove member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
