import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, Phone, Loader2,
  ArrowRight, Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Props {
  waba: any;
  phones: any[];
  workspacePhone?: any | null;
}

type Severity = 'ok' | 'warn' | 'error' | 'pending';

interface Diagnosis {
  severity: Severity;
  headline: string;       // 1-line status for support agent
  nextAction: string;     // What to tell the customer to do
  steps: { label: string; done: boolean; note?: string }[];
}

const isNumericId = (v: any) =>
  typeof v === 'string' && /^\d{8,}$/.test(v.trim());

function diagnose(waba: any, phones: any[], workspacePhone: any | null): Diagnosis {
  const phone = phones?.[0];
  const wabaIdValid = isNumericId(waba?.waba_id);
  const businessIdValid = isNumericId(waba?.business_id);
  const phoneIdValid = isNumericId(phone?.phone_number_id);
  const hasPhoneRow = !!phone;
  const hasWebhook = !!phone?.last_webhook_at;
  const tokenSource = waba?.token_source || null;

  const steps = [
    { label: 'Embedded Signup launched', done: !!waba, note: tokenSource ? `source: ${tokenSource}` : undefined },
    { label: 'Valid WABA ID received from Meta', done: wabaIdValid, note: waba?.waba_id ? `id: ${waba.waba_id}` : undefined },
    { label: 'Business Manager ID linked', done: businessIdValid, note: waba?.business_id || undefined },
    { label: 'Phone number registered', done: hasPhoneRow && phoneIdValid, note: phone?.phone_number_id },
    { label: 'Webhook delivering events', done: hasWebhook, note: phone?.last_webhook_at ? `last: ${new Date(phone.last_webhook_at).toLocaleString()}` : 'no events received yet' },
    { label: 'Quality rating issued', done: !!phone?.quality_rating, note: phone?.quality_rating || undefined },
  ];

  if (!waba && !hasPhoneRow && !workspacePhone) {
    return {
      severity: 'pending',
      headline: 'WhatsApp not connected — customer has not started Embedded Signup yet.',
      nextAction: 'Ask the customer to open Settings → WhatsApp → Connect Number and complete Meta Embedded Signup.',
      steps,
    };
  }

  if (waba && !wabaIdValid) {
    return {
      severity: 'error',
      headline: `Embedded Signup started but failed — WABA ID is invalid ("${waba?.waba_id ?? '—'}"). No real Meta connection exists.`,
      nextAction: 'Delete this stale WABA record and ask the customer to re-run Embedded Signup from Settings → WhatsApp.',
      steps,
    };
  }

  if (wabaIdValid && !businessIdValid) {
    return {
      severity: 'warn',
      headline: 'WABA ID received but Business Manager ID is missing — connection is half-complete.',
      nextAction: 'Ask the customer to re-authorize Embedded Signup so Meta returns the Business ID.',
      steps,
    };
  }

  if (wabaIdValid && !hasPhoneRow) {
    return {
      severity: 'warn',
      headline: 'WABA created but no phone number registered yet.',
      nextAction: 'Ask the customer to add a WhatsApp number to this WABA inside the Embedded Signup popup, or add it from Meta Business Manager.',
      steps,
    };
  }

  if (hasPhoneRow && !phoneIdValid) {
    return {
      severity: 'error',
      headline: `Phone number ID is invalid ("${phone?.phone_number_id}") — not a real Meta phone.`,
      nextAction: 'Delete this phone row and ask the customer to re-run Embedded Signup so Meta returns a real Phone Number ID.',
      steps,
    };
  }

  if (phoneIdValid && phone?.status !== 'connected') {
    return {
      severity: 'warn',
      headline: `Phone is registered but status is "${phone?.status}" — not yet connected.`,
      nextAction: 'Ask the customer to verify the OTP / two-step PIN inside Meta Business Manager for this number.',
      steps,
    };
  }

  if (phoneIdValid && !hasWebhook) {
    return {
      severity: 'warn',
      headline: 'Phone connected but webhook has never fired — Meta is not delivering events to us.',
      nextAction: 'Confirm webhook subscription in Meta App Dashboard → WhatsApp → Configuration. Ask customer to send a test message.',
      steps,
    };
  }

  return {
    severity: 'ok',
    headline: `Healthy — connected and receiving events. Last webhook: ${new Date(phone.last_webhook_at).toLocaleString()}.`,
    nextAction: 'No action needed. Customer can send and receive messages.',
    steps,
  };
}

