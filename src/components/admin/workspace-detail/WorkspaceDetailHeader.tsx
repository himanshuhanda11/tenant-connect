import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminStatusBadge, AdminPlanBadge } from '@/components/admin/AdminStatusBadge';
import { ArrowLeft, Copy, Pause, Play, Ban, ExternalLink, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HealthBadge, computeWorkspaceHealth } from '@/components/admin/HealthBadge';

interface WorkspaceDetailHeaderProps {
  workspace: any;
  entitlements: any;
  isSuperAdmin: boolean;
  onPauseSending: (paused: boolean) => void;
  onSuspendClick: () => void;
  onImpersonate?: () => void;
  onDeleteWorkspace?: (type: 'soft' | 'hard') => void;
}

export function WorkspaceDetailHeader({
  workspace, entitlements, isSuperAdmin, onPauseSending, onSuspendClick, onImpersonate, onDeleteWorkspace
}: WorkspaceDetailHeaderProps) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [deleteReason, setDeleteReason] = useState('');

  const copyId = () => {
    navigator.clipboard.writeText(workspace.id || '');
    toast({ title: 'Workspace ID copied' });
  };

  const handleDelete = () => {
    onDeleteWorkspace?.(deleteType);
    setDeleteDialog(false);
    setDeleteReason('');
    if (deleteType === 'hard') {
      navigate('/control/workspaces');
    }
  };

  return (
    <div className="space-y-4">
      {/* Back + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/control/workspaces')} className="w-fit rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Workspaces
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{workspace.name}</h1>
            <button onClick={copyId} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy workspace ID">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">/{workspace.slug} · Created {new Date(workspace.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AdminPlanBadge plan={entitlements?.plan || 'free'} />
          <AdminStatusBadge status={workspace.is_suspended ? 'suspended' : 'active'} />
          {entitlements?.sending_paused && <AdminStatusBadge status="paused" />}
          <HealthBadge score={computeWorkspaceHealth(workspace)} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline" size="sm" className="rounded-xl text-xs"
          onClick={() => onPauseSending(!entitlements?.sending_paused)}
        >
          {entitlements?.sending_paused ? <Play className="h-3.5 w-3.5 mr-1" /> : <Pause className="h-3.5 w-3.5 mr-1" />}
          {entitlements?.sending_paused ? 'Resume Sending' : 'Pause Sending'}
        </Button>
        {isSuperAdmin && (
          <>
            <Button
              variant={workspace.is_suspended ? 'outline' : 'destructive'}
              size="sm" className="rounded-xl text-xs"
              onClick={onSuspendClick}
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              {workspace.is_suspended ? 'Unsuspend' : 'Suspend'}
            </Button>
            <Button
              variant="outline" size="sm" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Workspace
            </Button>
          </>
        )}
        {onImpersonate && (
          <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={onImpersonate}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Impersonate (Read-only)
          </Button>
        )}
        <Button variant="outline" size="sm" className="rounded-xl text-xs" asChild>
          <a href={`/dashboard`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View in Client App
          </a>
        </Button>
      </div>

      {/* Delete Workspace Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Workspace: {workspace.name}
            </DialogTitle>
            <DialogDescription>
              Choose how to delete this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={deleteType} onValueChange={(v) => setDeleteType(v as 'soft' | 'hard')}>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value="soft" id="soft" className="mt-0.5" />
                <div>
                  <Label htmlFor="soft" className="font-medium cursor-pointer">Archive (Soft Delete)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Disable the workspace and hide it. All data (chats, contacts, numbers) will be preserved and can be restored later.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/30 hover:bg-destructive/5">
                <RadioGroupItem value="hard" id="hard" className="mt-0.5" />
                <div>
                  <Label htmlFor="hard" className="font-medium cursor-pointer text-destructive">Permanent Delete</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permanently remove the workspace and all associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </RadioGroup>
            <div>
              <Label className="text-sm">Reason (optional)</Label>
              <Textarea 
                placeholder="Reason for deletion..." 
                value={deleteReason} 
                onChange={e => setDeleteReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              {deleteType === 'soft' ? 'Archive Workspace' : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
