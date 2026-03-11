import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Send, Plus, Ban } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';

export function CampaignsPanel() {
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useCampaigns();

  const activeCampaigns = campaigns.filter(c => c.status === 'running' || c.status === 'scheduled').length;
  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + (c.delivered_count || 0), 0);
  const blockRate = totalSent > 0 ? ((totalSent - totalDelivered) / totalSent * 100) : 0;

  if (isLoading) {
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
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Send className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No campaigns yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first broadcast campaign</p>
            <Button size="sm" className="mt-4" onClick={() => navigate('/campaigns/create')}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{activeCampaigns}</p>
              <Progress value={campaigns.length > 0 ? (activeCampaigns / campaigns.length) * 100 : 0} className="h-1.5 bg-emerald-100" />
              <span className="text-xs text-muted-foreground">{campaigns.length} total</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Ban className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Block Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{blockRate.toFixed(1)}%</p>
              <Progress value={blockRate} className="h-1.5 bg-amber-100" />
              <span className="text-xs text-muted-foreground">{totalSent.toLocaleString()} sent</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