const SEVERITY_STYLES: Record<Severity, { bg: string; ring: string; icon: any; iconColor: string; label: string; chip: string }> = {
  ok:      { bg: 'bg-emerald-50/60 dark:bg-emerald-950/30', ring: 'ring-emerald-200 dark:ring-emerald-900',  icon: CheckCircle2,  iconColor: 'text-emerald-600',  label: 'Healthy',  chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  warn:    { bg: 'bg-amber-50/60 dark:bg-amber-950/30',     ring: 'ring-amber-200 dark:ring-amber-900',      icon: AlertTriangle, iconColor: 'text-amber-600',    label: 'Action needed', chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
  error:   { bg: 'bg-red-50/60 dark:bg-red-950/30',         ring: 'ring-red-200 dark:ring-red-900',          icon: XCircle,       iconColor: 'text-red-600',      label: 'Broken',   chip: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  pending: { bg: 'bg-muted/40',                              ring: 'ring-border',                             icon: Clock,         iconColor: 'text-muted-foreground', label: 'Not started', chip: 'bg-muted text-muted-foreground' },
};

function copy(text?: string | null) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => toast({ title: 'Copied', description: text }));
}

export function WhatsAppConnectionStatus({ waba, phones, workspacePhone }: Props) {
  const dx = diagnose(waba, phones || [], workspacePhone);
  const sty = SEVERITY_STYLES[dx.severity];
  const Icon = sty.icon;
  const phone = phones?.[0];
  const completed = dx.steps.filter(s => s.done).length;

  return (
    <Card className={cn('rounded-2xl border-0 shadow-sm ring-1', sty.ring, sty.bg)}>
      <CardContent className="p-5 space-y-4">
        {/* Headline */}
        <div className="flex items-start gap-3">
          <div className={cn('h-10 w-10 rounded-xl bg-background flex items-center justify-center flex-shrink-0 shadow-sm')}>
            <Icon className={cn('h-5 w-5', sty.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold">WhatsApp Connection Status</h3>
              <Badge className={cn('text-[10px] uppercase tracking-wide font-semibold border-0', sty.chip)}>{sty.label}</Badge>
              <span className="text-[11px] text-muted-foreground">{completed}/{dx.steps.length} steps complete</span>
            </div>
            <p className="text-sm font-medium leading-snug">{dx.headline}</p>
          </div>
        </div>

        {/* Next action */}
        <div className="flex items-start gap-2 rounded-xl bg-background/70 p-3 ring-1 ring-border/60">
          <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-0.5">What to tell the customer</p>
            <p className="text-sm leading-snug">{dx.nextAction}</p>
          </div>
        </div>

        {/* Step checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {dx.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {s.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className={cn('font-medium', !s.done && 'text-muted-foreground')}>{s.label}</span>
                {s.note && (
                  <span className="text-muted-foreground ml-1 break-all">— {s.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick reference IDs */}
        {(waba || phone) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            {waba?.waba_id && (
              <button onClick={() => copy(waba.waba_id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-background hover:bg-muted ring-1 ring-border/60">
                WABA: {waba.waba_id} <Copy className="h-3 w-3 opacity-60" />
              </button>
            )}
            {waba?.business_id && (
              <button onClick={() => copy(waba.business_id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-background hover:bg-muted ring-1 ring-border/60">
                BIZ: {waba.business_id} <Copy className="h-3 w-3 opacity-60" />
              </button>
            )}
            {phone?.phone_number_id && (
              <button onClick={() => copy(phone.phone_number_id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-background hover:bg-muted ring-1 ring-border/60">
                PHONE_ID: {phone.phone_number_id} <Copy className="h-3 w-3 opacity-60" />
              </button>
            )}
            {phone?.display_number && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono bg-background ring-1 ring-border/60">
                <Phone className="h-3 w-3" /> {phone.display_number}
              </span>
            )}
          </div>
        )}

        {/* Coexistence / Onboarding type */}
        {waba && (
          <div className="rounded-xl bg-background/70 p-3 ring-1 ring-border/60 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Onboarding</span>
              <Badge className="text-[10px] uppercase tracking-wide font-semibold border-0 bg-muted text-foreground">
                {waba.onboarding_type === 'business_app_coexistence' ? 'Business App Coexistence' : 'Normal API'}
              </Badge>
              {(waba.coexistence_enabled || waba.coexistence_status) && (
                <Badge className={cn(
                  'text-[10px] uppercase tracking-wide font-semibold border-0',
                  waba.coexistence_enabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : waba.coexistence_status === 'error'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                )}>
                  Coexistence: {waba.coexistence_enabled ? 'Enabled' : (waba.coexistence_status || 'unknown')}
                </Badge>
              )}
            </div>
            {(waba.coexistence_enabled || waba.coexistence_status || waba.coexistence_checked_at) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div><span className="font-medium text-foreground">Status:</span> {waba.coexistence_status || '—'}</div>
                <div><span className="font-medium text-foreground">Eligibility:</span> {waba.coexistence_eligibility || '—'}</div>
                <div className="sm:col-span-2"><span className="font-medium text-foreground">Last checked:</span> {waba.coexistence_checked_at ? new Date(waba.coexistence_checked_at).toLocaleString() : '—'}</div>
                {waba.coexistence_error && (
                  <div className="sm:col-span-2 text-destructive break-all"><span className="font-medium">Error:</span> {waba.coexistence_error}</div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
