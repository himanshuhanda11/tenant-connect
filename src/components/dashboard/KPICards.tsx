import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Inbox,
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { KPIMetric } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  kpis: KPIMetric[];
  loading?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  'inbox': Inbox,
  'user-x': UserX,
  'alert-triangle': AlertTriangle,
  'clock': Clock,
  'check-circle': CheckCircle,
  'star': Star,
};

export function KPICards({ kpis, loading }: KPICardsProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon] || Inbox;
        const TrendIcon = kpi.changeType === 'positive' ? TrendingUp : 
                          kpi.changeType === 'negative' ? TrendingDown : Minus;

        return (
          <Card
            key={kpi.id}
            className={cn(
              "group transition-all duration-200 hover:shadow-lg",
              kpi.href && "cursor-pointer hover:border-primary/50"
            )}
            onClick={() => kpi.href && navigate(kpi.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  kpi.changeType === 'negative' ? 'bg-red-500/10' : 'bg-primary/10'
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    kpi.changeType === 'negative' ? 'text-red-600' : 'text-primary'
                  )} />
                </div>
                {kpi.change !== undefined && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs border-0",
                      kpi.changeType === 'positive' && 'bg-green-500/10 text-green-600',
                      kpi.changeType === 'negative' && 'bg-red-500/10 text-red-600',
                      kpi.changeType === 'neutral' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {kpi.title}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
