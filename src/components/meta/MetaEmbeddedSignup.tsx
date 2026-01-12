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
        console.log('🔧 Loading Meta config...');
        const { data, error } = await supabase.functions.invoke('meta-embedded-signup', {
          body: { action: 'get_config' }
        });

        if (error || !data?.appId) {
          console.error('❌ Failed to get Meta App ID:', error);
          setErrorMessage('Failed to load Meta configuration. Please try again.');
          return;
        }

        const appId = data.appId;
        const configId = data.configId;
        console.log('✅ Meta config loaded - App ID:', appId, 'Config ID:', configId);

        // Store config ID for later use
        (window as any).__META_CONFIG_ID__ = configId;
        (window as any).__META_APP_ID__ = appId;

        window.fbAsyncInit = function () {
          console.log('🔧 Initializing Facebook SDK...');
          window.FB.init({
            appId: appId,
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v21.0'
          });
          console.log('✅ Facebook SDK initialized');
          setSdkLoaded(true);
        };

        // Load SDK script
        if (!document.getElementById('facebook-jssdk')) {
          console.log('🔧 Loading Facebook SDK script...');
          const js = document.createElement('script');
          js.id = 'facebook-jssdk';
          js.src = 'https://connect.facebook.net/en_US/sdk.js';
          js.async = true;
          js.defer = true;
          js.onerror = () => {
            console.error('❌ Failed to load Facebook SDK script');
            setErrorMessage('Failed to load Facebook SDK. Please check your network connection.');
          };
          document.body.appendChild(js);
        } else if (window.FB) {
          console.log('✅ Facebook SDK already loaded');
          setSdkLoaded(true);
        }
      } catch (err) {
        console.error('❌ Error loading Facebook SDK:', err);
        setErrorMessage('Failed to initialize. Please refresh and try again.');
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
    console.log('🚀 Starting WhatsApp signup...');
    
    if (!window.FB) {
      console.error('❌ Facebook SDK not loaded');
      toast.error('Facebook SDK not loaded. Please refresh the page.');
      return;
    }
    
    if (!currentTenant) {
      console.error('❌ No workspace selected');
      toast.error('No workspace selected');
      return;
    }

    const configId = (window as any).__META_CONFIG_ID__;
    if (!configId) {
      console.error('❌ Meta configuration not available');
      toast.error('Meta configuration not available. Please refresh the page.');
      return;
    }

    console.log('📋 Using Config ID:', configId);
    console.log('📋 Tenant ID:', currentTenant.id);

    setLoading(true);
    setStatus('connecting');
    setErrorMessage(null);

    try {
      window.FB.login(
        async (response: any) => {
          console.log('📩 FB.login response:', JSON.stringify(response, null, 2));
          
          if (response.authResponse) {
            setStatus('processing');
            
            try {
              // Get the code from the response
              const code = response.authResponse.code;
              console.log('🔑 Got authorization code:', code ? 'Yes' : 'No');
              
              if (!code) {
                throw new Error('No authorization code received from Meta');
              }
              
              // Exchange code for access token and get WABA details via edge function
              console.log('🔄 Exchanging code for access token...');
              const { data, error } = await supabase.functions.invoke('meta-embedded-signup', {
                body: {
                  action: 'exchange_code',
                  code: code,
                  tenantId: currentTenant.id
                }
              });

              console.log('📩 Exchange response:', JSON.stringify(data, null, 2));

              if (error) {
                console.error('❌ Edge function error:', error);
                throw error;
              }

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
              console.error('❌ Error processing embedded signup:', err);
              setStatus('error');
              setErrorMessage(err.message || 'Failed to connect account');
              onError?.(err);
              toast.error(err.message || 'Failed to connect WhatsApp Business Account');
            }
          } else {
            console.log('⚠️ User cancelled or did not authorize:', response);
            setStatus('idle');
            
            // Check for specific error
            if (response.status === 'unknown') {
              setErrorMessage('Login popup was closed or blocked. Please allow popups and try again.');
            }
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
    } catch (err: any) {
      console.error('❌ FB.login exception:', err);
      setLoading(false);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to open Facebook login');
      toast.error('Failed to open Facebook login');
    }
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
