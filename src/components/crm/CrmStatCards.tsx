import { Card } from '@/components/ui/card';
import { TrendingUp, Briefcase, CircleDot, Trophy, XCircle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
  tint: string;
  iconBg: string;
}

export function CrmStatCards({
  total, open, won, lost, value, wonValue, currency = 'USD',
}: { total: number; open: number; won: number; lost: number; value: number; wonValue: number; currency?: string }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  const stats: Stat[] = [
    { label: 'Total Deals',  value: total, icon: Briefcase, tint: 'text-foreground', iconBg: 'bg-slate-100 text-slate-700' },
    { label: 'Open Deals',   value: open,  icon: CircleDot, tint: 'text-foreground', iconBg: 'bg-blue-100 text-blue-700' },
    { label: 'Won',          value: won,   icon: Trophy,    tint: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lost',         value: lost,  icon: XCircle,   tint: 'text-rose-700',    iconBg: 'bg-rose-100 text-rose-700' },
    { label: 'Open Value',   value: fmt(value),    icon: DollarSign, tint: 'text-foreground', iconBg: 'bg-amber-100 text-amber-700' },
    { label: 'Won Value',    value: fmt(wonValue), icon: TrendingUp, tint: 'text-foreground', iconBg: 'bg-primary/15 text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map(s => (
        <Card key={s.label} className="p-4 rounded-2xl border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-card">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">{s.label}</div>
              <div className={cn('mt-1.5 text-xl sm:text-2xl font-bold tabular-nums truncate', s.tint)}>{s.value}</div>
            </div>
            <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', s.iconBg)}>
              <s.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
