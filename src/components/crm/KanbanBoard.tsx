import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DealCard } from './DealCard';
import type { Deal, PipelineStage } from '@/types/crm';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  stages: PipelineStage[];
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onMoveDeal: (dealId: string, newStageId: string) => void;
  onAddDeal: (stageId: string) => void;
}

export function KanbanBoard({ stages, deals, onDealClick, onMoveDeal, onAddDeal }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const fmtSum = (n: number, currency: string) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
      {stages.map(stage => {
        const stageDeals = deals.filter(d => d.stage_id === stage.id);
        const sum = stageDeals.reduce((s, d) => s + Number(d.value || 0), 0);
        const currency = stageDeals[0]?.currency || 'USD';
        const isOver = overStage === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
            onDragLeave={() => setOverStage(prev => prev === stage.id ? null : prev)}
            onDrop={() => {
              if (draggingId) onMoveDeal(draggingId, stage.id);
              setDraggingId(null); setOverStage(null);
            }}
            className={cn(
              'snap-start shrink-0 w-[280px] md:w-[300px] rounded-2xl bg-muted/40 flex flex-col max-h-[calc(100vh-280px)] transition-colors',
              isOver && 'bg-primary/5 ring-2 ring-primary/30'
            )}
          >
            {/* Header with color border */}
            <div className="rounded-t-2xl border-t-4 px-3 pt-3 pb-2" style={{ borderTopColor: stage.color }}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm text-foreground truncate">{stage.name}</h3>
                <span className="text-[11px] font-medium text-muted-foreground bg-background rounded-full px-2 py-0.5 border border-border/50">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">{fmtSum(sum, currency)}</div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 min-h-[100px]">
              {stageDeals.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground/70 py-10 border-2 border-dashed border-border/40 rounded-xl mx-1">
                  Drop deals here
                </div>
              ) : (
                stageDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isDragging={draggingId === deal.id}
                    onClick={() => onDealClick(deal)}
                    onDragStart={(e) => { setDraggingId(deal.id); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))
              )}
            </div>

            {/* Add deal */}
            <div className="p-2 border-t border-border/40">
              <Button
                variant="ghost" size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-background h-8"
                onClick={() => onAddDeal(stage.id)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add deal
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
