import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, TrendingDown, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  metric?: string;
  action?: { label: string; href: string };
}

const mockRiskItems: RiskItem[] = [
  {
    id: 'quality-drop',
    title: 'Message Quality Drop',
    description: '3 workspaces saw quality rating drop to RED in the last 7 days.',
    severity: 'critical',
    metric: '3 workspaces',
    action: { label: 'Review', href: '/admin/workspaces?view=quality-risk' },
  },
  {
    id: 'template-rejection',
    title: 'High Template Rejection Rate',
    description: 'Template rejection rate jumped to 28% this week (vs 12% baseline).',
    severity: 'warning',
    metric: '28% rejection',
    action: { label: 'View Templates', href: '/admin/workspaces' },
  },
  {
    id: 'failed-messages',
    title: 'Failed Message Spike',
    description: '1.2K failed messages in last 24 hours, 3x above normal.',
    severity: 'warning',
    metric: '1.2K failed',
    action: { label: 'Investigate', href: '/admin/audit-logs' },
  },
];

const severityConfig = {
  critical: {
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-700 border-red-200',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Warning',
  },
  info: {
    icon: TrendingDown,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Info',
  },
};

export function AdminRiskPanel() {
  const items = mockRiskItems;

  if (items.length === 0) return null;

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
            <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
          </div>
          Risk & Compliance
          <Badge variant="outline" className="ml-auto text-[10px] h-5 bg-red-50 text-red-600 border-red-200">
            {items.filter(i => i.severity === 'critical').length} critical
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {items.map(item => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
                <Icon className={cn('h-4 w-4', config.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium">{item.title}</span>
                  <Badge variant="outline" className={cn('text-[9px] h-4 px-1.5', config.badge)}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                {item.metric && (
                  <span className="text-xs font-semibold text-foreground mt-1 inline-block tabular-nums">
                    {item.metric}
                  </span>
                )}
              </div>
              {item.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => window.location.href = item.action!.href}
                >
                  {item.action.label}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
