import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ROIMetric {
  label: string;
  value: string;
  subValue?: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const metrics: ROIMetric[] = [
  {
    label: 'Total Ad Spend',
    value: '$4,850',
    subValue: 'This month',
    change: -8,
    icon: DollarSign,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    label: 'Leads Generated',
    value: '1,247',
    subValue: 'Via Click-to-WhatsApp',
    change: 24,
    icon: Users,
    color: 'text-green-600 bg-green-100',
  },
  {
    label: 'Cost per Lead',
    value: '$3.89',
    subValue: 'vs $5.20 industry avg',
    change: -25,
    icon: Target,
    color: 'text-purple-600 bg-purple-100',
  },
  {
    label: 'Conversions',
    value: '312',
    subValue: '25% of leads',
    change: 18,
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-100',
  },
];

const funnelSteps = [
  { label: 'Ad Impressions', value: 125000, icon: '👁️' },
  { label: 'Ad Clicks', value: 4850, icon: '👆' },
  { label: 'WhatsApp Opens', value: 3240, icon: '💬' },
  { label: 'Conversations', value: 1247, icon: '🗣️' },
  { label: 'Qualified Leads', value: 687, icon: '⭐' },
  { label: 'Conversions', value: 312, icon: '🎯' },
];

export function ROIDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">ROI Dashboard</h2>
            <p className="text-sm text-muted-foreground">Meta Ads → WhatsApp Performance</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sync Data
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  {metric.subValue && (
                    <p className="text-xs text-muted-foreground mt-1">{metric.subValue}</p>
                  )}
                </div>
                <div className={cn("p-2.5 rounded-xl", metric.color.split(' ')[1])}>
                  <metric.icon className={cn("h-5 w-5", metric.color.split(' ')[0])} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {metric.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  metric.change > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel Visualization */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>
            From ad impression to conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
            {funnelSteps.map((step, idx) => {
              const percentage = idx === 0 ? 100 : Math.round((step.value / funnelSteps[0].value) * 100);
              const dropOff = idx > 0 
                ? Math.round(((funnelSteps[idx - 1].value - step.value) / funnelSteps[idx - 1].value) * 100)
                : 0;

              return (
                <div key={step.label} className="flex items-center gap-2 flex-1 min-w-[140px]">
                  <div className="flex-1">
                    <div 
                      className="mx-auto rounded-xl bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 p-4 text-center"
                      style={{ 
                        width: `${Math.max(percentage, 30)}%`,
                        minWidth: '100px'
                      }}
                    >
                      <span className="text-2xl mb-1 block">{step.icon}</span>
                      <p className="text-lg font-bold">{step.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{step.label}</p>
                    </div>
                    {dropOff > 0 && (
                      <div className="text-center mt-2">
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                          -{dropOff}% drop
                        </Badge>
                      </div>
                    )}
                  </div>
                  {idx < funnelSteps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Best Performer</p>
              <p className="text-lg font-bold text-green-800 dark:text-green-200 mt-1">
                Retargeting Campaign
              </p>
              <p className="text-xs text-green-600 mt-1">32% conversion rate</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Needs Attention</p>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200 mt-1">
                Brand Awareness
              </p>
              <p className="text-xs text-amber-600 mt-1">High spend, low conversion</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Opportunity</p>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mt-1">
                Scale Summer Sale
              </p>
              <p className="text-xs text-blue-600 mt-1">Low CPL, high quality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
