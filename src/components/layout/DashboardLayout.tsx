import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Menu, X } from 'lucide-react';
import { useAgentSessionTracker } from '@/hooks/useAgentPerformance';

function MobileHeader() {
  const { toggleSidebar, state } = useSidebar();
  const isOpen = state === 'expanded';

  return (
    <header className="h-12 sm:h-14 flex items-center gap-3 px-3 sm:px-4 border-b border-border/60 bg-background/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <button
        onClick={toggleSidebar}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sm:inline">Menu</span>
      </button>
      <div className="flex-1" />
    </header>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading: tenantLoading, currentTenant } = useTenant();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  // Track user id to avoid re-running onboarding check on token refreshes
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

  // Track agent login/logout sessions
  useAgentSessionTracker();

  // Check onboarding status — only once per unique user id
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOnboardingChecked(true);
      return;
    }

    // Skip if we already checked this user (prevents reset on token refresh / tab switch)
    if (checkedUserId === user.id) return;

    const checkOnboarding = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_step')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.onboarding_step !== 'completed') {
        // Check if user is a team member — skip onboarding for them
        const { data: membership } = await supabase
          .from('tenant_members')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (membership) {
          await supabase.from('profiles').update({ onboarding_step: 'completed' }).eq('id', user.id);
        } else if (profile.onboarding_step === 'pending' || profile.onboarding_step === 'google_done') {
          navigate('/onboarding/org');
        } else if (profile.onboarding_step === 'org_done') {
          navigate('/onboarding/password');
        }
      }
      setCheckedUserId(user.id);
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, [user, authLoading, navigate, checkedUserId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // After refresh/login we may not have a selected workspace yet.
    // Always route through the workspace selector instead of forcing creation.
    if (!authLoading && !tenantLoading && user && !currentTenant && onboardingChecked) {
      navigate('/select-workspace');
    }
  }, [user, authLoading, tenantLoading, currentTenant, onboardingChecked, navigate]);

  // Show loading while auth or tenant data is being fetched
  if (authLoading || tenantLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentTenant) {
    return null;
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 w-full">
          <MobileHeader />
          <div className="flex-1 overflow-auto relative bg-muted/20">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}