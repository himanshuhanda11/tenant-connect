import React, { useState, useRef, useEffect } from 'react';
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
  emoji?: string;
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  defaultOpen?: boolean;
  emoji?: string;
}

const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, key: 'dashboard', emoji: '📊' },
  { title: 'Inbox', url: '/inbox', icon: Inbox, badge: 0, key: 'inbox', emoji: '💬' },
  { title: 'Contacts', url: '/contacts', icon: Contact, key: 'contacts', emoji: '👥' },
  { title: 'Tags', url: '/tags', icon: Tag, key: 'tags', emoji: '🏷️' },
  { title: 'User Attributes', url: '/user-attributes', icon: ListFilter, key: 'user-attributes', emoji: '📝' }
];

// channelMenuItems defined dynamically inside component

const growthMenuItems: MenuItem[] = [
  { title: 'Campaigns', url: '/campaigns', icon: Send, key: 'campaigns', emoji: '📣' },
  { title: 'Automation', url: '/automation', icon: Zap, key: 'automation', emoji: '⚡' },
  { title: 'Auto-Form Rules', url: '/automation/form-rules', icon: FileText, key: 'form-rules', isNew: true, emoji: '📋' },
  { title: 'Flows', url: '/flows', icon: Workflow, key: 'flows', emoji: '🔀' }
];

const metaAdsMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/meta-ads', icon: Megaphone, key: 'meta-ads-overview', emoji: '📢' },
  { title: 'Setup', url: '/meta-ads/setup', icon: Link2, key: 'meta-ads-setup', emoji: '🔗' },
  { title: 'Ads Manager', url: '/meta-ads/manager', icon: Target, key: 'meta-ads-manager', emoji: '🎯' },
  { title: 'Lead Analytics', url: '/meta-ads/analytics', icon: BarChart3, key: 'meta-ads-analytics', isNew: true, emoji: '📈' },
  { title: 'Attribution Rules', url: '/meta-ads/attribution', icon: Route, key: 'meta-ads-attribution', emoji: '🔄' },
  { title: 'Automations', url: '/meta-ads/automations', icon: Workflow, key: 'meta-ads-automations', emoji: '🤖' },
  { title: 'Settings', url: '/meta-ads/settings', icon: Cog, key: 'meta-ads-settings', emoji: '⚙️' }
];

const teamMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/team', icon: Users, key: 'team-overview', emoji: '👔' },
  { title: 'Members', url: '/team/members', icon: Users, key: 'team-members', emoji: '👥' },
  { title: 'Roles & Permissions', url: '/team/roles', icon: Shield, key: 'team-roles', emoji: '🛡️' },
  { title: 'Teams (Groups)', url: '/team/groups', icon: UsersRound, key: 'team-groups', emoji: '🏢' },
  { title: 'Routing', url: '/team/routing', icon: Route, key: 'team-routing', emoji: '🔄' },
  { title: 'Working Hours & SLA', url: '/team/sla', icon: Clock, key: 'team-sla', emoji: '⏰' },
  { title: 'Audit Logs', url: '/team/audit', icon: ScrollText, key: 'team-audit', emoji: '📋' }
];

const settingsMenuItems: MenuItem[] = [
  { title: 'Integrations', url: '/app/integrations', icon: Puzzle, key: 'integrations', isNew: true, emoji: '🔌' },
  { title: 'Billing', url: '/billing', icon: CreditCard, key: 'billing', emoji: '💳' },
  { title: 'Settings', url: '/settings', icon: Settings, key: 'settings', emoji: '⚙️' },
  { title: 'Guide', url: '/help', icon: HelpCircle, key: 'help', emoji: '❓' }
];

