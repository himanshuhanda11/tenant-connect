import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AdminAuditTimeline } from '@/components/admin/AdminAuditTimeline';
import { WorkspaceDetailHeader } from '@/components/admin/workspace-detail/WorkspaceDetailHeader';
import { OverviewTab } from '@/components/admin/workspace-detail/OverviewTab';
import { TeamTab } from '@/components/admin/workspace-detail/TeamTab';
import { WhatsAppTab } from '@/components/admin/workspace-detail/WhatsAppTab';
import { TemplatesTab } from '@/components/admin/workspace-detail/TemplatesTab';
import { CampaignsTab } from '@/components/admin/workspace-detail/CampaignsTab';
import { IntegrationsTab } from '@/components/admin/workspace-detail/IntegrationsTab';
import {
  Loader2, LayoutDashboard, Users, Phone, MessageSquare, Zap, Plug, ScrollText, Eye
} from 'lucide-react';
import { useImpersonation } from '@/components/admin/ImpersonationBanner';

export default function AdminWorkspaceDetail() {
  const { id } = useParams();
  const { role } = useOutletContext<{ role: string }>();
  const { get, post, loading } = useAdminApi();
  const { start: startImpersonation } = useImpersonation();
  const isSuperAdmin = role === 'super_admin';

  const [workspace, setWorkspace] = useState<any>(null);
  const [entitlements, setEntitlements] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [workspacePhone, setWorkspacePhone] = useState<any>(null);
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
      setWorkspacePhone(data.workspace_phone || null);
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
    <div className="space-y-6 animate-fade-in">
      <WorkspaceDetailHeader
        workspace={workspace}
        entitlements={entitlements}
        isSuperAdmin={isSuperAdmin}
        onPauseSending={handlePauseSending}
        onSuspendClick={() => setSuspendDialog(true)}
        onImpersonate={() => startImpersonation(workspace.id, workspace.name)}
        onDeleteWorkspace={(type) => {
          if (type === 'soft') {
            toast({ title: 'Workspace archived', description: `${workspace.name} has been archived. All data is preserved.` });
          } else {
            toast({ title: 'Workspace deleted', description: `${workspace.name} has been permanently deleted.` });
          }
        }}
      />

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

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            entitlements={entitlements}
            isSuperAdmin={isSuperAdmin}
            onToggle={handleToggle}
            onLimitChange={handleLimitChange}
            onEntitlementsChange={setEntitlements}
          />
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <TeamTab members={members} isSuperAdmin={isSuperAdmin} />
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4">
          <WhatsAppTab 
            phones={phones} 
            workspacePhone={workspacePhone} 
            isSuperAdmin={isSuperAdmin} 
            workspaceId={id}
            onRefresh={() => {
              get(`workspaces/${id}`).then(data => {
                setPhones(data.phones || []);
                setWorkspacePhone(data.workspace_phone || null);
              }).catch(() => {});
            }}
          />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab isSuperAdmin={isSuperAdmin} />
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <IntegrationsTab isSuperAdmin={isSuperAdmin} />
        </TabsContent>
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
