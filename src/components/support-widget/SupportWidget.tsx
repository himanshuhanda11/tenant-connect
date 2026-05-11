import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Calendar, ArrowRight, Loader2, CheckCircle2, User, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  extra?: { lead_name?: string | null; lead_phone?: string | null },
) {
  try {
    await supabase.from('support_widget_events' as any).insert({
      event_type,
      widget_mode,
      user_id,
      workspace_id,
      page_url: window.location.pathname,
      user_agent: navigator.userAgent.slice(0, 255),
      lead_name: extra?.lead_name ?? null,
      lead_phone: extra?.lead_phone ?? null,
    });
  } catch (err) {
    console.warn('[SupportWidget] event log failed', err);
  }
}

type Step = 'intro' | 'name' | 'phone' | 'connecting';

const ICON_DISMISS_KEY = 'aireatro_support_widget_icon_dismissed';

export function SupportWidget() {
  const settings = useSupportSettings();
  const location = useLocation();
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [iconDismissed, setIconDismissed] = useState(() => {
    try { return sessionStorage.getItem(ICON_DISMISS_KEY) === '1'; } catch { return false; }
  });
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

  // Always collect lead before opening WhatsApp when the toggle is on,
  // regardless of whether the visitor is signed in.
  const collectLead = !!settings.collect_lead_before_chat;

  const openWhatsApp = (extraName?: string, extraPhone?: string) => {
    const finalPrefill = (extraName || extraPhone)
      ? `${prefill}${extraName ? `\nName: ${extraName}` : ''}${extraPhone ? `\nPhone: ${extraPhone}` : ''}`
      : prefill;
    const href = buildWaLink(settings.whatsapp_number, finalPrefill);
    logEvent('click', mode, user?.id ?? null, t?.id ?? null, {
      lead_name: extraName ?? null,
      lead_phone: extraPhone ?? null,
    });
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleCtaClick = () => {
    if (collectLead) {
      setOpen(true);
      setStep('name');
      setErrMsg(null);
      return;
    }
    openWhatsApp();
  };

  const submitName = () => {
    const v = leadName.trim();
    if (v.length < 2 || v.length > 80) { setErrMsg('Please enter your full name (2–80 characters).'); return; }
    setErrMsg(null);
    setStep('phone');
  };

  const submitPhone = () => {
    const cleaned = leadPhone.replace(/[^\d+]/g, '');
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) { setErrMsg('Please enter a valid mobile number.'); return; }
    setErrMsg(null);
    setStep('connecting');
    setTimeout(() => {
      openWhatsApp(leadName.trim(), cleaned);
    }, 900);
  };

  const resetForm = () => {
    setStep('intro');
    setLeadName('');
    setLeadPhone('');
    setErrMsg(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 200);
  };

  if (mode === 'icon_only' && !collectLead) {
    if (iconDismissed) return null;
    return (
      <div className={cn('fixed bottom-4 sm:bottom-6 z-[60] flex items-center gap-2', positionClass)}>
        <button
          type="button"
          onClick={handleCtaClick}
          aria-label={settings.icon_only_tooltip}
          title={settings.icon_only_tooltip}
          className="group relative inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full shadow-lg shadow-black/20 hover:scale-[1.03] active:scale-95 transition-transform text-white"
          style={{ backgroundColor: brand }}
        >
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: brand }}
          />
          <span className="relative h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
            <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="relative text-sm font-semibold whitespace-nowrap pr-1">
            {settings.cta_text || 'Chat on WhatsApp'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            try { sessionStorage.setItem(ICON_DISMISS_KEY, '1'); } catch {}
            setIconDismissed(true);
          }}
          aria-label="Dismiss"
          className="h-7 w-7 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-foreground/80 hover:text-foreground hover:scale-110 transition"
        >
          <X className="h-3.5 w-3.5" />
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
              onClick={handleClose}
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

          {step === 'intro' && (
            <>
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
            </>
          )}

          {(step === 'name' || step === 'phone') && (
            <div className="px-5 py-5 space-y-4">
              <StepDots active={step === 'name' ? 0 : 1} brand={brand} />
              {step === 'name' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {settings.step_name_label}
                    </label>
                    <Input
                      autoFocus
                      maxLength={80}
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitName()}
                      placeholder={settings.step_name_placeholder}
                    />
                  </div>
                  {errMsg && <p className="text-[11px] text-destructive">{errMsg}</p>}
                  <button
                    onClick={submitName}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition shadow-md"
                    style={{ backgroundColor: brand }}
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {settings.step_phone_label}
                    </label>
                    <Input
                      autoFocus
                      type="tel"
                      maxLength={20}
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitPhone()}
                      placeholder={settings.step_phone_placeholder}
                    />
                  </div>
                  {errMsg && <p className="text-[11px] text-destructive">{errMsg}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setStep('name'); setErrMsg(null); }}
                      className="h-11 px-4 rounded-xl text-sm font-medium border border-border/60 text-foreground hover:bg-muted/60 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitPhone}
                      className="flex-1 h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition shadow-md"
                      style={{ backgroundColor: brand }}
                    >
                      <MessageCircle className="h-4 w-4" /> {settings.cta_text}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'connecting' && (
            <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
              <div className="relative h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brand}20` }}>
                <Loader2 className="h-7 w-7 animate-spin" style={{ color: brand }} />
              </div>
              <p className="text-sm font-medium text-foreground">{settings.step_connect_message}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Opening WhatsApp…
              </p>
            </div>
          )}
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

function StepDots({ active, brand }: { active: 0 | 1; brand: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1].map((i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i === active ? 24 : 8,
            backgroundColor: i <= active ? brand : 'hsl(var(--muted))',
          }}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">Step {active + 1} of 2</span>
    </div>
  );
}

export default SupportWidget;
