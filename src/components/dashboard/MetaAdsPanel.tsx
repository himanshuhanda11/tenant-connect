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
  MessageCircle,
  Inbox,
  Circle,
} from 'lucide-react';
import type { MetaAdsMetrics } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface MetaAdsPanelProps {
  metrics: MetaAdsMetrics | null;
  loading?: boolean;
}

// Mock top campaigns
const mockTopCampaigns = [
  { name: 'WhatsApp Forms', subtext: 'Corrso local: 16', spent: '830k', icon: MessageCircle, color: 'text-emerald-600' },
  { name: 'Brand Awareness', subtext: 'Corrso local: 18', spent: '€80k', icon: Circle, color: 'text-orange-500' },
];

export function MetaAdsPanel({ metrics, loading }: MetaAdsPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="border-0 shadow-soft">
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
    <Card className="border-0 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Megaphone className="w-4 h-4 text-purple-600" />
            </div>
            Meta Ads (CTWA)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/meta-ads')} className="h-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Tbeck */}
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Inbox className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tbeck</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics?.leadsToday || 156}
            </p>
            <span className="text-xs text-muted-foreground">Met carregenet</span>
          </div>
          
          {/* TinS */}
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">TinS</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics?.conversionRate?.toFixed(1) || 3.2}x
            </p>
            <span className="text-xs text-muted-foreground">Dead lead ago</span>
          </div>
        </div>

        {/* Top Campaigns */}
        <div>
          <span className="text-sm font-medium mb-3 block">Top Campaigns</span>
          <div className="space-y-2">
            {mockTopCampaigns.map((campaign) => {
              const Icon = campaign.icon;
              return (
                <div 
                  key={campaign.name} 
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate('/meta-ads')}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-background border")}>
                      <Icon className={cn("w-4 h-4", campaign.color)} />
                    </div>
                    <div>
                      <span className="font-medium text-sm">{campaign.name}</span>
                      <p className="text-xs text-muted-foreground">{campaign.subtext}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{campaign.spent}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
