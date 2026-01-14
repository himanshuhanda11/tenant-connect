import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ChevronDown, ChevronRight, Plus, Inbox, Contact, Phone, FileText, Send, Zap, CreditCard, Shield, UsersRound, Route, Clock, ScrollText, Tag, ListFilter, HelpCircle, Megaphone, BarChart3, Link2, Target, Workflow, Cog, Building2, Sparkles, TrendingUp, Headphones, Search, Bell, Check, Puzzle } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { sidebarDescriptions } from '@/data/sidebarDescriptions';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';
interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  badge?: number;
  key: string;
  isNew?: boolean;
}
interface MenuGroup {
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  items: MenuItem[];
  defaultOpen?: boolean;
}
const mainMenuItems: MenuItem[] = [{
  title: 'Dashboard',
  url: '/dashboard',
  icon: LayoutDashboard,
  key: 'dashboard'
}, {
  title: 'Inbox',
  url: '/inbox',
  icon: Inbox,
  badge: 0,
  key: 'inbox'
}, {
  title: 'Contacts',
  url: '/contacts',
  icon: Contact,
  key: 'contacts'
}, {
  title: 'Tags',
  url: '/tags',
  icon: Tag,
  key: 'tags'
}, {
  title: 'User Attributes',
  url: '/user-attributes',
  icon: ListFilter,
  key: 'user-attributes'
}];
const channelMenuItems: MenuItem[] = [{
  title: 'Phone Numbers',
  url: '/phone-numbers',
  icon: Phone,
  key: 'phone-numbers'
}, {
  title: 'Templates',
  url: '/templates',
  icon: FileText,
  key: 'templates'
}];
const growthMenuItems: MenuItem[] = [{
  title: 'Campaigns',
  url: '/campaigns',
  icon: Send,
  key: 'campaigns'
}, {
  title: 'Automation',
  url: '/automation',
  icon: Zap,
  key: 'automation'
}, {
  title: 'Flows',
  url: '/flows',
  icon: Workflow,
  key: 'flows',
  isNew: true
}];
const metaAdsMenuItems: MenuItem[] = [{
  title: 'Overview',
  url: '/meta-ads',
  icon: Megaphone,
  key: 'meta-ads-overview'
}, {
  title: 'Setup',
  url: '/meta-ads/setup',
  icon: Link2,
  key: 'meta-ads-setup'
}, {
  title: 'Ads Manager',
  url: '/meta-ads/manager',
  icon: Target,
  key: 'meta-ads-manager'
}, {
  title: 'Lead Analytics',
  url: '/meta-ads/analytics',
  icon: BarChart3,
  key: 'meta-ads-analytics',
  isNew: true
}, {
  title: 'Attribution Rules',
  url: '/meta-ads/attribution',
  icon: Route,
  key: 'meta-ads-attribution'
}, {
  title: 'Automations',
  url: '/meta-ads/automations',
  icon: Workflow,
  key: 'meta-ads-automations'
}, {
  title: 'Settings',
  url: '/meta-ads/settings',
  icon: Cog,
  key: 'meta-ads-settings'
}];
const teamMenuItems: MenuItem[] = [{
  title: 'Overview',
  url: '/team',
  icon: Users,
  key: 'team-overview'
}, {
  title: 'Members',
  url: '/team/members',
  icon: Users,
  key: 'team-members'
}, {
  title: 'Roles & Permissions',
  url: '/team/roles',
  icon: Shield,
  key: 'team-roles'
}, {
  title: 'Teams (Groups)',
  url: '/team/groups',
  icon: UsersRound,
  key: 'team-groups'
}, {
  title: 'Routing',
  url: '/team/routing',
  icon: Route,
  key: 'team-routing'
}, {
  title: 'Working Hours & SLA',
  url: '/team/sla',
  icon: Clock,
  key: 'team-sla'
}, {
  title: 'Audit Logs',
  url: '/team/audit',
  icon: ScrollText,
  key: 'team-audit'
}];
const settingsMenuItems: MenuItem[] = [{
  title: 'Integrations',
  url: '/app/integrations',
  icon: Puzzle,
  key: 'integrations',
  isNew: true
}, {
  title: 'Billing',
  url: '/billing',
  icon: CreditCard,
  key: 'billing'
}, {
  title: 'Settings',
  url: '/settings',
  icon: Settings,
  key: 'settings'
}, {
  title: 'Guide',
  url: '/help',
  icon: HelpCircle,
  key: 'help'
}];
const menuGroups: MenuGroup[] = [{
  label: 'Channels',
  icon: Phone,
  items: channelMenuItems
}, {
  label: 'Growth',
  icon: TrendingUp,
  items: growthMenuItems
}, {
  label: 'Meta Ads',
  icon: Megaphone,
  items: metaAdsMenuItems
}, {
  label: 'Team',
  icon: Users,
  items: teamMenuItems
}];
const roleConfig: Record<string, {
  color: string;
  bg: string;
  border: string;
}> = {
  owner: {
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
  admin: {
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  agent: {
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20'
  }
};
export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const {
    tenants,
    currentTenant,
    currentRole,
    setCurrentTenant
  } = useTenant();
  const {
    state
  } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Meta Ads': true,
    'Team': false
  });
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
    setExpandedGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
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
            <item.icon
              className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive && "text-primary",
                isHelpItem && !isActive && "text-primary"
              )}
            />
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
                  "hover:text-sidebar-foreground hover:bg-sidebar-accent/80",
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
      return <SidebarGroup key={group.label} className="mt-2">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {group.items.slice(0, 3).map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>;
    }
    return <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)} className="mt-2">
        <SidebarGroup>
          <CollapsibleTrigger asChild>
            <button className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors", hasActiveItem ? "text-primary bg-primary/5" : "text-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50")}>
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
      </Collapsible>;
  };
  return <Sidebar className={cn("border-r border-sidebar-border bg-sidebar transition-all duration-300", isCollapsed ? "w-[68px]" : "w-[260px]")} collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <img 
            src={aireatroLogo} 
            alt="AiReatro" 
            className={cn(
              "w-auto transition-all duration-300",
              isCollapsed ? "h-8" : "h-10"
            )} 
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Workspace Switcher */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("w-full flex items-center gap-3 rounded-xl transition-all duration-200", "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/50 hover:from-sidebar-accent/80 hover:to-sidebar-accent/30", "border border-sidebar-border hover:border-primary/20", isCollapsed ? "p-2 justify-center" : "px-3 py-2.5")}>
                <div className={cn("flex items-center justify-center rounded-lg font-semibold text-sm flex-shrink-0", "bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary", isCollapsed ? "w-8 h-8" : "w-9 h-9")}>
                  {currentTenant?.name?.slice(0, 1).toUpperCase() || <Building2 className="w-4 h-4" />}
                </div>
                {!isCollapsed && <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {currentTenant?.name || 'Select Workspace'}
                      </p>
                      {currentRole && <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", roleConfig[currentRole]?.bg || "bg-muted")} />
                          <p className={cn("text-xs capitalize", roleConfig[currentRole]?.color || "text-muted-foreground")}>
                            {currentRole}
                          </p>
                        </div>}
                    </div>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
                  </>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-2">
              <div className="px-2 py-1.5 mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Switch Workspace
                </p>
              </div>
              {tenants.map(tenant => {
              const roleStyle = roleConfig[tenant.role] || {};
              const isSelected = currentTenant?.id === tenant.id;
              return <DropdownMenuItem key={tenant.id} onClick={() => setCurrentTenant(tenant)} className={cn("flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors", isSelected && "bg-primary/5")}>
                    <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl font-semibold text-sm", "bg-gradient-to-br from-primary/10 to-emerald-500/10 text-primary")}>
                      {tenant.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tenant.name}</p>
                      <Badge variant="outline" className={cn("text-[10px] capitalize mt-1", roleConfig[tenant.role]?.color, roleConfig[tenant.role]?.bg, roleConfig[tenant.role]?.border)}>
                        {tenant.role}
                      </Badge>
                    </div>
                    {isSelected && <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>}
                  </DropdownMenuItem>;
            })}
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={() => navigate('/select-workspace')} className="gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-dashed border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Create or Switch</p>
                  <p className="text-xs text-muted-foreground">Manage workspaces</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Guide Shortcut (always visible) */}
        <div className="mb-4">
          {isCollapsed ? <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild>
                      <NavLink to="/help" className={cn("flex items-center justify-center p-2 rounded-lg transition-all duration-200", "bg-primary/10 text-primary hover:bg-primary/15")} activeClassName="">
                        <HelpCircle className="w-5 h-5" />
                      </NavLink>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">Guide</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu> : <NavLink to="/help" className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold", "bg-primary/10 text-primary hover:bg-primary/15")} activeClassName="">
              <HelpCircle className="w-5 h-5" />
              <span className="flex-1">Guide</span>
              <span className="text-xs font-normal text-primary/80">Quick help</span>
            </NavLink>}
        </div>

        {/* Quick Search - Only when expanded */}
        {!isCollapsed && <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Quick search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm" />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background rounded border">
                ⌘K
              </kbd>
            </div>
          </div>}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible Groups */}
        {menuGroups.map(group => renderCollapsibleGroup(group))}

        {/* Platform Section */}
        <SidebarGroup className="mt-4">
          {!isCollapsed && <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider px-3 mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Platform
            </SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsMenuItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-2", isCollapsed ? "justify-center" : "")}>
          {/* Always-visible Guide button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to="/help"
                className={cn(
                  "shrink-0 flex items-center justify-center rounded-lg transition-colors",
                  "hover:bg-sidebar-accent",
                  isCollapsed ? "w-10 h-10" : "w-10 h-10"
                )}
                aria-label="Guide"
                activeClassName=""
              >
                <HelpCircle className="w-5 h-5 text-foreground" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="top">Guide</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl transition-colors",
                  "hover:bg-sidebar-accent",
                  isCollapsed ? "p-2 justify-center" : "px-3 py-2.5"
                )}
              >
                <Avatar className={cn("flex-shrink-0", isCollapsed ? "w-8 h-8" : "w-9 h-9")}> 
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary text-xs font-semibold">
                    {getInitials(profile?.full_name ?? null, user?.email ?? '')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2">
              <div className="px-3 py-2 mb-2 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 py-2.5 rounded-lg">
                <Settings className="w-4 h-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/help')} className="gap-3 py-2.5 rounded-lg">
                <Headphones className="w-4 h-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={handleSignOut} className="gap-3 py-2.5 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>;
}