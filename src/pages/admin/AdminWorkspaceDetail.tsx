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
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { AdminStatusBadge, AdminPlanBadge } from '@/components/admin/AdminStatusBadge';
import { AdminAuditTimeline } from '@/components/admin/AdminAuditTimeline';
import UserManagementActions from '@/components/admin/UserManagementActions';
import {
  ArrowLeft, Loader2, Phone, Users, Shield, ScrollText, Settings,
  Ban, Pause, Play, Copy, LayoutDashboard, MessageSquare, Zap, Plug
} from 'lucide-react';

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

  const copyId = () => {
    navigator.clipboard.writeText(id || '');
    toast({ title: 'ID copied' });
  };

  if (loading && !workspace) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!workspace) return <div className="text-center py-20 text-muted-foreground">Workspace not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/workspaces')} className="w-fit rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{workspace.name}</h1>
            <button onClick={copyId} className="text-muted-foreground hover:text-foreground">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">/{workspace.slug} · Created {new Date(workspace.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AdminPlanBadge plan={entitlements?.plan || 'free'} />
          <AdminStatusBadge status={workspace.is_suspended ? 'suspended' : 'active'} />
          {entitlements?.sending_paused && <AdminStatusBadge status="paused" />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-xs"
          onClick={() => handlePauseSending(!entitlements?.sending_paused)}
        >
          {entitlements?.sending_paused ? <Play className="h-3.5 w-3.5 mr-1" /> : <Pause className="h-3.5 w-3.5 mr-1" />}
          {entitlements?.sending_paused ? 'Resume Sending' : 'Pause Sending'}
        </Button>
        {isSuperAdmin && (
          <Button
            variant={workspace.is_suspended ? 'outline' : 'destructive'}
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => setSuspendDialog(true)}
          >
            <Ban className="h-3.5 w-3.5 mr-1" />
            {workspace.is_suspended ? 'Unsuspend' : 'Suspend'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <ScrollArea className="w-full">
          <TabsList className="rounded-xl w-full sm:w-auto flex-nowrap">
            <TabsTrigger value="overview" className="rounded-lg text-xs gap-1"><LayoutDashboard className="h-3.5 w-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="team" className="rounded-lg text-xs gap-1"><Users className="h-3.5 w-3.5" />Team</TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-lg text-xs gap-1"><Phone className="h-3.5 w-3.5" />WhatsApp</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg text-xs gap-1"><MessageSquare className="h-3.5 w-3.5" />Templates</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg text-xs gap-1"><Zap className="h-3.5 w-3.5" />Campaigns</TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg text-xs gap-1"><Plug className="h-3.5 w-3.5" />Integrations</TabsTrigger>
            <TabsTrigger value="audit" className="rounded-lg text-xs gap-1"><ScrollText className="h-3.5 w-3.5" />Audit</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <Label className="text-sm">Sending Paused</Label>
                  <Switch checked={entitlements?.sending_paused || false} onCheckedChange={v => handlePauseSending(v)} />
                </div>
                {['enable_ai', 'enable_ads', 'enable_integrations', 'enable_autoforms'].map(f => (
                  <div key={f} className="flex items-center justify-between py-1">
                    <Label className="text-sm capitalize">{f.replace(/enable_/g, '').replace(/_/g, ' ')}</Label>
                    <Switch checked={entitlements?.[f] ?? true} onCheckedChange={v => handleToggle(f, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  Limits {!isSuperAdmin && <span className="text-xs text-muted-foreground font-normal">(read-only)</span>}
                </CardTitle>
              </CardHeader>
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
                      className="w-24 text-right rounded-xl h-8 text-sm"
                      value={entitlements?.[l.key] ?? ''}
                      disabled={!isSuperAdmin}
                      onBlur={e => isSuperAdmin && handleLimitChange(l.key, e.target.value)}
                      onChange={e => setEntitlements((prev: any) => ({ ...prev, [l.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {isSuperAdmin && <TableHead className="w-10"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium text-sm">{m.profiles?.full_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.profiles?.email}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[11px]">{m.role}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                      {isSuperAdmin && (
                        <TableCell><UserManagementActions member={m} isSuperAdmin={isSuperAdmin} /></TableCell>
                      )}
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow><TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground text-sm">No members</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
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
                      <TableCell className="font-medium text-sm">{p.display_name || '—'}</TableCell>
                      <TableCell className="font-mono text-sm">{p.phone_e164}</TableCell>
                      <TableCell><AdminStatusBadge status={p.status === 'connected' ? 'connected' : 'pending'} /></TableCell>
                      <TableCell>
                        {p.quality_rating ? (
                          <Badge variant="outline" className="text-[11px]">{p.quality_rating}</Badge>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {phones.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No phone numbers</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="py-12 text-center">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Template status overview coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="py-12 text-center">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Campaign management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="py-12 text-center">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Plug className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Integration health overview coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-4">
          <AdminAuditTimeline logs={auditLogs} />
        </TabsContent>
      </Tabs>

      {/* Suspend Dialog */}
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
