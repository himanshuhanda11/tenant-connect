import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  Webhook,
  Bot,
  Send,
  CreditCard,
  Shield,
} from 'lucide-react';
import type { SystemAlert } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertsPanelProps {
  alerts: SystemAlert[];
  onDismiss?: (id: string) => void;
}

const alertTypeConfig: Record<string, { icon: React.ElementType; className: string }> = {
  error: { icon: AlertCircle, className: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30' },
  warning: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30' },
  info: { icon: Info, className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30' },
};

const categoryIcons: Record<string, React.ElementType> = {
  webhook: Webhook,
  api: AlertCircle,
  automation: Bot,
  campaign: Send,
  payment: CreditCard,
  security: Shield,
};

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  const navigate = useNavigate();
  const visibleAlerts = alerts.filter(a => !a.dismissed);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            System Alerts
            <Badge variant="destructive" className="ml-2">
              {visibleAlerts.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visibleAlerts.map((alert) => {
            const typeConfig = alertTypeConfig[alert.type] || alertTypeConfig.warning;
            const TypeIcon = typeConfig.icon;
            const CategoryIcon = categoryIcons[alert.category] || AlertCircle;

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  typeConfig.className
                )}
              >
                <TypeIcon className={cn(
                  "w-5 h-5 shrink-0 mt-0.5",
                  alert.type === 'error' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                      <CategoryIcon className="w-3 h-3" />
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                    {alert.actionLabel && alert.actionHref && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => navigate(alert.actionHref!)}
                      >
                        {alert.actionLabel}
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
