import React from 'react';
import { 
  ArrowRight, Users, Phone, Clock, MoreHorizontal,
  CheckCircle, Sparkles, AlertTriangle, Settings, Pencil, Archive,
  MessageSquare, Wifi, Signal
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
    logo_url?: string | null;
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

// Generate consistent color from workspace name
const getAvatarGradient = (name: string): string => {
  const gradients = [
    'from-emerald-400 to-green-600',
    'from-teal-400 to-cyan-600',
    'from-blue-400 to-indigo-600',
    'from-violet-400 to-purple-600',
    'from-pink-400 to-rose-600',
    'from-amber-400 to-orange-600',
    'from-lime-400 to-green-600',
    'from-sky-400 to-blue-600',
    'from-fuchsia-400 to-pink-600',
    'from-cyan-400 to-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export default function WorkspaceCard({
  workspace,
  onSelect,
  onRename,
  onManageMembers,
  onSettings,
  onArchive,
}: WorkspaceCardProps) {
  const isConnected = workspace.status === 'connected';
  const isSetup = workspace.status === 'setup';
  const isAttention = workspace.status === 'attention';
  const avatarGradient = getAvatarGradient(workspace.name);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-300 touch-manipulation cursor-pointer",
      "bg-card hover:shadow-xl hover:-translate-y-0.5",
      isConnected && "border-primary/20 hover:border-primary/40",
      isSetup && "border-border hover:border-muted-foreground/30",
      isAttention && "border-destructive/20 hover:border-destructive/40",
    )} onClick={onSelect}>
      {/* Live indicator strip for connected */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse" />
      )}

      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Premium avatar */}
          <div className="relative">
            {workspace.logo_url ? (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg border border-border">
                <img
                  src={workspace.logo_url}
                  alt={workspace.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient avatar on error
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('bg-gradient-to-br', ...avatarGradient.split(' '), 'flex', 'items-center', 'justify-center', 'text-white', 'font-bold', 'text-lg');
                    target.parentElement!.textContent = getInitial(workspace.name);
                  }}
                />
              </div>
            ) : (
              <div className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-lg",
                avatarGradient
              )}>
                {getInitial(workspace.name)}
              </div>
            )}
            {/* Live dot */}
            {isConnected && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-card flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
              {workspace.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">{workspace.role}</p>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {onRename && <DropdownMenuItem onClick={onRename}><Pencil className="w-4 h-4 mr-2" />Rename</DropdownMenuItem>}
              {onManageMembers && <DropdownMenuItem onClick={onManageMembers}><Users className="w-4 h-4 mr-2" />Members</DropdownMenuItem>}
              {onSettings && <DropdownMenuItem onClick={onSettings}><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>}
              {onArchive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onArchive} className="text-destructive"><Archive className="w-4 h-4 mr-2" />Archive</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status badge */}
        <div className="mb-3">
          {isConnected ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 gap-1.5 font-medium">
              <Signal className="w-3 h-3" />
              Live · WhatsApp Connected
            </Badge>
          ) : isAttention ? (
            <Badge variant="destructive" className="gap-1.5 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Needs Attention
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 font-medium text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              Finish Setup
            </Badge>
          )}
        </div>

        {/* Phone number with live indicator */}
        {workspace.phoneNumber && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-medium text-primary truncate">{workspace.phoneNumber}</span>
            <Wifi className="w-3 h-3 text-primary ml-auto animate-pulse" />
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}</span>
          </div>
          {(workspace.messagesThisWeek ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{workspace.messagesThisWeek} this week</span>
            </div>
          )}
        </div>

        {/* Last active */}
        {workspace.lastActive && (
          <p className="text-[11px] text-muted-foreground/60 mb-3 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Active {formatDistanceToNow(new Date(workspace.lastActive), { addSuffix: false })} ago
          </p>
        )}

        {/* CTA */}
        <Button
          className={cn(
            "w-full h-10 font-medium shadow-sm transition-all",
            isConnected
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {isConnected ? 'Open workspace' : 'Continue setup'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
