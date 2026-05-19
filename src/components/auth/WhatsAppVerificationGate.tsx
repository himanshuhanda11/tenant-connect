import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Blocks access to a route until the signed-in user has verified their WhatsApp
 * number. Existing users are grandfathered (whatsapp_verification_required=false).
 *
 * Use this on routes that are NOT wrapped in <DashboardLayout> (e.g.
 * /select-workspace, /create-workspace). DashboardLayout enforces the same
 * gate for everything inside it.
 */
export function WhatsAppVerificationGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<'checking' | 'allowed' | 'blocked'>('checking');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setState('allowed'); // let downstream route handle redirect to /login
      return;
    }
    const isPreview =
      typeof window !== 'undefined' && !!sessionStorage.getItem('preview_workspace_id');
    if (isPreview) {
      setState('allowed');
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('whatsapp_verified, whatsapp_verification_required')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const mustVerify =
        data && (data as any).whatsapp_verification_required && !(data as any).whatsapp_verified;
      setState(mustVerify ? 'blocked' : 'allowed');
    })();
    return () => { cancelled = true; };
  }, [user, loading]);

  if (loading || state === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === 'blocked') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/verify-whatsapp?next=${next}`} replace />;
  }

  return <>{children}</>;
}
