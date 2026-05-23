import { Users, UserCheck, Activity, Layers, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  key: string;
  label: string;
  value: number;
  growthPct?: number | null;
  trendText?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string; // tailwind gradient / accent
}

interface Props {
  totalContacts: number;
  activeContacts: number;
  engagedContacts: number;
  segmentsCount: number;
  tagsCount: number;
  growth?: Partial<Record<'total' | 'active' | 'engaged' | 'segments' | 'tags', number>>;
}

export function ContactsAnalyticsCards({
  totalContacts,
  activeContacts,
  engagedContacts,
  segmentsCount,
  tagsCount,
  growth = {},
}: Props) {
  const stats: Stat[] = [
    {
      key: 'total',
      label: 'Total Contacts',
      value: totalContacts,
      growthPct: growth.total ?? null,
      trendText: 'vs. last 30 days',
      icon: Users,
      tone: 'from-blue-500/15 to-blue-500/5 text-blue-600 ring-blue-500/20',
    },
    {
      key: 'active',
      label: 'Active Contacts',
      value: activeContacts,
      growthPct: growth.active ?? null,
      trendText: 'messaged in 30d',
      icon: UserCheck,
      tone: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600 ring-emerald-500/20',
    },
    {
      key: 'engaged',
      label: 'Engaged',
      value: engagedContacts,
      growthPct: growth.engaged ?? null,
      trendText: 'replied this week',
      icon: Activity,
      tone: 'from-violet-500/15 to-violet-500/5 text-violet-600 ring-violet-500/20',
    },
    {
      key: 'segments',
      label: 'Segments',
      value: segmentsCount,
      growthPct: growth.segments ?? null,
      trendText: 'audiences saved',
      icon: Layers,
      tone: 'from-amber-500/15 to-amber-500/5 text-amber-600 ring-amber-500/20',
    },
    {
      key: 'tags',
      label: 'Tags',
      value: tagsCount,
      growthPct: growth.tags ?? null,
      trendText: 'in use',
      icon: Tag,
      tone: 'from-rose-500/15 to-rose-500/5 text-rose-600 ring-rose-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 md:px-6 pt-4">
      {stats.map((s) => {
        const Icon = s.icon;
        const isUp = (s.growthPct ?? 0) >= 0;
        return (
          <div
            key={s.key}
            className={cn(
              'group relative rounded-2xl border border-border/60 bg-card p-3.5 overflow-hidden',
              'transition-all hover:shadow-sm hover:-translate-y-[1px]'
            )}
          >
            <div
              className={cn(
                'absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl pointer-events-none',
                s.tone
              )}
            />
            <div className="relative flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</p>
              </div>
              <div
                className={cn(
                  'h-9 w-9 rounded-xl bg-gradient-to-br ring-1 flex items-center justify-center shrink-0',
                  s.tone
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="relative mt-2 flex items-center gap-1.5 text-[11px]">
              {s.growthPct !== null && s.growthPct !== undefined ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold',
                    isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  )}
                >
                  {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isUp ? '+' : ''}
                  {s.growthPct.toFixed(1)}%
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  —
                </span>
              )}
              {s.trendText && <span className="text-muted-foreground truncate">{s.trendText}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
