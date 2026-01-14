import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bot,
  ChevronRight,
  Clock,
  AlertTriangle,
  Pause,
  Play,
  TrendingUp,
} from 'lucide-react';
import type { AutomationMetrics } from '@/types/dashboard';

interface AutomationsPanelProps {
  metrics: AutomationMetrics | null;
  loading?: boolean;
}

export function AutomationsPanel({ metrics, loading }: AutomationsPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            Automations Impact
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/automation')}>
              Create <Play className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/automation')}>
              View Logs <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-200/50">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Executions</span>
            </div>
            <p className="text-xl font-bold text-emerald-700">
              {metrics?.totalExecutions.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-200/50">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Time Saved</span>
            </div>
            <p className="text-xl font-bold text-blue-700">
              {metrics?.timeSavedMinutes || 0}m
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Error Rate</span>
            </div>
            <p className="text-xl font-bold">
              {((metrics?.errorRate || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Paused warning */}
        {(metrics?.pausedCount || 0) > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-200">
            <Pause className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              {metrics?.pausedCount} automation(s) paused
            </span>
            <Button variant="link" size="sm" className="ml-auto h-auto p-0 text-amber-700">
              Review
            </Button>
          </div>
        )}

        {/* Top automations */}
        <div>
          <p className="text-sm font-medium mb-2">Top Automations</p>
          <div className="space-y-2">
            {(metrics?.topAutomations || []).slice(0, 5).map((auto, i) => (
              <div key={auto.id} className="flex items-center gap-2">
                <div className="w-6 text-center text-xs font-medium text-muted-foreground">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{auto.name}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {auto.runs} runs
                </Badge>
              </div>
            ))}
            {(!metrics?.topAutomations || metrics.topAutomations.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No automations configured yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
