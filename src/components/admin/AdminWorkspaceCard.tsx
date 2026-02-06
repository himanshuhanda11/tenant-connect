import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdminStatusBadge, AdminPlanBadge } from './AdminStatusBadge';
import { HealthBadge, computeWorkspaceHealth } from './HealthBadge';
import { Eye, Pause, Play, Ban, MoreHorizontal, Users, Phone, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface AdminWorkspaceCardProps {
  workspace: Workspace;
  isSuperAdmin: boolean;
  onView: () => void;
  onPauseSending: () => void;
  onSuspend: () => void;
}

export function AdminWorkspaceCard({ workspace: w, isSuperAdmin, onView, onPauseSending, onSuspend }: AdminWorkspaceCardProps) {
  const copyId = () => {
    navigator.clipboard.writeText(w.workspace_id);
    toast({ title: 'ID copied' });
  };

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{w.workspace_name}</h3>
              <button onClick={copyId} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">/{w.slug}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-3.5 w-3.5 mr-2" /> View workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPauseSending}>
                {w.sending_paused ? <Play className="h-3.5 w-3.5 mr-2" /> : <Pause className="h-3.5 w-3.5 mr-2" />}
                {w.sending_paused ? 'Resume sending' : 'Pause sending'}
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSuspend} className="text-destructive">
                    <Ban className="h-3.5 w-3.5 mr-2" />
                    {w.is_suspended ? 'Unsuspend' : 'Suspend workspace'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <AdminPlanBadge plan={w.plan_name || w.plan} />
          <AdminStatusBadge status={w.is_suspended ? 'suspended' : 'active'} />
          {w.sending_paused && <AdminStatusBadge status="paused" />}
          <HealthBadge score={computeWorkspaceHealth(w)} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {w.members_count}</span>
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {w.phone_numbers_count}</span>
          <span className="ml-auto">{new Date(w.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
