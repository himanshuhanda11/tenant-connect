import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, ScrollText, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/control', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/control/workspaces', icon: Building2, label: 'Spaces' },
  { to: '/control/incidents', icon: Siren, label: 'Incidents' },
  { to: '/control/billing', icon: CreditCard, label: 'Billing' },
  { to: '/control/audit-logs', icon: ScrollText, label: 'Audit' },
];

export function AdminMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-md border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-3">
        <div className="grid grid-cols-5 gap-1 py-2">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/60'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'h-9 w-9 rounded-2xl flex items-center justify-center border transition-all',
                    isActive
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-border'
                  )}>
                    <tab.icon className={cn('h-4 w-4', isActive && 'stroke-[2.5]')} />
                  </div>
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
