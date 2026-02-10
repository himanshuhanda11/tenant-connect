import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    FB: any;
  }
}

interface MetaEmbeddedSignupProps {
  onSuccess?: (data: { wabaId: string; phoneNumberId: string }) => void;
  onError?: (error: Error) => void;
}

export function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  // Store WABA + phone IDs received via the MessageEvent listener
  const sessionDataRef = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);

  // Listen for session info from Meta's Embedded Signup popup
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      ) {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log('Embedded Signup FINISH — WABA:', waba_id, 'Phone:', phone_number_id);
            sessionDataRef.current = { wabaId: waba_id, phoneNumberId: phone_number_id };
          } else if (data.event === 'CANCEL') {
            console.warn('Embedded Signup cancelled at step:', data.data?.current_step);
            toast.info('WhatsApp signup was cancelled');
            setLoading(false);
          } else if (data.event === 'ERROR') {
            console.error('Embedded Signup error:', data.data?.error_message);
            toast.error(data.data?.error_message || 'An error occurred during signup');
            setLoading(false);
          }
        }
      } catch {
        // Non-JSON messages from other iframes — ignore
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const launchWhatsAppSignup = async () => {
    if (!currentTenant) {
      toast.error('No workspace selected');
      return;
    }

    if (!window.FB) {
      toast.error('Facebook SDK not loaded yet. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    sessionDataRef.current = null;

    // FB.login callback — receives the auth code
    const fbLoginCallback = async (response: any) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('FB.login returned code, exchanging on backend...');

        try {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          if (!token) throw new Error('Not authenticated');

          // Wait a brief moment for the MessageEvent to arrive with WABA/phone IDs
          await new Promise((r) => setTimeout(r, 1500));

          const wabaId = sessionDataRef.current?.wabaId;
          const phoneNumberId = sessionDataRef.current?.phoneNumberId;

          console.log('Sending to backend — code, wabaId:', wabaId, 'phoneNumberId:', phoneNumberId);

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const res = await fetch(`${supabaseUrl}/functions/v1/meta-embedded-signup`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'exchange_code',
              code,
              tenantId: currentTenant.id,
              wabaId: wabaId || undefined,
              phoneNumberId: phoneNumberId || undefined,
            }),
          });

          const result = await res.json();

          if (!res.ok) {
            throw new Error(result.error || 'Failed to complete signup');
          }

          toast.success(
            `WhatsApp connected! ${result.phoneCount || 0} phone number(s) linked.`
          );
          onSuccess?.({
            wabaId: result.wabaId,
            phoneNumberId: result.phoneNumberId,
          });
        } catch (err: any) {
          console.error('Embedded signup exchange error:', err);
          toast.error(err.message || 'Failed to complete signup');
          onError?.(err);
        }
      } else {
        console.warn('FB.login cancelled or failed', response);
        toast.info('Facebook login was cancelled');
      }

      setLoading(false);
    };

    // Launch the Embedded Signup popup via FB.login
    window.FB.login(fbLoginCallback, {
      config_id: '1271263174873831',
      response_type: 'code',
      override_default_response_type: true,
      extras: { version: 'v3' },
    });
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={launchWhatsAppSignup}
        disabled={loading}
        className="w-full h-12"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting to WhatsApp...
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 mr-2" />
            Login with Facebook
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        A popup will open for you to authorize your WhatsApp Business Account.
      </p>
    </div>
  );
}
