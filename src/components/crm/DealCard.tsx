import { MessageCircle, AlertTriangle, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PRIORITY_META, type Deal } from '@/types/crm';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function DealCard({ deal, onClick, isDragging, onDragStart, onDragEnd }: DealCardProps) {
  const priority = PRIORITY_META[deal.priority];
  const isOverdue = deal.expected_close_date && new Date(deal.expected_close_date) < new Date() && deal.status === 'open';
  const valueFmt = new Intl.NumberFormat(undefined, {
    style: 'currency', currency: deal.currency || 'USD', maximumFractionDigits: 0,
  }).format(Number(deal.value || 0));

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-border/60 bg-card p-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all',
        'active:scale-[0.98]',
        isDragging && 'opacity-50 rotate-1'
      )}
    >
      {/* Priority dot + title */}
      <div className="flex items-start gap-2">
        <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', priority.dot)} />
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{deal.title}</h4>
          {deal.company_name && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{deal.company_name}</p>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-bold text-foreground tabular-nums">{valueFmt}</span>
        {isOverdue && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-rose-50 text-rose-700 border-rose-200 gap-1">
            <AlertTriangle className="h-2.5 w-2.5" /> Overdue
          </Badge>
        )}
      </div>

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {deal.tags.slice(0, 3).map(t => (
            <Badge key={t} variant="secondary" className="h-4.5 px-1.5 text-[10px] font-normal">{t}</Badge>
          ))}
          {deal.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{deal.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">{formatDistanceToNow(new Date(deal.last_activity_at), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          <Avatar className="h-5 w-5 border border-border">
            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
              <User className="h-2.5 w-2.5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
