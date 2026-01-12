import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Check, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export default function SelectWorkspace() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { tenants, loading: tenantLoading, currentTenant, setCurrentTenant } = useTenant();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);


  const handleSelectWorkspace = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      navigate('/dashboard');
    }
  };

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary mb-4">
            <MessageSquare className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Select Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Choose a workspace to continue
          </p>
        </div>

        <Card className="shadow-soft border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Your Workspaces
            </CardTitle>
            <CardDescription>
              Select a workspace or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenants.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">No workspace yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first workspace to start using the app.
                </p>
              </div>
            ) : (
              tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSelectWorkspace(tenant.id)}
                  className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{tenant.role}</p>
                    </div>
                  </div>
                  {currentTenant?.id === tenant.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))
            )}

            <div className="pt-4 border-t border-border">
              <Button
                variant={tenants.length === 0 ? "default" : "outline"}
                className="w-full h-11"
                onClick={() => navigate('/create-workspace')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
