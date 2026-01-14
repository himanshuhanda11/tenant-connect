import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  UserPlus,
  Zap,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'message' | 'contact' | 'automation' | 'campaign' | 'resolved' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
  href?: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const iconMap = {
  message: MessageSquare,
  contact: UserPlus,
  automation: Zap,
  campaign: Send,
  resolved: CheckCircle,
  alert: AlertCircle,
};

const colorMap = {
  message: 'text-blue-600 bg-blue-500/10',
  contact: 'text-purple-600 bg-purple-500/10',
  automation: 'text-orange-600 bg-orange-500/10',
  campaign: 'text-primary bg-primary/10',
  resolved: 'text-success bg-success/10',
  alert: 'text-warning bg-warning/10',
};

export function RecentActivityCard({ activities, loading }: RecentActivityCardProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          View All
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-3">
          <div className="space-y-1">
            {activities.map((activity) => {
              const Icon = iconMap[activity.type];
              const colors = colorMap[activity.type];

              return (
                <button
                  key={activity.id}
                  onClick={() => activity.href && navigate(activity.href)}
                  className={cn(
                    "w-full flex items-start gap-3 p-2.5 rounded-lg transition-all text-left",
                    activity.href && "hover:bg-muted/50 cursor-pointer"
                  )}
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", colors)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
