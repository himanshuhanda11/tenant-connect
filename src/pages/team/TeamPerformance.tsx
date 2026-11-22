import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity, AlertCircle, BarChart3, Clock, Inbox, Info, Loader2, MessageCircle,
  MessageSquareReply, RefreshCw, Send, Sparkles, UserX, Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeamBreadcrumb } from '@/components/team/TeamBreadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTenant } from '@/contexts/TenantContext';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';
import {
  useAgentPerformanceReport, type AgentPerformanceRow, type DrilldownMetric,
} from '@/hooks/useAgentPerformanceReport';
import {
  WorkspaceDateRangeFilter, resolveWorkspaceRange, type WorkspaceDateValue,
} from '@/components/common/WorkspaceDateRangeFilter';
import { MetricDrilldownSheet } from '@/components/team/performance/MetricDrilldownSheet';
import { METRIC_INFO } from '@/components/team/performance/metricDefinitions';
import { DATE_PRESET_LABELS, formatDurationSeconds, formatInZone } from '@/lib/workspaceTime';
import { cn } from '@/lib/utils';

const ALL = '__all__';

const initials = (name: string | null) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('');

interface Drill {
  metric: DrilldownMetric;
  agentId: string | null;
  agentName: string | null;
  unassignedOnly?: boolean;
}

function KpiCard({
  icon: Icon, metric, value, sub, tone = 'default', onClick, loading,
}: {
  icon: React.ElementType; metric: DrilldownMetric; value: string | number; sub?: string;
  tone?: 'default' | 'primary' | 'warning'; onClick?: () => void; loading?: boolean;
}) {
  const info = METRIC_INFO[metric];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-h-[112px] w-full flex-col justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        tone === 'primary' && 'border-primary/30 bg-primary/5',
        tone === 'warning' && 'border-amber-500/30 bg-amber-500/5',
        tone === 'default' && 'border-border',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{info.label}</span>
        <Icon className={cn('h-4 w-4', tone === 'primary' ? 'text-primary' : tone === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')} />
      </div>
      {loading ? <Skeleton className="h-8 w-16" /> : (
        <span className="text-3xl font-bold tracking-tight tabular-nums">{value}</span>
      )}
      <span className="text-[11px] text-muted-foreground group-hover:text-foreground">{sub ?? 'Tap to see the chats'}</span>
    </button>
  );
}

function SmallStat({ metric, value, onClick }: { metric: DrilldownMetric; value: string | number; onClick?: () => void }) {
  const info = METRIC_INFO[metric];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left transition-colors hover:border-primary/40"
        >
          <span className="text-xs text-muted-foreground">{info.label}</span>
          <span className="text-sm font-semibold tabular-nums">{value}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{info.help}</TooltipContent>
    </Tooltip>
  );
}

function NumCell({ value, onClick, highlight }: { value: number; onClick: () => void; highlight?: boolean }) {
  if (!value) return <span className="text-muted-foreground/50">0</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-1.5 py-0.5 font-semibold tabular-nums underline-offset-4 hover:bg-primary/10 hover:text-primary hover:underline',
        highlight && 'text-primary',
      )}
    >
      {value.toLocaleString()}
    </button>
  );
}

