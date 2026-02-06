import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminStatusBadgeProps {
  status: 'active' | 'suspended' | 'pending' | 'paused' | 'connected' | 'disconnected' | 'error' | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  connected: { label: 'Connected', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  suspended: { label: 'Suspended', classes: 'bg-red-50 text-red-700 border-red-200' },
  error: { label: 'Error', classes: 'bg-red-50 text-red-700 border-red-200' },
  pending: { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  paused: { label: 'Paused', classes: 'bg-orange-50 text-orange-600 border-orange-200' },
  disconnected: { label: 'Disconnected', classes: 'bg-muted text-muted-foreground border-border' },
};

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, classes: 'bg-muted text-muted-foreground border-border' };
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium border', config.classes, className)}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full mr-1.5',
        status === 'active' || status === 'connected' ? 'bg-emerald-500' :
        status === 'suspended' || status === 'error' ? 'bg-red-500' :
        status === 'pending' ? 'bg-amber-500' :
        status === 'paused' ? 'bg-orange-500' : 'bg-muted-foreground'
      )} />
      {config.label}
    </Badge>
  );
}

interface PlanBadgeProps {
  plan: string;
  className?: string;
}

export function AdminPlanBadge({ plan, className }: PlanBadgeProps) {
  const isPro = plan?.toLowerCase().includes('pro') || plan?.toLowerCase().includes('business');
  return (
    <Badge
      variant="secondary"
      className={cn(
        'text-[11px] font-medium',
        isPro && 'bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border-purple-200',
        className
      )}
    >
      {plan || 'Free'}
    </Badge>
  );
}
