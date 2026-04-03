import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInboxCRMStats } from '@/hooks/useInboxCRM';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Inbox, CalendarClock, AlertTriangle, CheckCircle2,
  TrendingUp, UserX, Eye, MessageSquare, Clock,
  ArrowUpRight, Globe, Users, BarChart3, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statCards = [
  { key: 'new_today', label: 'New Today', icon: Inbox, gradient: 'from-blue-500 to-blue-600', ring: 'ring-blue-500/20', link: '/inbox/open' },
  { key: 'followup_today', label: 'Follow-up', icon: CalendarClock, gradient: 'from-amber-500 to-orange-500', ring: 'ring-amber-500/20', link: '/inbox/follow-up' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, gradient: 'from-red-500 to-rose-500', ring: 'ring-red-500/20', link: '/inbox/follow-up' },
  { key: 'converted_month', label: 'Resolved', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-500', ring: 'ring-emerald-500/20', link: '/inbox/resolved' },
] as const;

export default function InboxCRMDashboard() {
  const { stats, agentPerformance, loading } = useInboxCRMStats();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className={cn("space-y-5 animate-fade-in", isMobile ? "pb-24" : "max-w-6xl mx-auto")}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-md">
                  <BarChart3 className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h1 className={cn("font-bold tracking-tight text-foreground", isMobile ? "text-xl" : "text-2xl")}>
                    Inbox Overview
                  </h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    Team performance & lead pipeline
                    {stats?.workspace_timezone && stats.workspace_timezone !== 'UTC' && (
                      <span className="inline-flex items-center gap-0.5 text-muted-foreground/60">
                        <Globe className="h-3 w-3" />
                        {stats.workspace_timezone.replace('_', ' ').split('/').pop()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-4")}>
            {statCards.map(card => (
              <Card
                key={card.key}
                className={cn(
                  "group cursor-pointer border-border/40 hover:shadow-xl transition-all duration-300 overflow-hidden relative",
                  "hover:border-border/80 active:scale-[0.98]"
                )}
                onClick={() => navigate(card.link)}
              >
                <CardContent className={cn("relative", isMobile ? "p-3.5" : "p-5")}>
                  <div className="flex items-start justify-between mb-2.5">
                    <div className={cn(
                      "rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md ring-4",
                      card.gradient, card.ring,
                      isMobile ? "h-8 w-8" : "h-10 w-10"
                    )}>
                      <card.icon className={cn("text-white", isMobile ? "h-3.5 w-3.5" : "h-4.5 w-4.5")} />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  {loading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className={cn("font-bold tracking-tight text-foreground", isMobile ? "text-2xl" : "text-3xl")}>
                      {stats?.[card.key] ?? 0}
                    </p>
                  )}
                  <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-widest">
                    {card.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pipeline Summary Row */}
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            <PipelineCard
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              iconBg="bg-primary/10"
              label="Total Open"
              value={loading ? '—' : String(stats?.total_open ?? 0)}
              subtitle="Active conversations"
            />
            <PipelineCard
              icon={<UserX className="h-5 w-5 text-orange-500" />}
              iconBg="bg-orange-500/10"
              label="Unassigned"
              value={loading ? '—' : String(stats?.unassigned ?? 0)}
              subtitle="Needs agent attention"
              alert={(stats?.unassigned ?? 0) > 5}
            />
          </div>

          {/* Agent Performance */}
          <Card className="border-border/40 overflow-hidden">
            {/* Header */}
            <div className={cn("border-b bg-gradient-to-r from-muted/40 to-transparent", isMobile ? "px-4 py-3.5" : "px-6 py-4")}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Users className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Agent Performance</h3>
                  <p className="text-[11px] text-muted-foreground">Today's activity & response metrics</p>
                </div>
                {!loading && agentPerformance.length > 0 && (
                  <Badge variant="outline" className="ml-auto text-[10px] h-5 font-medium">
                    {agentPerformance.length} agent{agentPerformance.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Table Header (desktop) */}
            {!isMobile && !loading && agentPerformance.length > 0 && (
              <div className="px-6 py-2 border-b bg-muted/20 grid grid-cols-12 gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <div className="col-span-4">Agent</div>
                <div className="col-span-2 text-center">Opened / Assigned</div>
                <div className="col-span-2 text-center">Replied</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1 text-center">Won</div>
                <div className="col-span-1 text-center">Open</div>
                <div className="col-span-1 text-center">Overdue</div>
              </div>
            )}

            {/* Content */}
            <div className={cn(isMobile ? "px-3 py-2" : "px-4 py-2")}>
              {loading ? (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : agentPerformance.length === 0 ? (
                <div className="text-center py-16">
                  <div className="h-14 w-14 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No agent data available</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Agent stats appear when conversations are assigned</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {agentPerformance.map((agent, idx) => (
                    <AgentRow key={agent.agent_id} agent={agent} idx={idx} total={agentPerformance.length} isMobile={isMobile} getInitials={getInitials} />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}

/* ---- Sub-components ---- */

function PipelineCard({ icon, iconBg, label, value, subtitle, alert }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; subtitle: string; alert?: boolean;
}) {
  return (
    <Card className={cn("border-border/40", alert && "border-orange-300/60")}>
      <CardContent className="p-4 flex items-center gap-3.5">
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {alert && <Zap className="h-3.5 w-3.5 text-orange-500 animate-pulse" />}
          </div>
          <p className="text-[10px] text-muted-foreground/60">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentRow({ agent, idx, total, isMobile, getInitials }: {
  agent: any; idx: number; total: number; isMobile: boolean; getInitials: (n: string) => string;
}) {
  const todayTotal = agent.total_today_assigned || 0;
  const todayOpened = agent.today_opened || 0;
  const todayReplied = agent.today_replied || 0;
  const openRate = todayTotal > 0 ? Math.round((todayOpened / todayTotal) * 100) : 0;

  const avatarGradient =
    idx === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
    idx === 1 ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
    idx === 2 ? "bg-gradient-to-br from-purple-500 to-pink-500" :
    "bg-gradient-to-br from-slate-500 to-slate-600";

  const replyColor =
    todayOpened === 0 ? 'text-muted-foreground' :
    (todayReplied / todayOpened) >= 0.8 ? 'text-emerald-600' :
    (todayReplied / todayOpened) >= 0.5 ? 'text-amber-600' : 'text-red-500';

  if (isMobile) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/40">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 shadow-sm">
            <AvatarFallback className={cn("text-xs font-bold text-white", avatarGradient)}>
              {getInitials(agent.agent_name)}
            </AvatarFallback>
          </Avatar>
          {idx === 0 && total > 1 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center">
              <span className="text-[7px] font-bold">★</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-semibold truncate">{agent.agent_name}</p>
            {idx === 0 && total > 1 && (
              <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 border-amber-200">Top</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span className="font-semibold text-foreground">{todayOpened}</span>
              <span>/ {todayTotal}</span>
            </span>
            <span className={cn("inline-flex items-center gap-1", replyColor)}>
              <MessageSquare className="h-3 w-3" />
              <span className="font-semibold">{todayReplied}</span>
            </span>
          </div>
          {todayTotal > 0 && <Progress value={openRate} className="h-1 mt-1.5" />}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <MetricPill value={agent.assigned_count} label="All" />
          <MetricPill value={agent.converted_count} label="Won" color="text-emerald-600" />
          {agent.overdue_count > 0 && (
            <Badge className="bg-red-50 text-red-600 border-red-200 text-[9px] px-1 h-5 gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {agent.overdue_count}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Desktop row
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl hover:bg-muted/25 transition-all border border-transparent hover:border-border/40 group">
      {/* Agent */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9 shadow-sm ring-2 ring-background">
            <AvatarFallback className={cn("text-[10px] font-bold text-white", avatarGradient)}>
              {getInitials(agent.agent_name)}
            </AvatarFallback>
          </Avatar>
          {idx === 0 && total > 1 && (
            <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-amber-400 border-[1.5px] border-background flex items-center justify-center">
              <span className="text-[6px] font-bold">★</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">{agent.agent_name}</p>
            {idx === 0 && total > 1 && (
              <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 border-amber-200 shrink-0">Top</Badge>
            )}
          </div>
          {todayTotal > 0 && <Progress value={openRate} className="h-1 mt-1" />}
        </div>
      </div>

      {/* Opened / Assigned */}
      <div className="col-span-2 text-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="font-bold text-foreground">{todayOpened}</span>
              <span className="text-muted-foreground">/ {todayTotal}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>Chats opened today out of {todayTotal} assigned</TooltipContent>
        </Tooltip>
      </div>

      {/* Replied */}
      <div className="col-span-2 text-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("inline-flex items-center gap-1 text-xs", replyColor)}>
              <MessageSquare className="h-3 w-3" />
              <span className="font-bold">{todayReplied}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>Replied today</TooltipContent>
        </Tooltip>
      </div>

      {/* Total */}
      <div className="col-span-1 text-center">
        <p className="text-sm font-bold text-foreground">{agent.assigned_count}</p>
      </div>

      {/* Won */}
      <div className="col-span-1 text-center">
        <p className="text-sm font-bold text-emerald-600">{agent.converted_count}</p>
      </div>

      {/* Open */}
      <div className="col-span-1 text-center">
        <p className="text-sm font-bold text-foreground">{agent.pending_count}</p>
      </div>

      {/* Overdue */}
      <div className="col-span-1 text-center">
        {agent.overdue_count > 0 ? (
          <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px] px-1.5 h-5 gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {agent.overdue_count}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground/40">—</span>
        )}
      </div>
    </div>
  );
}

function MetricPill({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="text-center px-1.5">
      <p className={cn("text-xs font-bold", color || "text-foreground")}>{value}</p>
      <p className="text-[8px] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
