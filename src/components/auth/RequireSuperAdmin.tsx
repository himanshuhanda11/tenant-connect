import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminApi } from "@/hooks/useAdminApi";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Gate that only allows platform super_admins through.
 * Used by mail.aireatro.com (super-admin-only portal) and any other
 * route that should be restricted to platform owners.
 *
 * Non-admins see a polished "Restricted" screen and can sign out
 * or return to the main app — they are never silently redirected.
 */
export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const activeUser = user ?? session?.user ?? null;
        if (!activeUser) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          navigate(`/login?redirect=${next}`, { replace: true });
          return;
        }
        if (!cancelled) setSessionEmail(activeUser.email ?? null);
        const data = await get("me");
        if (!cancelled) setRole(data?.role ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to verify access");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Verifying access…</p>
      </div>
    );
  }

  const isSuperAdmin = role === "super_admin";

  if (error || !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/40 via-background to-muted/20 p-4">
        <Card className="max-w-md w-full rounded-2xl border-border/50 shadow-lg animate-fade-in">
          <CardContent className="pt-8 pb-8 px-8 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold">Restricted area</h1>
              <p className="text-sm text-muted-foreground">
                This portal is reserved for Aireatro platform super admins.
                Your account ({user?.email}) does not have access.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" onClick={() => signOut()} className="w-full">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
