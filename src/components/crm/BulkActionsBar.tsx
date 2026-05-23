import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Trash2, ArrowRightLeft, Flag, X, ChevronDown } from 'lucide-react';
import type { PipelineStage, DealPriority } from '@/types/crm';

interface Props {
  count: number;
  stages: PipelineStage[];
  onClear: () => void;
  onMove: (stageId: string) => Promise<void>;
  onPriority: (p: DealPriority) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function BulkActionsBar({ count, stages, onClear, onMove, onPriority, onDelete }: Props) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)]">
      <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/30 px-3 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold tabular-nums">
          {count} selected
        </span>
        <span className="h-5 w-px bg-border/60" />

        <Select onValueChange={(v) => onMove(v)}>
          <SelectTrigger className="h-8 w-auto gap-1.5 text-xs border-0 hover:bg-muted/60">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Move to
          </SelectTrigger>
          <SelectContent>
            {stages.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
              <Flag className="h-3.5 w-3.5" /> Priority <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-xs">Set priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['low','normal','high','urgent'] as DealPriority[]).map(p => (
              <DropdownMenuItem key={p} onSelect={() => onPriority(p)} className="capitalize">{p}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => { if (confirm(`Delete ${count} deal(s)?`)) onDelete(); }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>

        <span className="h-5 w-px bg-border/60" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear} aria-label="Clear selection">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
