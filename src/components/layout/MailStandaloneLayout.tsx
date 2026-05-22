import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Minimal standalone layout for mail.aireatro.com.
 *
 * Unlike DashboardLayout, this does NOT:
 *  - check `profiles.onboarding_step` (super admins skip onboarding entirely)
 *  - enforce WhatsApp OTP
 *  - redirect to /select-workspace when no tenant is selected
 *
 * It only verifies the user is signed in. Super-admin gating is handled
 * one level up by <RequireSuperAdmin />.
 */
export function MailStandaloneLayout({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || user || session) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && !data.session) navigate("/login", { replace: true });
    });
    return () => { cancelled = true; };
  }, [user, session, loading, navigate]);

  if (loading || (!user && !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
