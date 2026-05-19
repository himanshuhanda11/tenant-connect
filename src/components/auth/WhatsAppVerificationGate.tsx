import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getDeviceHash } from '@/lib/auth/deviceId';

/**
 * Blocks access until the WhatsApp OTP gate is satisfied. The gate itself is
 * only enforced when the global `whatsapp_otp_enabled` flag in
 * `platform_settings` is true — super admins can toggle it from /control.
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
      // 1. Feature flag — if disabled, skip the entire gate.
      const { data: flagRow } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'whatsapp_otp_enabled')
        .maybeSingle();
      if (cancelled) return;
      const otpEnabled = (flagRow as any)?.value === true;
      if (!otpEnabled) {
        setState('allowed');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('whatsapp_verified, whatsapp_verification_required')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;

      const required = !!(profile as any)?.whatsapp_verification_required;
      const verified = !!(profile as any)?.whatsapp_verified;

      if (required && !verified) {
        setState('blocked');
        return;
      }

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
          // Fail-open on RPC error.
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
