import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
  Shield,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { IntegrationWithStatus } from '@/types/integration';

interface IntegrationOverviewProps {
  integration: IntegrationWithStatus;
  eventStats: {
    total: number;
    processed: number;
    failed: number;
    pending: number;
  };
  mappingsCount: number;
  onTestConnection: () => void;
  onCopyWebhook: () => void;
  isTestingConnection?: boolean;
}

export function IntegrationOverview({
  integration,
  eventStats,
  mappingsCount,
  onTestConnection,
  onCopyWebhook,
  isTestingConnection,
}: IntegrationOverviewProps) {
  const tenantIntegration = integration.tenantIntegration;
  const healthStatus = tenantIntegration?.health_status || 'unknown';
  
  const getHealthScore = () => {
    if (!integration.isConnected) return 0;
    if (eventStats.total === 0) return 100;
    return Math.round((eventStats.processed / eventStats.total) * 100);
  };

  const healthScore = getHealthScore();

  const getHealthColor = () => {
    if (healthScore >= 90) return 'text-green-500';
    if (healthScore >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = () => {
    if (healthScore >= 90) return 'bg-green-500';
    if (healthScore >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="w-5 h-5 text-primary" />
              Health Score
            </CardTitle>
            <CardDescription>Overall integration performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${healthScore * 2.51} 251`}
                    className={getHealthColor()}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-2xl font-bold", getHealthColor())}>
                    {healthScore}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon()}
                    <span className="capitalize font-medium">{healthStatus}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Event</span>
                  <span className="font-medium">
                    {integration.lastEventFormatted || 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Mappings</span>
                  <span className="font-medium">{mappingsCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Event Statistics
            </CardTitle>
            <CardDescription>Last 24 hours performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Total Events</span>
                </div>
                <p className="text-2xl font-bold">{eventStats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Processed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{eventStats.processed}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-muted-foreground">Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{eventStats.failed}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{eventStats.pending}</p>
              </div>
            </div>
            
            {/* Success Rate Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">{eventStats.total > 0 ? Math.round((eventStats.processed / eventStats.total) * 100) : 100}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-green-500 transition-all" 
                    style={{ width: `${eventStats.total > 0 ? (eventStats.processed / eventStats.total) * 100 : 100}%` }} 
                  />
                  <div 
                    className="bg-red-500 transition-all" 
                    style={{ width: `${eventStats.total > 0 ? (eventStats.failed / eventStats.total) * 100 : 0}%` }} 
                  />
                  <div 
                    className="bg-yellow-500 transition-all" 
                    style={{ width: `${eventStats.total > 0 ? (eventStats.pending / eventStats.total) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Connection Details
          </CardTitle>
          <CardDescription>Webhook configuration and testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Webhook URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs font-mono truncate">
                  {tenantIntegration?.webhook_url || 'Not configured'}
                </code>
                <Button variant="outline" size="icon" onClick={onCopyWebhook}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Connected At */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Connected Since</label>
              <p className="px-3 py-2 bg-muted rounded-md text-sm">
                {tenantIntegration?.connected_at
                  ? new Date(tenantIntegration.connected_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not connected'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={onTestConnection} disabled={isTestingConnection}>
              {isTestingConnection ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <a 
                href={integration.documentation_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Documentation
              </a>
            </Button>
          </div>

          {/* Last Error */}
          {tenantIntegration?.last_error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600">Last Error</p>
                  <p className="text-xs text-red-500 mt-0.5">{tenantIntegration.last_error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported Events</CardTitle>
          <CardDescription>
            Events that {integration.name} can send to your webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {integration.supported_events.map((event) => (
              <Badge key={event} variant="outline" className="font-mono text-xs">
                {integration.key}.{event}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
