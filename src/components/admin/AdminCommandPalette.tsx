import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, Building2, CreditCard, ScrollText, Search,
  Pause, ShieldAlert, ArrowRight, Bookmark, AlertTriangle,
  BarChart3, FileText, Users, Siren, Settings, Shield, Download,
} from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Badge } from '@/components/ui/badge';

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}

interface WorkspaceResult {
  workspace_id: string;
  workspace_name: string;
  slug: string;
  is_suspended: boolean;
  plan_name: string | null;
}

const navigationItems = [
  { label: 'Overview', icon: LayoutDashboard, to: '/control', keywords: 'home dashboard overview kpi' },
  { label: 'Workspaces', icon: Building2, to: '/control/workspaces', keywords: 'clients tenants workspaces' },
  { label: 'Billing', icon: CreditCard, to: '/control/billing', keywords: 'billing invoices payments revenue' },
  { label: 'Incidents', icon: Siren, to: '/control/incidents', keywords: 'incidents soc outage' },
  { label: 'Audit Logs', icon: ScrollText, to: '/control/audit-logs', keywords: 'audit logs history timeline' },
  { label: 'Platform Team', icon: Users, to: '/control/team', keywords: 'team agents support members', superOnly: true },
  { label: 'Settings', icon: Settings, to: '/control/settings', keywords: 'settings flags feature toggles', superOnly: true },
];

const savedViews = [
  { label: 'Suspended Workspaces', icon: ShieldAlert, to: '/control/workspaces?view=suspended', keywords: 'suspended blocked' },
  { label: 'Pending Numbers', icon: AlertTriangle, to: '/control/workspaces?view=pending-numbers', keywords: 'pending phone numbers' },
  { label: 'Pro Plan Clients', icon: BarChart3, to: '/control/workspaces?view=pro', keywords: 'pro plan premium' },
  { label: 'High Revenue Clients', icon: CreditCard, to: '/control/workspaces?view=high-revenue', keywords: 'revenue high value' },
];

export function AdminCommandPalette({ open, onOpenChange, role }: AdminCommandPaletteProps) {
  const navigate = useNavigate();
  const { get, post } = useAdminApi();
  const [query, setQuery] = useState('');
  const [workspaces, setWorkspaces] = useState<WorkspaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const isSuperAdmin = role === 'super_admin';

  // Search workspaces when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setWorkspaces([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await get(`workspaces?search=${encodeURIComponent(query)}&page=1`);
        setWorkspaces((data.workspaces || []).slice(0, 5));
      } catch {
        setWorkspaces([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const runAction = useCallback((to: string) => {
    onOpenChange(false);
    setQuery('');
    navigate(to);
  }, [navigate, onOpenChange]);

  const handleToggleReadOnly = useCallback(async () => {
    try {
      const settings = await get('settings');
      const current = (settings.settings || []).find((s: any) => s.key === 'support_read_only');
      const newValue = !(current?.value === true);
      await post('settings', { key: 'support_read_only', value: newValue });
      onOpenChange(false);
      setQuery('');
      window.location.reload();
    } catch { /* ignore */ }
  }, [get, post, onOpenChange]);

  // Reset on close
  useEffect(() => {
    if (!open) { setQuery(''); setWorkspaces([]); }
  }, [open]);

  const filteredNav = navigationItems.filter(i => !i.superOnly || isSuperAdmin);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search workspaces, navigate, run actions..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? 'Searching...' : 'No results found.'}
        </CommandEmpty>

        {/* Workspace results */}
        {workspaces.length > 0 && (
          <CommandGroup heading="Workspaces">
            {workspaces.map(w => (
              <CommandItem
                key={w.workspace_id}
                value={`ws-${w.workspace_name}-${w.slug}`}
                onSelect={() => runAction(`/control/workspaces/${w.workspace_id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{w.workspace_name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">/{w.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {w.is_suspended && (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1.5">Suspended</Badge>
                  )}
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {filteredNav.map(item => (
            <CommandItem
              key={item.to}
              value={`nav-${item.label} ${item.keywords}`}
              onSelect={() => runAction(item.to)}
            >
              <item.icon className="h-4 w-4 mr-2 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Saved Views */}
        <CommandGroup heading="Saved Views">
          {savedViews.map(item => (
            <CommandItem
              key={item.to}
              value={`view-${item.label} ${item.keywords}`}
              onSelect={() => runAction(item.to)}
            >
              <Bookmark className="h-4 w-4 mr-2 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Quick Actions */}
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem
            value="action-pause-sending"
            onSelect={() => runAction('/control/workspaces?action=pause-all')}
          >
            <Pause className="h-4 w-4 mr-2 text-amber-500" />
            Pause Sending (Workspace)
          </CommandItem>

          {isSuperAdmin && (
            <>
              <CommandItem
                value="action-toggle-read-only"
                onSelect={handleToggleReadOnly}
              >
                <Shield className="h-4 w-4 mr-2 text-destructive" />
                Toggle Read-Only Mode
                <Badge variant="outline" className="ml-auto text-[9px] h-4">super_admin</Badge>
              </CommandItem>

              <CommandItem
                value="action-declare-incident"
                onSelect={() => runAction('/control/incidents')}
              >
                <Siren className="h-4 w-4 mr-2 text-destructive" />
                Declare Incident
                <Badge variant="outline" className="ml-auto text-[9px] h-4">super_admin</Badge>
              </CommandItem>

              <CommandItem
                value="action-export-audit"
                onSelect={() => runAction('/control/audit-logs?export=true')}
              >
                <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                Export Audit Logs
                <Badge variant="outline" className="ml-auto text-[9px] h-4">super_admin</Badge>
              </CommandItem>
            </>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
