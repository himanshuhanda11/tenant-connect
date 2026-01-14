import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  RefreshCw,
  ExternalLink,
  Crown
} from 'lucide-react';

interface AIInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionHref?: string;
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

export function AIInsightsPanel({ metrics, isPro = true }: AIInsightsPanelProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!isPro) {
      setInsights([
        {
          type: 'info',
          message: 'Upgrade to Pro to unlock AI-powered insights',
          priority: 'medium',
        }
      ]);
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
      
      setInsights(data?.insights || []);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to load insights');
      // Set fallback insights
      setInsights([
        {
          type: 'info',
          message: 'AI insights temporarily unavailable',
          priority: 'low',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [metrics.openConversations, metrics.unassigned, metrics.slaBreaches]);

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                AI Insights
                {!isPro && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Actionable recommendations powered by AI
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
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
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
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                  insight.actionHref ? 'cursor-pointer' : ''
                }`}
                onClick={() => insight.actionHref && navigate(insight.actionHref)}
              >
                <div className="mt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {insight.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(insight.priority)}`}
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
                {insight.actionHref && (
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
