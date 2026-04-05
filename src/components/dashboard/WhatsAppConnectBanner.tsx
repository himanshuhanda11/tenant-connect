import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, ArrowRight, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export function WhatsAppConnectBanner() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [dismissed, setDismissed] = useState(false);
  const [hasPhone, setHasPhone] = useState<boolean | null>(null);

  useEffect(() => {
    if (!currentTenant) return;

    // Check if dismissed this session
    const key = `wa_banner_dismissed_${currentTenant.id}`;
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
      return;
    }

    const check = async () => {
      const { count } = await supabase
        .from('phone_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id);
      setHasPhone((count ?? 0) > 0);
    };
    check();
  }, [currentTenant]);

  if (dismissed || hasPhone === null || hasPhone) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (currentTenant) {
      sessionStorage.setItem(`wa_banner_dismissed_${currentTenant.id}`, '1');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div className="relative flex items-center gap-3 rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5 px-4 py-3 sm:px-5 sm:py-3.5">
          {/* Pulse indicator */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Wifi className="h-4 w-4 text-primary" />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight">
              WhatsApp API not connected
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              Connect your number to start sending messages, campaigns & automations
            </p>
          </div>

          {/* CTA */}
          <Button
            size="sm"
            onClick={() => navigate('/phone-numbers/connect')}
            className="flex-shrink-0 gap-1.5 rounded-xl text-xs font-semibold px-4"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Connect Now
            <ArrowRight className="h-3 w-3" />
          </Button>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
