import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface MetaEmbeddedSignupProps {
  onSuccess?: (data: { wabaId: string; phoneNumberId: string }) => void;
  onError?: (error: Error) => void;
}

export function MetaEmbeddedSignup({ onSuccess, onError }: MetaEmbeddedSignupProps) {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(false);

  const startWhatsAppConnect = async () => {
    if (!currentTenant) {
      toast.error('No workspace selected');
      return;
    }

    setLoading(true);
    
    try {
      // Get auth token for the request
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/waba-connect-start?tenantId=${currentTenant.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start connection');
      }

      if (result.url) {
        // Redirect to Meta OAuth
        window.location.href = result.url;
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (err: any) {
      console.error('Error starting WhatsApp connect:', err);
      toast.error(err.message || 'Failed to start connection');
      onError?.(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={startWhatsAppConnect}
        disabled={loading}
        className="w-full h-12"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to Meta...
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 mr-2" />
            Continue with Facebook
            <ExternalLink className="w-3 h-3 ml-2" />
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        You'll be redirected to Meta to authorize your WhatsApp Business Account.
        After authorization, you'll be returned here automatically.
      </p>
    </div>
  );
}
