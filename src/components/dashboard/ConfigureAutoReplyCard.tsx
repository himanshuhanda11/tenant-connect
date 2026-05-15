import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, Sparkles, Clock, Zap, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';

const lsKey = (tenantId: string) => `aireatro:dashboard:autoReplyHighlightDismissed:${tenantId}`;

/**
 * Dashboard highlight prompting the user to configure WhatsApp auto-replies
 * (business-hours, after-hours, keyword rules, or AI bot).
 *
 * Renders only when:
 *   - tenant has NO auto_reply_settings row, OR
 *   - none of business_hours_enabled / after_hours_enabled / keywords_enabled / ai_enabled are true
 * AND the user has not dismissed it.
 */
export default function ConfigureAutoReplyCard() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  const [loading, setLoading] = useState(true);
  const [needsConfig, setNeedsConfig] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    setDismissed(localStorage.getItem(lsKey(tenantId)) === '1');

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('auto_reply_settings')
        .select('business_hours_enabled, after_hours_enabled, keywords_enabled, ai_enabled')
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (cancelled) return;
      const anyEnabled = !!(
        data &&
        (data.business_hours_enabled ||
          data.after_hours_enabled ||
          data.keywords_enabled ||
          data.ai_enabled)
      );
      setNeedsConfig(!anyEnabled);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  if (loading || !needsConfig || dismissed || !tenantId) return null;

  const dismiss = () => {
    localStorage.setItem(lsKey(tenantId), '1');
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary/30',
        'bg-gradient-to-br from-primary/10 via-emerald-500/5 to-blue-500/10',
        'p-4 sm:p-5 shadow-md animate-fade-in'
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
          <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide mb-1.5">
            <Sparkles className="h-3 w-3" /> Recommended
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
            Configure automatic responses for incoming messages
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 max-w-xl">
            Reply instantly 24/7 with business-hours greetings, after-hours messages, keyword
            rules, or an AI bot that qualifies leads while you sleep.
          </p>

          <div className="hidden sm:flex flex-wrap items-center gap-2 mt-3 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 border border-border/50">
              <Clock className="h-3 w-3 text-emerald-500" /> Business hours
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 border border-border/50">
              <Zap className="h-3 w-3 text-amber-500" /> Keyword rules
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 border border-border/50">
              <Bot className="h-3 w-3 text-primary" /> AI bot
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 border border-border/50">
              <CheckCircle2 className="h-3 w-3 text-blue-500" /> Lead qualification
            </span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/settings?section=autoreply')}
          className="w-full sm:w-auto h-10 rounded-xl gap-1.5 bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 shadow-md flex-shrink-0"
        >
          Configure now <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
