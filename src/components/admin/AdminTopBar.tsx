import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import {
  Search, Bell, ShieldCheck, Headset, User, LogOut, Settings, Menu, Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';

interface AdminTopBarProps {
  role: string;
  onSearchOpen?: () => void;
  readOnly?: boolean;
}

export function AdminTopBar({ role, onSearchOpen, readOnly }: AdminTopBarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isSuperAdmin = role === 'super_admin';

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/75 backdrop-blur border-b border-border/50 flex items-center px-4 md:px-6 gap-3">
      {/* Mobile menu drawer */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Open menu" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[320px]">
            <SheetHeader className="px-5 pt-5 pb-3">
              <SheetTitle>Control Center</SheetTitle>
            </SheetHeader>
            <div className="border-t">
              <AdminSidebar role={role} collapsed={false} onToggle={() => {}} inline />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop title + role */}
      <div className="hidden md:flex items-center gap-2">
        <div className="text-sm font-semibold">Control Center</div>
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
      </div>

      {/* Search */}
      <div className="flex-1 flex items-center gap-2">
        <div className="relative w-full max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search workspaces, users..."
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border text-sm rounded-xl cursor-pointer"
            onClick={onSearchOpen}
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Mobile ⌘K button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 w-8 p-0"
          onClick={onSearchOpen}
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="hidden lg:flex rounded-xl h-9 text-xs"
          onClick={onSearchOpen}
        >
          <Command className="mr-1.5 h-3.5 w-3.5" />
          ⌘K
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative rounded-xl">
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
