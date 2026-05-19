import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getDeviceHash } from '@/lib/auth/deviceId';

/**
 * Blocks access until:
 *   1. (signup gate) `whatsapp_verification_required` users have `whatsapp_verified = true`
 *   2. (login gate) the current browser is registered in `trusted_devices` (30-day window)
 *
 * Existing users are grandfathered via `whatsapp_verification_required = false`,
 * but ALL verified users still need a trusted device per browser.
 */
export function WhatsAppVerificationGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<'checking' | 'allowed' | 'blocked'>('checking');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setState('allowed');
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('whatsapp_verified, whatsapp_verification_required')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;

      const required = !!(profile as any)?.whatsapp_verification_required;
      const verified = !!(profile as any)?.whatsapp_verified;

      // Signup gate
      if (required && !verified) {
        setState('blocked');
        return;
      }

      // Login gate — only enforced for users who have ever verified.
      if (verified) {
        try {
          const deviceHash = await getDeviceHash();
          const { data: trusted } = await supabase.rpc('is_device_trusted', {
            _device_hash: deviceHash,
          });
          if (!trusted) {
            setState('blocked');
            return;
          }
        } catch {
          // On RPC error, fail-open to avoid locking users out.
        }
      }

      setState('allowed');
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
