import React from 'react';
import { 
  ArrowRight, Users, Phone, Clock, MoreHorizontal,
  CheckCircle, Sparkles, AlertTriangle, Settings, Pencil, Archive
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
    phoneNumber?: string;
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

const statusConfig: Record<string, { icon: React.ElementType; bgColor: string; textColor: string; label: string }> = {
  connected: { 
    icon: CheckCircle, 
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    label: 'WhatsApp connected',
  },
  setup: { 
    icon: Sparkles, 
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    label: 'Finish setup',
  },
  attention: { 
    icon: AlertTriangle, 
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    label: 'Needs attention',
  },
};

// Generate consistent color from workspace name
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-green-500',
    'bg-emerald-500', 
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function WorkspaceCard({
  workspace,
  onSelect,
  onRename,
  onManageMembers,
  onSettings,
  onArchive,
}: WorkspaceCardProps) {
  const status = statusConfig[workspace.status] || statusConfig.setup;
  const StatusIcon = status.icon;
  const avatarColor = getAvatarColor(workspace.name);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Card className="group relative overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg",
            avatarColor
          )}>
            {getInitial(workspace.name)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              {workspace.name}
            </h3>
            
            {/* Status badge */}
            <Badge 
              variant="secondary" 
              className={cn(
                "mt-1.5 text-xs font-medium border-0 gap-1",
                status.bgColor,
                status.textColor
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
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
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>Phone numbers</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{workspace.phoneCount} phone number{workspace.phoneCount !== 1 ? 's' : ''} connected</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Phone number display */}
        {workspace.phoneNumber && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">{workspace.phoneNumber}</span>
          </div>
        )}

        {/* Last active */}
        {workspace.lastActive && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Active {formatDistanceToNow(new Date(workspace.lastActive), { addSuffix: false })} ago</span>
          </div>
        )}

        {/* Primary action button */}
        <Button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-sm"
        >
          Open workspace
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
