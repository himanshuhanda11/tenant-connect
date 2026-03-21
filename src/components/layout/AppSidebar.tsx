import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ChevronDown, ChevronRight, Plus, Inbox, Contact, Phone, FileText, Send, Zap, CreditCard, Shield, UsersRound, Route, Clock, ScrollText, Tag, ListFilter, HelpCircle, Megaphone, BarChart3, Link2, Target, Workflow, Cog, Building2, TrendingUp, Headphones, Check, Puzzle, PanelLeftClose, PanelLeft, User, ChevronUp, ExternalLink, AlertTriangle, Ban } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { sidebarDescriptions } from '@/data/sidebarDescriptions';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  key: string;
  isNew?: boolean;
  docUrl?: string;
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
];

const crmMenuItems: MenuItem[] = [
  { title: 'Contacts', url: '/contacts', icon: Contact, key: 'contacts', docUrl: '/help/contacts-tags' },
  { title: 'Tags', url: '/tags', icon: Tag, key: 'tags', docUrl: '/help/contacts-tags' },
  { title: 'Attributes', url: '/user-attributes', icon: ListFilter, key: 'user-attributes', docUrl: '/help/contacts-tags' },
];

const inboxMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/inbox/dashboard', icon: BarChart3, key: 'inbox-dashboard' },
  { title: 'All Inbox', url: '/inbox', icon: Inbox, key: 'inbox-all', docUrl: '/help/inbox' },
  { title: 'My Inbox', url: '/inbox/mine', icon: User, key: 'inbox-mine' },
  { title: 'New Today', url: '/inbox/new-today', icon: Plus, key: 'inbox-new-today' },
  { title: 'Follow-up Today', url: '/inbox/followup-today', icon: Clock, key: 'inbox-followup' },
  { title: 'Overdue', url: '/inbox/overdue', icon: AlertTriangle, key: 'inbox-overdue' },
  { title: 'Converted', url: '/inbox/converted', icon: Check, key: 'inbox-converted' },
  { title: 'Junk', url: '/inbox/junk', icon: Ban, key: 'inbox-junk' },
];

const growthMenuItems: MenuItem[] = [
  { title: 'Broadcast', url: '/campaigns', icon: Send, key: 'campaigns', docUrl: '/help/campaigns' },
  { title: 'Automation', url: '/automation', icon: Zap, key: 'automation', docUrl: '/help/automation' },
  { title: 'Form Rules', url: '/automation/form-rules', icon: FileText, key: 'form-rules', isNew: true, docUrl: '/help/form-rules' },
  { title: 'Flows', url: '/flows', icon: Workflow, key: 'flows', docUrl: '/help/automation' },
];

const metaAdsMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/meta-ads', icon: Megaphone, key: 'meta-ads-overview', docUrl: '/help/meta-ads' },
  { title: 'Setup', url: '/meta-ads/setup', icon: Link2, key: 'meta-ads-setup', docUrl: '/help/meta-ads' },
  { title: 'Lead Forms', url: '/lead-forms', icon: FileText, key: 'lead-forms', isNew: true },
  { title: 'Ads Manager', url: '/meta-ads/manager', icon: Target, key: 'meta-ads-manager', docUrl: '/help/meta-ads' },
  { title: 'Lead Analytics', url: '/meta-ads/analytics', icon: BarChart3, key: 'meta-ads-analytics', isNew: true, docUrl: '/help/meta-ads' },
  { title: 'Attribution', url: '/meta-ads/attribution', icon: Route, key: 'meta-ads-attribution', docUrl: '/help/meta-ads' },
  { title: 'Automations', url: '/meta-ads/automations', icon: Workflow, key: 'meta-ads-automations', docUrl: '/help/meta-ads' },
  { title: 'Ads Settings', url: '/meta-ads/settings', icon: Cog, key: 'meta-ads-settings', docUrl: '/help/meta-ads' },
];

const teamMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/team', icon: Users, key: 'team-overview', docUrl: '/help/team' },
  { title: 'Members', url: '/team/members', icon: Users, key: 'team-members', docUrl: '/help/team' },
  { title: 'Roles', url: '/team/roles', icon: Shield, key: 'team-roles', docUrl: '/help/team' },
  { title: 'Groups', url: '/team/groups', icon: UsersRound, key: 'team-groups', docUrl: '/help/team' },
  { title: 'Routing', url: '/team/routing', icon: Route, key: 'team-routing', docUrl: '/help/team' },
  { title: 'Hours & SLA', url: '/team/sla', icon: Clock, key: 'team-sla', docUrl: '/help/team' },
  { title: 'Audit Logs', url: '/team/audit', icon: ScrollText, key: 'team-audit', docUrl: '/help/team' },
];

const settingsMenuItems: MenuItem[] = [
  { title: 'Integrations', url: '/app/integrations', icon: Puzzle, key: 'integrations', isNew: true },
  { title: 'Billing', url: '/billing', icon: CreditCard, key: 'billing' },
  { title: 'Settings', url: '/settings', icon: Settings, key: 'settings' },
];

const roleConfig: Record<string, { color: string }> = {
  owner: { color: 'text-amber-500' },
  admin: { color: 'text-blue-500' },
  agent: { color: 'text-emerald-500' },
};

