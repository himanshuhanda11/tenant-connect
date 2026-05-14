import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { loadFacebookSdk } from '@/lib/loadFacebookSdk';

declare global {
  interface Window {
    FB: any;
  }
}

type SignupMode = 'standard' | 'coexistence';

interface CoexistencePayload {
  coexistence_enabled: boolean;
  coexistence_status: string | null;
  coexistence_eligibility: string | null;
  coexistence_error: string | null;
  coexistence_checked_at: string;
  is_on_biz_app?: boolean | null;
  platform_type?: string | null;
  contacts_sync_status?: string | null;
  history_sync_status?: string | null;
  history_sync_progress?: number | null;
}

interface MetaEmbeddedSignupProps {
  onSuccess?: (data: {
    wabaId: string;
    phoneNumberId: string;
    mode?: SignupMode;
    coexistence?: CoexistencePayload | null;
  }) => void;
  onError?: (error: Error) => void;
  onConnectionError?: (errorMessage: string) => void;
}

export function MetaEmbeddedSignup({ onSuccess, onError, onConnectionError }: MetaEmbeddedSignupProps) {
  const { currentTenant } = useTenant();
  const [loadingMode, setLoadingMode] = useState<SignupMode | null>(null);
  const [lastResult, setLastResult] = useState<{
    mode: SignupMode;
    wabaId?: string;
    phoneNumberId?: string;
    displayNumber?: string;
    coexistence?: CoexistencePayload | null;
  } | null>(null);

  const sessionDataRef = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);

  useEffect(() => { loadFacebookSdk().catch(() => {}); }, []);

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
            setLoadingMode(null);
          } else if (data.event === 'ERROR') {
            console.error('Embedded Signup error:', data.data?.error_message);
            toast.error(data.data?.error_message || 'An error occurred during signup');
            setLoadingMode(null);
          }
        }
      } catch {
        /* ignore non-JSON */
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const launchSignup = async (mode: SignupMode, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!currentTenant) {
      toast.error('No workspace selected');
      return;
    }

    try {
      await loadFacebookSdk();
    } catch {
      toast.error('Could not load Facebook SDK. Please try again.');
      return;
    }

    setLoadingMode(mode);
    sessionDataRef.current = null;

    const fbLoginCallback = (response: any) => {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('FB.login returned code (mode:', mode, '), exchanging on backend...');

        (async () => {
          try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (!token) throw new Error('Not authenticated');

            await new Promise((r) => setTimeout(r, 1500));

            const wabaId = sessionDataRef.current?.wabaId;
            const phoneNumberId = sessionDataRef.current?.phoneNumberId;

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
                mode,
              }),
            });

            const result = await res.json();

            if (!res.ok) {
              const errMsg = result.error || 'Failed to complete signup';
              onConnectionError?.(errMsg);
              throw new Error(errMsg);
            }

            const cx: CoexistencePayload | null = result.coexistence || null;
            setLastResult({
              mode,
              wabaId: result.wabaId,
              phoneNumberId: result.phoneNumberId,
              coexistence: cx,
            });

            if (mode === 'coexistence') {
              if (cx?.coexistence_enabled) {
                toast.success('WhatsApp Coexistence enabled — Business App keeps working.');
              } else if (cx?.coexistence_status === 'not_eligible' || cx?.coexistence_eligibility === 'not_eligible') {
                toast.warning('Coexistence is not available for this number. You can still connect using normal WhatsApp Cloud API setup.');
              } else if (cx?.coexistence_status === 'error') {
                toast.error(cx.coexistence_error || 'Could not verify coexistence status from Meta.');
              } else {
                toast.success(`WhatsApp connected. ${result.phoneCount || 0} phone number(s) linked.`);
              }
            } else {
              toast.success(`WhatsApp connected! ${result.phoneCount || 0} phone number(s) linked.`);
            }

            onSuccess?.({
              wabaId: result.wabaId,
              phoneNumberId: result.phoneNumberId,
              mode: result.mode,
              coexistence: cx,
            });
          } catch (err: any) {
            console.error('Embedded signup exchange error:', err);
            const errMsg = err.message || 'Failed to complete signup';
            toast.error(errMsg);
            onConnectionError?.(errMsg);
            onError?.(err);
          } finally {
            setLoadingMode(null);
          }
        })();
      } else {
        console.warn('FB.login cancelled or failed', response);
        toast.info('Facebook login was cancelled');
        setLoadingMode(null);
      }
    };

    const extras: Record<string, any> = {
      setup: {},
      featureType: '',
      sessionInfoVersion: '3',
    };

    if (mode === 'coexistence') {
      // Meta Coexistence config — keeps WhatsApp Business App active alongside Cloud API
      extras.featureType = 'whatsapp_business_app_onboarding';
      extras.setup = { coexistence: true };
    }

    window.FB.login(fbLoginCallback, {
      config_id: '2832690830396328',
      response_type: 'code',
      override_default_response_type: true,
      extras,
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
    });
  };

  const cx = lastResult?.coexistence;
  const cxEnabled = !!cx?.coexistence_enabled;
  const cxNotEligible = cx?.coexistence_status === 'not_eligible' || cx?.coexistence_eligibility === 'not_eligible';

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={(e) => launchSignup('standard', e)}
        disabled={loadingMode !== null}
        className="w-full h-12"
        size="lg"
      >
        {loadingMode === 'standard' ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting to WhatsApp...</>
        ) : (
          <><MessageSquare className="w-4 h-4 mr-2" />Login with Facebook</>
        )}
      </Button>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">Connect existing WhatsApp Business App number</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Use the same number in WhatsApp Business App and Aireatro together — keep automation, team inbox, CRM, and campaigns alongside your mobile app.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => launchSignup('coexistence', e)}
          disabled={loadingMode !== null}
          className="w-full"
        >
          {loadingMode === 'coexistence' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting with Coexistence...</>
          ) : (
            <><Smartphone className="w-4 h-4 mr-2" />Connect with Coexistence</>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        A popup will open for you to authorize your WhatsApp Business Account.
      </p>

      {lastResult?.mode === 'coexistence' && cx && (
        <div className={`rounded-lg border p-4 text-sm space-y-2 ${
          cxEnabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {cxEnabled ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Coexistence Enabled</>
            ) : cxNotEligible ? (
              <><AlertTriangle className="w-4 h-4 text-amber-600" /> Coexistence Not Available</>
            ) : (
              <><AlertTriangle className="w-4 h-4 text-amber-600" /> Coexistence Status: {cx.coexistence_status || 'unknown'}</>
            )}
          </div>
          {cxEnabled && (
            <p className="text-xs text-muted-foreground">
              WhatsApp Business App can still be used on this number.
            </p>
          )}
          {cxNotEligible && (
            <p className="text-xs text-muted-foreground">
              Coexistence is not available for this number. You can still connect using normal WhatsApp Cloud API setup.
            </p>
          )}
          {cx.coexistence_error && (
            <p className="text-xs text-destructive">{cx.coexistence_error}</p>
          )}
          <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div><span className="font-medium text-foreground">WABA ID:</span> {lastResult.wabaId}</div>
            <div><span className="font-medium text-foreground">Phone Number ID:</span> {lastResult.phoneNumberId}</div>
            <div><span className="font-medium text-foreground">Last checked:</span> {new Date(cx.coexistence_checked_at).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
