import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
        if (profile.onboarding_step === 'pending' || profile.onboarding_step === 'google_done') {
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
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 w-full">
          <header className="h-12 sm:h-14 flex items-center gap-2 sm:gap-4 px-3 sm:px-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}