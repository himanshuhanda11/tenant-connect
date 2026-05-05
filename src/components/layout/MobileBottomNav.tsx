import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Inbox, Contact, Send, Zap, MoreHorizontal,
  LayoutDashboard, FileText, Megaphone, Workflow, CreditCard,
  Settings, Users, Phone, Puzzle, BarChart3, HelpCircle, Tag, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type Tab = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { to: '/inbox', label: 'Inbox', icon: Inbox, match: (p) => p.startsWith('/inbox') },
  { to: '/contacts', label: 'Contacts', icon: Contact, match: (p) => p.startsWith('/contacts') || p.startsWith('/tags') || p.startsWith('/user-attributes') },
  { to: '/campaigns', label: 'Campaigns', icon: Send, match: (p) => p.startsWith('/campaigns') },
  { to: '/automation', label: 'Automation', icon: Zap, match: (p) => p.startsWith('/automation') || p.startsWith('/flows') },
];

const MORE_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inbox/dashboard', label: 'Inbox Overview', icon: BarChart3 },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/meta-ads', label: 'Meta Ads', icon: Megaphone },
  { to: '/lead-forms', label: 'Lead Forms', icon: Workflow },
  { to: '/tags', label: 'Tags', icon: Tag },
  { to: '/phone-numbers', label: 'Phone Numbers', icon: Phone },
  { to: '/integrations', label: 'Integrations', icon: Puzzle },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = !TABS.some((t) => (t.match ? t.match(pathname) : pathname.startsWith(t.to)));

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 inset-x-0 z-40',
        'bg-background/95 backdrop-blur-md border-t border-border/60',
        'pb-[env(safe-area-inset-bottom)]'
      )}
      role="navigation"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match ? tab.match(pathname) : pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] active:scale-95 transition-transform',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </NavLink>
            </li>
          );
        })}
        <li>
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'w-full flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] active:scale-95 transition-transform',
                  isMoreActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)] max-h-[80vh] overflow-y-auto">
              <SheetHeader className="text-left">
                <SheetTitle>More</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {MORE_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.to}
                      onClick={() => {
                        setMoreOpen(false);
                        navigate(link.to);
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/60 bg-card/40 active:scale-95 transition-transform"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium text-foreground text-center leading-tight">
                        {link.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
