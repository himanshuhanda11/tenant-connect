import { Megaphone, Shield, Key, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const charges = [
  { category: 'Marketing', price: '₹1.09', suffix: '/msg', icon: Megaphone, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  { category: 'Utility', price: '₹0.145', suffix: '/msg', icon: Shield, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { category: 'Auth', price: '₹0.145', suffix: '/msg', icon: Key, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { category: 'Service', price: 'Free', suffix: ' ∞', icon: MessageSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
];

interface Props {
  compact?: boolean;
  className?: string;
}

export default function TemplateChargesBlock({ compact, className }: Props) {
  return (
    <div className={cn("rounded-xl bg-muted/30 border border-border/40", compact ? "p-2.5" : "p-3", className)}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Meta Template Charges
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {charges.map((c) => (
          <div key={c.category} className="flex items-center gap-1.5">
            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0", c.bg)}>
              <c.icon className={cn("w-2.5 h-2.5", c.color)} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-muted-foreground">{c.category}</span>
              <p className="text-xs font-bold leading-none">
                {c.price}
                <span className="text-[9px] font-normal text-muted-foreground">{c.suffix}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
