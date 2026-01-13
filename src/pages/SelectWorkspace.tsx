import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Loader2, MessageSquare, ArrowRight, Users, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { format } from 'date-fns';

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { tenants, loading: tenantLoading, currentTenant, setCurrentTenant, refreshTenants, createTenant } = useTenant();
  const [workspaceName, setWorkspaceName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // If a tenant is already selected (e.g. restored from localStorage), skip this page.
    if (!authLoading && !tenantLoading && user && currentTenant) {
      navigate('/dashboard');
    }
  }, [authLoading, tenantLoading, user, currentTenant, navigate]);

  const handleSelectWorkspace = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      navigate('/dashboard');
    }
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

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">smeksh</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Select a workspace to continue or create a new one
          </p>
        </div>

        {/* Create New Workspace Card */}
        <Card className="mb-8 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Create New Workspace</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Each workspace is associated with one WhatsApp Business API number
                </p>
                <form onSubmit={handleCreateWorkspace} className="flex gap-3">
                  <Input
                    placeholder="Enter workspace name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="max-w-sm bg-background"
                  />
                  <Button 
                    type="submit" 
                    disabled={!workspaceName.trim() || isCreating}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                  </Button>
                </form>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-primary/60" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Workspaces */}
        {tenants.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Workspaces</h2>
              <Button variant="ghost" size="sm" onClick={() => refreshTenants()} className="text-muted-foreground">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tenants.map((tenant) => (
                <Card 
                  key={tenant.id} 
                  className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  onClick={() => handleSelectWorkspace(tenant.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {tenant.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 mt-1">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Role
                        </span>
                        <span className="font-medium text-foreground capitalize">{tenant.role}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Created
                        </span>
                        <span className="font-medium text-foreground">
                          {format(new Date(tenant.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectWorkspace(tenant.id);
                      }}
                    >
                      Open Workspace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tenants.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first workspace above to get started
            </p>
            <Button variant="outline" size="sm" onClick={() => refreshTenants()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
