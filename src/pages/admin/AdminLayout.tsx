import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Shield, LayoutDashboard, Building2, ScrollText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }

    get('me').then(data => {
      setRole(data.role);
      setChecking(false);
    }).catch(() => {
      navigate('/dashboard');
    });
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/workspaces', icon: Building2, label: 'Workspaces' },
    { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 border-r border-border bg-background flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Admin Console</span>
          <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium uppercase">
            {role}
          </span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/dashboard')}>
            ← Back to App
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet context={{ role }} />
      </main>
    </div>
  );
}
