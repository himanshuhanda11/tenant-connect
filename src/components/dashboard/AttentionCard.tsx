import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  FileText,
  Shield,
  CreditCard,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dashboardAllClear from '@/assets/dashboard-all-clear.png';

interface AlertItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  message: string;
  href: string;
  severity: 'critical' | 'warning' | 'info';
}

interface AttentionCardProps {
  templatesPending?: number;
  qualityRating?: 'green' | 'yellow' | 'red' | 'unknown';
  billingDueDays?: number;
  chatsWaiting?: number;
  loading?: boolean;
}

export function AttentionCard({
  templatesPending = 0,
  qualityRating = 'green',
  billingDueDays,
  chatsWaiting = 0,
  loading,
}: AttentionCardProps) {
  const navigate = useNavigate();

  const alerts: AlertItem[] = [];

  if (templatesPending > 0) {
    alerts.push({
      id: 'templates',
      icon: FileText,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-500/10',
      message: `${templatesPending} template${templatesPending > 1 ? 's' : ''} pending approval`,
      href: '/templates',
      severity: 'warning',
    });
  }

  if (qualityRating === 'yellow' || qualityRating === 'red') {
    alerts.push({
      id: 'quality',
      icon: Shield,
      iconColor: qualityRating === 'red' ? 'text-destructive' : 'text-amber-600',
      iconBg: qualityRating === 'red' ? 'bg-destructive/10' : 'bg-amber-500/10',
      message: `Quality rating dropped to ${qualityRating === 'red' ? 'Red' : 'Yellow'}`,
      href: '/settings',
      severity: qualityRating === 'red' ? 'critical' : 'warning',
    });
  }

  if (billingDueDays !== undefined && billingDueDays <= 3) {
    alerts.push({
      id: 'billing',
      icon: CreditCard,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-500/10',
      message: `Billing due in ${billingDueDays} day${billingDueDays !== 1 ? 's' : ''}`,
      href: '/billing',
      severity: billingDueDays <= 1 ? 'critical' : 'warning',
    });
  }

  if (chatsWaiting > 0) {
    alerts.push({
      id: 'chats',
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500/10',
      message: `${chatsWaiting} chat${chatsWaiting > 1 ? 's' : ''} waiting on agent`,
      href: '/inbox?assigned=none',
      severity: chatsWaiting > 10 ? 'critical' : 'warning',
    });
  }

  // Limit to 4
  const visibleAlerts = alerts.slice(0, 4);

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {visibleAlerts.length > 0 ? (
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          )}
          <CardTitle className="text-base font-semibold">
            {visibleAlerts.length > 0 ? 'Attention Needed' : 'All Clear'}
          </CardTitle>
          {visibleAlerts.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto">
              {visibleAlerts.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <img 
              src={dashboardAllClear} 
              alt="All clear" 
              className="h-16 w-16 object-contain mb-2"
              loading="lazy"
            />
            <p className="text-sm font-medium text-foreground">All Clear! 🎉</p>
            <p className="text-xs text-muted-foreground mt-0.5">No issues right now</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <button
                  key={alert.id}
                  onClick={() => navigate(alert.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", alert.iconBg)}>
                    <Icon className={cn("h-4 w-4", alert.iconColor)} />
                  </div>
                  <span className="text-sm text-foreground flex-1">{alert.message}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
