import React from 'react';
import { 
  Building2, ArrowRight, Users, Phone, MessageSquare, 
  CheckCircle, AlertTriangle, Clock, MoreHorizontal,
  Crown, UserCog, Shield, Eye, Inbox, Settings, Pencil, Archive
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
    created_at: string;
    phoneCount: number;
    memberCount: number;
    status: 'connected' | 'setup' | 'attention';
    messagesThisWeek?: number;
    lastActive?: string;
  };
  onSelect: () => void;
  onRename?: () => void;
  onManageMembers?: () => void;
  onSettings?: () => void;
  onArchive?: () => void;
}

const roleConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  owner: { icon: Crown, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', label: 'Owner' },
  admin: { icon: UserCog, color: 'text-blue-600 bg-blue-500/10 border-blue-500/20', label: 'Admin' },
  agent: { icon: Shield, color: 'text-green-600 bg-green-500/10 border-green-500/20', label: 'Agent' },
  viewer: { icon: Eye, color: 'text-gray-600 bg-gray-500/10 border-gray-500/20', label: 'Viewer' },
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string; tooltip: string }> = {
  connected: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-500',
    label: 'WhatsApp connected',
    tooltip: 'Your WhatsApp Business API is connected and active'
  },
  setup: { 
    icon: Clock, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-500',
    label: 'Finish setup',
    tooltip: 'Complete your WhatsApp setup to start messaging'
  },
  attention: { 
    icon: AlertTriangle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-500',
    label: 'Needs attention',
    tooltip: 'There are issues that need your attention'
  },
};

export default function WorkspaceCard({
  workspace,
  onSelect,
  onRename,
  onManageMembers,
  onSettings,
  onArchive,
}: WorkspaceCardProps) {
  const role = roleConfig[workspace.role] || roleConfig.agent;
  const status = statusConfig[workspace.status] || statusConfig.setup;
  const RoleIcon = role.icon;
  const StatusIcon = status.icon;

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCTALabel = () => {
    if (workspace.role === 'agent') return 'Go to Inbox';
    if (workspace.role === 'viewer') return 'View Only';
    return 'Open workspace';
  };

  const getCTAIcon = () => {
    if (workspace.role === 'agent') return Inbox;
    return ArrowRight;
  };

  const CTAIcon = getCTAIcon();

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
      "hover:-translate-y-1 cursor-pointer"
    )}>
      {/* Status indicator bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", status.bgColor)} />

      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-primary/10">
            <span className="text-sm font-bold text-primary">{getInitials(workspace.name)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {workspace.name}
            </h3>
            
            {/* Status pill */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium", status.color)}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{status.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {onRename && (
                <DropdownMenuItem onClick={onRename}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              {onManageMembers && (
                <DropdownMenuItem onClick={onManageMembers}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage members
                </DropdownMenuItem>
              )}
              {onSettings && (
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Workspace settings
                </DropdownMenuItem>
              )}
              {onArchive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onArchive} className="text-destructive focus:text-destructive">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <span>{workspace.phoneCount} {workspace.phoneCount === 1 ? 'number' : 'numbers'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          {workspace.lastActive && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDistanceToNow(new Date(workspace.lastActive), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Role badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("text-xs font-medium border", role.color)}>
            <RoleIcon className="w-3 h-3 mr-1" />
            {role.label}
          </Badge>

          {workspace.messagesThisWeek !== undefined && workspace.messagesThisWeek > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{workspace.messagesThisWeek} this week</span>
            </div>
          )}
        </div>

        {/* Primary action button */}
        <Button
          onClick={onSelect}
          className="w-full mt-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 shadow-sm group-hover:shadow-md transition-shadow"
        >
          {getCTALabel()}
          <CTAIcon className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
