import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Loader2, MessageSquare, ArrowRight, Users, Calendar, 
  RefreshCw, Phone, Shield, Crown, UserCog, Eye, Lock, AlertTriangle,
  CheckCircle, Clock, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WorkspaceEnriched {
  id: string;
  name: string;
  slug: string;
  role: string;
  created_at: string;
  phoneNumber?: string;
  phoneCount: number;
  memberCount: number;
  status: 'active' | 'suspended' | 'trial_expired';
  lastActivity?: string;
  messagesThisWeek?: number;
}

const roleIcons: Record<string, React.ElementType> = {
  owner: Crown,
  admin: UserCog,
  agent: Shield,
  viewer: Eye,
};

const roleColors: Record<string, string> = {
  owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  agent: 'bg-green-500/10 text-green-600 border-green-500/20',
  viewer: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-600', icon: Lock },
  trial_expired: { label: 'Trial Expired', color: 'bg-amber-500/10 text-amber-600', icon: AlertTriangle },
};

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { tenants, loading: tenantLoading, setCurrentTenant, refreshTenants, createTenant } = useTenant();
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceEnriched[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch enriched workspace data
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (tenants.length === 0) {
        setWorkspaces([]);
        return;
      }

      setLoadingDetails(true);
      try {
        const enriched: WorkspaceEnriched[] = await Promise.all(
          tenants.map(async (tenant) => {
            // Fetch phone numbers count
            const { count: phoneCount } = await supabase
              .from('phone_numbers')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id);

            // Fetch first connected phone number for display
            const { data: phones } = await supabase
              .from('phone_numbers')
              .select('display_number')
              .eq('tenant_id', tenant.id)
              .eq('status', 'connected')
              .limit(1);

            // Fetch member count
            const { count: memberCount } = await supabase
              .from('tenant_members')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id);

            // Fetch messages this week (optional - for activity indicator)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const { count: messagesThisWeek } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id)
              .gte('created_at', weekAgo.toISOString());

            return {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              role: tenant.role,
              created_at: tenant.created_at,
              phoneNumber: phones?.[0]?.display_number || undefined,
              phoneCount: phoneCount || 0,
              memberCount: memberCount || 0,
              status: 'active' as const, // Default to active, can be extended
              messagesThisWeek: messagesThisWeek || 0,
            };
          })
        );
        setWorkspaces(enriched);
      } catch (error) {
        console.error('Error fetching workspace details:', error);
        // Fallback
        setWorkspaces(tenants.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          role: t.role,
          created_at: t.created_at,
          phoneCount: 0,
          memberCount: 0,
          status: 'active' as const,
        })));
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchWorkspaceDetails();
  }, [tenants]);

  const handleSelectWorkspace = (workspace: WorkspaceEnriched) => {
    if (workspace.status === 'suspended') return;
    
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) {
      setCurrentTenant(tenant);
      // Role-based redirect
      if (workspace.role === 'agent') {
        navigate('/inbox');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTenants();
    setIsRefreshing(false);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    
    setIsCreating(true);
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error, tenant } = await createTenant(workspaceName, slug);
    
    if (!error && tenant) {
      navigate('/dashboard');
    }
    setIsCreating(false);
  };

  const getRoleCTA = (role: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return { label: 'Open Workspace', icon: ArrowRight };
      case 'agent':
        return { label: 'Go to Inbox', icon: Inbox };
      case 'viewer':
        return { label: 'View Only', icon: Eye };
      default:
        return { label: 'Open Workspace', icon: ArrowRight };
    }
  };

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading workspaces...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there';

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">smeksh</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-muted-foreground hover:text-foreground">
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Select a Workspace
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose which workspace you want to continue with
            </p>
          </div>

          {/* Existing Workspaces */}
          {workspaces.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">Your Workspaces</h2>
                  <Badge variant="secondary" className="font-mono">
                    {workspaces.length}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="text-muted-foreground"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace) => {
                  const RoleIcon = roleIcons[workspace.role] || Shield;
                  const statusInfo = statusConfig[workspace.status];
                  const StatusIcon = statusInfo.icon;
                  const isSuspended = workspace.status === 'suspended';
                  const isExpired = workspace.status === 'trial_expired';
                  const cta = getRoleCTA(workspace.role);
                  const CTAIcon = cta.icon;

                  return (
                    <Card 
                      key={workspace.id} 
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300",
                        isSuspended 
                          ? "opacity-60 cursor-not-allowed" 
                          : "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-pointer hover:-translate-y-1"
                      )}
                      onClick={() => handleSelectWorkspace(workspace)}
                    >
                      {/* Status indicator bar */}
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-1",
                        workspace.status === 'active' && "bg-gradient-to-r from-green-500 to-emerald-500",
                        workspace.status === 'suspended' && "bg-gradient-to-r from-red-500 to-rose-500",
                        workspace.status === 'trial_expired' && "bg-gradient-to-r from-amber-500 to-orange-500"
                      )} />

                      <CardContent className="p-6">
                        {/* Header row */}
                        <div className="flex items-start gap-4 mb-4">
                          {/* Logo/Avatar */}
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                            "bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/10"
                          )}>
                            <Building2 className="w-7 h-7 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                              {workspace.name}
                            </h3>
                            
                            {/* Role badge */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs font-medium border", roleColors[workspace.role])}
                              >
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {workspace.role.charAt(0).toUpperCase() + workspace.role.slice(1)}
                              </Badge>
                              
                              {/* Status badge */}
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", statusInfo.color)}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone Numbers</p>
                              <p className="font-semibold text-foreground">{workspace.phoneCount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Members</p>
                              <p className="font-semibold text-foreground">{workspace.memberCount}</p>
                            </div>
                          </div>
                        </div>

                        {/* Activity indicator */}
                        {workspace.messagesThisWeek !== undefined && workspace.messagesThisWeek > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 px-2.5 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
                            <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600 font-medium">{workspace.messagesThisWeek.toLocaleString()} messages this week</span>
                          </div>
                        )}

                        {/* Phone number display */}
                        {workspace.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="font-mono text-foreground">{workspace.phoneNumber}</span>
                          </div>
                        )}

                        {/* Created date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Calendar className="w-3.5 h-3.5" />
                          Created {format(new Date(workspace.created_at), 'MMM d, yyyy')}
                        </div>

                        {/* CTA Button */}
                        {isSuspended ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="w-full opacity-50 cursor-not-allowed"
                                disabled
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Suspended
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This workspace has been suspended. Contact support for assistance.</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : isExpired ? (
                          <Button 
                            variant="outline" 
                            className="w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectWorkspace(workspace);
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Upgrade Plan
                          </Button>
                        ) : (
                          <Button 
                            className={cn(
                              "w-full transition-all duration-200",
                              "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
                              "group-hover:bg-primary group-hover:text-primary-foreground"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectWorkspace(workspace);
                            }}
                          >
                            {cta.label}
                            <CTAIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create New Workspace Card */}
          <Card className="overflow-hidden border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Create New Workspace</h2>
                      <p className="text-sm text-muted-foreground">
                        Each workspace is associated with one WhatsApp Business API number
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleCreateWorkspace} className="flex gap-3 mt-4">
                    <Input
                      placeholder="Enter workspace name..."
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="max-w-md bg-background border-muted-foreground/20 focus:border-primary"
                    />
                    <Button 
                      type="submit" 
                      disabled={!workspaceName.trim() || isCreating}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
                
                <div className="hidden lg:block">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center border border-primary/10">
                    <Building2 className="w-16 h-16 text-primary/40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {tenants.length === 0 && !tenantLoading && (
            <div className="text-center py-16 mt-8">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No workspaces yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first workspace above to start managing your WhatsApp Business conversations
              </p>
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh List
              </Button>
            </div>
          )}

          {/* Loading details overlay */}
          {loadingDetails && workspaces.length === 0 && tenants.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {tenants.map((t) => (
                <Card key={t.id} className="overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse" />
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="h-16 bg-muted rounded-lg animate-pulse" />
                      <div className="h-16 bg-muted rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
