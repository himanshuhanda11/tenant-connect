import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * OAuth callback handler.
 * Supports both PKCE (?code=...) and implicit (#access_token=...) flows.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // If provider returned an OAuth error, surface it.
      const oauthError = searchParams.get('error');
      const oauthErrorDescription = searchParams.get('error_description');
      if (oauthError) {
        setError(oauthErrorDescription || oauthError);
        return;
      }

      const next = searchParams.get('next') || '/select-workspace';

      try {
        // If AuthProvider already finished exchanging the code, we may already have a session.
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          navigate(next, { replace: true });
          return;
        }

        // 1) If PKCE code is present, exchange it.
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // 2) Otherwise, try implicit parsing (if provider returned tokens in hash).
          //    This is safe to call even if there are no tokens.
          // @ts-expect-error - getSessionFromUrl exists in supabase-js v2
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
        }

        // Confirm we now have a session (prevents redirect-to-login race conditions).
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('Sign-in completed but no session was created.');
        }

        navigate(next, { replace: true });
      } catch (e: any) {
        console.error('OAuth callback error:', e);

        // Sometimes the exchange is performed by another part of the app and this call races.
        // If a session exists anyway, proceed.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          navigate(next, { replace: true });
          return;
        }

        setError(e?.message || 'Authentication failed.');
      }
    };

    run();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
        {error ? (
          <p className="text-xs text-destructive max-w-sm text-center">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
