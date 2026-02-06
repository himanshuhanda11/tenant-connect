import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, CreditCard, Ban, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttentionItem {
  id: string;
  severity: 'error' | 'warning' | 'info';
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
  onAction?: () => void;
}

interface AdminAttentionPanelProps {
  items: AttentionItem[];
}

const severityStyles = {
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', dot: 'bg-red-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', dot: 'bg-amber-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', dot: 'bg-blue-500' },
};

export function AdminAttentionPanel({ items }: AdminAttentionPanelProps) {
  if (items.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm border-border/50">
        <CardContent className="py-8 text-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">All clear — nothing needs attention right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Attention Needed
          </CardTitle>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map(item => {
          const styles = severityStyles[item.severity];
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                styles.bg, styles.border
              )}
            >
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', styles.bg)}>
                <item.icon className={cn('h-4 w-4', styles.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="flex-shrink-0 text-xs h-7 px-2"
                onClick={item.onAction}
              >
                {item.cta} <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function buildAttentionItems(kpi: any, navigate: (path: string) => void): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (kpi?.suspended_workspaces > 0) {
    items.push({
      id: 'suspended',
      severity: 'error',
      icon: Ban,
      title: `${kpi.suspended_workspaces} suspended workspace${kpi.suspended_workspaces > 1 ? 's' : ''}`,
      description: 'Require review or unsuspension',
      cta: 'View',
      onAction: () => navigate('/control/workspaces'),
    });
  }

  const pendingPhones = (kpi?.total_phone_numbers || 0) - (kpi?.connected_phone_numbers || 0);
  if (pendingPhones > 0) {
    items.push({
      id: 'pending-phones',
      severity: 'warning',
      icon: Phone,
      title: `${pendingPhones} pending phone connection${pendingPhones > 1 ? 's' : ''}`,
      description: 'Numbers awaiting verification',
      cta: 'Review',
      onAction: () => navigate('/control/workspaces'),
    });
  }

  return items;
}
