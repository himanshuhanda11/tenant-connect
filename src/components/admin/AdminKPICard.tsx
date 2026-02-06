import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminKPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  onViewDetails?: () => void;
}

export function AdminKPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  onViewDetails,
}: AdminKPICardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend !== undefined && trend === 0;

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trendPositive && 'bg-emerald-50 text-emerald-600',
              trendNegative && 'bg-red-50 text-red-600',
              trendNeutral && 'bg-muted text-muted-foreground',
            )}>
              {trendPositive && <TrendingUp className="h-3 w-3" />}
              {trendNegative && <TrendingDown className="h-3 w-3" />}
              {trendNeutral && <Minus className="h-3 w-3" />}
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trendLabel && <p className="text-[11px] text-muted-foreground mt-0.5">{trendLabel}</p>}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 mt-3 transition-colors"
          >
            View details <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
