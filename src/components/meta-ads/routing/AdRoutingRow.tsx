import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowRight, Check, Pencil, UserPlus, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AgentStack } from './AgentStack';
import type { AssignmentSummary } from '@/lib/metaAdRouting';
import { cn } from '@/lib/utils';

export interface AdRoutingRowProps {
  title: string;
  /** Small grey line under the title, e.g. ad ID and campaign. */
  subtitle: string;
  leads?: number | null;
  lastChatAt?: string | null;
  /** 'live' | 'paused' come from Meta; 'recent' | 'quiet' from WhatsApp chats. */
  status: 'live' | 'paused' | 'recent' | 'quiet';
  statusLabel: string;
  ruleName?: string | null;
  ruleIsGeneral?: boolean;
  summary: AssignmentSummary | null;
  onRoute: () => void;
  onRename?: (name: string) => Promise<void>;
  renameValue?: string;
}

const STATUS_DOT: Record<AdRoutingRowProps['status'], string> = {
  live: 'bg-success',
  recent: 'bg-success',
  paused: 'bg-muted-foreground/40',
  quiet: 'bg-warning',
};

/** One ad on the left, the agents who get its leads on the right. */
export function AdRoutingRow(props: AdRoutingRowProps) {
  const { title, subtitle, leads, lastChatAt, status, statusLabel, ruleName, ruleIsGeneral, summary, onRoute, onRename, renameValue } = props;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const routed = !!summary;

  const save = async () => {
    if (!onRename) return;
    await onRename(value);
    setEditing(false);
  };

  return (
    <div className={cn(
      'grid gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md lg:grid-cols-[minmax(0,1.25fr)_24px_minmax(0,1fr)_auto] lg:items-center lg:gap-4',
      !routed && 'border-warning/40',
    )}>
      {/* Ad */}
      <div className="min-w-0">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input autoFocus value={value} onChange={e => setValue(e.target.value)} maxLength={80} className="h-8 text-sm"
              placeholder="e.g. Europe jobs – Tagalog"
              onKeyDown={e => { if (e.key === 'Enter') void save(); if (e.key === 'Escape') setEditing(false); }} />
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Save name" onClick={() => void save()}><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Cancel" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-semibold" title={title}>{title}</p>
            {onRename && (
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-muted-foreground" aria-label="Rename ad" onClick={() => { setValue(renameValue ?? title); setEditing(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        <p className="truncate text-[11px] text-muted-foreground" title={subtitle}>{subtitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[status])} />{statusLabel}
          </span>
          {leads != null && <span>{leads.toLocaleString()} leads</span>}
          {lastChatAt && <span>Last chat {formatDistanceToNow(new Date(lastChatAt), { addSuffix: true })}</span>}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-2 text-muted-foreground lg:justify-center">
        <ArrowDown className="h-4 w-4 lg:hidden" />
        <ArrowRight className="hidden h-5 w-5 lg:block" />
        <span className="text-[10px] font-semibold uppercase tracking-wider lg:hidden">Leads go to</span>
      </div>

      {/* Agents */}
      <div className="min-w-0">
        {summary ? (
          <>
            <AgentStack summary={summary} />
            {ruleIsGeneral && ruleName && (
              <p className="mt-1 truncate text-[10px] text-muted-foreground" title={ruleName}>From your “every ad” rule: {ruleName}</p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
            <div className="min-w-0">
              <p className="text-sm font-medium">No agents picked</p>
              <p className="text-[11px] text-muted-foreground">Goes to your general auto-assign</p>
            </div>
          </div>
        )}
      </div>

      <Button size="sm" variant={routed ? 'outline' : 'default'} className="w-full gap-1.5 lg:w-auto" onClick={onRoute}>
        <UserPlus className="h-3.5 w-3.5" />
        {routed ? (ruleIsGeneral ? 'Pick agents for this ad' : 'Change agents') : 'Pick agents'}
      </Button>
    </div>
  );
}

export function RoutedBadge({ routed }: { routed: boolean }) {
  return routed
    ? <Badge variant="secondary" className="text-[10px]">Routed</Badge>
    : <Badge variant="outline" className="border-warning/50 text-[10px] text-warning">Needs agents</Badge>;
}
