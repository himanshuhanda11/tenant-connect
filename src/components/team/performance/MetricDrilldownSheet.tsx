import { Link } from 'react-router-dom';
import { ExternalLink, Inbox, Loader2, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDurationSeconds, formatInZone } from '@/lib/workspaceTime';
import { useAgentPerformanceDrilldown, type DrilldownMetric } from '@/hooks/useAgentPerformanceReport';
import { METRIC_INFO } from './metricDefinitions';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tenantId: string | undefined;
  metric: DrilldownMetric | null;
  agentId: string | null;
  agentName: string | null;
  unassignedOnly?: boolean;
  start: Date;
  end: Date;
  live: boolean;
  phoneNumberId: string | null;
  timeZone: string;
  periodLabel: string;
}

const fmt = (v: string | null, tz: string) =>
  formatInZone(v, tz, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export function MetricDrilldownSheet(props: Props) {
  const { data, isLoading, error } = useAgentPerformanceDrilldown({
    tenantId: props.tenantId,
    metric: props.open ? props.metric : null,
    agentId: props.agentId,
    unassignedOnly: props.unassignedOnly,
    start: props.start,
    end: props.end,
    live: props.live,
    phoneNumberId: props.phoneNumberId,
  });
  const info = props.metric ? METRIC_INFO[props.metric] : null;
  const who = props.unassignedOnly ? 'No agent' : props.agentName ?? 'All agents';
  const isSnapshot = props.metric === 'pending' || props.metric === 'unassigned';

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border p-5 text-left">
          <SheetTitle className="text-lg">{info?.label}</SheetTitle>
          <SheetDescription className="space-y-1">
            <span className="block">
              {who} · {isSnapshot ? 'right now' : props.periodLabel}
              {data ? ` · ${data.length}${data.length >= 500 ? '+' : ''} chat${data.length === 1 ? '' : 's'}` : ''}
            </span>
            {info && <span className="block text-xs">{info.help}</span>}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading chats…
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                Couldn’t load these chats. {(error as Error).message}
              </div>
            )}
            {data && data.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 opacity-40" />
                No chats in this count.
              </div>
            )}
            {data?.map((row) => (
              <div key={row.conversation_id} className="rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.contact_name || row.contact_wa_id || 'Unknown contact'}</p>
                    {row.contact_wa_id && <p className="text-xs text-muted-foreground">+{row.contact_wa_id}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] capitalize">{row.status}</Badge>
                    <Button asChild size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs">
                      <Link to={`/inbox/${row.conversation_id}`}>Open <ExternalLink className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                </div>
                <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div><dt className="text-muted-foreground">Received</dt><dd className="font-medium">{fmt(row.created_at, props.timeZone)}</dd></div>
                  <div><dt className="text-muted-foreground">Last customer message</dt><dd className="font-medium">{fmt(row.last_inbound_at, props.timeZone)}</dd></div>
                  <div>
                    <dt className="text-muted-foreground">Assigned to</dt>
                    <dd className="font-medium">{row.assigned_name ?? <span className="text-amber-600 dark:text-amber-400">Unassigned</span>}</dd>
                  </div>
                  <div><dt className="text-muted-foreground">Assigned at</dt><dd className="font-medium">{fmt(row.assigned_at, props.timeZone)}</dd></div>
                  {row.credited_agent_name && row.credited_agent_id !== row.assigned_to && (
                    <div className="col-span-2"><dt className="text-muted-foreground">Counted for</dt><dd className="font-medium">{row.credited_agent_name}</dd></div>
                  )}
                  {row.agent_messages > 0 && (
                    <div><dt className="text-muted-foreground">Replies in period</dt><dd className="font-medium">{row.agent_messages}</dd></div>
                  )}
                  {row.first_response_seconds != null && (
                    <div><dt className="text-muted-foreground">First reply after</dt><dd className="font-medium">{formatDurationSeconds(row.first_response_seconds)}</dd></div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
