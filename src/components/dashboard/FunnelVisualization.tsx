import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Megaphone, 
  Inbox, 
  Workflow, 
  Users, 
  Target,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface FunnelStage {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  icon: React.ElementType;
  color: string;
}

interface FunnelVisualizationProps {
  data: {
    metaAds: number;
    inbox: number;
    flows: number;
    agents: number;
    conversions: number;
  };
  loading?: boolean;
}

export function FunnelVisualization({ data, loading }: FunnelVisualizationProps) {
  const stages: FunnelStage[] = [
    { id: 'ads', label: 'Meta Ads', value: data.metaAds, icon: Megaphone, color: 'bg-blue-500' },
    { id: 'inbox', label: 'Inbox', value: data.inbox, icon: Inbox, color: 'bg-indigo-500' },
    { id: 'flows', label: 'Flows', value: data.flows, icon: Workflow, color: 'bg-purple-500' },
    { id: 'agents', label: 'Agents', value: data.agents, icon: Users, color: 'bg-pink-500' },
    { id: 'conversions', label: 'Conversions', value: data.conversions, icon: Target, color: 'bg-emerald-500' },
  ];

  const calculateConversion = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round((current / previous) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Meta Ads → Inbox → Flow → Agent → Conversion
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {calculateConversion(data.conversions, data.metaAds)}% overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual Funnel */}
        <div className="relative">
          {/* Funnel stages */}
          <div className="flex items-center justify-between gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              const conversionRate = index > 0 
                ? calculateConversion(stage.value, stages[index - 1].value) 
                : 100;

              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1 text-center">
                    {/* Icon + Label */}
                    <div className={`mx-auto w-10 h-10 rounded-lg ${stage.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Value */}
                    <div className="text-lg font-bold">{stage.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{stage.label}</div>
                    
                    {/* Conversion Rate */}
                    {index > 0 && (
                      <div className="mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            conversionRate >= 50 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : conversionRate >= 25 
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          }`}
                        >
                          {conversionRate}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow between stages */}
                  {index < stages.length - 1 && (
                    <div className="flex items-center justify-center shrink-0">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Funnel bar visualization */}
          <div className="mt-6 space-y-1.5">
            {stages.map((stage, index) => {
              const widthPercent = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
              
              return (
                <div key={`bar-${stage.id}`} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground text-right shrink-0">
                    {stage.label}
                  </div>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(widthPercent, 8)}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        {stage.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Avg Response</div>
            <div className="text-lg font-bold">2.5m</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Drop-off Rate</div>
            <div className="text-lg font-bold flex items-center justify-center gap-1">
              18%
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Conv. Value</div>
            <div className="text-lg font-bold">₹4.2L</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
