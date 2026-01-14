import { useMemo } from 'react';
import { Contact } from '@/types/contact';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Zap,
  MessageSquare,
  MousePointerClick,
  Calendar,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementScoreCardProps {
  contact: Contact;
  showDetails?: boolean;
}

interface EngagementMetric {
  name: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  weight: number;
}

export function EngagementScoreCard({ contact, showDetails = false }: EngagementScoreCardProps) {
  const engagementData = useMemo(() => {
    // Calculate engagement score based on various factors
    const metrics: EngagementMetric[] = [
      {
        name: 'Recency',
        value: contact.last_seen 
          ? Math.max(0, 100 - Math.floor((Date.now() - new Date(contact.last_seen).getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
        max: 100,
        icon: <Calendar className="h-3 w-3" />,
        weight: 0.3,
      },
      {
        name: 'Response Rate',
        value: contact.mau_status === 'active' ? 85 : contact.mau_status === 'inactive' ? 40 : 15,
        max: 100,
        icon: <MessageSquare className="h-3 w-3" />,
        weight: 0.25,
      },
      {
        name: 'Interaction Quality',
        value: (contact.sentiment_score ?? 50) + 50,
        max: 100,
        icon: <MousePointerClick className="h-3 w-3" />,
        weight: 0.25,
      },
      {
        name: 'Lifecycle Stage',
        value: contact.lead_status === 'won' ? 100 : 
               contact.lead_status === 'negotiation' ? 80 :
               contact.lead_status === 'proposal' ? 60 :
               contact.lead_status === 'qualified' ? 45 :
               contact.lead_status === 'contacted' ? 30 : 15,
        max: 100,
        icon: <Star className="h-3 w-3" />,
        weight: 0.2,
      },
    ];

    const totalScore = Math.round(
      metrics.reduce((acc, m) => acc + (m.value / m.max) * m.weight * 100, 0)
    );

    // Determine trend (mock - in real app this would compare historical data)
    const trend = contact.mau_status === 'active' ? 'up' : 
                  contact.mau_status === 'churned' ? 'down' : 'stable';

    // Determine tier
    const tier = totalScore >= 80 ? 'Champion' :
                 totalScore >= 60 ? 'Engaged' :
                 totalScore >= 40 ? 'Warming' :
                 totalScore >= 20 ? 'Cold' : 'At Risk';

    const tierColor = totalScore >= 80 ? 'text-emerald-600 bg-emerald-100' :
                      totalScore >= 60 ? 'text-blue-600 bg-blue-100' :
                      totalScore >= 40 ? 'text-amber-600 bg-amber-100' :
                      totalScore >= 20 ? 'text-orange-600 bg-orange-100' : 'text-red-600 bg-red-100';

    return { metrics, totalScore, trend, tier, tierColor };
  }, [contact]);

  const TrendIcon = engagementData.trend === 'up' ? TrendingUp :
                    engagementData.trend === 'down' ? TrendingDown : Minus;

  const trendColor = engagementData.trend === 'up' ? 'text-emerald-600' :
                     engagementData.trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <div className="space-y-4">
      {/* Main Score Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
              <TrendIcon className={cn("h-4 w-4", trendColor)} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{engagementData.totalScore}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Badge className={cn("text-xs font-medium", engagementData.tierColor)}>
              {engagementData.tier}
            </Badge>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-right cursor-help">
                <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  {engagementData.trend === 'up' ? '+12%' : 
                   engagementData.trend === 'down' ? '-8%' : '0%'}
                </div>
                <span className="text-xs text-muted-foreground">vs last 30d</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Engagement trend compared to previous period</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress 
          value={engagementData.totalScore} 
          className="h-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>At Risk</span>
          <span>Champion</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {engagementData.metrics.map((metric) => (
            <div key={metric.name} className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                {metric.icon}
                <span className="text-xs font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-1.5 flex-1" 
                />
                <span className="text-xs font-medium w-8 text-right">
                  {Math.round((metric.value / metric.max) * 100)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
