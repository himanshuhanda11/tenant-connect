import { Clock } from 'lucide-react';
import type { InboxConversation } from '@/types/inbox';
import { formatInZone, timeZoneLabel } from '@/lib/workspaceTime';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';
import { useAgentDisplayNames } from '@/hooks/useAgentDisplayNames';

const STATUS_LABEL: Record<string, string> = { open: 'Open', closed: 'Closed', expired: 'Open (24h window ended)', pending: 'Pending' };

/** Every key time for a chat, in the workspace's time zone. */
export function ConversationTimesCard({ conversation }: { conversation: InboxConversation }) {
  const tz = useWorkspaceTimezone();
  const agentName = useAgentDisplayNames();
  const fmt = (v?: string | null) => formatInZone(v, tz, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const assignee = conversation.assigned_to
    ? agentName(conversation.assigned_to, conversation.assigned_agent?.full_name) ?? 'Agent'
    : null;

  const rows: [string, React.ReactNode][] = [
    ['First message received', fmt(conversation.first_message_at || conversation.created_at)],
    ['Chat created', fmt(conversation.created_at)],
    ['Last customer message', fmt(conversation.last_inbound_at)],
    ['Last agent reply', conversation.last_agent_reply_at ? fmt(conversation.last_agent_reply_at) : 'No reply yet'],
    ['Assigned to', assignee ?? <span className="text-amber-600 dark:text-amber-400">Unassigned</span>],
    ['Assigned at', conversation.assigned_at ? fmt(conversation.assigned_at) : '—'],
    ['Status', STATUS_LABEL[conversation.status] ?? conversation.status],
  ];

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="h-3 w-3" /> Chat times
        </span>
        <span className="truncate text-[10px] text-muted-foreground">{timeZoneLabel(tz)}</span>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 text-xs">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium text-foreground/90">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
