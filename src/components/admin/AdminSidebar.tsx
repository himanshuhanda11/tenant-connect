import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Shield, LayoutDashboard, Building2, ScrollText, Users, CreditCard,
  ChevronLeft, ChevronRight, ArrowLeft, Settings, Siren
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  role: string;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/control', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/control/workspaces', icon: Building2, label: 'Workspaces' },
  { to: '/control/billing', icon: CreditCard, label: 'Billing' },
  { to: '/control/incidents', icon: Siren, label: 'Incidents', badge: 'New' },
  { to: '/control/team', icon: Users, label: 'Platform Team', superOnly: true },
  { to: '/control/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/control/settings', icon: Settings, label: 'Settings', superOnly: true },
];

export function AdminSidebar({ role, collapsed, onToggle }: AdminSidebarProps) {
  const navigate = useNavigate();
  const isSuperAdmin = role === 'super_admin';
  const filteredItems = navItems.filter(i => !i.superOnly || isSuperAdmin);

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const link = (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => cn(
          'group flex items-center gap-3 rounded-xl text-sm transition-all duration-150',
          collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
          isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        )}
      >
        {({ isActive }) => (
          <>
            <div className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0',
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground group-hover:text-foreground border-border'
            )}>
              <item.icon className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="rounded-full text-[9px] h-4 px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        'hidden md:flex sticky top-0 h-screen flex-col bg-background/80 backdrop-blur border-r border-border/50 transition-all duration-200',
        collapsed ? 'w-16' : 'w-[280px]'
      )}
    >
      {/* Brand */}
      <div className={cn('px-5 pt-5', collapsed && 'px-3')}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold tracking-tight">AiReatro</div>
                <div className="text-[10px] text-muted-foreground">Control Center</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <Badge variant="secondary" className="rounded-full text-[9px]">
              Internal
            </Badge>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {filteredItems.map(item => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-2">
        {/* Tip card */}
        {!collapsed && (
          <div className="rounded-2xl border bg-background p-3 mb-2">
            <div className="text-xs font-medium">Tip</div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Press <kbd className="font-semibold bg-muted px-1 py-0.5 rounded text-[10px]">⌘K</kbd> to search commands.
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full rounded-xl text-xs text-muted-foreground', collapsed && 'px-0')}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {!collapsed && <span className="ml-1.5">Back to App</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full rounded-xl text-xs text-muted-foreground', collapsed && 'px-0')}
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          {!collapsed && <span className="ml-1.5">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
