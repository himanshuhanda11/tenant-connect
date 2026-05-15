import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Menu, X } from 'lucide-react';
import { useAgentSessionTracker } from '@/hooks/useAgentPerformance';
import { WhatsAppConnectBanner } from '@/components/dashboard/WhatsAppConnectBanner';
import { MobileBottomNav } from './MobileBottomNav';
import { PreviewWorkspaceBanner } from '@/components/admin/PreviewWorkspaceBanner';
import { AgentAvailabilityPill } from '@/components/availability/AgentAvailabilityPill';
import { cn } from '@/lib/utils';



function MobileHeader() {
  const { toggleSidebar, state } = useSidebar();
  const isOpen = state === 'expanded';

  return (
    <header className="flex h-12 items-center gap-3 border-b border-border/60 bg-background/95 px-3 pt-[env(safe-area-inset-top)] shadow-xs backdrop-blur-md sm:h-14 sm:px-4 md:hidden" style={{ height: 'calc(3rem + env(safe-area-inset-top))' }}>
      <button
        onClick={toggleSidebar}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card hover:bg-accent border border-border/50 shadow-sm transition-all duration-200 active:scale-95"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <Menu className="h-4 w-4 text-foreground" />
        <span className="text-xs font-medium text-foreground">Menu</span>
      </button>
      <div className="flex-1" />
      <AgentAvailabilityPill compact />
    </header>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { loading: tenantLoading, currentTenant } = useTenant();
  const isInboxWorkspace = location.pathname.startsWith('/inbox') && !location.pathname.startsWith('/inbox/dashboard');
  // Skip onboarding/role-based redirects when a super admin is previewing.
  const isPreview = typeof window !== 'undefined' && !!sessionStorage.getItem('preview_workspace_id');
  const [onboardingChecked, setOnboardingChecked] = useState(isPreview);
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
    // Skip in preview mode — the previewed tenant is loaded async.
    if (isPreview) return;
    if (!authLoading && !tenantLoading && user && !currentTenant && onboardingChecked) {
      navigate('/select-workspace');
    }
  }, [user, authLoading, tenantLoading, currentTenant, onboardingChecked, navigate, isPreview]);

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
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
          <PreviewWorkspaceBanner />
          {!isInboxWorkspace && <MobileHeader />}
          {/* Desktop: floating Pause-New-Chats pill (always visible) */}
          <div className="pointer-events-none fixed top-3 right-4 z-40 hidden md:block">
            <div className="pointer-events-auto">
              <AgentAvailabilityPill />
            </div>
          </div>
          <ScrollToTop />
          <div
            data-dashboard-content
            className={cn(
              "relative min-h-0 flex-1 bg-muted/20",
              isInboxWorkspace
                ? "overflow-hidden p-0"
                : "overflow-auto p-4 pb-[calc(12rem+env(safe-area-inset-bottom))] sm:p-6 md:pb-20 lg:p-8"
            )}
          >
            {children}
          </div>
          {!isInboxWorkspace && !location.pathname.startsWith('/phone-numbers') && <WhatsAppConnectBanner />}
          <MobileBottomNav />
        </main>
      </div>
    </SidebarProvider>
  );
}