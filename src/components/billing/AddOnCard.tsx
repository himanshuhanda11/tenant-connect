import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AddOn, formatINR } from '@/data/addOns';
import { toast } from 'sonner';

interface AddOnCardProps {
  addon: AddOn;
  locked?: boolean;
  compact?: boolean;
}

export function AddOnCard({ addon, locked, compact }: AddOnCardProps) {
  const [qty, setQty] = useState(1);
  const Icon = addon.icon;

  const handleAdd = () => {
    toast.info(`${addon.name} add-on will be available soon via checkout`);
  };

  return (
    <div className={cn(
      'group relative rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30',
      locked && 'opacity-60 pointer-events-none',
      compact && 'p-3',
    )}>
      {addon.badge && (
        <Badge variant="secondary" className="absolute -top-2 right-3 text-[10px]">
          {addon.badge}
        </Badge>
      )}

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>
            {addon.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {compact ? addon.description : addon.benefit}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-bold text-foreground">{formatINR(addon.price)}</span>
          <span className="text-xs text-muted-foreground ml-1">{addon.unit}</span>
        </div>

        <div className="flex items-center gap-2">
          {addon.quantitySelectable && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-medium w-5 text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
          <Button size="sm" variant="outline" onClick={handleAdd} className="h-7 text-xs px-3 gap-1">
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 rounded-xl bg-background/60 flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">Upgrade required</Badge>
        </div>
      )}
    </div>
  );
}
