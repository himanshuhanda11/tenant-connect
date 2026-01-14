import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Calendar,
  MessageSquare,
  Users,
  Phone,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageMetric {
  key: string;
  label: string;
  used: number;
  limit: number;
  predicted: number;
  icon: React.ComponentType<{ className?: string }>;
  unit?: string;
}

const metrics: UsageMetric[] = [
  {
    key: 'messages',
    label: 'Monthly Messages',
    used: 8420,
    limit: 10000,
    predicted: 12500,
    icon: MessageSquare,
    unit: 'messages',
  },
  {
    key: 'team',
    label: 'Team Members',
    used: 4,
    limit: 5,
    predicted: 4,
    icon: Users,
  },
  {
    key: 'phones',
    label: 'Phone Numbers',
    used: 2,
    limit: 3,
    predicted: 2,
    icon: Phone,
  },
  {
    key: 'automations',
    label: 'Automation Runs',
    used: 3250,
    limit: 5000,
    predicted: 4800,
    icon: Zap,
    unit: 'runs',
  },
];

export function UsagePrediction() {
  const daysRemaining = 12;
  const billingDate = 'January 26, 2026';

  const getStatusColor = (used: number, limit: number, predicted: number) => {
    const currentPercent = (used / limit) * 100;
    const predictedPercent = (predicted / limit) * 100;
    
    if (predictedPercent > 100) return 'text-red-600 bg-red-100';
    if (predictedPercent > 85) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  const willExceed = metrics.some(m => m.predicted > m.limit);

  return (
    <div className="space-y-6">
      {/* Prediction Alert */}
      {willExceed && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Usage Alert</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Based on current usage patterns, you're projected to exceed your plan limits before 
            the billing cycle ends. Consider upgrading to avoid service interruptions.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>AI Usage Prediction</CardTitle>
                <CardDescription>Projected usage based on your patterns</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Billing Cycle Info */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 mb-6">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{daysRemaining} days</strong> remaining until {billingDate}
            </span>
          </div>

          {/* Usage Metrics */}
          <div className="space-y-6">
            {metrics.map((metric) => {
              const usedPercent = (metric.used / metric.limit) * 100;
              const predictedPercent = (metric.predicted / metric.limit) * 100;
              const statusColor = getStatusColor(metric.used, metric.limit, metric.predicted);
              const willExceedLimit = metric.predicted > metric.limit;

              return (
                <div key={metric.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted">
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {metric.used.toLocaleString()} / {metric.limit.toLocaleString()}
                      </span>
                      <Badge className={cn("text-xs", statusColor)}>
                        {Math.round(usedPercent)}% used
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar with Prediction */}
                  <div className="relative">
                    <Progress value={usedPercent} className="h-3" />
                    
                    {/* Predicted marker */}
                    <div 
                      className="absolute top-0 h-3 border-r-2 border-dashed border-violet-500"
                      style={{ left: `${Math.min(predictedPercent, 100)}%` }}
                    />
                    
                    {/* Overflow indicator */}
                    {willExceedLimit && (
                      <div 
                        className="absolute top-0 right-0 h-3 bg-red-200 rounded-r"
                        style={{ 
                          width: `${Math.min((predictedPercent - 100), 50)}%`,
                          left: '100%'
                        }}
                      />
                    )}
                  </div>

                  {/* Prediction Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>Predicted end-of-cycle:</span>
                      <span className={cn(
                        "font-medium",
                        willExceedLimit ? "text-red-600" : "text-foreground"
                      )}>
                        {metric.predicted.toLocaleString()} {metric.unit || ''}
                      </span>
                    </div>
                    {willExceedLimit && (
                      <Badge variant="destructive" className="text-xs">
                        +{(metric.predicted - metric.limit).toLocaleString()} over limit
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upgrade CTA */}
          {willExceed && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Upgrade to Growth Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Get 25,000 messages, 10 team members, and priority support
                  </p>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/25">
                  Upgrade Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="flex items-start gap-2 mt-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Predictions are based on your usage patterns over the last 30 days and may vary 
              based on actual usage. Upgrade anytime to increase limits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
