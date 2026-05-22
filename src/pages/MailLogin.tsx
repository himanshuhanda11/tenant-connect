import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

/**
 * Dedicated login page for mail.aireatro.com.
 * - Email/password only (no Google, no signup, no marketing).
 * - After auth, verifies the user is a platform super_admin via admin-api/me.
 * - Non-super-admins are immediately signed out and shown an error.
 */
export default function MailLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAndRoute = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No active session");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!res.ok) {
        await supabase.auth.signOut();
        setError("This portal is reserved for platform super admins.");
        return;
      }
      const data = await res.json();
      if (data?.role !== "super_admin") {
        await supabase.auth.signOut();
        setError("This portal is reserved for platform super admins.");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/mail";
      window.location.replace(redirect);
    } catch (e: any) {
      await supabase.auth.signOut();
      setError(e?.message || "Access verification failed");
    }
  };

  // If already signed in when landing here, verify and route.
  useEffect(() => {
    if (!authLoading && user) {
      verifyAndRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        toast.error(signInError.message);
        return;
      }
      await verifyAndRoute();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md rounded-2xl border-border/60 shadow-xl">
        <CardHeader className="text-center space-y-3 pt-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Super Admin Portal
            </CardTitle>
            <CardDescription className="mt-1.5">
              Restricted access · mail.aireatro.com
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aireatro.com"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying…</>
              ) : (
                "Sign in"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Customer accounts cannot sign in here. Use{" "}
              <a href="https://app.aireatro.com/login" className="underline hover:text-foreground">
                app.aireatro.com
              </a>{" "}
              instead.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