const getAvatarColor = (name: string): string => {
  const colors = [
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-violet-400 to-purple-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-sky-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { tenants, currentTenant, currentRole, setCurrentTenant } = useTenant();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { phoneNumbers } = usePhoneNumbers();

  const channelMenuItems: MenuItem[] = [
    { title: 'WhatsApp', url: '/phone-numbers', icon: Phone, key: 'phone-numbers', docUrl: '/help/phone-numbers' },
    { title: 'Templates', url: '/templates', icon: FileText, key: 'templates', isNew: true, docUrl: '/help/templates' },
  ];

  const isAgent = currentRole === 'agent';
  const filteredMainMenuItems = isAgent
    ? mainMenuItems
    : mainMenuItems;

  const filteredInboxMenuItems = isAgent
    ? inboxMenuItems.filter(i => ['inbox-all', 'inbox-mine', 'inbox-followup', 'inbox-overdue'].includes(i.key))
    : inboxMenuItems;

  const filteredCrmMenuItems = isAgent
    ? crmMenuItems.filter(i => ['contacts', 'tags'].includes(i.key))
    : crmMenuItems;

  const menuGroups: MenuGroup[] = [
    { label: 'Inbox', icon: Inbox, items: filteredInboxMenuItems, defaultOpen: true },
    { label: 'CRM', icon: Contact, items: filteredCrmMenuItems },
    ...(isAgent ? [] : [{ label: 'Channels', icon: Phone, items: channelMenuItems }]),
    ...(isAgent ? [] : [{ label: 'Growth', icon: TrendingUp, items: growthMenuItems }]),
    ...(isAgent ? [] : [{ label: 'Meta Ads', icon: Megaphone, items: metaAdsMenuItems }]),
    ...(isAgent ? [] : [{ label: 'Team', icon: Users, items: teamMenuItems }]),
  ];

  const filteredSettingsMenuItems = isAgent
    ? settingsMenuItems.filter(i => ['help'].includes(i.key))
    : settingsMenuItems;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => ({
    'Meta Ads': true,
    'Team': location.pathname.startsWith('/team'),
  }));

  useEffect(() => {
    const activeGroup = menuGroups.find(g => isGroupActive(g.items));
    if (activeGroup) setExpandedGroups(prev => ({ ...prev, [activeGroup.label]: true }));
  }, [location.pathname]);

  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const activeGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      activeGroupRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setCurrentTenant(null);
    await signOut();
    navigate('/login', { replace: true });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email.slice(0, 2).toUpperCase();
  };

  const isRouteActive = (url: string) => {
    if (url === '/dashboard') return location.pathname === url;
    return location.pathname.startsWith(url);
  };

  const isGroupActive = (items: MenuItem[]) => items.some(item => isRouteActive(item.url));
  const toggleGroup = (label: string) => setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));

  /* ── Render a single menu item ── */
  const renderMenuItem = (item: MenuItem, nested = false) => {
    const isActive = isRouteActive(item.url);

    if (isCollapsed) {
      return (
        <SidebarMenuItem key={item.title}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === '/dashboard'}
                  className={cn(
                    "flex items-center justify-center p-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                      : "text-sidebar-foreground/45 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  activeClassName=""
                >
                  <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} />
                </NavLink>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">{item.title}</TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === '/dashboard'}
            className={cn(
              "group/menuitem relative flex items-center gap-3 px-3 py-[11px] rounded-xl text-[13px] font-medium transition-all duration-200 ease-out",
              isActive
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)] font-semibold"
                : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            activeClassName=""
          >
            {/* Left accent bar for active state */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
            )}
            <item.icon className={cn(
              "h-[16px] w-[16px] flex-shrink-0 transition-colors duration-200",
              isActive ? "text-primary" : "text-sidebar-foreground/35 group-hover/menuitem:text-sidebar-foreground/60"
            )} />
            <span className="flex-1 truncate tracking-[-0.01em] leading-none">{item.title}</span>
            {item.isNew && (
              <span className="text-[8px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md leading-none">
                new
              </span>
            )}
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant="destructive" className="h-[18px] min-w-[18px] px-1 text-[10px] rounded-full">
                {item.badge}
              </Badge>
            )}
            {item.docUrl && (
              <a
                href={item.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover/menuitem:opacity-100 transition-opacity duration-200 p-0.5 rounded-md hover:bg-sidebar-accent"
                title={`${item.title} docs`}
              >
                <ExternalLink className="h-3 w-3 text-sidebar-foreground/30 hover:text-primary" />
              </a>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  /* ── Collapsible group ── */
  const renderCollapsibleGroup = (group: MenuGroup) => {
    const isOpen = expandedGroups[group.label] ?? isGroupActive(group.items);
    const hasActiveItem = isGroupActive(group.items);

    if (isCollapsed) {
      return (
        <SidebarGroup key={group.label} className="mt-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {group.items.slice(0, 3).map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }

    return (
      <div key={group.label} ref={hasActiveItem ? activeGroupRef : undefined}>
        <Collapsible open={isOpen} onOpenChange={() => toggleGroup(group.label)} className="mt-1.5">
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-200",
                hasActiveItem
                  ? "text-primary bg-primary/5"
                  : "text-sidebar-foreground/35 hover:text-sidebar-foreground/55 hover:bg-sidebar-accent/50"
              )}>
                <group.icon className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronRight className={cn("w-3 h-3 transition-transform duration-250 ease-out", isOpen && "rotate-90")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
              <SidebarGroupContent className="mt-1.5 ml-2 pl-3 border-l-[1.5px] border-sidebar-border/40">
                <SidebarMenu className="space-y-0.5">
                  {group.items.map(item => renderMenuItem(item, true))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </div>
    );
  };

  const workspaceColor = currentTenant?.name ? getAvatarColor(currentTenant.name) : 'from-emerald-400 to-teal-500';
  const userColor = profile?.full_name || user?.email ? getAvatarColor(profile?.full_name || user?.email || '') : 'from-blue-400 to-indigo-500';

  return (
    <Sidebar collapsible="icon">
      {/* ── Header ── */}
      <SidebarHeader className="px-3 py-4 border-b border-sidebar-border/50">
        <div className="flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity duration-200">
            <img src={aireatroLogo} alt="AiReatro" className={cn("w-auto transition-all duration-200", isCollapsed ? "h-7" : "h-9")} />
          </Link>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-7 w-7 rounded-xl text-sidebar-foreground/25 hover:text-sidebar-foreground/50 hover:bg-sidebar-accent transition-all duration-200">
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="w-full h-7 mt-2.5 rounded-xl text-sidebar-foreground/25 hover:text-sidebar-foreground/50 hover:bg-sidebar-accent transition-all duration-200">
            <PanelLeft className="w-3.5 h-3.5" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent ref={sidebarScrollRef} className="px-3 py-3.5 overflow-y-auto">
        {/* ── Workspace Switcher ── */}
        <div className="mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 group",
                "hover:bg-sidebar-accent/50",
                isCollapsed ? "p-1.5 justify-center" : "px-2.5 py-2"
              )}>
                <div className={cn(
                  "flex items-center justify-center rounded-lg font-bold text-white text-xs flex-shrink-0",
                  `bg-gradient-to-br ${workspaceColor}`,
                  isCollapsed ? "w-7 h-7" : "w-8 h-8"
                )}>
                  {currentTenant?.name?.slice(0, 1).toUpperCase() || <Building2 className="w-4 h-4" />}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-semibold text-sidebar-foreground truncate">
                        {currentTenant?.name || 'Select'}
                      </p>
                      {currentRole && (
                        <p className={cn("text-[10px] font-medium capitalize", roleConfig[currentRole]?.color || "text-muted-foreground")}>
                          {currentRole}
                        </p>
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 text-sidebar-foreground/30" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-1.5 bg-popover shadow-xl border border-border">
              <div className="px-2 py-1.5 mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Switch Workspace</p>
              </div>
              <div className="max-h-[240px] overflow-y-auto space-y-0.5">
                {tenants.map(tenant => {
                  const isSelected = currentTenant?.id === tenant.id;
                  const tenantColor = getAvatarColor(tenant.name);
                  return (
                    <DropdownMenuItem
                      key={tenant.id}
                      onClick={() => setCurrentTenant(tenant)}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg cursor-pointer",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg font-bold text-white text-[10px]", `bg-gradient-to-br ${tenantColor}`)}>
                        {tenant.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-popover-foreground truncate">{tenant.name}</p>
                        <p className={cn("text-[10px] capitalize", roleConfig[tenant.role]?.color || "text-muted-foreground")}>{tenant.role}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onClick={() => navigate('/select-workspace')} className="gap-2.5 p-2 rounded-lg">
                <div className="w-7 h-7 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-[12px] text-muted-foreground">Create or Switch</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Main Nav ── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMainMenuItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && <div className="mx-3 my-2.5 border-b border-sidebar-border/40" />}

        {/* ── Collapsible Groups ── */}
        {menuGroups.map(group => renderCollapsibleGroup(group))}

        {!isCollapsed && <div className="mx-3 my-2.5 border-b border-sidebar-border/40" />}

        {/* ── Platform ── */}
        <SidebarGroup className="mt-1.5">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] font-semibold uppercase tracking-[0.06em] px-3 mb-1">
              Platform
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {filteredSettingsMenuItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="px-2.5 py-2.5 border-t border-sidebar-border/40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-2 rounded-lg transition-all group hover:bg-sidebar-accent/50",
              isCollapsed ? "p-1.5 justify-center" : "px-2 py-1.5"
            )}>
              <div className={cn(
                "flex items-center justify-center rounded-full font-bold text-white text-[10px] flex-shrink-0",
                `bg-gradient-to-br ${userColor}`,
                isCollapsed ? "w-7 h-7" : "w-7 h-7"
              )}>
                {getInitials(profile?.full_name ?? null, user?.email ?? '')}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12px] font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/40 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronUp className="w-3 h-3 text-sidebar-foreground/30" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56 p-1.5 bg-popover shadow-xl border border-border mb-1">
            <div className="px-2 py-2 mb-1 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full font-bold text-white text-[10px] flex items-center justify-center", `bg-gradient-to-br ${userColor}`)}>
                  {getInitials(profile?.full_name ?? null, user?.email ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-popover-foreground truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <DropdownMenuItem onClick={() => navigate('/settings?section=profile')} className="gap-2 py-1.5 rounded-md text-[12px]">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 py-1.5 rounded-md text-[12px]">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2 py-1.5 rounded-md text-[12px]">
              <a href="/help" target="_blank" rel="noopener noreferrer">
                <Headphones className="w-3.5 h-3.5 text-muted-foreground" /> Help
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={handleSignOut} className="gap-2 py-1.5 rounded-md text-[12px] text-destructive focus:text-destructive">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
