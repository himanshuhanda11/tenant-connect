import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowAnalyticsProps {
  flowId: string;
}

interface NodeMetric {
  nodeKey: string;
  nodeName: string;
  entered: number;
  completed: number;
  dropOff: number;
  avgTime: string;
}

export function FlowAnalytics({ flowId }: FlowAnalyticsProps) {
  // Mock analytics data
  const metrics = {
    totalRuns: 1247,
    completionRate: 68,
    avgDuration: '4m 32s',
    conversionRate: 24,
    trend: 'up' as const,
    trendValue: 12,
  };

  const nodeMetrics: NodeMetric[] = [
    { nodeKey: 'welcome', nodeName: 'Welcome Message', entered: 1247, completed: 1189, dropOff: 4.6, avgTime: '5s' },
    { nodeKey: 'qualify', nodeName: 'Qualification Q1', entered: 1189, completed: 982, dropOff: 17.4, avgTime: '45s' },
    { nodeKey: 'options', nodeName: 'Service Options', entered: 982, completed: 891, dropOff: 9.3, avgTime: '32s' },
    { nodeKey: 'contact', nodeName: 'Contact Info', entered: 891, completed: 756, dropOff: 15.2, avgTime: '1m 20s' },
    { nodeKey: 'confirm', nodeName: 'Confirmation', entered: 756, completed: 702, dropOff: 7.1, avgTime: '10s' },
  ];

  const funnelWidth = (index: number) => {
    const baseWidth = 100 - (index * 15);
    return `${Math.max(baseWidth, 30)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{metrics.totalRuns.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">+{metrics.trendValue}% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{metrics.completionRate}%</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <Progress value={metrics.completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{metrics.avgDuration}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+5% vs last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Flow Funnel
          </CardTitle>
          <CardDescription>
            Track drop-off at each step of your flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TooltipProvider>
              {nodeMetrics.map((node, idx) => (
                <div key={node.nodeKey} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Funnel bar */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "h-12 rounded-lg flex items-center justify-between px-4 transition-all cursor-pointer hover:opacity-90",
                            node.dropOff > 15 ? "bg-red-100 dark:bg-red-900/30" :
                            node.dropOff > 10 ? "bg-amber-100 dark:bg-amber-900/30" :
                            "bg-primary/10"
                          )}
                          style={{ width: funnelWidth(idx) }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{node.nodeName}</span>
                            {node.dropOff > 15 && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-semibold">{node.completed.toLocaleString()}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                node.dropOff > 15 ? "bg-red-200 text-red-700" :
                                node.dropOff > 10 ? "bg-amber-200 text-amber-700" :
                                "bg-green-200 text-green-700"
                              )}
                            >
                              -{node.dropOff}%
                            </Badge>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="text-sm space-y-1">
                          <p><strong>Entered:</strong> {node.entered.toLocaleString()}</p>
                          <p><strong>Completed:</strong> {node.completed.toLocaleString()}</p>
                          <p><strong>Avg Time:</strong> {node.avgTime}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Arrow to next */}
                    {idx < nodeMetrics.length - 1 && (
                      <div className="absolute -bottom-3 left-8 z-10">
                        <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-200" />
              <span className="text-xs text-muted-foreground">Low drop-off (&lt;10%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-200" />
              <span className="text-xs text-muted-foreground">Medium (10-15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-200" />
              <span className="text-xs text-muted-foreground">High drop-off (&gt;15%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
