import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Loader2, Lock, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette';
import { ImpersonationProvider, ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export default function AdminLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [supportReadOnly, setSupportReadOnly] = useState(false);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const checkAccess = async () => {
    setChecking(true);
    setError(null);
    try {
      const data = await get('me');
      setRole(data.role);
      setSupportReadOnly(data.support_read_only ?? false);
    } catch (e: any) {
      setError(e.message || 'Failed to verify platform access');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    checkAccess();
  }, [user, authLoading]);

  // Loading state
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Verifying platform access...</p>
      </div>
    );
  }

  // Restricted access gate — animated, premium
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 via-background to-muted/30 relative overflow-hidden">
        {/* Subtle background blur elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-destructive/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <Card className="relative rounded-2xl shadow-lg border-border/50 max-w-md w-full mx-4 animate-fade-in">
          <CardContent className="pt-8 pb-8 px-8 text-center space-y-5">
            {/* Animated lock icon */}
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-2xl bg-destructive/10 animate-ping opacity-20" />
              <div className="relative h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-destructive animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight">Restricted Area</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This section is reserved for AiReatro internal platform operations.
                If you believe this is an error, contact the platform owner.
              </p>
            </div>

            <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Platform Control Console
            </Badge>

            {error !== 'Access denied' && (
              <p className="text-xs text-destructive bg-destructive/5 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-center pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Go back to app
              </Button>
              <Button
                variant="ghost"
                className="rounded-xl text-muted-foreground"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isReadOnly = supportReadOnly && role === 'support';

  return (
    <ImpersonationProvider>
      <div className="min-h-screen flex bg-muted/30">
        <AdminSidebar
          role={role || ''}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopBar role={role || ''} onSearchOpen={() => setCmdOpen(true)} readOnly={isReadOnly} />

          {/* Impersonation banner */}
          <ImpersonationBanner />

          {/* Read-only banner */}
          {isReadOnly && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-center gap-2">
              <Lock className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                Support is currently in read-only mode. Mutations are disabled during incident response.
              </span>
            </div>
          )}

          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <Outlet context={{ role, readOnly: isReadOnly }} />
            </div>
          </main>
        </div>

        <AdminMobileNav />
        <AdminCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} role={role || ''} />
      </div>
    </ImpersonationProvider>
  );
}
