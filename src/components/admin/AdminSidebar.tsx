import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Shield, LayoutDashboard, Building2, ScrollText, Users, CreditCard,
  ChevronLeft, ChevronRight, ArrowLeft, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  role: string;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/workspaces', icon: Building2, label: 'Workspaces' },
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/team', icon: Users, label: 'Support Team', superOnly: true },
  { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings', superOnly: true },
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
          'flex items-center gap-2.5 rounded-xl text-sm transition-all duration-150 relative group',
          collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
            )}
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
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
        'hidden md:flex flex-col bg-card border-r border-border/50 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo / Header */}
      <div className={cn(
        'h-14 flex items-center border-b border-border/50 px-3',
        collapsed ? 'justify-center' : 'gap-2'
      )}>
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">Admin Console</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AiReatro</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredItems.map(item => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border/50 space-y-1">
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
