import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Loader2, RefreshCw, Search, 
  SortAsc, Filter, ChevronDown, ArrowRight, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import WorkspaceCard from '@/components/workspace/WorkspaceCard';
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState';

interface WorkspaceEnriched {
  id: string;
  name: string;
  slug: string;
  role: string;
  created_at: string;
  phoneCount: number;
  memberCount: number;
  status: 'connected' | 'setup' | 'attention';
  messagesThisWeek?: number;
  lastActive?: string;
}

type SortOption = 'recent' | 'newest' | 'alphabetical';
type FilterOption = 'all' | 'connected' | 'setup' | 'owner' | 'admin' | 'agent';

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { tenants, loading: tenantLoading, setCurrentTenant, refreshTenants, createTenant } = useTenant();
  
  const [workspaces, setWorkspaces] = useState<WorkspaceEnriched[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Smart controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || !profile) return;
      
      const onboardingStep = profile.onboarding_step;
      if (onboardingStep !== 'completed') {
        if (onboardingStep === 'pending' || onboardingStep === 'google_done') {
          navigate('/onboarding/org');
        } else if (onboardingStep === 'org_done') {
          navigate('/onboarding/password');
        }
      }
    };
    
    if (!authLoading && user && profile) {
      checkOnboarding();
    }
  }, [user, authLoading, profile, navigate]);

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
            const { count: phoneCount } = await supabase
              .from('phone_numbers')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id);

            const { data: phones } = await supabase
              .from('phone_numbers')
              .select('status')
              .eq('tenant_id', tenant.id)
              .limit(1);

            const { count: memberCount } = await supabase
              .from('tenant_members')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id);

            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const { count: messagesThisWeek } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id)
              .gte('created_at', weekAgo.toISOString());

            // Determine status based on phone connection
            let status: 'connected' | 'setup' | 'attention' = 'setup';
            if (phones && phones.length > 0 && phones[0].status === 'connected') {
              status = 'connected';
            }

            return {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              role: tenant.role,
              created_at: tenant.created_at,
              phoneCount: phoneCount || 0,
              memberCount: memberCount || 0,
              status,
              messagesThisWeek: messagesThisWeek || 0,
              lastActive: tenant.updated_at || tenant.created_at,
            };
          })
        );
        setWorkspaces(enriched);
      } catch (error) {
        console.error('Error fetching workspace details:', error);
        setWorkspaces(tenants.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          role: t.role,
          created_at: t.created_at,
          phoneCount: 0,
          memberCount: 0,
          status: 'setup' as const,
        })));
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchWorkspaceDetails();
  }, [tenants]);

  // Filtered and sorted workspaces
  const filteredWorkspaces = useMemo(() => {
    let result = [...workspaces];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status/role filter
    if (filterBy !== 'all') {
      if (['connected', 'setup', 'attention'].includes(filterBy)) {
        result = result.filter(w => w.status === filterBy);
      } else {
        result = result.filter(w => w.role === filterBy);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.lastActive || b.created_at).getTime() - new Date(a.lastActive || a.created_at).getTime());
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [workspaces, searchQuery, sortBy, filterBy]);

  // Recent workspaces (last 3)
  const recentWorkspaces = useMemo(() => {
    return [...workspaces]
      .sort((a, b) => new Date(b.lastActive || b.created_at).getTime() - new Date(a.lastActive || a.created_at).getTime())
      .slice(0, 3);
  }, [workspaces]);

  const handleSelectWorkspace = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) {
      setCurrentTenant(tenant);
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

  const handleCreateWorkspace = async (name: string, purpose: string, connectNow: boolean) => {
    setIsCreating(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error, tenant } = await createTenant(name, slug);
    
    if (!error && tenant) {
      setModalOpen(false);
      if (connectNow) {
        navigate('/phone-numbers/connect');
      } else {
        navigate('/dashboard');
      }
    }
    setIsCreating(false);
  };

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  if (!user) return null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <img src={aireatroLogo} alt="AiReatro" className="h-9 w-auto" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground truncate max-w-[180px]">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()} 
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-primary/5 to-emerald-500/5 border border-primary/10 p-6 md:p-10 mb-8">
            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Welcome back, {getUserName()} 👋
                </h1>
                <p className="text-muted-foreground max-w-lg">
                  Choose a workspace to continue, or create a new one for a new WhatsApp Business number.
                </p>
              </div>
              <Button 
                onClick={() => setModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create new workspace
              </Button>
            </div>
          </div>

          {/* Primary Action Card */}
          <Card className="mb-10 overflow-hidden border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-primary/10">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Create a new workspace
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Best for a new brand, client, or WhatsApp Business number.
                  </p>
                  
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      One workspace = one WhatsApp number
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Separate teams, flows, and analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Recommended for production use
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => setModalOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                  >
                    Create workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary">
                    Learn how workspaces work
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workspaces Content */}
          {loadingDetails ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-9 w-24" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="flex gap-4 mb-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : workspaces.length === 0 ? (
            <WorkspaceEmptyState />
          ) : (
            <div className="space-y-10">
              {/* Recent Workspaces */}
              {recentWorkspaces.length > 0 && workspaces.length > 3 && (
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Recent Workspaces</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentWorkspaces.map((workspace) => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onSelect={() => handleSelectWorkspace(workspace)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Workspaces */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">All Workspaces</h2>
                    <Badge variant="secondary" className="font-mono">{workspaces.length}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                </div>

                {/* Smart Controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workspaces..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <SortAsc className="w-4 h-4" />
                        Sort
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy('recent')}>
                        Recently opened {sortBy === 'recent' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('newest')}>
                        Newest first {sortBy === 'newest' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                        Alphabetical {sortBy === 'alphabetical' && '✓'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterBy('all')}>
                        All {filterBy === 'all' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('connected')}>
                        Connected {filterBy === 'connected' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('setup')}>
                        Needs setup {filterBy === 'setup' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('owner')}>
                        Owner {filterBy === 'owner' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('admin')}>
                        Admin {filterBy === 'admin' && '✓'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy('agent')}>
                        Agent {filterBy === 'agent' && '✓'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Workspace Grid */}
                {filteredWorkspaces.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No workspaces match your filters.</p>
                    <Button 
                      variant="link" 
                      onClick={() => { setSearchQuery(''); setFilterBy('all'); }}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkspaces.map((workspace) => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onSelect={() => handleSelectWorkspace(workspace)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
          <Button 
            onClick={() => setModalOpen(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create workspace
          </Button>
        </div>

        {/* Create Workspace Modal */}
        <CreateWorkspaceModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCreateWorkspace={handleCreateWorkspace}
          isCreating={isCreating}
        />
      </div>
    </TooltipProvider>
  );
}
