import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { AdminCommandPalette } from '@/components/admin/AdminCommandPalette';

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

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
    } catch (e: any) {
      setError(e.message || 'Failed to verify admin access');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    checkAccess();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Verifying platform access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold">Access Restricted</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="text-muted-foreground text-xs">
            This area is restricted to the AiReatro internal platform team only.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to App</Button>
            <Button onClick={checkAccess}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar
        role={role || ''}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar role={role || ''} onSearchOpen={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <Outlet context={{ role }} />
          </div>
        </main>
      </div>

      <AdminMobileNav />
      <AdminCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} role={role || ''} />
    </div>
  );
}
