import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInboxCRMStats } from '@/hooks/useInboxCRM';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Inbox, CalendarClock, AlertTriangle, CheckCircle2, 
  TrendingUp, UserX, Eye, MessageSquare, Clock,
  ArrowUpRight, Sparkles, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statCards = [
  { key: 'new_today', label: 'New Today', icon: Inbox, gradient: 'from-blue-500 to-blue-600', bgGlow: 'bg-blue-500/10', link: '/inbox/open' },
  { key: 'followup_today', label: 'Follow-up', icon: CalendarClock, gradient: 'from-amber-500 to-orange-500', bgGlow: 'bg-amber-500/10', link: '/inbox/follow-up' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, gradient: 'from-red-500 to-rose-500', bgGlow: 'bg-red-500/10', link: '/inbox/follow-up' },
  { key: 'converted_month', label: 'Resolved', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-500', bgGlow: 'bg-emerald-500/10', link: '/inbox/resolved' },
] as const;

export default function InboxCRMDashboard() {
  const { stats, agentPerformance, loading } = useInboxCRMStats();
  const navigate = useNavigate();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getResponseColor = (replied: number, opened: number) => {
    if (opened === 0) return 'text-muted-foreground';
    const ratio = replied / opened;
    if (ratio >= 0.8) return 'text-emerald-600';
    if (ratio >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              Team performance & lead pipeline
              {stats?.workspace_timezone && stats.workspace_timezone !== 'UTC' && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
                  <Globe className="h-3 w-3" />
                  {stats.workspace_timezone.replace('_', ' ').split('/').pop()}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(card => (
            <Card 
              key={card.key} 
              className="group cursor-pointer border-border/40 hover:border-border/80 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
              onClick={() => navigate(card.link)}
            >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", card.bgGlow)} />
              <CardContent className="p-4 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", card.gradient)}>
                    <card.icon className="h-4 w-4 text-white" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {stats?.[card.key] ?? 0}
                  </p>
                )}
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Total Open</p>
                <p className="text-xl font-bold text-foreground">{loading ? '...' : stats?.total_open ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <UserX className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Unassigned</p>
                <p className="text-xl font-bold text-foreground">{loading ? '...' : stats?.unassigned ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance - Premium Design */}
        <Card className="border-border/40 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Agent Performance</h3>
                <p className="text-[11px] text-muted-foreground">Today's activity & lead pipeline</p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : agentPerformance.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <UserX className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No agent data available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agentPerformance.map((agent, idx) => {
                  const todayTotal = agent.total_today_assigned || 0;
                  const todayOpened = agent.today_opened || 0;
                  const todayReplied = agent.today_replied || 0;
                  const openRate = todayTotal > 0 ? Math.round((todayOpened / todayTotal) * 100) : 0;

                  return (
                    <div 
                      key={agent.agent_id} 
                      className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all duration-200"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarFallback className={cn(
                            "text-xs font-bold text-white",
                            idx === 0 ? "bg-gradient-to-br from-primary to-emerald-500" :
                            idx === 1 ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                            "bg-gradient-to-br from-slate-500 to-slate-600"
                          )}>
                            {getInitials(agent.agent_name)}
                          </AvatarFallback>
                        </Avatar>
                        {idx === 0 && agentPerformance.length > 1 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center">
                            <span className="text-[8px] font-bold text-amber-900">★</span>
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">{agent.agent_name}</p>
                          {idx === 0 && agentPerformance.length > 1 && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200">Top</Badge>
                          )}
                        </div>

                        {/* Today's Activity Bar */}
                        <div className="flex items-center gap-3 text-[11px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span className="font-medium text-foreground">{todayOpened}</span>
                                {todayTotal > 0 && <span>/ {todayTotal}</span>}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Chats opened today out of {todayTotal} assigned</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={cn("inline-flex items-center gap-1", getResponseColor(todayReplied, todayOpened))}>
                                <MessageSquare className="h-3 w-3" />
                                <span className="font-medium">{todayReplied}</span>
                                <span className="text-muted-foreground">replied</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Messages replied today</TooltipContent>
                          </Tooltip>

                          {todayTotal > 0 && (
                            <div className="flex-1 max-w-[80px]">
                              <Progress value={openRate} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pipeline Stats */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center px-2">
                              <p className="text-sm font-bold text-foreground">{agent.assigned_count}</p>
                              <p className="text-[9px] text-muted-foreground uppercase">Total</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Total assigned conversations</TooltipContent>
                        </Tooltip>

                        <div className="h-6 w-px bg-border/50" />

                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center px-2">
                              <p className="text-sm font-bold text-emerald-600">{agent.converted_count}</p>
                              <p className="text-[9px] text-muted-foreground uppercase">Won</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Converted leads</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-center px-2">
                              <p className="text-sm font-bold text-foreground">{agent.pending_count}</p>
                              <p className="text-[9px] text-muted-foreground uppercase">Open</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Pending conversations</TooltipContent>
                        </Tooltip>

                        {agent.overdue_count > 0 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px] px-1.5 h-5 gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {agent.overdue_count}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Overdue follow-ups</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
