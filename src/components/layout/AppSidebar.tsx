import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ChevronDown, ChevronRight, Plus, Inbox, Contact, Phone, FileText, Send, Zap, CreditCard, Shield, UsersRound, Route, Clock, ScrollText, Tag, ListFilter, HelpCircle, Megaphone, BarChart3, Link2, Target, Workflow, Cog, Building2, Sparkles, TrendingUp, Headphones, Check, Puzzle, PanelLeftClose, PanelLeft, User, ChevronUp } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
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
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { title: 'Inbox', url: '/inbox', icon: Inbox, badge: 0, key: 'inbox' },
  { title: 'Contacts', url: '/contacts', icon: Contact, key: 'contacts' },
  { title: 'Tags', url: '/tags', icon: Tag, key: 'tags' },
  { title: 'User Attributes', url: '/user-attributes', icon: ListFilter, key: 'user-attributes' }
];

const channelMenuItems: MenuItem[] = [
  { title: 'Phone Numbers', url: '/phone-numbers', icon: Phone, key: 'phone-numbers' },
  { title: 'Templates', url: '/templates', icon: FileText, key: 'templates', isNew: true }
];

const growthMenuItems: MenuItem[] = [
  { title: 'Campaigns', url: '/campaigns', icon: Send, key: 'campaigns' },
  { title: 'Automation', url: '/automation', icon: Zap, key: 'automation' },
  { title: 'Auto-Form Rules', url: '/automation/form-rules', icon: FileText, key: 'form-rules', isNew: true },
  { title: 'Flows', url: '/flows', icon: Workflow, key: 'flows' }
];

const metaAdsMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/meta-ads', icon: Megaphone, key: 'meta-ads-overview' },
  { title: 'Setup', url: '/meta-ads/setup', icon: Link2, key: 'meta-ads-setup' },
  { title: 'Ads Manager', url: '/meta-ads/manager', icon: Target, key: 'meta-ads-manager' },
  { title: 'Lead Analytics', url: '/meta-ads/analytics', icon: BarChart3, key: 'meta-ads-analytics', isNew: true },
  { title: 'Attribution Rules', url: '/meta-ads/attribution', icon: Route, key: 'meta-ads-attribution' },
  { title: 'Automations', url: '/meta-ads/automations', icon: Workflow, key: 'meta-ads-automations' },
  { title: 'Settings', url: '/meta-ads/settings', icon: Cog, key: 'meta-ads-settings' }
];

const teamMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/team', icon: Users, key: 'team-overview' },
  { title: 'Members', url: '/team/members', icon: Users, key: 'team-members' },
  { title: 'Roles & Permissions', url: '/team/roles', icon: Shield, key: 'team-roles' },
  { title: 'Teams (Groups)', url: '/team/groups', icon: UsersRound, key: 'team-groups' },
  { title: 'Routing', url: '/team/routing', icon: Route, key: 'team-routing' },
  { title: 'Working Hours & SLA', url: '/team/sla', icon: Clock, key: 'team-sla' },
  { title: 'Audit Logs', url: '/team/audit', icon: ScrollText, key: 'team-audit' }
];

const settingsMenuItems: MenuItem[] = [
  { title: 'Integrations', url: '/app/integrations', icon: Puzzle, key: 'integrations', isNew: true },
  { title: 'Billing', url: '/billing', icon: CreditCard, key: 'billing' },
  { title: 'Settings', url: '/settings', icon: Settings, key: 'settings' },
  { title: 'Guide', url: '/help', icon: HelpCircle, key: 'help' }
];

const menuGroups: MenuGroup[] = [
  { label: 'Channels', icon: Phone, items: channelMenuItems },
  { label: 'Growth', icon: TrendingUp, items: growthMenuItems },
  { label: 'Meta Ads', icon: Megaphone, items: metaAdsMenuItems },
  { label: 'Team', icon: Users, items: teamMenuItems }
];

