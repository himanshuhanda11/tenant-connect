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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

const mainMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Inbox', url: '/inbox', icon: Inbox, badge: 0 },
  { title: 'Contacts', url: '/contacts', icon: Contact },
];

const channelMenuItems = [
  { title: 'Phone Numbers', url: '/phone-numbers', icon: Phone },
  { title: 'Templates', url: '/templates', icon: FileText },
];

const growthMenuItems = [
  { title: 'Campaigns', url: '/campaigns', icon: Send },
  { title: 'Automation', url: '/automation', icon: Zap },
];

const settingsMenuItems = [
  { title: 'Team', url: '/team', icon: Users },
  { title: 'Billing', url: '/billing', icon: CreditCard },
  { title: 'Settings', url: '/settings', icon: Settings },
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

  const renderMenuItems = (items: typeof mainMenuItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === '/dashboard'}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.title}</span>
              {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sidebar-foreground text-sm truncate">
              WhatsApp ISV
            </h2>
            <p className="text-xs text-sidebar-foreground/60">Platform</p>
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

        {/* Settings */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-1">
            Manage
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
