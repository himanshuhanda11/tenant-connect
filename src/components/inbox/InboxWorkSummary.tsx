import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useAgentPerformanceReport } from '@/hooks/useAgentPerformanceReport';
import { rangeForPreset } from '@/lib/workspaceTime';
import type { InboxTimeFilterValue } from './InboxTimeFilter';
import { cn } from '@/lib/utils';

const PERIOD_LABEL: Record<string, string> = {
  all: 'today', today: 'today', yesterday: 'yesterday', last_24h: 'last 24 hours',
  last_7d: 'last 7 days', last_30d: 'last 30 days', custom: 'picked dates',
};

/**
 * "My work" strip at the top of the inbox: new chats received, chats replied
 * (new + older) and chats still waiting, for the period picked in the date tabs
 * ("All" shows today). Agents see their own numbers; owners/admins see the team's.
 */
export function InboxWorkSummary({ timeFilter, timeZone }: { timeFilter: InboxTimeFilterValue; timeZone: string }) {
  const { currentTenant } = useTenant();
  const period = useMemo(() => {
    const now = new Date();
    if (timeFilter.preset === 'custom' && timeFilter.custom) return { ...timeFilter.custom, live: false };
    const preset = timeFilter.preset === 'all' || timeFilter.preset === 'custom' ? 'today' : timeFilter.preset;
    const r = rangeForPreset(preset, timeZone, now);
    return { start: r.start, end: r.end, live: preset !== 'yesterday' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter.preset, timeFilter.custom?.start?.getTime(), timeFilter.custom?.end?.getTime(), timeZone]);

  const { data, isLoading } = useAgentPerformanceReport({
    tenantId: currentTenant?.id,
    start: period.start,
    end: period.end,
    live: period.live,
    phoneNumberId: null,
    agentId: null,
    timeZone,
  });

  const t = data?.totals;
  const team = !!data?.can_view_all;
  const n = (v: number | undefined) => (v == null ? '–' : v.toLocaleString('en-US'));
  const label = PERIOD_LABEL[timeFilter.preset === 'custom' && !timeFilter.custom ? 'today' : timeFilter.preset];

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between px-2.5 pt-2">
        <p className="text-[11px] font-semibold text-foreground">
          {team ? 'Team work' : 'My work'} <span className="font-normal text-muted-foreground">· {label}</span>
        </p>
        {team && (
          <Link to="/team/performance" className="flex items-center text-[11px] font-medium text-primary hover:underline">
            Each agent <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className={cn('grid grid-cols-3 divide-x divide-border/60 px-1 pb-2 pt-1', isLoading && !t && 'animate-pulse')}>
        <Stat label="New chats" value={n(t?.new_total)} />
        <Stat
          label="Replied"
          value={n(t?.total_handled)}
          sub={t ? `${n(t.new_handled)} new · ${n(t.existing_handled)} old` : undefined}
          tone="success"
        />
        {team
          ? <Stat label="Unassigned" value={n(t?.unassigned)} sub="right now" />
          : <Stat label="Waiting" value={n(t?.pending)} sub="need your reply" tone="warning" />}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'success' | 'warning' }) {
  return (
    <div className="min-w-0 px-1.5 text-center">
      <p className={cn('text-base font-bold tabular-nums leading-tight text-foreground', tone === 'success' && 'text-success', tone === 'warning' && 'text-warning')}>{value}</p>
      <p className="truncate text-[10.5px] font-medium text-muted-foreground">{label}</p>
      {sub && <p className="truncate text-[9.5px] text-muted-foreground/80">{sub}</p>}
    </div>
  );
}
