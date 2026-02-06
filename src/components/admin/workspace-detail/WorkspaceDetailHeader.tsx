import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminStatusBadge, AdminPlanBadge } from '@/components/admin/AdminStatusBadge';
import { ArrowLeft, Copy, Pause, Play, Ban, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WorkspaceDetailHeaderProps {
  workspace: any;
  entitlements: any;
  isSuperAdmin: boolean;
  onPauseSending: (paused: boolean) => void;
  onSuspendClick: () => void;
}

export function WorkspaceDetailHeader({
  workspace, entitlements, isSuperAdmin, onPauseSending, onSuspendClick
}: WorkspaceDetailHeaderProps) {
  const navigate = useNavigate();

  const copyId = () => {
    navigator.clipboard.writeText(workspace.id || '');
    toast({ title: 'Workspace ID copied' });
  };

  return (
    <div className="space-y-4">
      {/* Back + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/workspaces')} className="w-fit rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
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
          <Button
            variant={workspace.is_suspended ? 'outline' : 'destructive'}
            size="sm" className="rounded-xl text-xs"
            onClick={onSuspendClick}
          >
            <Ban className="h-3.5 w-3.5 mr-1" />
            {workspace.is_suspended ? 'Unsuspend' : 'Suspend'}
          </Button>
        )}
        <Button variant="outline" size="sm" className="rounded-xl text-xs" asChild>
          <a href={`/dashboard`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View in Client App
          </a>
        </Button>
      </div>
    </div>
  );
}
