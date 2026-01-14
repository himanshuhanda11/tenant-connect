import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  Clock, 
  Star,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentMetrics {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  metrics: {
    conversations: number;
    avgResponseTime: string;
    csat: number;
    resolutionRate: number;
    slaBreaches: number;
  };
  trend: 'up' | 'down' | 'stable';
  rank: number;
}

const MOCK_AGENTS: AgentMetrics[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    isOnline: true,
    metrics: {
      conversations: 127,
      avgResponseTime: '1m 24s',
      csat: 4.8,
      resolutionRate: 94,
      slaBreaches: 0,
    },
    trend: 'up',
    rank: 1,
  },
  {
    id: '2',
    name: 'Ahmed Hassan',
    isOnline: true,
    metrics: {
      conversations: 98,
      avgResponseTime: '2m 15s',
      csat: 4.6,
      resolutionRate: 89,
      slaBreaches: 2,
    },
    trend: 'stable',
    rank: 2,
  },
  {
    id: '3',
    name: 'Maria Garcia',
    isOnline: false,
    metrics: {
      conversations: 156,
      avgResponseTime: '1m 48s',
      csat: 4.7,
      resolutionRate: 92,
      slaBreaches: 1,
    },
    trend: 'up',
    rank: 3,
  },
  {
    id: '4',
    name: 'John Smith',
    isOnline: true,
    metrics: {
      conversations: 45,
      avgResponseTime: '4m 30s',
      csat: 4.1,
      resolutionRate: 78,
      slaBreaches: 5,
    },
    trend: 'down',
    rank: 4,
  },
];

export function AgentPerformanceCard() {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-amber-500" />;
    return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Agent Performance
          </CardTitle>
          <Badge variant="outline">Last 7 days</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TooltipProvider>
            {MOCK_AGENTS.map((agent) => (
              <div 
                key={agent.id}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:border-primary/50",
                  agent.rank === 1 && "bg-gradient-to-r from-amber-50 to-transparent border-amber-200"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankBadge(agent.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                      agent.isOnline ? "bg-green-500" : "bg-slate-400"
                    )} />
                  </div>

                  {/* Name & Trend */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{agent.name}</p>
                      {agent.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {agent.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {agent.metrics.conversations}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Conversations handled</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {agent.metrics.avgResponseTime}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Avg response time</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {agent.metrics.csat}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>CSAT score</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Performance Bars */}
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Resolution</span>
                        <span className="font-medium">{agent.metrics.resolutionRate}%</span>
                      </div>
                      <Progress value={agent.metrics.resolutionRate} className="h-1.5" />
                    </div>

                    {/* SLA Status */}
                    {agent.metrics.slaBreaches === 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        SLA OK
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-0">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {agent.metrics.slaBreaches} breach{agent.metrics.slaBreaches > 1 ? 'es' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
