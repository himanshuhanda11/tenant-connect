import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutGrid, Users, Tag, Filter, BarChart3, Settings, Inbox, Building2,
  ChevronLeft, ChevronRight, ArrowLeftRight, Copy, Check, LogOut, Sparkles, MessageCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Section { label: string; items: { label: string; to: string; icon: any; badge?: string }[]; }

const SECTIONS: Section[] = [
  {
    label: 'CRM',
    items: [
      { label: 'Pipeline', to: '/crm/pipelines', icon: LayoutGrid },
      { label: 'Deals', to: '/crm/deals', icon: BarChart3 },
      { label: 'Contacts', to: '/contacts', icon: Users },
      { label: 'Tags', to: '/tags', icon: Tag },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Inbox', to: '/inbox', icon: Inbox },
      { label: 'Campaigns', to: '/campaigns', icon: MessageCircle },
    ],
  },
];

export function CrmSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { currentTenant } = useTenant();
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyWorkspaceId = async () => {
    if (!currentTenant?.id) return;
    await navigator.clipboard.writeText(currentTenant.id);
    setCopied(true);
    toast.success('Workspace ID copied');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside className={cn(
      'hidden md:flex flex-col shrink-0 border-r border-white/5 transition-[width] duration-200',
      'bg-gradient-to-b from-[hsl(222_47%_8%)] via-[hsl(222_47%_10%)] to-[hsl(222_47%_8%)] text-slate-200',
      collapsed ? 'w-[68px]' : 'w-[260px]',
    )}>
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-white/5">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-bold text-sm truncate">Aireatro CRM</span>
          </Link>
        )}
        <button onClick={onToggle} className={cn(
          'h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition',
          collapsed && 'mx-auto'
        )} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Workspace card */}
      <div className="px-3 pt-3">
        <div className={cn(
          'rounded-xl border border-white/5 bg-white/[0.03] p-2.5',
          collapsed && 'p-1.5 flex justify-center'
        )}>
          {collapsed ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {(currentTenant?.name || 'W').slice(0,1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {(currentTenant?.name || 'W').slice(0,1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-white">{currentTenant?.name || 'Workspace'}</p>
                <button onClick={copyWorkspaceId} className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1 truncate w-full">
                  {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                  <span className="truncate font-mono">{currentTenant?.id.slice(0,8)}...</span>
                </button>
              </div>
              <button onClick={() => navigate('/select-workspace')} className="h-6 w-6 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white" aria-label="Switch workspace">
                <ArrowLeftRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {SECTIONS.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.to || pathname.startsWith(item.to + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all relative',
                      active
                        ? 'bg-primary/15 text-white shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
                    <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <Badge className="h-4 px-1 text-[9px] bg-primary/20 text-primary border-0">{item.badge}</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-white/5 p-2 space-y-1">
        <Link to="/dashboard/settings" className={cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5',
          collapsed && 'justify-center px-2'
        )}>
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div className={cn(
          'flex items-center gap-2 rounded-lg p-1.5',
          collapsed && 'justify-center'
        )}>
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-white/10 text-white text-[10px]">
              {(user?.email || 'U').slice(0,1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-white truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-500">Online</p>
              </div>
              <button onClick={() => signOut()} className="h-7 w-7 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white" aria-label="Sign out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
