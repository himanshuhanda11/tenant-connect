import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Calendar, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';
import {
  SupportWidgetSettings,
  buildWaLink,
  getSupportWidgetMode,
  interpolatePrefill,
} from '@/lib/supportWidget';

const CACHE_KEY = 'aireatro_support_widget_settings_v1';

function useSupportSettings() {
  const [settings, setSettings] = useState<SupportWidgetSettings | null>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as SupportWidgetSettings) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('support_widget_settings' as any)
        .select('*')
        .eq('id', 'global')
        .maybeSingle();
      if (mounted && data) {
        setSettings(data as unknown as SupportWidgetSettings);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
      }
    })();
    return () => { mounted = false; };
  }, []);

  return settings;
}

async function logEvent(
  event_type: 'view' | 'click',
  widget_mode: 'icon_only' | 'full_widget',
  user_id: string | null,
  workspace_id: string | null,
) {
  try {
    await supabase.from('support_widget_events' as any).insert({
      event_type,
      widget_mode,
      user_id,
      workspace_id,
      page_url: window.location.pathname,
      user_agent: navigator.userAgent.slice(0, 255),
    });
  } catch (err) {
    console.warn('[SupportWidget] event log failed', err);
  }
}

export function SupportWidget() {
  const settings = useSupportSettings();
  const location = useLocation();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const viewedRef = useRef<string | null>(null);

  // Read billing/plan info from currentTenant (best-effort, safe defaults)
  const t = currentTenant as any;
  const planSlug: string = t?.plan_slug || t?.plan || 'free';
  const billingStatus: string = t?.billing_status || 'inactive';
  const hasWhatsApp: boolean = !!(t?.whatsapp_phone_number_id || t?.whatsapp_number);
  const isPaidPlan = ['basic', 'pro', 'business', 'enterprise'].includes(String(planSlug).toLowerCase());
  const hasActivePlan = isPaidPlan && ['active', 'trialing'].includes(billingStatus);
  const onboardingComplete = !!t?.id && hasWhatsApp;

  const mode = useMemo(
    () => getSupportWidgetMode({
      settings,
      pathname: location.pathname,
      isAuthenticated: !!user,
      hasActivePlan,
      hasWhatsApp,
      onboardingComplete,
      isPaidPlan,
    }),
    [settings, location.pathname, user, hasActivePlan, hasWhatsApp, onboardingComplete, isPaidPlan],
  );

  // Log a view once per session per (mode, path)
  useEffect(() => {
    if (mode === 'hidden' || !settings) return;
    const key = `${mode}:${location.pathname}`;
    if (viewedRef.current === key) return;
    viewedRef.current = key;
    logEvent('view', mode, user?.id ?? null, t?.id ?? null);
  }, [mode, settings, location.pathname, user?.id, t?.id]);

  if (mode === 'hidden' || !settings) return null;

  const positionClass = settings.position === 'bottom-left'
    ? 'left-4 sm:left-6'
    : 'right-4 sm:right-6';

  const prefillTemplate = isPaidPlan
    ? settings.prefilled_message_paid
    : settings.prefilled_message_new;

  const prefill = interpolatePrefill(prefillTemplate, {
    email: user?.email,
    workspace: t?.name,
    plan: planSlug,
  });

  const waHref = buildWaLink(settings.whatsapp_number, prefill);
  const brand = settings.brand_color || '#25D366';

  const handleCtaClick = () => {
    logEvent('click', mode, user?.id ?? null, t?.id ?? null);
    window.open(waHref, '_blank', 'noopener,noreferrer');
  };

  if (mode === 'icon_only') {
    return (
      <div className={cn('fixed bottom-4 sm:bottom-6 z-[60]', positionClass)}>
        <button
          type="button"
          onClick={handleCtaClick}
          aria-label={settings.icon_only_tooltip}
          title={settings.icon_only_tooltip}
          className="group relative h-14 w-14 rounded-full shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
          style={{ backgroundColor: brand }}
        >
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: brand }}
          />
          <MessageCircle className="relative h-6 w-6 text-white" strokeWidth={2.4} />
        </button>
      </div>
    );
  }

  // full_widget
  return (
    <div className={cn('fixed bottom-4 sm:bottom-6 z-[60] flex flex-col items-end gap-3', positionClass)}>
      {open && (
        <div
          className="w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-2xl bg-background border border-border/60 shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 text-white relative" style={{ backgroundColor: brand }}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight">
                  {settings.display_name}
                  <span className="ml-0.5 inline-block h-2 w-2 rounded-full bg-emerald-300 ring-2 ring-white/30" />
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">Typically replies in minutes</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {settings.full_widget_title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings.full_widget_subtitle}
            </p>
            <div className="rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground border border-border/50">
              {settings.full_widget_message}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 space-y-2">
            <button
              onClick={handleCtaClick}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition shadow-md"
              style={{ backgroundColor: brand }}
            >
              <MessageCircle className="h-4 w-4" />
              {settings.cta_text}
            </button>
            {settings.show_book_demo && (
              <a
                href="/contact"
                className="w-full h-10 rounded-xl text-sm font-medium border border-border/60 text-foreground hover:bg-muted/60 flex items-center justify-center gap-2 transition"
              >
                <Calendar className="h-4 w-4" />
                Contact Us
              </a>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-full shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center text-white"
        style={{ backgroundColor: brand }}
        aria-label={open ? 'Close support' : 'Open support'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" strokeWidth={2.4} />}
      </button>
    </div>
  );
}

export default SupportWidget;
