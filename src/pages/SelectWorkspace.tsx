import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Plus, Loader2, RefreshCw, Search, 
  ChevronDown, ArrowRight, Lightbulb, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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
import workspaceHubIllustration from '@/assets/workspace-hub-illustration.png';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import WorkspaceCard from '@/components/workspace/WorkspaceCard';
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState';

interface WorkspaceEnriched {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Agent auto-redirect: skip workspace selection, go straight to inbox
  useEffect(() => {
    if (authLoading || tenantLoading || !user || tenants.length === 0) return;

    const isAgentOnly = tenants.every(t => t.role === 'agent');
    if (isAgentOnly) {
      // Auto-select first workspace and redirect to inbox
      const agentTenant = tenants[0];
      setCurrentTenant(agentTenant);
      navigate('/inbox', { replace: true });
    }
  }, [authLoading, tenantLoading, user, tenants, setCurrentTenant, navigate]);

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
    let isCancelled = false;

    const fetchWorkspaceDetails = async () => {
      if (tenants.length === 0) {
        setWorkspaces([]);
        return;
      }

      setLoadingDetails(true);

      const weekAgoIso = (() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      })();

      try {
        const enriched: WorkspaceEnriched[] = await Promise.all(
          tenants.map(async (tenant) => {
            const [phoneCountRes, phonesRes, memberCountRes, messagesThisWeekRes] = await Promise.all([
              supabase.from('phone_numbers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
              supabase.from('phone_numbers').select('status, display_number').eq('tenant_id', tenant.id).eq('status', 'connected').limit(1),
              supabase.from('tenant_members').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
              supabase.from('messages').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id).gte('created_at', weekAgoIso),
            ]);

            const phoneCount = phoneCountRes.count ?? 0;
            const phones = phonesRes.data ?? [];
            const memberCount = memberCountRes.count ?? 0;
            const messagesThisWeek = messagesThisWeekRes.count ?? 0;

            let status: 'connected' | 'setup' | 'attention' = 'setup';
            if (phones.length > 0) status = 'connected';

            return {
              id: tenant.id,
              name: tenant.name,
              slug: tenant.slug,
              logo_url: tenant.logo_url,
              role: tenant.role,
              created_at: tenant.created_at,
              phoneCount,
              phoneNumber: phones?.[0]?.display_number,
              memberCount,
              status,
              messagesThisWeek,
              lastActive: tenant.updated_at || tenant.created_at,
            };
          })
        );

        if (!isCancelled) setWorkspaces(enriched);
      } catch (error) {
        console.error('Error fetching workspace details:', error);
        if (!isCancelled) {
          setWorkspaces(tenants.map((t) => ({
            id: t.id, name: t.name, slug: t.slug, role: t.role, created_at: t.created_at,
            phoneCount: 0, memberCount: 0, status: 'setup' as const,
          })));
        }
      } finally {
        if (!isCancelled) setLoadingDetails(false);
      }
    };

    fetchWorkspaceDetails();
    return () => { isCancelled = true; };
  }, [tenants]);

  // Filtered and sorted workspaces
  const filteredWorkspaces = useMemo(() => {
    let result = [...workspaces];
    if (searchQuery) {
      result = result.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterBy !== 'all') {
      if (['connected', 'setup', 'attention'].includes(filterBy)) {
        result = result.filter(w => w.status === filterBy);
      } else {
        result = result.filter(w => w.role === filterBy);
      }
    }
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

  const handleSelectWorkspace = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) {
      setCurrentTenant(tenant);
      navigate(workspace.role === 'agent' ? '/inbox' : '/dashboard');
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
      navigate(connectNow ? '/phone-numbers/connect' : '/dashboard');
    }
    setIsCreating(false);
  };

  const handleSignOut = async () => {
    setCurrentTenant(null);
    await signOut();
    navigate('/login', { replace: true });
  };

  // --- 3-dot menu handlers ---
  const [renameTarget, setRenameTarget] = useState<WorkspaceEnriched | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setRenaming(true);
    const { error } = await supabase
      .from('tenants')
      .update({ name: renameValue.trim() })
      .eq('id', renameTarget.id);
    setRenaming(false);
    if (error) {
      toast.error('Failed to rename workspace');
    } else {
      toast.success('Workspace renamed');
      setWorkspaces(prev => prev.map(w => w.id === renameTarget.id ? { ...w, name: renameValue.trim() } : w));
      await refreshTenants();
    }
    setRenameTarget(null);
  };

  const handleManageMembers = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) {
      setCurrentTenant(tenant);
      navigate('/team');
    }
  };

  const handleSettings = (workspace: WorkspaceEnriched) => {
    const tenant = tenants.find(t => t.id === workspace.id);
    if (tenant) {
      setCurrentTenant(tenant);
      navigate('/settings');
    }
  };

  const [archiveTarget, setArchiveTarget] = useState<WorkspaceEnriched | null>(null);
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    // For now we just remove from local list (no DB archive column yet)
    setWorkspaces(prev => prev.filter(w => w.id !== archiveTarget.id));
    toast.success('Workspace hidden from list');
    setArchiving(false);
    setArchiveTarget(null);
  };

  const sortLabels: Record<SortOption, string> = {
    recent: 'Recently opened',
    newest: 'Newest first',
    alphabetical: 'Alphabetical',
  };

  const connectedCount = workspaces.filter(w => w.status === 'connected').length;
  const canCreateWorkspace = workspaces.some(w => ['owner', 'admin'].includes(w.role)) || workspaces.length === 0;

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
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
        {/* Premium Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/">
              <img src={aireatroLogo} alt="AiReatro" className="h-11 w-auto hover:opacity-80 transition-opacity" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground h-10 px-3 touch-manipulation"
              >
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 xs:px-4 py-6 sm:py-10 max-w-5xl pb-24 md:pb-8">
          {/* Hero Section with Illustration */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-8 sm:mb-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                Your Workspaces
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-lg">
                Manage your WhatsApp Business channels. Each workspace connects to one dedicated number.
              </p>
              {connectedCount > 0 && (
                <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                  <span className="text-sm font-medium text-primary">
                    {connectedCount} workspace{connectedCount !== 1 ? 's' : ''} live
                  </span>
                </div>
              )}
            </div>
            <div className="hidden md:block shrink-0">
              <img 
                src={workspaceHubIllustration} 
                alt="Workspace Hub" 
                className="w-48 lg:w-56 h-auto object-contain drop-shadow-xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Create Workspace Card */}
          {canCreateWorkspace && <Card className="mb-8 sm:mb-10 overflow-hidden bg-gradient-to-br from-primary/5 via-card to-primary/3 border border-primary/15 shadow-sm hidden sm:block">
            <CardContent className="p-5 sm:p-6 md:p-8 relative">
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground hover:bg-primary border-0 text-xs font-medium">
                ✨ Recommended
              </Badge>
              
              <div className="flex items-center gap-6 mt-5">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                      Create a new workspace
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Perfect for a new brand, client, or WhatsApp number.
                    </p>

                    <div className="flex flex-col xs:flex-row gap-3">
                      <Button 
                        onClick={() => setModalOpen(true)}
                        variant="outline"
                        className="border-2 border-foreground/20 hover:border-foreground/40 bg-card hover:bg-accent text-foreground shadow-sm text-sm h-10 font-semibold"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create workspace
                      </Button>
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm h-10" asChild>
                        <Link to="/help/workspaces">
                          Learn how workspaces work
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>}

          {/* Content */}
          {loadingDetails ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-9 w-64" />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden bg-card">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-40 mb-3" />
                      <Skeleton className="h-10 w-full mb-3" />
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
            <div className="space-y-8">
              <section>
                {/* Controls */}
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">Workspaces</h2>
                      <Badge variant="secondary" className="font-medium text-xs">
                        {workspaces.length}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" size="icon"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="h-9 w-9"
                    >
                      <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </Button>
                  </div>
                  
                  <div className="flex flex-col xs:flex-row gap-2">
                    <div className="relative flex-1 xs:max-w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 h-9 text-sm">
                            <Filter className="w-4 h-4" />
                            <span className="hidden xs:inline">Filter</span>
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setFilterBy('all')}>All {filterBy === 'all' && '✓'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterBy('connected')}>Connected {filterBy === 'connected' && '✓'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterBy('setup')}>Needs setup {filterBy === 'setup' && '✓'}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 h-9 text-sm">
                            <span className="hidden xs:inline">{sortLabels[sortBy]}</span>
                            <span className="xs:hidden">Sort</span>
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSortBy('recent')}>Recently opened {sortBy === 'recent' && '✓'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest first {sortBy === 'newest' && '✓'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>Alphabetical {sortBy === 'alphabetical' && '✓'}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                {filteredWorkspaces.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <p className="text-muted-foreground">No workspaces match your filters.</p>
                    <Button variant="link" onClick={() => { setSearchQuery(''); setFilterBy('all'); }} className="mt-2 text-primary text-sm">
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkspaces.map((workspace) => (
                      <WorkspaceCard
                        key={workspace.id}
                        workspace={workspace}
                        onSelect={() => handleSelectWorkspace(workspace)}
                        onRename={() => { setRenameTarget(workspace); setRenameValue(workspace.name); }}
                        onManageMembers={() => handleManageMembers(workspace)}
                        onSettings={() => handleSettings(workspace)}
                        onArchive={() => setArchiveTarget(workspace)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Footer */}
          {workspaces.length > 0 && (
            <div className="hidden xs:flex items-center justify-center gap-2 mt-10 sm:mt-12 text-xs text-muted-foreground/60 text-center">
              <Lightbulb className="w-4 h-4 flex-shrink-0" />
              <span>Each workspace is linked to one WhatsApp Business API number.</span>
            </div>
          )}
        </main>

        {/* Mobile sticky CTA */}
        {canCreateWorkspace && (
          <div className="fixed bottom-0 left-0 right-0 p-3 xs:p-4 bg-card/95 backdrop-blur-sm border-t border-border sm:hidden z-40">
            <Button 
              onClick={() => setModalOpen(true)}
              variant="outline"
              className="w-full h-11 border-2 border-foreground/20 hover:border-foreground/40 bg-card hover:bg-accent text-foreground shadow-sm text-sm font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create workspace
            </Button>
          </div>
        )}

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
