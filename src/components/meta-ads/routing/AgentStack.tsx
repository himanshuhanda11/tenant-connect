import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { ASSIGN_MODE_LABEL, initials, type AssignmentSummary } from '@/lib/metaAdRouting';
import { cn } from '@/lib/utils';

interface AgentStackProps {
  summary: AssignmentSummary;
  className?: string;
  /** Show every agent name instead of a compact "+N" list. */
  showAllNames?: boolean;
}

/** Overlapping agent avatars plus readable names and how leads are shared. */
export function AgentStack({ summary, className, showAllNames }: AgentStackProps) {
  if (summary.mode === 'team') {
    return (
      <div className={cn('flex min-w-0 items-center gap-2', className)}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="h-4 w-4" /></span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{summary.teamName}</p>
          <p className="text-[11px] text-muted-foreground">Whole team</p>
        </div>
      </div>
    );
  }

  const agents = summary.agents;
  const visible = agents.slice(0, 4);
  const names = agents.map(a => a.name);
  const nameText = showAllNames || names.length <= 3 ? names.join(', ') : `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)} title={names.join(', ')}>
      <div className="flex shrink-0 -space-x-2">
        {visible.map(agent => (
          <Avatar key={agent.id} className="h-8 w-8 border-2 border-card">
            {agent.avatarUrl ? <AvatarImage src={agent.avatarUrl} alt={agent.name} /> : null}
            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{initials(agent.name)}</AvatarFallback>
          </Avatar>
        ))}
        {agents.length > visible.length && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">+{agents.length - visible.length}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className={cn('text-sm font-medium', !showAllNames && 'truncate')}>{nameText}</p>
        <p className="text-[11px] text-muted-foreground">
          {ASSIGN_MODE_LABEL[summary.mode]}{summary.mode === 'turns' ? ` · ${agents.length} agents, equal share` : ''}
        </p>
      </div>
    </div>
  );
}