const TeamPerformance = () => {
  const { currentTenant, tenants, setCurrentTenant } = useTenant();
  const timeZone = useWorkspaceTimezone();
  const { phoneNumbers } = usePhoneNumbers();
  const [dateValue, setDateValue] = useState<WorkspaceDateValue>({ preset: 'today' });
  const [phoneId, setPhoneId] = useState<string>(ALL);
  const [agentFilter, setAgentFilter] = useState<string>(ALL);
  const [drill, setDrill] = useState<Drill | null>(null);

  // Re-resolve the range whenever the filter or timezone changes.
  const range = useMemo(() => resolveWorkspaceRange(dateValue, timeZone), [dateValue, timeZone]);
  const periodLabel = dateValue.preset === 'custom' && dateValue.custom
    ? `${formatInZone(dateValue.custom.start, timeZone)} – ${formatInZone(dateValue.custom.end, timeZone)}`
    : DATE_PRESET_LABELS[dateValue.preset];

  const phoneNumberId = phoneId === ALL ? null : phoneId;
  const agentId = agentFilter === ALL ? null : agentFilter;

  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useAgentPerformanceReport({
    tenantId: currentTenant?.id,
    start: range.start,
    end: range.end,
    live: range.live,
    phoneNumberId,
    agentId,
    timeZone,
  });

  const totals = data?.totals;
  const agents = data?.agents ?? [];
  const canViewAll = data?.can_view_all ?? false;
  const activePhones = phoneNumbers.filter((p) => String(p.status) !== 'disconnected');

  const openDrill = (metric: DrilldownMetric, agent?: AgentPerformanceRow | null, unassignedOnly?: boolean) =>
    setDrill({
      metric,
      agentId: agent ? agent.id : agentId,
      agentName: agent ? agent.name : agentId ? agents.find((a) => a.id === agentId)?.name ?? null : null,
      unassignedOnly,
    });

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-5 pb-10">
        <TeamBreadcrumb currentPage="Agent performance" />

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <BarChart3 className="h-6 w-6 text-primary" /> Agent performance
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              New chats, chats each agent actually worked on, and who is waiting — counted from real messages.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {dataUpdatedAt > 0 && <span>Updated {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })} · live</span>}
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <WorkspaceDateRangeFilter value={dateValue} onChange={setDateValue} timeZone={timeZone} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Select
                value={currentTenant?.id}
                onValueChange={(id) => {
                  const t = tenants.find((x) => x.id === id);
                  if (t) { setCurrentTenant(t); setPhoneId(ALL); setAgentFilter(ALL); }
                }}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Workspace" /></SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={phoneId} onValueChange={setPhoneId}>
                <SelectTrigger className="h-9"><SelectValue placeholder="WhatsApp number" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All WhatsApp numbers</SelectItem>
                  {activePhones.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.verified_name || p.display_name || 'Number'} · {p.phone_e164}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={agentFilter} onValueChange={setAgentFilter} disabled={!canViewAll}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Agent" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{canViewAll ? 'All agents' : 'Only you'}</SelectItem>
                  {canViewAll && agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name || a.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Couldn’t load the report.</p>
              <p className="text-xs opacity-80">{(error as Error).message}</p>
            </div>
          </div>
        )}

        {/* Main KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <KpiCard icon={Sparkles} metric="new_total" tone="primary" loading={isLoading}
            value={(totals?.new_total ?? 0).toLocaleString()}
            sub={totals?.new_unassigned ? `${totals.new_unassigned} still without an agent` : periodLabel}
            onClick={() => openDrill('new_total')} />
          <KpiCard icon={MessageSquareReply} metric="existing_handled" loading={isLoading}
            value={(totals?.existing_handled ?? 0).toLocaleString()} sub={periodLabel}
            onClick={() => openDrill('existing_handled')} />
          <KpiCard icon={Activity} metric="total_handled" tone="primary" loading={isLoading}
            value={(totals?.total_handled ?? 0).toLocaleString()}
            sub={`${totals?.new_handled ?? 0} new + ${totals?.existing_handled ?? 0} existing`}
            onClick={() => openDrill('total_handled')} />
          <KpiCard icon={Clock} metric="pending" tone="warning" loading={isLoading}
            value={(totals?.pending ?? 0).toLocaleString()} sub="Right now"
            onClick={() => openDrill('pending')} />
          <KpiCard icon={UserX} metric="unassigned" tone="warning" loading={isLoading}
            value={(totals?.unassigned ?? 0).toLocaleString()} sub="Right now"
            onClick={() => openDrill('unassigned', null, true)} />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <SmallStat metric="new_by_customer" value={totals?.new_by_customer ?? 0} onClick={() => openDrill('new_by_customer')} />
          <SmallStat metric="new_by_agent" value={totals?.new_by_agent ?? 0} onClick={() => openDrill('new_by_agent')} />
          <SmallStat metric="customer_replies" value={totals?.customer_replies ?? 0} onClick={() => openDrill('customer_replies')} />
          <SmallStat metric="agent_replies" value={(totals?.agent_replies ?? 0).toLocaleString()} onClick={() => openDrill('agent_replies')} />
          <SmallStat metric="first_response" value={formatDurationSeconds(totals?.avg_first_response_seconds)} onClick={() => openDrill('first_response')} />
        </div>

        {/* Agents */}
        <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">By agent</h2>
              <span className="text-xs text-muted-foreground">· {periodLabel}</span>
            </div>
            {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {isLoading ? (
            <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 opacity-40" />
              No agents in this workspace yet.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Agent</th>
                      <th className="px-2 py-2.5 text-center font-medium" colSpan={3}>New chats assigned</th>
                      <th className="px-2 py-2.5 text-right font-medium">New in period</th>
                      <th className="px-2 py-2.5 text-right font-medium">New handled</th>
                      <th className="px-2 py-2.5 text-right font-medium">Existing handled</th>
                      <th className="px-2 py-2.5 text-right font-medium">Total handled</th>
                      <th className="px-2 py-2.5 text-right font-medium">Customer replies</th>
                      <th className="px-2 py-2.5 text-right font-medium">Replies sent</th>
                      <th className="px-2 py-2.5 text-right font-medium">Waiting</th>
                      <th className="px-2 py-2.5 text-right font-medium">First reply</th>
                      <th className="px-4 py-2.5 text-right font-medium">Last activity</th>
                    </tr>
                    <tr className="text-[10px] uppercase tracking-wide">
                      <th />
                      <th className="px-2 pb-2 text-right font-medium">Today</th>
                      <th className="px-2 pb-2 text-right font-medium">Yesterday</th>
                      <th className="px-2 pb-2 text-right font-medium">24h</th>
                      <th colSpan={9} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {agents.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={a.avatar_url ?? undefined} />
                                <AvatarFallback className="text-[11px]">{initials(a.name)}</AvatarFallback>
                              </Avatar>
                              {a.is_online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{a.name || a.email}</p>
                              {!a.is_active && <p className="text-[10px] text-muted-foreground">Inactive</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{a.new_today}</td>
                        <td className="px-2 py-3 text-right tabular-nums">{a.new_yesterday}</td>
                        <td className="px-2 py-3 text-right tabular-nums">{a.new_last_24h}</td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.new_assigned} onClick={() => openDrill('new_total', a)} /></td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.new_handled} onClick={() => openDrill('new_handled', a)} /></td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.existing_handled} onClick={() => openDrill('existing_handled', a)} /></td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.total_handled} highlight onClick={() => openDrill('total_handled', a)} /></td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.customer_replies} onClick={() => openDrill('customer_replies', a)} /></td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.agent_replies} onClick={() => openDrill('agent_replies', a)} /></td>
                        <td className="px-2 py-3 text-right"><NumCell value={a.pending} onClick={() => openDrill('pending', a)} /></td>
                        <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">{formatDurationSeconds(a.avg_first_response_seconds)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-muted-foreground">
                          {a.last_activity ? formatInZone(a.last_activity, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="divide-y divide-border lg:hidden">
                {agents.map((a) => (
                  <div key={a.id} className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={a.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">{initials(a.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{a.name || a.email}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Today {a.new_today} · Yesterday {a.new_yesterday} · 24h {a.new_last_24h} new
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {a.last_activity ? formatInZone(a.last_activity, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {([
                        ['new_total', a.new_assigned, Sparkles],
                        ['existing_handled', a.existing_handled, MessageCircle],
                        ['total_handled', a.total_handled, Activity],
                        ['customer_replies', a.customer_replies, MessageSquareReply],
                        ['agent_replies', a.agent_replies, Send],
                        ['pending', a.pending, Clock],
                      ] as [DrilldownMetric, number, React.ElementType][]).map(([m, v, Icon]) => (
                        <button key={m} type="button" onClick={() => openDrill(m, a)}
                          className="rounded-xl border border-border bg-muted/30 p-2 transition-colors hover:border-primary/40">
                          <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-base font-semibold tabular-nums">{v.toLocaleString()}</p>
                          <p className="text-[10px] leading-tight text-muted-foreground">{METRIC_INFO[m].label}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">First reply time: {formatDurationSeconds(a.avg_first_response_seconds)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Definitions */}
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
          <AccordionItem value="how" className="border-none">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> How these numbers are counted</span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(Object.keys(METRIC_INFO) as DrilldownMetric[]).map((m) => (
                  <li key={m}><span className="font-medium text-foreground">{METRIC_INFO[m].label}:</span> {METRIC_INFO[m].help}</li>
                ))}
                <li>
                  <span className="font-medium text-foreground">Time zone:</span> Today, Yesterday and custom ranges use your workspace time zone.
                  “Last 24 hours” is a rolling 24 hours up to now.
                </li>
                <li>
                  <span className="font-medium text-foreground">Older replies:</span> replies sent before this report existed are credited to the agent who owned the chat at that moment.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <MetricDrilldownSheet
        open={!!drill}
        onOpenChange={(o) => !o && setDrill(null)}
        tenantId={currentTenant?.id}
        metric={drill?.metric ?? null}
        agentId={drill?.agentId ?? null}
        agentName={drill?.agentName ?? null}
        unassignedOnly={drill?.unassignedOnly}
        start={range.start}
        end={range.end}
        live={range.live}
        phoneNumberId={phoneNumberId}
        timeZone={timeZone}
        periodLabel={periodLabel}
      />
    </DashboardLayout>
  );
};

export default TeamPerformance;
