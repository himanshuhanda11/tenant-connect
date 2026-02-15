import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  CheckCircle2,
  Send,
  CreditCard,
  Zap,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  type: 'template_submitted' | 'template_approved' | 'campaign_sent' | 'payment_success' | 'payment_failed' | 'flow_triggered';
  title: string;
  timestamp: string;
}

interface RecentTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

const iconConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  template_submitted: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  template_approved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  campaign_sent: { icon: Send, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  payment_success: { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  payment_failed: { icon: CreditCard, color: 'text-destructive', bg: 'bg-destructive/10' },
  flow_triggered: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-500/10' },
};

export function RecentTimeline({ events, loading }: RecentTimelineProps) {
  if (loading) {
    return (
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
        ) : (
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[13px] top-3 bottom-3 w-px bg-border" />

            {events.slice(0, 5).map((event, i) => {
              const config = iconConfig[event.type] || iconConfig.flow_triggered;
              const Icon = config.icon;

              return (
                <div key={event.id} className="relative flex items-start gap-3 py-2.5">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 z-10", config.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
