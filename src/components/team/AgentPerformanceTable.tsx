import { useState } from 'react';
import { useAgentPerformance } from '@/hooks/useAgentPerformance';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  RefreshCw, Loader2, Activity, Clock, MessageSquare, 
  MousePointerClick, Reply, UserCheck, TrendingUp, Award,
  AlertCircle, Zap, Users, Timer
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const PERIOD_OPTIONS = [
  { value: 1, label: 'Today' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
];

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-[11px] text-muted-foreground font-medium truncate">{label}</p>
            {subtext && <p className="text-[10px] text-muted-foreground/60">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResponseBadge({ minutes }: { minutes: number }) {
  if (minutes <= 0) return <span className="text-xs text-muted-foreground">—</span>;
  
  const color = minutes > 30 ? 'bg-destructive/10 text-destructive border-destructive/20' 
    : minutes > 10 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
    : 'bg-primary/10 text-primary border-primary/20';
  
  return (
    <Badge variant="outline" className={cn("text-[11px] font-mono font-semibold gap-1 px-2", color)}>
      <Timer className="h-3 w-3" />
      {minutes.toFixed(0)}m
    </Badge>
  );
}

export function AgentPerformanceTable() {
  const [days, setDays] = useState(7);
  const { agents, loading, error, refetch } = useAgentPerformance(days);

  const topPerformer = agents.length > 0 
    ? agents.reduce((best, a) => a.chats_replied > best.chats_replied ? a : best, agents[0])
    : null;

  const totalReplies = agents.reduce((sum, a) => sum + a.chats_replied, 0);
  const totalOpened = agents.reduce((sum, a) => sum + a.chats_opened, 0);
  const totalHours = agents.reduce((sum, a) => sum + a.total_hours_worked, 0);
  const onlineCount = agents.filter(a => a.is_online).length;

  return (
    <div className="space-y-5">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Agent Performance</h2>
            <p className="text-xs text-muted-foreground">Detailed activity metrics per agent</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Period pills */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                  days === opt.value
                    ? "bg-background text-foreground shadow-sm border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={loading}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading performance data...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load data</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={Users}
              label="Online Now"
              value={onlineCount}
              subtext={`of ${agents.length} agents`}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={Clock}
              label="Total Hours"
              value={`${totalHours.toFixed(0)}h`}
              subtext={`Last ${days === 1 ? 'day' : `${days} days`}`}
              color="bg-blue-500/10 text-blue-600"
            />
            <StatCard
              icon={Reply}
              label="Total Replies"
              value={totalReplies}
              color="bg-violet-500/10 text-violet-600"
            />
            <StatCard
              icon={MousePointerClick}
              label="Chats Opened"
              value={totalOpened}
              color="bg-amber-500/10 text-amber-600"
            />
          </div>

          {/* Top Performer */}
          {topPerformer && topPerformer.chats_replied > 0 && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent overflow-hidden">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
                  <AvatarImage src={topPerformer.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {topPerformer.agent_name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{topPerformer.agent_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Top performer — {topPerformer.chats_replied} replies · {topPerformer.total_hours_worked.toFixed(1)}h worked
                  </p>
                </div>
                <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 shrink-0 hidden sm:flex gap-1">
                  <Zap className="h-3 w-3" /> MVP
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Agent List */}
          {agents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                  <Activity className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="font-semibold text-base mb-1">No Agent Data</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Agent activity will appear here once agents start working in this workspace.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-border/50">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_0.8fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-2 px-4 py-3 bg-muted/30 border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Agent</span>
                <span>Status</span>
                <span>Last Login</span>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Hours
                  </TooltipTrigger>
                  <TooltipContent>Total hours worked in period</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <MousePointerClick className="h-3 w-3" /> Opened
                  </TooltipTrigger>
                  <TooltipContent>Chats opened / viewed</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Reply className="h-3 w-3" /> Replied
                  </TooltipTrigger>
                  <TooltipContent>Messages sent (excl. auto-replies)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Claimed
                  </TooltipTrigger>
                  <TooltipContent>Leads claimed / picked up</TooltipContent>
                </Tooltip>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Open
                </span>
                <span>Avg Response</span>
              </div>

              {/* Agent rows */}
              <div className="divide-y divide-border/40">
                {agents.map((agent) => {
                  const replyRate = agent.chats_opened > 0 
                    ? Math.round((agent.chats_replied / agent.chats_opened) * 100) 
                    : 0;

                  return (
                    <div key={agent.agent_id} className="group hover:bg-muted/20 transition-colors">
                      {/* Desktop row */}
                      <div className="hidden md:grid grid-cols-[2fr_0.8fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-2 px-4 py-3 items-center">
                        {/* Agent */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={agent.avatar_url || ''} />
                              <AvatarFallback className="text-xs font-semibold bg-muted">
                                {agent.agent_name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                              agent.is_online ? "bg-green-500" : "bg-muted-foreground/30"
                            )} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{agent.agent_name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{agent.agent_email}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold",
                              agent.is_online 
                                ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                : "bg-muted/50 text-muted-foreground border-border/50"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full mr-1",
                              agent.is_online ? "bg-green-500" : "bg-muted-foreground/40"
                            )} />
                            {agent.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>

                        {/* Last Login */}
                        <p className="text-xs text-muted-foreground">
                          {agent.last_login_at 
                            ? formatDistanceToNow(new Date(agent.last_login_at), { addSuffix: true })
                            : '—'
                          }
                        </p>

                        {/* Hours */}
                        <div>
                          <p className="font-mono text-sm font-semibold">{agent.total_hours_worked.toFixed(1)}h</p>
                          <p className="text-[10px] text-muted-foreground">~{agent.avg_daily_hours.toFixed(1)}h/day</p>
                        </div>

                        {/* Opened */}
                        <p className="font-mono text-sm">{agent.chats_opened}</p>

                        {/* Replied */}
                        <div>
                          <p className="font-mono text-sm font-semibold">{agent.chats_replied}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Progress value={replyRate} className="h-1 w-12" />
                            <span className="text-[10px] text-muted-foreground">{replyRate}%</span>
                          </div>
                        </div>

                        {/* Claimed */}
                        <p className="font-mono text-sm">{agent.conversations_claimed}</p>

                        {/* Open Chats */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm">{agent.current_open_chats}</span>
                        </div>

                        {/* Avg Response */}
                        <ResponseBadge minutes={agent.avg_response_minutes} />
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={agent.avatar_url || ''} />
                              <AvatarFallback className="text-sm font-semibold bg-muted">
                                {agent.agent_name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                              agent.is_online ? "bg-green-500" : "bg-muted-foreground/30"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{agent.agent_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{agent.agent_email}</p>
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-[10px] shrink-0",
                              agent.is_online 
                                ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                : ""
                            )}
                          >
                            {agent.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="font-mono text-sm font-bold">{agent.total_hours_worked.toFixed(1)}h</p>
                            <p className="text-[10px] text-muted-foreground">Hours</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="font-mono text-sm font-bold">{agent.chats_opened}</p>
                            <p className="text-[10px] text-muted-foreground">Opened</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="font-mono text-sm font-bold">{agent.chats_replied}</p>
                            <p className="text-[10px] text-muted-foreground">Replied</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="font-mono text-sm font-bold">{agent.current_open_chats}</p>
                            <p className="text-[10px] text-muted-foreground">Open</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Last login: {agent.last_login_at 
                              ? formatDistanceToNow(new Date(agent.last_login_at), { addSuffix: true })
                              : 'Never'}
                          </span>
                          <ResponseBadge minutes={agent.avg_response_minutes} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
