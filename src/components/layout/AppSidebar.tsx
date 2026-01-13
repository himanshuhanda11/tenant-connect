import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  MessageSquare,
  Inbox,
  Contact,
  Phone,
  FileText,
  Send,
  Zap,
  CreditCard,
  Shield,
  UsersRound,
  Route,
  Clock,
  ScrollText,
  Tag,
  ListFilter,
  HelpCircle,
  Megaphone,
  BarChart3,
  Link2,
  Target,
  Workflow,
  Cog,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { sidebarDescriptions } from '@/data/sidebarDescriptions';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  key: string;
}

const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { title: 'Inbox', url: '/inbox', icon: Inbox, badge: 0, key: 'inbox' },
  { title: 'Contacts', url: '/contacts', icon: Contact, key: 'contacts' },
  { title: 'Tags', url: '/tags', icon: Tag, key: 'tags' },
  { title: 'User Attributes', url: '/user-attributes', icon: ListFilter, key: 'user-attributes' },
];

const channelMenuItems: MenuItem[] = [
  { title: 'Phone Numbers', url: '/phone-numbers', icon: Phone, key: 'phone-numbers' },
  { title: 'Templates', url: '/templates', icon: FileText, key: 'templates' },
];

const growthMenuItems: MenuItem[] = [
  { title: 'Campaigns', url: '/campaigns', icon: Send, key: 'campaigns' },
  { title: 'Automation', url: '/automation', icon: Zap, key: 'automation' },
];

const metaAdsMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/meta-ads', icon: Megaphone, key: 'meta-ads-overview' },
  { title: 'Setup', url: '/meta-ads/setup', icon: Link2, key: 'meta-ads-setup' },
  { title: 'Ads Manager', url: '/meta-ads/manager', icon: Target, key: 'meta-ads-manager' },
  { title: 'Lead Analytics', url: '/meta-ads/analytics', icon: BarChart3, key: 'meta-ads-analytics' },
  { title: 'Attribution Rules', url: '/meta-ads/attribution', icon: Route, key: 'meta-ads-attribution' },
  { title: 'Automations', url: '/meta-ads/automations', icon: Workflow, key: 'meta-ads-automations' },
  { title: 'Settings', url: '/meta-ads/settings', icon: Cog, key: 'meta-ads-settings' },
];

const teamMenuItems: MenuItem[] = [
  { title: 'Overview', url: '/team', icon: Users, key: 'team-overview' },
  { title: 'Members', url: '/team/members', icon: Users, key: 'team-members' },
  { title: 'Roles & Permissions', url: '/team/roles', icon: Shield, key: 'team-roles' },
  { title: 'Teams (Groups)', url: '/team/groups', icon: UsersRound, key: 'team-groups' },
  { title: 'Routing', url: '/team/routing', icon: Route, key: 'team-routing' },
  { title: 'Working Hours & SLA', url: '/team/sla', icon: Clock, key: 'team-sla' },
  { title: 'Audit Logs', url: '/team/audit', icon: ScrollText, key: 'team-audit' },
];

const settingsMenuItems: MenuItem[] = [
  { title: 'Billing', url: '/billing', icon: CreditCard, key: 'billing' },
  { title: 'Settings', url: '/settings', icon: Settings, key: 'settings' },
  { title: 'Help', url: '/help', icon: HelpCircle, key: 'help' },
];

const roleColors: Record<string, string> = {
  owner: 'bg-primary/20 text-primary border-primary/30',
  admin: 'bg-info/20 text-info border-info/30',
  agent: 'bg-muted text-muted-foreground border-border',
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { tenants, currentTenant, currentRole, setCurrentTenant } = useTenant();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const renderMenuItems = (items: MenuItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const meta = sidebarDescriptions[item.key];
        return (
          <SidebarMenuItem key={item.title}>
            <div className="flex items-center gap-1">
              <SidebarMenuButton asChild className="flex-1">
                <NavLink
                  to={item.url}
                  end={item.url === '/dashboard'}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              </SidebarMenuButton>
              {meta && (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 rounded hover:bg-sidebar-accent transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <HelpCircle className="h-3.5 w-3.5 text-sidebar-foreground/40 hover:text-sidebar-foreground/70" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    align="start"
                    className="max-w-[280px] p-3"
                  >
                    <p className="text-sm mb-2">{meta.description}</p>
                    <NavLink 
                      to={`/help/${meta.helpSlug}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Learn more →
                    </NavLink>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-sidebar-border bg-background">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sidebar-foreground text-sm truncate">
              smeksh
            </h2>
            <p className="text-xs text-sidebar-foreground/60">WhatsApp Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {/* Workspace Switcher */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors text-left">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 text-primary font-semibold text-sm">
                  {currentTenant?.name?.slice(0, 1).toUpperCase() || 'W'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentTenant?.name || 'Select Workspace'}
                  </p>
                  {currentRole && (
                    <p className="text-xs text-sidebar-foreground/60 capitalize">
                      {currentRole}
                    </p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onClick={() => setCurrentTenant(tenant)}
                  className="flex items-center gap-3 py-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary font-semibold text-sm">
                    {tenant.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tenant.name}</p>
                    <Badge variant="outline" className={`text-xs capitalize ${roleColors[tenant.role]}`}>
                      {tenant.role}
                    </Badge>
                  </div>
                  {currentTenant?.id === tenant.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/create-workspace')} className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Channel Management */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-1">
            Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(channelMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Growth */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-1">
            Growth
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(growthMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Meta Ads */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-1">
            Meta Ads
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(metaAdsMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team Management */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-1">
            Team
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(teamMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-1">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(settingsMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                  {getInitials(profile?.full_name ?? null, user?.email ?? '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