const roleConfig: Record<string, { color: string; bg: string; border: string }> = {
  owner: { color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  admin: { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  agent: { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20' }
};

// Generate consistent color from name
const getAvatarColor = (name: string): string => {
  const colors = [
    'from-green-400 to-emerald-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-violet-500',
    'from-pink-400 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { tenants, currentTenant, currentRole, setCurrentTenant } = useTenant();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Meta Ads': true,
    'Team': false
  });

  const handleSignOut = async () => {
    // Clear tenant immediately so route guards don't bounce the user back.
    setCurrentTenant(null);
    await signOut();
    navigate('/login', { replace: true });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const isRouteActive = (url: string) => {
    if (url === '/dashboard') return location.pathname === url;
    return location.pathname.startsWith(url);
  };

  const isGroupActive = (items: MenuItem[]) => {
    return items.some(item => isRouteActive(item.url));
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenuItem = (item: MenuItem, compact = false) => {
    const meta = sidebarDescriptions[item.key];
    const isActive = isRouteActive(item.url);
    const isHelpItem = item.key === 'help';

    if (isCollapsed) {
      return (
        <SidebarMenuItem key={item.title} className="relative">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === '/dashboard'}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg transition-all duration-200 font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isHelpItem
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-foreground/80 hover:text-foreground hover:bg-sidebar-accent"
                  )}
                  activeClassName=""
                >
                  <item.icon className="w-5 h-5" />
                </NavLink>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {item.title}
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title} className="relative">
        <SidebarMenuButton asChild className="group/item">
          <NavLink
            to={item.url}
            end={item.url === '/dashboard'}
            className={cn(
              "flex items-center gap-3 px-3 pr-10 rounded-lg transition-all duration-200 font-medium",
              compact ? "py-2" : "py-2.5",
              isActive
                ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary -ml-[2px] pl-[14px]"
                : isHelpItem
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-foreground/80 hover:text-foreground hover:bg-sidebar-accent"
            )}
            activeClassName=""
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary", isHelpItem && !isActive && "text-primary")} />
            <span className="flex-1 truncate">{item.title}</span>
            {item.isNew && (
              <Badge className="h-5 px-1.5 text-[10px] bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                NEW
              </Badge>
            )}
            {item.badge !== undefined && item.badge > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs animate-pulse">
                {item.badge}
              </Badge>
            )}
          </NavLink>
        </SidebarMenuButton>

        {meta && (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded",
                  "bg-sidebar-accent text-sidebar-foreground/60",
                  "hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
                )}
                aria-label={`Help for ${item.title}`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="start" className="max-w-[280px] p-3">
              <p className="text-sm mb-2">{meta.description}</p>
              <NavLink
                to={meta.helpSlug ? `/help/${meta.helpSlug}` : "/help"}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Learn more →
              </NavLink>
            </TooltipContent>
          </Tooltip>
        )}
      </SidebarMenuItem>
    );
  };

  const renderCollapsibleGroup = (group: MenuGroup) => {
    const isOpen = expandedGroups[group.label] ?? isGroupActive(group.items);
    const hasActiveItem = isGroupActive(group.items);
    const GroupIcon = group.icon;

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
      <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)} className="mt-2">
        <SidebarGroup>
          <CollapsibleTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
              hasActiveItem ? "text-primary bg-primary/5" : "text-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50"
            )}>
              <GroupIcon className="w-4 h-4" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-90")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down">
            <SidebarGroupContent className="mt-1 ml-2 pl-4 border-l border-sidebar-border">
              <SidebarMenu className="space-y-0.5">
                {group.items.map(item => renderMenuItem(item, true))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  };

  const workspaceColor = currentTenant?.name ? getAvatarColor(currentTenant.name) : 'from-green-400 to-emerald-500';
  const userColor = profile?.full_name || user?.email ? getAvatarColor(profile?.full_name || user?.email || '') : 'from-blue-400 to-indigo-500';

  return (
    <Sidebar className={cn("border-r border-sidebar-border bg-sidebar transition-all duration-300", isCollapsed ? "w-[68px]" : "w-[260px]")} collapsible="icon">
      {/* Header with Logo and Toggle */}
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src={aireatroLogo}
              alt="AiReatro"
              className={cn("w-auto transition-all duration-300", isCollapsed ? "h-8" : "h-12")}
            />
          </Link>
          {!isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse sidebar</TooltipContent>
            </Tooltip>
          )}
        </div>
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="w-full h-8 mt-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Workspace Switcher - Redesigned */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group",
                "bg-white border border-gray-200 shadow-sm",
                "hover:border-green-300 hover:shadow-md",
                isCollapsed ? "p-2 justify-center" : "px-3 py-3"
              )}>
                <div className={cn(
                  "flex items-center justify-center rounded-xl font-bold text-white text-sm flex-shrink-0 shadow-sm",
                  `bg-gradient-to-br ${workspaceColor}`,
                  isCollapsed ? "w-9 h-9" : "w-10 h-10"
                )}>
                  {currentTenant?.name?.slice(0, 1).toUpperCase() || <Building2 className="w-5 h-5" />}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {currentTenant?.name || 'Select Workspace'}
                      </p>
                      {currentRole && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn(
                            "text-xs font-medium capitalize",
                            roleConfig[currentRole]?.color || "text-gray-500"
                          )}>
                            {currentRole}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-2 bg-white shadow-xl border border-gray-200">
              <div className="px-2 py-2 mb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Switch Workspace
                </p>
              </div>
              <div className="max-h-[280px] overflow-y-auto space-y-1">
                {tenants.map(tenant => {
                  const roleStyle = roleConfig[tenant.role] || {};
                  const isSelected = currentTenant?.id === tenant.id;
                  const tenantColor = getAvatarColor(tenant.name);
                  return (
                    <DropdownMenuItem
                      key={tenant.id}
                      onClick={() => setCurrentTenant(tenant)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all",
                        isSelected ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg font-bold text-white text-sm shadow-sm",
                        `bg-gradient-to-br ${tenantColor}`
                      )}>
                        {tenant.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
                        <span className={cn(
                          "text-[10px] font-medium capitalize",
                          roleConfig[tenant.role]?.color || "text-gray-500"
                        )}>
                          {tenant.role}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={() => navigate('/select-workspace')}
                className="gap-3 p-2.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
              >
                <div className="w-9 h-9 rounded-lg bg-white border-2 border-dashed border-green-300 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Create or Switch</p>
                  <p className="text-xs text-green-600/70">Manage workspaces</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item, index) => (
                <div key={item.title}>
                  {renderMenuItem(item)}
                  {index < mainMenuItems.length - 1 && !isCollapsed && (
                    <div className="mx-3 my-1 border-b border-sidebar-border/50" />
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator after main navigation */}
        {!isCollapsed && <div className="mx-3 my-3 border-b border-sidebar-border" />}

        {/* Collapsible Groups */}
        {menuGroups.map((group, groupIndex) => (
          <div key={group.label}>
            {renderCollapsibleGroup(group)}
            {groupIndex < menuGroups.length - 1 && !isCollapsed && (
              <div className="mx-3 my-2 border-b border-sidebar-border/50" />
            )}
          </div>
        ))}

        {/* Separator before platform section */}
        {!isCollapsed && <div className="mx-3 my-3 border-b border-sidebar-border" />}

        {/* Platform Section */}
        <SidebarGroup className="mt-2">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider px-3 mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Platform
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsMenuItems.map((item, index) => (
                <div key={item.title}>
                  {renderMenuItem(item)}
                  {index < settingsMenuItems.length - 1 && !isCollapsed && (
                    <div className="mx-3 my-1 border-b border-sidebar-border/50" />
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile - Redesigned */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 rounded-xl transition-all group",
              "bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200",
              "hover:from-gray-100 hover:to-gray-50 hover:border-gray-300 hover:shadow-sm",
              isCollapsed ? "p-2 justify-center" : "px-3 py-2.5"
            )}>
              <div className={cn(
                "flex items-center justify-center rounded-full font-bold text-white text-xs shadow-sm flex-shrink-0",
                `bg-gradient-to-br ${userColor}`,
                isCollapsed ? "w-8 h-8" : "w-9 h-9"
              )}>
                {getInitials(profile?.full_name ?? null, user?.email ?? '')}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-64 p-2 bg-white shadow-xl border border-gray-200 mb-2">
            <div className="px-3 py-3 mb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full font-bold text-white text-sm flex items-center justify-center shadow-sm",
                  `bg-gradient-to-br ${userColor}`
                )}>
                  {getInitials(profile?.full_name ?? null, user?.email ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 py-2.5 rounded-lg hover:bg-gray-50">
              <User className="w-4 h-4 text-gray-500" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 py-2.5 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')} className="gap-3 py-2.5 rounded-lg hover:bg-gray-50">
              <Headphones className="w-4 h-4 text-gray-500" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 focus:text-red-700 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
