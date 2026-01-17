import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Loader2, RefreshCw, Search, 
  ChevronDown, ArrowRight, ExternalLink, Lightbulb, Filter
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
  phoneNumber?: string;
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
              .select('status, display_number')
              .eq('tenant_id', tenant.id)
              .eq('status', 'connected')
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
            if (phones && phones.length > 0) {
              status = 'connected';
            }

            return {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              role: tenant.role,
              created_at: tenant.created_at,
              phoneCount: phoneCount || 0,
              phoneNumber: phones?.[0]?.display_number,
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

  const sortLabels: Record<SortOption, string> = {
    recent: 'Recently opened',
    newest: 'Newest first',
    alphabetical: 'Alphabetical',
  };

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading workspaces...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 via-white to-green-50/30">
        {/* Sticky Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <img src={aireatroLogo} alt="AiReatro" className="h-9 w-auto" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="truncate max-w-[200px]">{user.email}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()} 
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Select a workspace
            </h1>
            <p className="text-gray-500">
              Continue where you left off, or create a new workspace for a new WhatsApp number.
            </p>
          </div>

          {/* Create Workspace Card */}
          <Card className="mb-10 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50/50 border border-green-100 shadow-sm">
            <CardContent className="p-6 md:p-8 relative">
              {/* Recommended badge */}
              <Badge className="absolute top-4 left-4 bg-green-500 text-white hover:bg-green-500 border-0 text-xs font-medium">
                Recommended
              </Badge>
              
              <div className="flex flex-col md:flex-row md:items-center gap-6 mt-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Create a new workspace
                    </h2>
                    <p className="text-gray-500 mb-4">
                      Perfect for a new brand, client, or WhatsApp number.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => setModalOpen(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                      >
                        Create workspace
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Learn how workspaces work
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Decorative illustration */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    {/* Buildings illustration */}
                    <div className="absolute inset-0 flex items-end justify-center gap-1">
                      <div className="w-8 h-16 bg-gradient-to-t from-green-200 to-green-100 rounded-t-lg" />
                      <div className="w-10 h-24 bg-gradient-to-t from-green-300 to-green-200 rounded-t-lg" />
                      <div className="w-8 h-20 bg-gradient-to-t from-emerald-200 to-emerald-100 rounded-t-lg" />
                    </div>
                    {/* WhatsApp icon */}
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workspaces Content */}
          {loadingDetails ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-9 w-64" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Skeleton className="w-11 h-11 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-5 w-28" />
                        </div>
                      </div>
                      <div className="flex gap-4 mb-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-28 mb-4" />
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
              {recentWorkspaces.length > 0 && (
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">Recent workspaces</h2>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium">
                        {workspaces.length}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search workspaces..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-48 bg-white border-gray-200"
                        />
                      </div>

                      {/* Filter */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 bg-white border-gray-200 text-gray-600">
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
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Sort */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 bg-white border-gray-200 text-gray-600">
                            {sortLabels[sortBy]}
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

                      {/* Refresh */}
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="bg-white border-gray-200 text-gray-600"
                      >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                      </Button>
                    </div>
                  </div>

                  {/* Workspace Grid */}
                  {filteredWorkspaces.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                      <p className="text-gray-500">No workspaces match your filters.</p>
                      <Button 
                        variant="link" 
                        onClick={() => { setSearchQuery(''); setFilterBy('all'); }}
                        className="mt-2 text-green-600"
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
              )}

              {/* All Workspaces - show if more than 3 */}
              {workspaces.length > 3 && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">All workspaces</h2>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium">
                        {workspaces.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkspaces.map((workspace) => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onSelect={() => handleSelectWorkspace(workspace)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Footer note */}
          {workspaces.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-12 text-sm text-gray-400">
              <Lightbulb className="w-4 h-4" />
              <span>Each workspace is associated with one WhatsApp Business API number.</span>
            </div>
          )}
        </main>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 md:hidden">
          <Button 
            onClick={() => setModalOpen(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
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
