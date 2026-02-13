import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getPlanLabel } from '@/hooks/usePlanGate';

interface ProGateProps {
  children: React.ReactNode;
  locked?: boolean;
  label?: string;
  requiredPlan?: string;
  onUpgrade?: () => void;
  className?: string;
}

/**
 * Wraps content with a blur overlay + upgrade prompt when `locked` is true.
 */
export function ProGate({ children, locked = false, label, requiredPlan, onUpgrade, className }: ProGateProps) {
  if (!locked) return <>{children}</>;

  const planName = requiredPlan ? getPlanLabel(requiredPlan) : (label || 'Pro');

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none filter blur-[2px] opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
        <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Lock className="w-3 h-3" />
          {planName} Feature
        </div>
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade} className="gap-1.5 text-xs h-7">
            Upgrade to {planName}
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Small inline plan badge to indicate premium features.
 */
export function ProBadge({ className, plan }: { className?: string; plan?: string }) {
  const label = plan ? getPlanLabel(plan) : 'Pro';
  return (
    <span className={cn(
      "inline-flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
      className
    )}>
      <Lock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
