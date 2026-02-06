import React from 'react';
import { cn } from '@/lib/utils';

interface HealthChip {
  label: string;
  value: string | number;
  status: 'success' | 'warning' | 'error' | 'neutral';
}

interface AdminHealthChipsProps {
  chips: HealthChip[];
}

const statusDot = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  neutral: 'bg-muted-foreground',
};

export function AdminHealthChips({ chips }: AdminHealthChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => (
        <div
          key={chip.label}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50 shadow-sm text-xs"
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[chip.status])} />
          <span className="text-muted-foreground">{chip.label}</span>
          <span className="font-semibold">{chip.value}</span>
        </div>
      ))}
    </div>
  );
}
