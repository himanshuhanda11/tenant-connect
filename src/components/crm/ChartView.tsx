import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { format, startOfWeek, addDays, subWeeks } from 'date-fns';
import { useCrmOwners } from '@/hooks/useCrmExtras';
import type { Deal, PipelineStage } from '@/types/crm';

interface Props {
  deals: Deal[];
  stages: PipelineStage[];
  currency: string;
}

export function ChartView({ deals, stages, currency }: Props) {
  const { owners } = useCrmOwners();
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  const byStage = useMemo(() => {
    return stages.map(s => {
      const ds = deals.filter(d => d.stage_id === s.id);
      return {
        name: s.name,
        color: s.color,
        count: ds.length,
        value: ds.reduce((sum, d) => sum + Number(d.value || 0), 0),
      };
    });
  }, [deals, stages]);

  const last12Weeks = useMemo(() => {
    const buckets: { week: string; created: number; won: number; value: number }[] = [];
    const start = startOfWeek(subWeeks(new Date(), 11));
    for (let i = 0; i < 12; i++) {
      const wStart = addDays(start, i * 7);
      const wEnd = addDays(wStart, 7);
      const created = deals.filter(d => {
        const c = new Date(d.created_at);
        return c >= wStart && c < wEnd;
      });
      const won = created.filter(d => d.status === 'won');
      buckets.push({
        week: format(wStart, 'MMM d'),
        created: created.length,
        won: won.length,
        value: created.reduce((s, d) => s + Number(d.value || 0), 0),
      });
    }
    return buckets;
  }, [deals]);

  // Per-stage conversion: % of deals reaching this stage that progressed past it (or won)
  const stageConversion = useMemo(() => {
    const ordered = [...stages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const stageIndex: Record<string, number> = {};
    ordered.forEach((s, i) => { stageIndex[s.id] = i; });
    return ordered.map((s, i) => {
      // entered = current deals at or past this stage, plus all won deals (assumed traversed)
      const entered = deals.filter(d => {
        if (d.status === 'won') return true;
        const idx = stageIndex[d.stage_id];
        return typeof idx === 'number' && idx >= i;
      }).length;
      const advanced = deals.filter(d => {
        if (d.status === 'won') return true;
        const idx = stageIndex[d.stage_id];
        return typeof idx === 'number' && idx > i;
      }).length;
      const rate = entered > 0 ? Math.round((advanced / entered) * 100) : 0;
      return { name: s.name, color: s.color, entered, advanced, rate };
    });
  }, [deals, stages]);

  // Owner workload: deals per assigned owner (open + value)
  const ownerWorkload = useMemo(() => {
    const map = new Map<string, { name: string; open: number; won: number; value: number }>();
    deals.forEach(d => {
      const key = d.owner_id || '__unassigned__';
      const owner = owners.find(o => o.user_id === d.owner_id);
      const name = d.owner_id ? (owner?.full_name || owner?.email || 'Member') : 'Unassigned';
      const entry = map.get(key) || { name, open: 0, won: 0, value: 0 };
      if (d.status === 'open') { entry.open += 1; entry.value += Number(d.value || 0); }
      if (d.status === 'won') entry.won += 1;
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => (b.open + b.won) - (a.open + a.won)).slice(0, 8);
  }, [deals, owners]);

  const totalOpen = deals.filter(d => d.status === 'open').length;
  const totalWon = deals.filter(d => d.status === 'won').length;
  const totalLost = deals.filter(d => d.status === 'lost').length;
  const winRate = totalWon + totalLost > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 0;

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
        No data to chart yet. Add some deals to see pipeline analytics.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Deals by stage" subtitle={`${deals.length} total deals`}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byStage} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {byStage.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Pipeline value by stage" subtitle={fmt(byStage.reduce((s, b) => s + b.value, 0))}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byStage} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => fmt(Number(v))} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={90} />
            <Tooltip formatter={(v: any) => fmt(Number(v))} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {byStage.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Deals created — last 12 weeks" subtitle="Created vs. won">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={last12Weeks} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="created" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="won" stroke="hsl(152 60% 45%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Conversion summary" subtitle={`${winRate}% win rate`}>
        <div className="grid grid-cols-3 gap-3 p-2">
          <SummaryCell label="Open" value={totalOpen} tone="text-blue-600" />
          <SummaryCell label="Won" value={totalWon} tone="text-emerald-600" />
          <SummaryCell label="Lost" value={totalLost} tone="text-rose-600" />
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={last12Weeks} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => fmt(Number(v))} width={70} />
            <Tooltip formatter={(v: any) => fmt(Number(v))} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#valGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3 text-center">
      <div className={`text-2xl font-bold tabular-nums ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
