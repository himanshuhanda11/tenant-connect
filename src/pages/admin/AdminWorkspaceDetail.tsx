import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Phone, Users, Shield, ScrollText, Settings, Ban } from 'lucide-react';

export default function AdminWorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useOutletContext<{ role: string }>();
  const { get, post, loading } = useAdminApi();
  const isSuperAdmin = role === 'super_admin';

  const [workspace, setWorkspace] = useState<any>(null);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    if (!id) return;
    get(`workspaces/${id}`).then(data => {
      setWorkspace(data.workspace);
      setEntitlements(data.entitlements);
      setMembers(data.members || []);
      setPhones(data.phones || []);
    }).catch(() => {});

    get(`audit-logs?workspace_id=${id}`).then(data => {
      setAuditLogs(data.logs || []);
    }).catch(() => {});
  }, [id]);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      await post(`workspaces/${id}/update`, { [field]: value });
      setEntitlements((prev: any) => ({ ...prev, [field]: value }));
      toast({ title: `${field.replace(/_/g, ' ')} updated` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handlePauseSending = async (paused: boolean) => {
    try {
      await post(`workspaces/${id}/pause-sending`, { paused });
      setEntitlements((prev: any) => ({ ...prev, sending_paused: paused }));
      toast({ title: paused ? 'Sending paused' : 'Sending resumed' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleSuspend = async () => {
    try {
      const isSuspended = workspace?.is_suspended;
      await post(`workspaces/${id}/suspend`, { suspend: !isSuspended, reason: suspendReason });
      setWorkspace((prev: any) => ({ ...prev, is_suspended: !isSuspended }));
      setSuspendDialog(false);
      setSuspendReason('');
      toast({ title: isSuspended ? 'Workspace unsuspended' : 'Workspace suspended' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleLimitChange = async (field: string, value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return;
    try {
      await post(`workspaces/${id}/update`, { [field]: num });
      setEntitlements((prev: any) => ({ ...prev, [field]: num }));
      toast({ title: 'Limit updated' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading && !workspace) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!workspace) return <div className="text-center py-20 text-muted-foreground">Workspace not found</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/workspaces')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground">/{workspace.slug} · Created {new Date(workspace.created_at).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {workspace.is_suspended ? (
            <Badge variant="destructive">Suspended</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          )}
          {entitlements?.sending_paused && <Badge variant="outline" className="text-orange-600">Sending Paused</Badge>}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><Settings className="h-3.5 w-3.5 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="phones"><Phone className="h-3.5 w-3.5 mr-1" />WhatsApp</TabsTrigger>
          <TabsTrigger value="team"><Users className="h-3.5 w-3.5 mr-1" />Team</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="h-3.5 w-3.5 mr-1" />Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sending & Feature Flags */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Controls</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sending Paused</Label>
                  <Switch checked={entitlements?.sending_paused || false} onCheckedChange={v => handlePauseSending(v)} />
                </div>
                {['enable_ai', 'enable_ads', 'enable_integrations', 'enable_autoforms'].map(f => (
                  <div key={f} className="flex items-center justify-between">
                    <Label className="capitalize">{f.replace(/_/g, ' ')}</Label>
                    <Switch checked={entitlements?.[f] ?? true} onCheckedChange={v => handleToggle(f, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Limits (super_admin only) */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Limits {!isSuperAdmin && <span className="text-xs text-muted-foreground">(read-only)</span>}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'monthly_conversation_limit', label: 'Conversations/mo' },
                  { key: 'monthly_broadcast_limit', label: 'Broadcasts/mo' },
                  { key: 'monthly_template_limit', label: 'Templates/mo' },
                  { key: 'monthly_flow_limit', label: 'Flows/mo' },
                ].map(l => (
                  <div key={l.key} className="flex items-center justify-between gap-2">
                    <Label className="text-sm">{l.label}</Label>
                    <Input
                      type="number"
                      className="w-24 text-right"
                      value={entitlements?.[l.key] ?? ''}
                      disabled={!isSuperAdmin}
                      onBlur={e => isSuperAdmin && handleLimitChange(l.key, e.target.value)}
                      onChange={e => setEntitlements((prev: any) => ({ ...prev, [l.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <Label>Plan</Label>
                  <Badge variant="secondary">{entitlements?.plan || 'free'}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          {isSuperAdmin && (
            <Card className="border-destructive/30">
              <CardHeader><CardTitle className="text-sm text-destructive flex items-center gap-1"><Shield className="h-4 w-4" />Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <Button
                  variant={workspace.is_suspended ? 'default' : 'destructive'}
                  onClick={() => setSuspendDialog(true)}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  {workspace.is_suspended ? 'Unsuspend Workspace' : 'Suspend Workspace'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="phones" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phones.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.display_name || '—'}</TableCell>
                      <TableCell className="font-mono text-sm">{p.phone_e164}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'connected' ? 'default' : 'outline'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.quality_rating || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {phones.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No phone numbers</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.profiles?.full_name || '—'}</TableCell>
                      <TableCell className="text-sm">{m.profiles?.email}</TableCell>
                      <TableCell><Badge variant="outline">{m.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No members</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{log.actor_role}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.note || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {auditLogs.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No audit logs for this workspace</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{workspace.is_suspended ? 'Unsuspend' : 'Suspend'} {workspace.name}?</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="Reason..." value={suspendReason} onChange={e => setSuspendReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog(false)}>Cancel</Button>
            <Button variant={workspace.is_suspended ? 'default' : 'destructive'} onClick={handleSuspend}>
              {workspace.is_suspended ? 'Unsuspend' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
