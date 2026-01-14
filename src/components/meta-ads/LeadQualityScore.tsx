import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignQuality {
  id: string;
  name: string;
  qualityScore: number;
  responseRate: number;
  conversionRate: number;
  avgFirstReply: string;
  leadCount: number;
  trend: 'up' | 'down' | 'stable';
}

const MOCK_CAMPAIGNS: CampaignQuality[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    qualityScore: 87,
    responseRate: 72,
    conversionRate: 18,
    avgFirstReply: '2m 15s',
    leadCount: 342,
    trend: 'up',
  },
  {
    id: '2',
    name: 'New Collection Launch',
    qualityScore: 64,
    responseRate: 45,
    conversionRate: 8,
    avgFirstReply: '8m 42s',
    leadCount: 156,
    trend: 'down',
  },
  {
    id: '3',
    name: 'Retargeting - Cart Abandon',
    qualityScore: 91,
    responseRate: 84,
    conversionRate: 32,
    avgFirstReply: '1m 08s',
    leadCount: 89,
    trend: 'up',
  },
  {
    id: '4',
    name: 'Brand Awareness',
    qualityScore: 42,
    responseRate: 28,
    conversionRate: 3,
    avgFirstReply: '15m 30s',
    leadCount: 523,
    trend: 'stable',
  },
];

export function LeadQualityScore() {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500' };
    if (score >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-500' };
    return { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 border-b-2 border-muted-foreground" />;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Sparkles className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle>Lead Quality Scores</CardTitle>
              <p className="text-sm text-muted-foreground">AI-powered campaign quality analysis</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TooltipProvider>
            {MOCK_CAMPAIGNS.map((campaign) => {
              const colors = getScoreColor(campaign.qualityScore);
              
              return (
                <div 
                  key={campaign.id}
                  className="p-4 rounded-xl border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Quality Score Circle */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center shrink-0 ring-2",
                          colors.bg, colors.ring
                        )}>
                          <span className={cn("text-lg font-bold", colors.text)}>
                            {campaign.qualityScore}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quality Score: {getScoreLabel(campaign.qualityScore)}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Campaign Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold truncate">{campaign.name}</h4>
                        <TrendIcon trend={campaign.trend} />
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Target className="h-3 w-3" />
                            <span className="text-xs">Leads</span>
                          </div>
                          <span className="font-medium">{campaign.leadCount}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">Response</span>
                          </div>
                          <span className="font-medium">{campaign.responseRate}%</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="text-xs">Conversion</span>
                          </div>
                          <span className="font-medium">{campaign.conversionRate}%</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">Avg Reply</span>
                          </div>
                          <span className="font-medium">{campaign.avgFirstReply}</span>
                        </div>
                      </div>

                      {/* Quality Bar */}
                      <div className="mt-3">
                        <Progress 
                          value={campaign.qualityScore} 
                          className="h-1.5" 
                        />
                      </div>
                    </div>

                    {/* Alert for low quality */}
                    {campaign.qualityScore < 50 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Low quality leads detected. Review targeting.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50">
          <h4 className="text-sm font-semibold mb-2">Quality Factors</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Response rate within 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Message engagement depth
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Conversion to qualified lead
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Follow-up response rate
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
