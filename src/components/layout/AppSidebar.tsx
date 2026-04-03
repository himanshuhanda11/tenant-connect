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
import {
  META_ADS_ANY_PERMISSIONS,
  META_ADS_ATTRIBUTION_PERMISSIONS,
  META_ADS_AUTOMATION_PERMISSIONS,
  META_ADS_CONNECT_PERMISSIONS,
  META_ADS_VIEW_PERMISSIONS,
  useCurrentRolePermissions,
} from '@/hooks/useCurrentRolePermissions';
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
  owner: { color: 'text-amber-400' },
  admin: { color: 'text-emerald-400' },
  manager: { color: 'text-sidebar-primary' },
  agent: { color: 'text-emerald-400' },
};

const getAvatarColor = (name: string): string => {
  const colors = [
    'from-emerald-500 to-teal-600',
    'from-emerald-500 to-teal-600',
    'from-teal-500 to-cyan-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
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
  const { hasAnyPermission } = useCurrentRolePermissions();

  const channelMenuItems: MenuItem[] = [
    { title: 'WhatsApp', url: '/phone-numbers', icon: Phone, key: 'phone-numbers', docUrl: '/help/phone-numbers' },
    { title: 'Templates', url: '/templates', icon: FileText, key: 'templates', isNew: true, docUrl: '/help/templates' },
  ];

  const isAgent = currentRole === 'agent';
  const filteredMetaAdsMenuItems = metaAdsMenuItems.filter((item) => {
    switch (item.key) {
      case 'meta-ads-overview':
      case 'meta-ads-manager':
      case 'meta-ads-analytics':
      case 'lead-forms':
        return hasAnyPermission(META_ADS_VIEW_PERMISSIONS);
      case 'meta-ads-setup':
      case 'meta-ads-settings':
        return hasAnyPermission(META_ADS_CONNECT_PERMISSIONS);
      case 'meta-ads-attribution':
        return hasAnyPermission(META_ADS_ATTRIBUTION_PERMISSIONS);
      case 'meta-ads-automations':
        return hasAnyPermission(META_ADS_AUTOMATION_PERMISSIONS);
      default:
        return hasAnyPermission(META_ADS_ANY_PERMISSIONS);
    }
  });

  const filteredMainMenuItems = mainMenuItems;

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
    ...(isAgent || filteredMetaAdsMenuItems.length === 0 ? [] : [{ label: 'Meta Ads', icon: Megaphone, items: filteredMetaAdsMenuItems }]),
    ...(isAgent ? [] : [{ label: 'Team', icon: Users, items: teamMenuItems }]),
  ];

  const filteredSettingsMenuItems = isAgent
    ? settingsMenuItems.filter(i => ['help'].includes(i.key))
    : settingsMenuItems;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => ({
    'Inbox': true,
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
                    "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ease-in-out",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/70"
                  )}
                  activeClassName=""
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] transition-all duration-200",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80"
                  )} />
                </NavLink>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium bg-popover text-popover-foreground border-border">
              {item.title}
            </TooltipContent>
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
              "group/menuitem relative flex items-center gap-3 px-3 py-[11px] sm:py-[9px] rounded-lg text-[14px] font-medium transition-all duration-200 ease-in-out",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--sidebar-border))]"
                : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/70"
            )}
            activeClassName=""
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[60%] rounded-r-full bg-sidebar-primary" />
            )}
            <item.icon className={cn(
              "h-4 w-4 flex-shrink-0 transition-all duration-200 ease-in-out",
              isActive
                ? "text-sidebar-primary"
                : "text-sidebar-foreground/70 group-hover/menuitem:text-sidebar-accent-foreground group-hover/menuitem:-translate-y-[1px]"
            )} />
            <span className="flex-1 truncate tracking-[-0.01em] leading-none">{item.title}</span>
            {item.isNew && (
              <span className="text-[8px] font-bold uppercase tracking-wider text-sidebar-primary bg-sidebar-primary/10 px-1.5 py-0.5 rounded-md leading-none border border-sidebar-primary/20">
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
                <ExternalLink className="h-3 w-3 text-sidebar-foreground/70 hover:text-sidebar-primary" strokeWidth={1.5} />
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
            <SidebarMenu className="space-y-1">
              {group.items.slice(0, 3).map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }

    return (
      <div key={group.label} ref={hasActiveItem ? activeGroupRef : undefined}>
        <Collapsible open={isOpen} onOpenChange={() => toggleGroup(group.label)} className="mt-1.5 pt-1.5 border-t border-sidebar-border/30 first:border-t-0 first:pt-0">
          <SidebarGroup>
           <CollapsibleTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 ease-in-out border border-transparent",
                hasActiveItem
                  ? "text-sidebar-primary bg-sidebar-primary/5 border-sidebar-primary/15"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
              )}>
                <group.icon className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors duration-200",
                  hasActiveItem ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                )} />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronRight className={cn("w-3 h-3 transition-transform duration-200 ease-in-out", isOpen && "rotate-90")} strokeWidth={1.5} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
              <SidebarGroupContent className="mt-0.5">
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

  const workspaceColor = currentTenant?.name ? getAvatarColor(currentTenant.name) : 'from-emerald-500 to-teal-600';
  const userColor = profile?.full_name || user?.email ? getAvatarColor(profile?.full_name || user?.email || '') : 'from-emerald-500 to-teal-600';

  return (
    <Sidebar collapsible="icon">
      {/* ── Header ── */}
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity duration-200">
            <img src={aireatroLogo} alt="AiReatro" className={cn("w-auto transition-all duration-200", isCollapsed ? "h-6" : "h-7")} />
            {!isCollapsed && (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-sidebar-primary bg-sidebar-primary/10 rounded-full border border-sidebar-primary/20">
                Pro
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-7 w-7 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/70 transition-all duration-200">
              <PanelLeftClose className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="w-full h-7 mt-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/70 transition-all duration-200">
            <PanelLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent ref={sidebarScrollRef} className="px-3 py-3 overflow-y-auto">
        {/* ── Workspace Switcher ── */}
        <div className="mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2.5 rounded-lg transition-all duration-200 ease-in-out group",
                "hover:bg-sidebar-accent/70",
                isCollapsed ? "p-1.5 justify-center" : "px-3 py-2.5"
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
                        <p className={cn("text-[10px] font-medium capitalize", roleConfig[currentRole]?.color || "text-sidebar-foreground") }>
                          {currentRole}
                        </p>
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 text-sidebar-foreground/50 group-hover:text-sidebar-foreground" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-1.5 bg-popover shadow-2xl border border-border text-popover-foreground">
              <div className="px-2 py-1.5 mb-1">
                <p className="text-[10px] font-semibold text-popover-foreground/60 uppercase tracking-wider">Switch Workspace</p>
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
                        "flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-popover-foreground/85 hover:text-popover-foreground focus:text-popover-foreground focus:bg-accent",
                        isSelected && "bg-sidebar-primary/10 text-popover-foreground"
                      )}
                    >
                      <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg font-bold text-white text-[10px]", `bg-gradient-to-br ${tenantColor}`)}>
                        {tenant.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate">{tenant.name}</p>
                        <p className={cn("text-[10px] capitalize", roleConfig[tenant.role]?.color || "text-popover-foreground/60")}>{tenant.role}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sidebar-primary" strokeWidth={1.5} />}
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator className="my-1 bg-border" />
              <DropdownMenuItem onClick={() => navigate('/select-workspace')} className="gap-2.5 p-2 rounded-lg text-popover-foreground/70 hover:text-popover-foreground focus:text-popover-foreground focus:bg-accent">
                <div className="w-7 h-7 rounded-lg border border-dashed border-border flex items-center justify-center">
                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                </div>
                <span className="text-[12px]">Create or Switch</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Main Nav ── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {filteredMainMenuItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && <div className="mx-3 my-2 border-b border-sidebar-border/40" />}

        {/* ── Collapsible Groups ── */}
        {menuGroups.map(group => renderCollapsibleGroup(group))}

        {!isCollapsed && <div className="mx-3 my-3 border-b border-sidebar-border/50" />}

        {/* ── Platform ── */}
        <SidebarGroup className="mt-1">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 mb-1">
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

      {/* ── Footer — Floating tile ── */}
      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-2.5 rounded-lg transition-all duration-200 ease-in-out group",
              "bg-sidebar-accent/40 hover:bg-sidebar-accent/70 border border-sidebar-border/70 shadow-[0_2px_8px_-2px_hsl(var(--sidebar-background)/0.35)]",
              isCollapsed ? "p-2 justify-center" : "px-3 py-2.5"
            )}>
              <div className={cn(
                "flex items-center justify-center rounded-full font-bold text-white text-[10px] flex-shrink-0",
                `bg-gradient-to-br ${userColor}`,
                "w-7 h-7"
              )}>
                {getInitials(profile?.full_name ?? null, user?.email ?? '')}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12px] font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/65 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronUp className="w-3 h-3 text-sidebar-foreground/50 group-hover:text-sidebar-foreground" strokeWidth={1.5} />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56 p-1.5 bg-popover shadow-2xl border border-border text-popover-foreground mb-1">
            <div className="px-2 py-2 mb-1 bg-accent rounded-lg">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full font-bold text-white text-[10px] flex items-center justify-center", `bg-gradient-to-br ${userColor}`)}>
                  {getInitials(profile?.full_name ?? null, user?.email ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-popover-foreground truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-popover-foreground/60 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <DropdownMenuItem onClick={() => navigate('/settings?section=profile')} className="gap-2 py-1.5 rounded-md text-[12px] text-popover-foreground/75 hover:text-popover-foreground focus:text-popover-foreground focus:bg-accent">
              <User className="w-3.5 h-3.5" strokeWidth={1.5} /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2 py-1.5 rounded-md text-[12px] text-popover-foreground/75 hover:text-popover-foreground focus:text-popover-foreground focus:bg-accent">
              <Settings className="w-3.5 h-3.5" strokeWidth={1.5} /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2 py-1.5 rounded-md text-[12px] text-popover-foreground/75 hover:text-popover-foreground focus:text-popover-foreground focus:bg-accent">
              <a href="/help" target="_blank" rel="noopener noreferrer">
                <Headphones className="w-3.5 h-3.5" strokeWidth={1.5} /> Help
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem onClick={handleSignOut} className="gap-2 py-1.5 rounded-md text-[12px] text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
