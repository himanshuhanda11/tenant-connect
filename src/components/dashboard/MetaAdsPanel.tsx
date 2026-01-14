import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Megaphone,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { MetaAdsMetrics } from '@/types/dashboard';

interface MetaAdsPanelProps {
  metrics: MetaAdsMetrics | null;
  loading?: boolean;
}

export function MetaAdsPanel({ metrics, loading }: MetaAdsPanelProps) {
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
    <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200/50 dark:border-purple-800/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Meta Ads (CTWA)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/meta-ads')}>
            Analytics <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lead stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border">
            <p className="text-xs text-muted-foreground mb-1">Leads Today</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {metrics?.leadsToday || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border">
            <p className="text-xs text-muted-foreground mb-1">Leads (7d)</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {metrics?.leads7d || 0}
            </p>
          </div>
        </div>

        {/* Conversion & Response */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-white/5 border">
            <Target className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Conversion</p>
              <p className="font-medium">{metrics?.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-white/5 border">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Response</p>
              <p className="font-medium">{Math.round((metrics?.avgResponseTime || 0) / 60)}m</p>
            </div>
          </div>
        </div>

        {/* Top campaigns */}
        <div>
          <p className="text-sm font-medium mb-2">Top Campaigns</p>
          <div className="space-y-2">
            {(metrics?.topCampaigns || []).slice(0, 3).map((campaign, i) => (
              <div
                key={campaign.name}
                className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-white/5 border"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 justify-center text-xs">
                    {i + 1}
                  </Badge>
                  <span className="text-sm truncate">{campaign.name}</span>
                </div>
                <Badge className="bg-purple-500/10 text-purple-600">
                  {campaign.leads} leads
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
