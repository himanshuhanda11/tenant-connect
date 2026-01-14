import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Inbox,
  MessageSquare,
  Clock,
  Tag,
  ChevronRight,
  AlertCircle,
  User,
  Zap,
} from 'lucide-react';
import type { InboxHealthMetrics, ActionQueueItem } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface InboxHealthPanelProps {
  metrics: InboxHealthMetrics | null;
  actionQueue: ActionQueueItem[];
  loading?: boolean;
}

const tagColors: Record<string, string> = {
  amber: 'bg-amber-500/10 text-amber-600 border-amber-200',
  blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
  green: 'bg-green-500/10 text-green-600 border-green-200',
  red: 'bg-red-500/10 text-red-600 border-red-200',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
};

const actionTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  unassigned: { icon: User, color: 'text-orange-600 bg-orange-100' },
  sla_risk: { icon: AlertCircle, color: 'text-red-600 bg-red-100' },
  ctwa_waiting: { icon: Zap, color: 'text-purple-600 bg-purple-100' },
  vip_waiting: { icon: Tag, color: 'text-amber-600 bg-amber-100' },
};

export function InboxHealthPanel({ metrics, actionQueue, loading }: InboxHealthPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = (metrics?.openConversations || 0) + (metrics?.closedConversations || 0);
  const openPercent = total > 0 ? ((metrics?.openConversations || 0) / total) * 100 : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Inbox Health */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Inbox Health
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inbox')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Open vs Closed */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Open vs Closed</span>
              <span className="font-medium">
                {metrics?.openConversations} / {metrics?.closedConversations}
              </span>
            </div>
            <Progress value={openPercent} className="h-2" />
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-muted-foreground">Waiting on Agent</span>
              </div>
              <p className="text-xl font-bold text-amber-700">{metrics?.waitingOnAgent || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-200/50">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Waiting on Customer</span>
              </div>
              <p className="text-xl font-bold text-blue-700">{metrics?.waitingOnCustomer || 0}</p>
            </div>
          </div>

          {/* Unread badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Unread messages</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {metrics?.unreadCount || 0}
            </Badge>
          </div>

          {/* Top tags */}
          <div>
            <p className="text-sm font-medium mb-2">Top Tags Driving Volume</p>
            <div className="flex flex-wrap gap-2">
              {metrics?.topTags.slice(0, 5).map((tag) => (
                <Badge
                  key={tag.name}
                  variant="outline"
                  className={cn("gap-1", tagColors[tag.color] || tagColors.blue)}
                >
                  {tag.name}
                  <span className="font-bold">{tag.count}</span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Queue */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Action Queue
            </CardTitle>
            {actionQueue.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {actionQueue.length} items
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {actionQueue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All caught up! No urgent actions.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {actionQueue.map((item) => {
                const config = actionTypeConfig[item.type] || actionTypeConfig.unassigned;
                const Icon = config.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/inbox?conversation=${item.conversationId}`)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={cn("p-2 rounded-lg", config.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.priority === 'high' && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
