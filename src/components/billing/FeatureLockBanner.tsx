import { AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureLockBannerProps {
  label: string;
  used: number;
  limit: number;
  addOnName?: string;
  onAddOn?: () => void;
  onUpgrade?: () => void;
  className?: string;
}

export function FeatureLockBanner({
  label,
  used,
  limit,
  addOnName,
  onAddOn,
  onUpgrade,
  className,
}: FeatureLockBannerProps) {
  const isAtLimit = used >= limit;
  if (!isAtLimit) return null;

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5',
      className,
    )}>
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            You've reached your {label} limit
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add more capacity to continue — no disruption to your workflows.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {addOnName && onAddOn && (
          <Button size="sm" variant="outline" onClick={onAddOn} className="h-8 gap-1.5 text-xs">
            <Plus className="w-3 h-3" />
            Add {addOnName}
          </Button>
        )}
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade} className="h-8 gap-1.5 text-xs">
            Upgrade Plan
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
