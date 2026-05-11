import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  yearly: boolean;
  onChange: (yearly: boolean) => void;
  variant?: 'dark' | 'light';
  className?: string;
}

export function MonthlyYearlyToggle({ yearly, onChange, variant = 'light', className }: Props) {
  const dark = variant === 'dark';
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-full border',
        dark ? 'bg-white/5 border-white/10 text-white' : 'bg-background border-border',
        className,
      )}
    >
      <Label
        htmlFor="billing-cycle"
        className={cn(
          'text-xs cursor-pointer',
          !yearly ? (dark ? 'text-white' : 'text-foreground font-semibold') : (dark ? 'text-white/60' : 'text-muted-foreground'),
        )}
      >
        Monthly
      </Label>
      <Switch id="billing-cycle" checked={yearly} onCheckedChange={onChange} />
      <Label
        htmlFor="billing-cycle"
        className={cn(
          'text-xs cursor-pointer flex items-center gap-1.5',
          yearly ? (dark ? 'text-white' : 'text-foreground font-semibold') : (dark ? 'text-white/60' : 'text-muted-foreground'),
        )}
      >
        Yearly
        <Badge
          className={cn(
            'border-0 text-[10px] px-1.5 py-0',
            dark ? 'bg-emerald-400/20 text-emerald-200' : 'bg-primary/10 text-primary',
          )}
        >
          −20%
        </Badge>
      </Label>
    </div>
  );
}
