import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Bell, ShieldCheck, Headset, ChevronLeft, User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AdminTopBarProps {
  role: string;
  onSearchOpen?: () => void;
}

export function AdminTopBar({ role, onSearchOpen }: AdminTopBarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isSuperAdmin = role === 'super_admin';

  return (
    <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-sm border-b border-border/50 flex items-center px-4 md:px-6 gap-3">
      {/* Back to app (mobile) */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden h-8 w-8 p-0"
        onClick={() => navigate('/dashboard')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search workspaces, users..."
          className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border text-sm rounded-xl"
          onClick={onSearchOpen}
          readOnly
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Role badge */}
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] uppercase tracking-wider font-semibold gap-1 h-6',
            isSuperAdmin
              ? 'bg-primary/5 text-primary border-primary/20'
              : 'bg-blue-50 text-blue-600 border-blue-200'
          )}
        >
          {isSuperAdmin ? <ShieldCheck className="h-3 w-3" /> : <Headset className="h-3 w-3" />}
          {isSuperAdmin ? 'Super Admin' : 'Support'}
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-muted">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-48">
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate('/control/settings')} className="text-sm">
              <Settings className="h-3.5 w-3.5 mr-2" /> Platform Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-sm text-destructive">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
