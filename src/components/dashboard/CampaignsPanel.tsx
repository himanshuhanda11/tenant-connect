import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Send,
  ChevronRight,
  Plus,
  Calendar,
  BarChart3,
  Trophy,
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

export function CampaignsPanel({ campaigns, loading }: CampaignsPanelProps) {
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
            <Send className="w-5 h-5 text-orange-600" />
            Campaigns
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/campaigns/create')}>
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Send className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No campaigns yet</p>
            <Button variant="link" size="sm" onClick={() => navigate('/campaigns/create')}>
              Create your first campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => {
              const status = statusConfig[campaign.status] || statusConfig.draft;
              
              return (
                <div
                  key={campaign.id}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{campaign.name}</p>
                      {campaign.scheduledAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(campaign.scheduledAt), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>
                    <Badge className={cn("shrink-0", status.className)}>
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Sent</span>
                      <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivered</span>
                      <p className="font-medium">{campaign.delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Read</span>
                      <p className="font-medium">{campaign.read.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reply Rate</span>
                      <p className="font-medium text-green-600">{campaign.replyRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
