import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Coins,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  Wallet,
  Users,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useBroadcastCostEstimate, type BroadcastCostEstimate } from '@/hooks/useBroadcastCostEstimate';
import { useMessageCredits } from '@/hooks/useMessageCredits';
import { cn } from '@/lib/utils';

interface Props {
  tenantId: string | null | undefined;
  contactIds: string[];
  templateCategory: string | null | undefined;
  className?: string;
  onEstimateChange?: (e: BroadcastCostEstimate | null) => void;
  compact?: boolean;
}

/**
 * Premium compact credit estimate card for /campaigns/create.
 * Country-wise pricing details live on /message-pricing instead.
 */
export function CampaignCreditEstimateCard({
  tenantId,
  contactIds,
  templateCategory,
  className,
  onEstimateChange,
  compact,
}: Props) {
  const navigate = useNavigate();
  const { estimate, loading, error } = useBroadcastCostEstimate({
    tenantId,
    contactIds,
    templateCategory,
  });
  const { balance: walletBalance } = useMessageCredits();

  // bubble up
  useEffect(() => {
    onEstimateChange?.(estimate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimate]);

  // animated counters
  const required = estimate?.total_credits ?? 0;
  const audience = estimate?.total_recipients ?? contactIds.length;
  const available = estimate?.available ?? walletBalance ?? 0;
  const sufficient = estimate ? estimate.sufficient : available >= required;
  const remaining = sufficient ? available - required : 0;
  const shortfall = sufficient ? 0 : required - available;

  const cat = (templateCategory || 'marketing').toLowerCase();
  const empty = contactIds.length === 0 || !templateCategory;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 transition-all',
        sufficient
          ? 'border-emerald-300/40 bg-gradient-to-br from-emerald-50/50 via-background to-background dark:from-emerald-500/5'
          : 'border-destructive/40 bg-gradient-to-br from-destructive/5 via-background to-background',
        className,
      )}
    >
      {/* Glow accent */}
      <div
        className={cn(
          'absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-40',
          sufficient ? 'bg-emerald-400/30' : 'bg-destructive/30',
        )}
        aria-hidden
      />

      <CardContent className="relative p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shadow-sm',
                sufficient
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground',
              )}
            >
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-none flex items-center gap-1.5">
                Campaign Credit Estimate
                <Sparkles className="h-3 w-3 text-amber-500" />
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 capitalize">
                {cat} template · live wallet sync
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] capitalize whitespace-nowrap">
            {cat}
          </Badge>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Kpi
            icon={<Users className="h-3 w-3" />}
            label="Audience"
            value={audience}
            suffix="contacts"
            loading={loading && empty === false}
          />
          <Kpi
            icon={<Coins className="h-3 w-3" />}
            label="Estimated"
            value={required}
            suffix="credits"
            tone={sufficient ? 'neutral' : 'bad'}
            loading={loading}
          />
          <Kpi
            icon={<Wallet className="h-3 w-3" />}
            label="Available"
            value={available}
            suffix="credits"
          />
          <Kpi
            icon={sufficient ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            label={sufficient ? 'After Send' : 'Short By'}
            value={sufficient ? remaining : shortfall}
            suffix="credits"
            tone={sufficient ? 'ok' : 'bad'}
          />
        </div>

        {/* Warning / Confirm state */}
        {empty ? (
          <p className="text-[11px] text-muted-foreground text-center py-1">
            Select audience and template to see your estimate.
          </p>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Calculating live cost…
          </div>
        ) : error ? (
          <p className="text-[11px] text-destructive">{error}</p>
        ) : sufficient ? (
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Wallet has enough credits — your campaign is ready to launch.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
            <div className="flex items-start gap-2 flex-1">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed">
                You need <strong>{required.toLocaleString()}</strong> credits, but only have{' '}
                <strong>{available.toLocaleString()}</strong> available. Top up{' '}
                <strong>{shortfall.toLocaleString()}+</strong> credits to send.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1 flex-shrink-0 w-full sm:w-auto"
              onClick={() => navigate('/billing?tab=credits')}
            >
              <Coins className="h-3.5 w-3.5" />
              Add Credits
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Footer link */}
        <div className="flex items-center justify-between pt-1 border-t">
          <Link
            to="/message-pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            <ExternalLink className="h-3 w-3" />
            Check Message Pricing
          </Link>
          <span className="text-[10px] text-muted-foreground">Final amount confirmed at send</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Kpi({
  icon,
  label,
  value,
  suffix,
  tone = 'neutral',
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone?: 'ok' | 'bad' | 'neutral';
  loading?: boolean;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    // simple animated counter
    if (display === value) return;
    const start = display;
    const diff = value - start;
    const dur = 400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={cn(
        'rounded-xl border bg-card/60 backdrop-blur-sm p-2.5 transition-colors',
        tone === 'bad' && 'border-destructive/30 bg-destructive/5',
        tone === 'ok' && 'border-emerald-300/40 bg-emerald-500/5',
      )}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={cn(
          'text-lg font-bold tabular-nums leading-tight mt-1',
          tone === 'ok' && 'text-emerald-700 dark:text-emerald-400',
          tone === 'bad' && 'text-destructive',
        )}
      >
        {loading ? '…' : display.toLocaleString()}
      </p>
      {suffix && <p className="text-[9px] text-muted-foreground">{suffix}</p>}
    </div>
  );
}
