import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProGateProps {
  children: React.ReactNode;
  locked?: boolean;
  label?: string;
  className?: string;
}

/**
 * Wraps content with a blur overlay + Pro badge when `locked` is true.
 */
export function ProGate({ children, locked = false, label = 'Pro', className }: ProGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none filter blur-[2px] opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          <Lock className="w-3 h-3" />
          {label} Feature
        </div>
      </div>
    </div>
  );
}

/**
 * Small inline Pro badge to indicate premium features.
 */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
      className
    )}>
      <Lock className="w-2.5 h-2.5" />
      Pro
    </span>
  );
}
