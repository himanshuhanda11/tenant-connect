import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AdminStatusBadge, AdminPlanBadge } from './AdminStatusBadge';
import { HealthBadge, computeWorkspaceHealth } from './HealthBadge';
import { Eye, Pause, Play, Ban, MoreHorizontal, Users, Phone, Copy, Mail, Building2, MapPin, Wifi, WifiOff, Calendar } from 'lucide-react';
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
  owner_email?: string | null;
  owner_full_name?: string | null;
  owner_company_name?: string | null;
  owner_country?: string | null;
  owner_phone?: string | null;
  owner_signup_at?: string | null;
  phone_number?: string | null;
  waba_status?: string | null;
  waba_connected_at?: string | null;
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

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString() : '—';

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-border/50 cursor-pointer" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{w.workspace_name}</h3>
              <button onClick={(e) => { e.stopPropagation(); copyId(); }} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">/{w.slug}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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

        {/* Owner & Company */}
        <div className="space-y-1 mb-3 pb-3 border-b border-border/50">
          {w.owner_full_name && (
            <div className="flex items-center gap-1.5 text-xs">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{w.owner_full_name}</span>
            </div>
          )}
          {w.owner_company_name && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{w.owner_company_name}</span>
            </div>
          )}
          {w.owner_email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{w.owner_email}</span>
            </div>
          )}
          {w.owner_country && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{w.owner_country}</span>
            </div>
          )}
          {w.phone_number && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Phone className="h-3 w-3" />
              <span>{w.phone_number}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <AdminPlanBadge plan={w.plan_name || w.plan} />
          <AdminStatusBadge status={w.is_suspended ? 'suspended' : 'active'} />
          {w.sending_paused && <AdminStatusBadge status="paused" />}
          {w.waba_status === 'active' ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600">
              <Wifi className="h-3 w-3" /> WABA
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <WifiOff className="h-3 w-3" /> No WABA
            </span>
          )}
          <HealthBadge score={computeWorkspaceHealth(w)} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Signed up: {fmt(w.owner_signup_at || w.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            <span>WABA: {fmt(w.waba_connected_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
