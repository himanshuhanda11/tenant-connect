import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, TrendingUp, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { useDealInsights, type DealAiInsights as Insights } from '@/hooks/useDealInsights';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Deal } from '@/types/crm';

interface Props {
  deal: Deal;
}

export function DealAiInsights({ deal }: Props) {
  const { generate, loading } = useDealInsights();
  const cached = (deal.metadata as any)?.ai as Insights | undefined;
  const [insights, setInsights] = useState<Insights | null>(cached ?? null);

  useEffect(() => {
    setInsights(((deal.metadata as any)?.ai as Insights | undefined) ?? null);
  }, [deal.id, deal.metadata]);

  const run = async () => {
    const r = await generate(deal.id);
    if (r) setInsights(r);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.5)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Insights</span>
            {insights?.generated_at && (
              <p className="text-[10px] text-muted-foreground">
                Updated {formatDistanceToNow(new Date(insights.generated_at), { addSuffix: true })}
              </p>
            )}
          </div>
          <Button size="sm" variant={insights ? 'outline' : 'default'} onClick={run} disabled={loading} className="h-8 gap-1.5">
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {insights ? 'Re-analyze' : 'Analyze deal'}
          </Button>
        </div>
        {insights?.summary && <p className="text-sm text-foreground/90 leading-snug">{insights.summary}</p>}
        {!insights && !loading && (
          <p className="text-xs text-muted-foreground">
            Get instant lead-quality, conversion probability and a recommended next action — powered by Lovable AI.
          </p>
        )}
      </div>

      {insights && (
        <>
          <MetricRow icon={Target} label="Lead quality" value={insights.lead_quality} tone="primary" />
          <MetricRow icon={TrendingUp} label="Conversion probability" value={insights.conversion_probability} tone="success" />
          <MetricRow icon={AlertCircle} label="Risk score" value={insights.risk_score} tone="danger" invert />

          <div className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next best action</span>
            </div>
            <p className="text-sm font-medium">{insights.next_best_action}</p>
          </div>

          {insights.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {insights.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-[10px] uppercase tracking-wider">{t}</Badge>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, tone, invert }: { icon: any; label: string; value: number; tone: 'primary' | 'success' | 'danger'; invert?: boolean }) {
  const score = Math.max(0, Math.min(100, Math.round(value)));
  const effective = invert ? 100 - score : score;
  const color = effective >= 70 ? 'text-emerald-600' : effective >= 40 ? 'text-amber-600' : 'text-rose-600';
  const barColor = tone === 'success' ? 'bg-emerald-500' : tone === 'danger' ? 'bg-rose-500' : 'bg-primary';
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn('text-base font-bold tabular-nums', color)}>{score}<span className="text-xs text-muted-foreground">/100</span></span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
