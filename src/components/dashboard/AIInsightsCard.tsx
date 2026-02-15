import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dashboardAiInsights from '@/assets/dashboard-ai-insights.png';

interface AIInsight {
  id: string;
  message: string;
  actionLabel: string;
  actionHref: string;
  type: 'warning' | 'success' | 'info';
}

interface AIInsightsCardProps {
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
  loading?: boolean;
}

export function AIInsightsCard({ metrics, isPro = true, loading: externalLoading }: AIInsightsCardProps) {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    if (!isPro) {
      setInsights([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-ai-insights', {
        body: { metrics },
      });

      if (error) throw error;

      const parsed: AIInsight[] = (data?.insights || []).slice(0, 3).map((insight: any, i: number) => ({
        id: `ai-${i}`,
        message: insight.message || 'Check your dashboard for updates.',
        actionLabel: insight.actionLabel || 'View',
        actionHref: insight.actionHref || '/dashboard',
        type: insight.type || 'info',
      }));

      setInsights(parsed.length > 0 ? parsed : getDefaults(metrics));
    } catch {
      setInsights(getDefaults(metrics));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [metrics.openConversations, metrics.unassigned]);

  if (externalLoading || loading) {
    return (
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isPro) {
    return (
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
            <Badge variant="secondary" className="text-xs ml-auto">
              <Crown className="h-3 w-3 mr-1" /> Pro
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Upgrade to unlock AI suggestions</p>
            <Button size="sm" onClick={() => navigate('/billing')}>Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={dashboardAiInsights} 
              alt="AI Insights" 
              className="h-10 w-10 object-contain"
              loading="lazy"
            />
            <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
          >
            <p className="text-sm text-foreground flex-1 leading-relaxed">{insight.message}</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-primary shrink-0"
              onClick={() => navigate(insight.actionHref)}
            >
              Fix now
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getDefaults(metrics: AIInsightsCardProps['metrics']): AIInsight[] {
  const items: AIInsight[] = [];

  if (metrics.unassigned > 0) {
    items.push({
      id: 'default-1',
      message: `${metrics.unassigned} chats are unassigned. Assign agents to improve response time.`,
      actionLabel: 'Assign',
      actionHref: '/inbox?assigned=none',
      type: 'warning',
    });
  }

  if (metrics.slaBreaches > 0) {
    items.push({
      id: 'default-2',
      message: `${metrics.slaBreaches} SLA breaches detected. Review response SLA settings.`,
      actionLabel: 'Review',
      actionHref: '/team/sla',
      type: 'warning',
    });
  }

  if (items.length < 3) {
    items.push({
      id: 'default-3',
      message: 'Schedule a campaign to re-engage inactive contacts from the last 30 days.',
      actionLabel: 'Create',
      actionHref: '/campaigns/create',
      type: 'info',
    });
  }

  return items.slice(0, 3);
}
