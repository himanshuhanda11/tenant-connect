import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading: tenantLoading, currentTenant } = useTenant();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setOnboardingChecked(true);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_step')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && profile.onboarding_step !== 'completed') {
        // Redirect to appropriate onboarding step
        if (profile.onboarding_step === 'pending' || profile.onboarding_step === 'google_done') {
          navigate('/onboarding/org');
        } else if (profile.onboarding_step === 'org_done') {
          navigate('/onboarding/password');
        }
      }
      setOnboardingChecked(true);
    };

    if (!authLoading && user) {
      checkOnboarding();
    } else if (!authLoading) {
      setOnboardingChecked(true);
    }
  }, [user, authLoading, navigate]);

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
            <Button asChild variant="outline" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/80 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
              <NavLink to="/help">
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline ml-1">Guide</span>
              </NavLink>
            </Button>
          </header>
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden relative">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}