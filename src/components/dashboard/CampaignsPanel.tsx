import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Send,
  ChevronRight,
  Plus,
  Calendar,
  BarChart3,
  Trophy,
  Zap,
  ShoppingCart,
  Ban,
  Tag,
} from 'lucide-react';
import type { CampaignSnapshot } from '@/types/dashboard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CampaignsPanelProps {
  campaigns: CampaignSnapshot[];
  loading?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-500/10 text-blue-600' },
  sending: { label: 'Sending', className: 'bg-amber-500/10 text-amber-600' },
  completed: { label: 'Completed', className: 'bg-green-500/10 text-green-600' },
  paused: { label: 'Paused', className: 'bg-red-500/10 text-red-600' },
};

// Mock top tags data
const mockTopTags = [
  { name: 'Lead', count: 106, campaigns: 'Campaigns', icon: Zap, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: 'Order', count: 3, campaigns: 'Campaigns', icon: ShoppingCart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

export function CampaignsPanel({ campaigns, loading }: CampaignsPanelProps) {
  const navigate = useNavigate();

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
  const blockRate = totalSent > 0 ? ((totalSent - totalDelivered) / totalSent * 100) : 0;

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
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Send className="w-4 h-4 text-orange-600" />
            </div>
            Campaigns
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/campaigns/create')} className="h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeCampaigns || 326}</p>
            <Progress value={75} className="h-1.5 bg-emerald-100" />
            <span className="text-xs text-muted-foreground">Closest targets</span>
          </div>
          
          {/* Block Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ban className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Block</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{blockRate.toFixed(0) || 10}%</p>
            <Progress value={blockRate || 10} className="h-1.5 bg-amber-100" />
            <span className="text-xs text-muted-foreground">Meta mask age</span>
          </div>
        </div>

        {/* Top Tags */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-1.5">
              Top Tags
              <Tag className="w-3 h-3 text-muted-foreground" />
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/tags')}>
              Chime
            </Button>
          </div>
          <div className="space-y-2">
            {mockTopTags.map((tag) => {
              const Icon = tag.icon;
              return (
                <div key={tag.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tag.bgColor)}>
                      <Icon className={cn("w-4 h-4", tag.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{tag.name}</span>
                        <span className="text-sm text-muted-foreground">{tag.count}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{tag.campaigns}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{tag.count}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
