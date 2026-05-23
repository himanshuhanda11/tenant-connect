import { Users, UserCheck, Activity, Layers, Tag, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  key: string;
  label: string;
  value: number;
  growthPct?: number | null;
  trendText?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconTone: string;
  glowTone: string;
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
      iconTone: 'from-sky-500/20 to-blue-500/10 text-sky-600 ring-sky-500/20',
      glowTone: 'from-sky-400/30 via-blue-500/10 to-transparent',
    },
    {
      key: 'active',
      label: 'Active Contacts',
      value: activeContacts,
      growthPct: growth.active ?? null,
      trendText: 'messaged in 30d',
      icon: UserCheck,
      iconTone: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 ring-emerald-500/20',
      glowTone: 'from-emerald-400/30 via-emerald-500/10 to-transparent',
    },
    {
      key: 'engaged',
      label: 'Engaged',
      value: engagedContacts,
      growthPct: growth.engaged ?? null,
      trendText: 'replied this week',
      icon: Activity,
      iconTone: 'from-violet-500/20 to-fuchsia-500/5 text-violet-600 ring-violet-500/20',
      glowTone: 'from-violet-400/30 via-fuchsia-500/10 to-transparent',
    },
    {
      key: 'segments',
      label: 'Segments',
      value: segmentsCount,
      growthPct: growth.segments ?? null,
      trendText: 'audiences saved',
      icon: Layers,
      iconTone: 'from-amber-500/20 to-orange-500/5 text-amber-600 ring-amber-500/20',
      glowTone: 'from-amber-400/30 via-orange-500/10 to-transparent',
    },
    {
      key: 'tags',
      label: 'Tags',
      value: tagsCount,
      growthPct: growth.tags ?? null,
      trendText: 'in use',
      icon: Tag,
      iconTone: 'from-rose-500/20 to-pink-500/5 text-rose-600 ring-rose-500/20',
      glowTone: 'from-rose-400/30 via-pink-500/10 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 px-4 md:px-8 pt-5">
      {stats.map((s) => {
        const Icon = s.icon;
        const isUp = (s.growthPct ?? 0) >= 0;
        return (
          <div
            key={s.key}
            className={cn(
              'group relative rounded-2xl border border-border/60 bg-card p-4 md:p-5 overflow-hidden',
              'shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)]',
              'hover:-translate-y-0.5 hover:border-border transition-all duration-300'
            )}
          >
            {/* Decorative glow */}
            <div
              className={cn(
                'absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-90',
                s.glowTone
              )}
            />
            {/* Hover arrow */}
            <ArrowUpRight className="absolute top-3 right-3 h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-semibold truncate">
                  {s.label}
                </p>
                <p className="mt-1.5 text-2xl md:text-[28px] leading-none font-bold tracking-tight tabular-nums">
                  {s.value.toLocaleString()}
                </p>
              </div>
              <div
                className={cn(
                  'h-10 w-10 rounded-xl bg-gradient-to-br ring-1 flex items-center justify-center shrink-0 shadow-sm',
                  s.iconTone
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
            </div>

            <div className="relative mt-3 flex items-center gap-2 text-[11px]">
              {s.growthPct !== null && s.growthPct !== undefined ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold',
                    isUp
                      ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20'
                  )}
                >
                  {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isUp ? '+' : ''}
                  {s.growthPct.toFixed(1)}%
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium text-[10px]">
                  —
                </span>
              )}
              {s.trendText && <span className="text-muted-foreground/80 truncate">{s.trendText}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
