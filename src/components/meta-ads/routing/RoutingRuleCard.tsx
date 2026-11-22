import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, GitBranch, MessageSquare, Pencil, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AgentStack } from './AgentStack';
import type { AssignmentSummary } from '@/lib/metaAdRouting';
import { cn } from '@/lib/utils';

interface RoutingRuleCardProps {
  order: number;
  name: string;
  isActive: boolean;
  sources: string[];
  summary: AssignmentSummary;
  extras: Array<{ type: string; label: string }>;
  leadsHandled: number;
  lastRunAt: string | null;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const EXTRA_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  send_template: MessageSquare,
  add_tag: Tag,
  start_workflow: GitBranch,
};

/** A routing rule written as a sentence: these ads → these agents. */
export function RoutingRuleCard(props: RoutingRuleCardProps) {
  const { order, name, isActive, sources, summary, extras, leadsHandled, lastRunAt, onEdit, onToggle, onDelete } = props;
  return (
    <div className={cn('rounded-2xl border bg-card p-4 shadow-sm', !isActive && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground" title="Order rules are checked">{order}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold" title={name}>{name}</h4>
            <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">{isActive ? 'On' : 'Paused'}</Badge>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {leadsHandled.toLocaleString()} leads handled{lastRunAt ? ` · last ${formatDistanceToNow(new Date(lastRunAt), { addSuffix: true })}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Switch checked={isActive} onCheckedChange={onToggle} aria-label={isActive ? 'Pause rule' : 'Turn rule on'} />
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit rule" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" aria-label="Delete rule" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 rounded-xl bg-muted/40 p-3 md:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] md:items-center">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Leads from</p>
          <div className="flex flex-wrap gap-1">
            {sources.slice(0, 3).map((s, i) => <Badge key={i} variant="outline" className="max-w-full truncate bg-card text-[11px] font-normal">{s}</Badge>)}
            {sources.length > 3 && <Badge variant="outline" className="bg-card text-[11px] font-normal">+{sources.length - 3} more</Badge>}
          </div>
        </div>
        <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Go to</p>
          {summary.mode === 'none' ? <p className="text-sm text-muted-foreground">Nobody (extras only)</p> : <AgentStack summary={summary} />}
        </div>
      </div>

      {extras.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {extras.map((e, i) => {
            const Icon = EXTRA_ICON[e.type] || GitBranch;
            return <Badge key={i} variant="secondary" className="gap-1 text-[10px] font-normal"><Icon className="h-3 w-3" />{e.label}</Badge>;
          })}
        </div>
      )}
    </div>
  );
}
