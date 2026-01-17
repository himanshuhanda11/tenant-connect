import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  UserX, 
  Clock, 
  Zap, 
  TrendingDown,
  ChevronRight,
  Bell,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import type { ActionQueueItem } from '@/types/dashboard';

interface AttentionItem {
  id: string;
  type: 'unassigned' | 'sla_breach' | 'broken_flow' | 'low_conversion' | 'webhook_error';
  title: string;
  subtitle: string;
  count?: number;
  severity: 'critical' | 'warning' | 'info';
  href: string;
}

interface AttentionNeededPanelProps {
  items: AttentionItem[];
  loading?: boolean;
}

const typeConfig = {
  unassigned: {
    icon: UserX,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  sla_breach: {
    icon: Clock,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  broken_flow: {
    icon: Zap,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  low_conversion: {
    icon: TrendingDown,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  webhook_error: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
};

const severityConfig = {
  critical: {
    badge: 'bg-destructive text-destructive-foreground',
    label: 'Critical',
  },
  warning: {
    badge: 'bg-amber-500 text-white',
    label: 'Warning',
  },
  info: {
    badge: 'bg-muted text-muted-foreground',
    label: 'Info',
  },
};

export function AttentionNeededPanel({ items, loading }: AttentionNeededPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Attention Needed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = items.filter(i => i.severity === 'critical').length;
  const warningCount = items.filter(i => i.severity === 'warning').length;

  return (
    <Card className={`border-0 shadow-soft ${criticalCount > 0 ? 'border-destructive/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${criticalCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
              {criticalCount > 0 ? (
                <Bell className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Attention Needed</CardTitle>
              <p className="text-xs text-muted-foreground">
                {items.length > 0 
                  ? `Fleet to reminder your d happening.`
                  : 'No issues need your attention'
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
            </div>
            <h4 className="font-semibold text-lg text-emerald-600 dark:text-emerald-400 mb-1">All clear!</h4>
            <p className="text-sm text-muted-foreground">
              No issues need your attention right now.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-2">
              {items.map((item) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                const severity = severityConfig[item.severity];

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {item.title}
                        </span>
                        {item.count && item.count > 1 && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {item.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs shrink-0 ${severity.badge}`}
                    >
                      {severity.label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