// menuGroups defined dynamically inside component

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
  const { phoneNumbers } = usePhoneNumbers();
  
  const primaryPhone = phoneNumbers.length > 0 ? phoneNumbers[0] : null;
  const phoneLabel = primaryPhone?.phone_e164 || 'Phone Numbers';

  const channelMenuItems: MenuItem[] = [
    { title: 'WhatsApp Number', url: '/phone-numbers', icon: Phone, key: 'phone-numbers', emoji: '📱' },
    { title: 'Templates', url: '/templates', icon: FileText, key: 'templates', isNew: true, emoji: '📄' }
  ];

  const menuGroups: MenuGroup[] = [
    { label: 'Channels', icon: Phone, items: channelMenuItems, emoji: '📡' },
    { label: 'Growth', icon: TrendingUp, items: growthMenuItems, emoji: '🚀' },
    { label: 'Meta Ads', icon: Megaphone, items: metaAdsMenuItems, emoji: '📢' },
    { label: 'Team', icon: Users, items: teamMenuItems, emoji: '👥' }
  ];

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => ({
    'Meta Ads': true,
    'Team': location.pathname.startsWith('/team'),
  }));

  // Auto-expand active group when navigating
  useEffect(() => {
    const activeGroup = menuGroups.find(g => isGroupActive(g.items));
    if (activeGroup) {
      setExpandedGroups(prev => ({ ...prev, [activeGroup.label]: true }));
    }
  }, [location.pathname]);

  // Auto-scroll sidebar to active group
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const activeGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeGroupRef.current && sidebarScrollRef.current) {
        activeGroupRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);
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
                    "flex items-center justify-center p-2 rounded-xl transition-all duration-200 font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : isHelpItem
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  activeClassName=""
                >
                  <span className="text-lg">{item.emoji}</span>
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
              "flex items-center gap-3 px-3 pr-10 rounded-xl transition-all duration-200 font-medium",
              compact ? "py-2" : "py-2.5",
              isActive
                ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-primary -ml-[3px] pl-[13px] shadow-sm shadow-primary/5"
                : isHelpItem
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
            )}
            activeClassName=""
          >
            <span className="text-base flex-shrink-0 w-6 text-center">{item.emoji}</span>
            <span className="flex-1 truncate">{item.title}</span>
            {item.isNew && (
              <Badge className="h-5 px-1.5 text-[10px] bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-sm">
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
                  "absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-lg",
                  "bg-sidebar-accent/60 text-sidebar-foreground/40",
                  "hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
      <div ref={hasActiveItem ? activeGroupRef : undefined}>
      <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)} className="mt-2">
        <SidebarGroup>
          <CollapsibleTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200",
              hasActiveItem 
                ? "text-primary bg-primary/5 shadow-sm shadow-primary/5" 
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}>
              <span className="text-sm">{group.emoji}</span>
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-90")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="animate-accordion-down">
            <SidebarGroupContent className="mt-1 ml-3 pl-4 border-l-2 border-sidebar-border/60">
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

  const workspaceColor = currentTenant?.name ? getAvatarColor(currentTenant.name) : 'from-green-400 to-emerald-500';
  const userColor = profile?.full_name || user?.email ? getAvatarColor(profile?.full_name || user?.email || '') : 'from-blue-400 to-indigo-500';

  return (
    <Sidebar className={cn("border-r border-sidebar-border/80 bg-sidebar transition-all duration-300", isCollapsed ? "w-[68px]" : "w-[260px]")} collapsible="icon">
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
                  className="h-8 w-8 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all"
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
                className="w-full h-8 mt-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>

      <SidebarContent ref={sidebarScrollRef} className="px-3 py-4">
        {/* Workspace Switcher - Redesigned */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group",
                "bg-sidebar-accent/50 border border-sidebar-border shadow-sm",
                "hover:border-primary/30 hover:shadow-md",
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
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {currentTenant?.name || 'Select Workspace'}
                      </p>
                      {currentRole && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn(
                            "text-xs font-medium capitalize",
                            roleConfig[currentRole]?.color || "text-muted-foreground"
                          )}>
                            {currentRole}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60 transition-colors" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-2 bg-popover shadow-xl border border-border">
              <div className="px-2 py-2 mb-2 bg-primary/10 rounded-lg">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
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
                        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg font-bold text-white text-sm shadow-sm",
                        `bg-gradient-to-br ${tenantColor}`
                      )}>
                        {tenant.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-popover-foreground truncate">{tenant.name}</p>
                        <span className={cn(
                          "text-[10px] font-medium capitalize",
                          roleConfig[tenant.role]?.color || "text-muted-foreground"
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
                className="gap-3 p-2.5 rounded-lg bg-primary/10 hover:bg-primary/15"
              >
                <div className="w-9 h-9 rounded-lg bg-card border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Create or Switch</p>
                  <p className="text-xs text-primary/70">Manage workspaces</p>
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
              <span className="text-sm">✨</span>
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
              "bg-sidebar-accent/50 border border-sidebar-border",
              "hover:bg-sidebar-accent hover:border-sidebar-border hover:shadow-sm",
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
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60 transition-colors" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-64 p-2 bg-popover shadow-xl border border-border mb-2">
            <div className="px-3 py-3 mb-2 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full font-bold text-white text-sm flex items-center justify-center shadow-sm",
                  `bg-gradient-to-br ${userColor}`
                )}>
                  {getInitials(profile?.full_name ?? null, user?.email ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-popover-foreground">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 py-2.5 rounded-lg hover:bg-accent">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 py-2.5 rounded-lg hover:bg-accent">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')} className="gap-3 py-2.5 rounded-lg hover:bg-accent">
              <Headphones className="w-4 h-4 text-muted-foreground" />
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
