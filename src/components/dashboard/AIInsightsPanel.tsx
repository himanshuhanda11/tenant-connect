import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  RefreshCw,
  ExternalLink,
  Crown,
  TrendingDown,
  TrendingUp,
  Zap,
  BarChart3,
  MessageSquare,
  FileEdit
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'performance' | 'engagement' | 'optimization' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  tags?: { label: string; variant: 'warning' | 'success' | 'default' | 'destructive' }[];
  actions?: { label: string; href: string }[];
  actionHref?: string;
  stat?: string;
}

interface AIInsightsPanelProps {
  metrics: {
    openConversations: number;
    unassigned: number;
    slaBreaches: number;
    avgResponseTime: number;
    resolvedToday: number;
    conversionRate: number;
    campaignsSent: number;
    automationRuns: number;
  };
  isPro?: boolean;
}

const iconMap = {
  performance: TrendingDown,
  engagement: CheckCircle2,
  optimization: Zap,
  success: TrendingUp,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  performance: { icon: 'text-amber-500', bg: 'bg-amber-500/10' },
  engagement: { icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  optimization: { icon: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { icon: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { icon: 'text-orange-500', bg: 'bg-orange-500/10' },
  info: { icon: 'text-blue-400', bg: 'bg-blue-400/10' },
};

export function AIInsightsPanel({ metrics, isPro = true }: AIInsightsPanelProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!isPro) {
      setInsights([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('dashboard-ai-insights', {
        body: { metrics },
      });

      if (fnError) throw fnError;
      
      // Transform old format to new format with enhanced data
      const enhancedInsights: AIInsight[] = (data?.insights || []).map((insight: any, index: number) => ({
        id: `insight-${index}`,
        type: insight.type === 'warning' ? 'performance' : insight.type === 'success' ? 'engagement' : 'optimization',
        title: getInsightTitle(insight.type),
        message: insight.message,
        priority: insight.priority,
        tags: getInsightTags(insight),
        actionHref: insight.actionHref,
        stat: getInsightStat(insight),
      }));
      
      setInsights(enhancedInsights.length > 0 ? enhancedInsights : getDefaultInsights(metrics));
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to load insights');
      setInsights(getDefaultInsights(metrics));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [metrics.openConversations, metrics.unassigned, metrics.slaBreaches]);

  return (
    <Card className="border-0 shadow-soft bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                AI Insights
                {!isPro && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                What happened issues need your attention today
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchInsights}
            disabled={loading || !isPro}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !isPro ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Crown className="w-10 h-10 text-amber-500 mb-3" />
            <h4 className="font-medium mb-1">Unlock AI Insights</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalized recommendations to improve performance
            </p>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate('/billing')}
            >
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-2">
            <div className="space-y-3">
              {insights.map((insight) => {
                const Icon = iconMap[insight.type] || Info;
                const colors = colorMap[insight.type] || colorMap.info;
                
                return (
                  <div
                    key={insight.id}
                    className="p-4 rounded-xl border bg-gradient-to-r from-background to-muted/30 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => insight.actionHref && navigate(insight.actionHref)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}>
                        <Icon className={`w-4 h-4 ${colors.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          {insight.stat && (
                            <span className="text-xs text-muted-foreground">{insight.stat}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                          {insight.message}
                        </p>
                        {insight.tags && insight.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {insight.tags.map((tag, idx) => (
                              <Badge 
                                key={idx} 
                                variant={tag.variant === 'default' ? 'secondary' : 'outline'}
                                className={`text-xs px-2 py-0.5 ${
                                  tag.variant === 'warning' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                  tag.variant === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                  tag.variant === 'destructive' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                  ''
                                }`}
                              >
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function getInsightTitle(type: string): string {
  switch (type) {
    case 'warning': return 'Performance';
    case 'success': return 'Lead Engagement';
    case 'info': return 'Flow Optimization';
    default: return 'Insight';
  }
}

function getInsightTags(insight: any): AIInsight['tags'] {
  if (insight.type === 'warning') {
    return [
      { label: '⚠ PENDING', variant: 'warning' },
      { label: 'Complaints', variant: 'default' },
    ];
  }
  if (insight.type === 'success') {
    return [
      { label: '↻ Shorter templates', variant: 'success' },
    ];
  }
  if (insight.type === 'info') {
    return [
      { label: '↻ Check', variant: 'default' },
      { label: 'TJS', variant: 'default' },
      { label: 'Campaign It', variant: 'default' },
    ];
  }
  return [];
}

function getInsightStat(insight: any): string {
  if (insight.type === 'warning') return '▾ Sincerity';
  if (insight.type === 'success') return '⊕ Spreedsheets';
  return '';
}

function getDefaultInsights(metrics: AIInsightsPanelProps['metrics']): AIInsight[] {
  const insights: AIInsight[] = [];
  
  if (metrics.unassigned > 0) {
    insights.push({
      id: 'performance-1',
      type: 'performance',
      title: 'Performance',
      message: `${metrics.unassigned} customers dropped at today. Schedule a follow up ooliter you close deals.`,
      priority: 'high',
      tags: [
        { label: '⚠ PENDING', variant: 'warning' },
        { label: 'Complaints', variant: 'default' },
      ],
      actionHref: '/inbox',
      stat: '▾ Sincerity',
    });
  }
  
  insights.push({
    id: 'engagement-1',
    type: 'engagement',
    title: 'Lead Engagement',
    message: `Response time higher for for ${metrics.resolvedToday || 12} leads on today.`,
    priority: 'medium',
    tags: [
      { label: '↻ Shorter templates', variant: 'success' },
    ],
    actionHref: '/inbox',
    stat: '⊕ Projects',
  });
  
  if (metrics.automationRuns > 0) {
    insights.push({
      id: 'optimization-1',
      type: 'optimization',
      title: 'Flow Optimization',
      message: 'Broken Webhook detected – failed after TNC node on insurance form flow.',
      priority: 'low',
      tags: [
        { label: '↻ Check', variant: 'default' },
        { label: 'TJS', variant: 'default' },
        { label: 'Campaign It', variant: 'default' },
      ],
      actionHref: '/flows',
    });
  }
  
  return insights;
}
