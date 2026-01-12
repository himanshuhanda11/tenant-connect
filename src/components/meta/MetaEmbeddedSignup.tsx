import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface MetaEmbeddedSignupProps {
  onSuccess?: (data: { wabaId: string; phoneNumberId: string }) => void;
  onError?: (error: Error) => void;
}

interface SessionInfo {
  accessToken: string;
  data_access_expiration_time: number;
}

export function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = async () => {
      // Get app ID from edge function (public endpoint)
      try {
        const { data, error } = await supabase.functions.invoke('meta-embedded-signup', {
          body: { action: 'get_config' }
        });

        if (error || !data?.appId) {
          console.error('Failed to get Meta App ID:', error);
          return;
        }

        const appId = data.appId;
        const configId = data.configId;

        // Store config ID for later use
        (window as any).__META_CONFIG_ID__ = configId;

        window.fbAsyncInit = function () {
          window.FB.init({
            appId: appId,
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v21.0'
          });
          setSdkLoaded(true);
        };

        // Load SDK script
        if (!document.getElementById('facebook-jssdk')) {
          const js = document.createElement('script');
          js.id = 'facebook-jssdk';
          js.src = 'https://connect.facebook.net/en_US/sdk.js';
          js.async = true;
          js.defer = true;
          document.body.appendChild(js);
        } else if (window.FB) {
          setSdkLoaded(true);
        }
      } catch (err) {
        console.error('Error loading Facebook SDK:', err);
      }
    };

    loadFacebookSDK();

    // Listen for message events from Facebook popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            // Phone number selected
            const phoneNumberId = data.data?.phone_number_id;
            const wabaId = data.data?.waba_id;
            console.log('Embedded signup finished:', { phoneNumberId, wabaId });
          } else if (data.event === 'CANCEL') {
            setStatus('idle');
            setLoading(false);
          } else if (data.event === 'ERROR') {
            setStatus('error');
            setErrorMessage(data.data?.error_message || 'An error occurred');
            setLoading(false);
          }
        }
      } catch (e) {
        // Not JSON, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const launchWhatsAppSignup = () => {
    if (!window.FB || !currentTenant) {
      toast.error('Facebook SDK not loaded or no workspace selected');
      return;
    }

    const configId = (window as any).__META_CONFIG_ID__;
    if (!configId) {
      toast.error('Meta configuration not available');
      return;
    }

    setLoading(true);
    setStatus('connecting');
    setErrorMessage(null);

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          setStatus('processing');
          
          try {
            // Get the code from the response
            const code = response.authResponse.code;
            
            // Exchange code for access token and get WABA details via edge function
            const { data, error } = await supabase.functions.invoke('meta-embedded-signup', {
              body: {
                action: 'exchange_code',
                code: code,
                tenantId: currentTenant.id
              }
            });

            if (error) throw error;

            if (data?.success) {
              setStatus('success');
              toast.success('WhatsApp Business Account connected successfully!');
              onSuccess?.({
                wabaId: data.wabaId,
                phoneNumberId: data.phoneNumberId
              });
            } else {
              throw new Error(data?.error || 'Failed to process signup');
            }
          } catch (err: any) {
            console.error('Error processing embedded signup:', err);
            setStatus('error');
            setErrorMessage(err.message || 'Failed to connect account');
            onError?.(err);
            toast.error(err.message || 'Failed to connect WhatsApp Business Account');
          }
        } else {
          console.log('User cancelled login or did not fully authorize.');
          setStatus('idle');
        }
        setLoading(false);
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: 2
        }
      }
    );
  };

  const getButtonContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting to Meta...
          </>
        );
      case 'processing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up account...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Connected Successfully
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Try Again
          </>
        );
      default:
        return (
          <>
            <MessageSquare className="w-4 h-4 mr-2" />
            Connect WhatsApp Business
          </>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={launchWhatsAppSignup}
        disabled={!sdkLoaded || loading || status === 'success'}
        className={`w-full h-12 ${
          status === 'success' 
            ? 'bg-green-600 hover:bg-green-700' 
            : status === 'error'
            ? 'bg-destructive hover:bg-destructive/90'
            : ''
        }`}
        size="lg"
      >
        {getButtonContent()}
      </Button>
      
      {errorMessage && (
        <p className="text-sm text-destructive text-center">{errorMessage}</p>
      )}

      {!sdkLoaded && (
        <p className="text-xs text-muted-foreground text-center">
          Loading Meta SDK...
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        By connecting, you agree to Meta's Terms of Service and Privacy Policy.
        Your WhatsApp Business Account will be linked to this workspace.
      </p>
    </div>
  );
}
