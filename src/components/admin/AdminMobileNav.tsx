import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/workspaces', icon: Building2, label: 'Workspaces' },
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit' },
];

export function AdminMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-3 rounded-lg transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
                  isActive && 'bg-primary/10'
                )}>
                  <tab.icon className="h-4 w-4" />
                </div>
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
