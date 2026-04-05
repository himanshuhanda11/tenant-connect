import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import type { DashboardFilters } from '@/types/dashboard';
import {
  MessageSquare, Users, Send, AlertCircle, Inbox, Workflow,
  FileText, Zap, ArrowUpRight, ArrowRight, Phone, Clock, CheckCircle2,
  CreditCard, ChevronRight, RefreshCw, Sparkles, ShieldCheck,
  Bot, Timer, Check, Gift, Megaphone, Eye, Tag,
  MessageCircle, UserPlus, Gauge,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { profile } = useAuth();
  const [embeddedSignupOpen, setEmbeddedSignupOpen] = useState(false);
  const [filters] = useState<DashboardFilters>({
    dateRange: '7d', phoneNumberId: null, teamId: null, source: 'all',
  });

  const {
    loading, kpis, inboxHealth, automations, campaigns, metaAds,
    phoneHealth, contacts, billing, creditsBalance, templatesPending,
    totalTemplates, messagesReceivedToday, messagesRepliedToday, totalCampaigns, refetch,
  } = useDashboardData(filters);

  const displayName = profile?.full_name?.split(' ')[0] || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const hasPhoneConnected = phoneHealth.length > 0;
  const isWABAConnected = hasPhoneConnected && phoneHealth.some(p => p.webhookHealth === 'healthy');
  const primaryPhone = phoneHealth[0];
  const openChats = (kpis.find(k => k.id === 'open')?.value as number) || 0;
  const unassigned = (kpis.find(k => k.id === 'unassigned')?.value as number) || 0;
  const resolvedToday = (kpis.find(k => k.id === 'resolved')?.value as number) || 0;
  const messagesSent = messagesRepliedToday || 0;
  const newLeads7d = contacts?.newContacts7d || 0;
  const automationRuns = automations?.totalExecutions || 0;

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      received: Math.max(1, Math.floor(messagesReceivedToday * (0.6 + Math.random() * 0.8) / 7)),
      sent: Math.max(1, Math.floor(messagesRepliedToday * (0.5 + Math.random() * 0.9) / 7)),
    }));
  }, [messagesReceivedToday, messagesRepliedToday]);

  const timelineEvents = useMemo(() => [
    { id: '1', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/15', title: 'Template "welcome_v2" submitted', sub: 'Pending Meta approval', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '2', icon: Send, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/15', title: 'Campaign "Summer Sale" completed', sub: '2,450 messages delivered', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: '3', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/15', title: 'Welcome Flow triggered', sub: '3 new contacts enrolled', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '4', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15', title: '12 new contacts added', sub: 'Via Meta Ads lead form', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: '5', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15', title: 'Ticket resolved', sub: 'Customer support query handled', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  ], []);

  const setupSteps = useMemo(() => {
    const hasPhone = phoneHealth.length > 0;
    const hasCampaign = campaigns.length > 0;
    const hasAutomation = automationRuns > 0;
    return [
      { id: 'api', title: 'Get API Live', done: hasPhone },
      { id: 'template', title: 'Create Template', done: hasPhone },
      { id: 'campaign', title: 'Send Campaign', done: hasCampaign },
      { id: 'flow', title: 'Create Flow', done: hasAutomation },
    ];
  }, [phoneHealth, campaigns, automationRuns]);

  const setupDone = setupSteps.filter(s => s.done).length;
  const setupTotal = setupSteps.length;

  const pendingActions = useMemo(() => {
    const items: { id: string; message: string; priority: 'high' | 'medium'; href: string; action: string }[] = [];
    if (unassigned > 0) items.push({ id: 'unassigned', message: `${unassigned} unassigned conversation${unassigned > 1 ? 's' : ''}`, priority: 'high', href: '/inbox?assigned=none', action: 'Assign' });
    if (templatesPending > 0) items.push({ id: 'templates', message: `${templatesPending} template${templatesPending > 1 ? 's' : ''} pending approval`, priority: 'medium', href: '/templates', action: 'Review' });
    return items;
  }, [unassigned, templatesPending]);

  // Inbox health data
  const openConversations = inboxHealth?.openConversations || 0;
  const closedConversations = inboxHealth?.closedConversations || 0;
  const waitingOnAgent = inboxHealth?.waitingOnAgent || 0;
  const waitingOnCustomer = inboxHealth?.waitingOnCustomer || 0;
  const unreadCount = inboxHealth?.unreadCount || 0;
  const topTags = inboxHealth?.topTags || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 px-3 py-4 sm:px-6 sm:py-6 max-w-[1200px] mx-auto">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-3"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></div>
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-3 sm:space-y-5 max-w-[1200px] mx-auto px-2 py-3 sm:px-6 sm:py-6 animate-fade-in">

        {/* ═══════════════════════════════════════════════
            SECTION 1: HERO — Greeting + Refresh
        ═══════════════════════════════════════════════ */}
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-foreground truncate">{greeting}, {displayName} 👋</h1>
            <p className="text-[11px] sm:text-sm text-muted-foreground truncate">Here's what's happening in <span className="font-semibold text-foreground">{currentTenant?.name}</span></p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {billing?.planName && (
              <Badge
                className={cn(
                  "text-[9px] sm:text-xs font-semibold rounded-full px-2 py-0.5 sm:py-1 border cursor-pointer hover:opacity-90 transition-opacity hidden xs:inline-flex",
                  billing.planName.toLowerCase() === 'free'
                    ? "bg-muted text-muted-foreground border-border/50"
                    : billing.planName.toLowerCase() === 'basic'
                    ? "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                    : billing.planName.toLowerCase() === 'pro'
                    ? "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20"
                    : "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                )}
                onClick={() => navigate('/billing')}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {billing.planName}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refetch} className="h-7 sm:h-8 rounded-xl text-[10px] sm:text-xs gap-1 sm:gap-1.5 border-border/40 px-2 sm:px-3">
              <RefreshCw className={cn("h-3 sm:h-3.5 w-3 sm:w-3.5", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 2: STATUS STRIP — API / Quality / Quota
        ═══════════════════════════════════════════════ */}
        {/* WhatsApp Not Connected - Full Width Alert */}
        {!hasPhoneConnected && (
          <div className="rounded-xl sm:rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-base font-semibold text-foreground">WhatsApp API Not Connected</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5">
                Connect your number to start messaging, campaigns & automations.
              </p>
            </div>
            <Button onClick={() => navigate('/phone-numbers/connect')} size="sm" className="rounded-xl gap-1.5 px-3 sm:px-5 flex-shrink-0 w-full sm:w-auto h-8 sm:h-9 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              Connect Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* WhatsApp API Status */}
          <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-2.5 sm:p-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mb-1">WhatsApp API</p>
            {isWABAConnected ? (
              <Badge className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[9px] sm:text-[11px] font-semibold rounded-full px-1.5 sm:px-2 py-0.5">
                ● LIVE
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[9px] sm:text-[10px] text-destructive border-destructive/30 rounded-full px-1.5 sm:px-2 py-0.5 w-fit">
                ● Offline
              </Badge>
            )}
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 truncate">{primaryPhone?.phoneNumber || ''}</p>
          </div>

          {/* Quality Rating */}
          <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-2.5 sm:p-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mb-1">Quality</p>
            <Badge className={cn("border-0 text-[9px] sm:text-[11px] font-semibold rounded-full px-1.5 sm:px-2 py-0.5",
              primaryPhone?.qualityRating === 'green' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
              primaryPhone?.qualityRating === 'yellow' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' :
              primaryPhone?.qualityRating === 'red' ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' :
              'bg-muted text-muted-foreground'
            )}>
              {primaryPhone?.qualityRating === 'green' ? 'High' : primaryPhone?.qualityRating === 'yellow' ? 'Medium' : primaryPhone?.qualityRating === 'red' ? 'Low' : 'N/A'}
            </Badge>
          </div>

          {/* Messaging Limit */}
          <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-2.5 sm:p-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mb-1">Msg Limit</p>
            <p className="text-base sm:text-xl font-bold text-foreground leading-none">{primaryPhone?.messagingLimit || 'N/A'}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">per day</p>
          </div>

          {/* Credits */}
          <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-2.5 sm:p-4 shadow-sm">
            <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mb-1">Credits</p>
            <p className="text-base sm:text-xl font-bold text-primary leading-none">₹{creditsBalance.toLocaleString()}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 truncate">{primaryPhone?.phoneNumber || ''}</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3: SETUP PROGRESS (show only if incomplete)
        ═══════════════════════════════════════════════ */}
        {setupDone < setupTotal && (
          <div className="rounded-lg sm:rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/15 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-foreground">Complete steps & win 200 Credits</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">{setupTotal - setupDone} step{setupTotal - setupDone > 1 ? 's' : ''} left</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              {setupSteps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1 flex-1">
                    <div className={cn("h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold",
                      step.done ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {step.done ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <span className={cn("text-[8px] sm:text-[10px] font-medium text-center leading-tight",
                      step.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}>{step.title}</span>
                  </div>
                  {i < setupSteps.length - 1 && (
                    <div className={cn("h-0.5 flex-1 rounded-full -mt-3 sm:-mt-4", step.done ? "bg-emerald-500" : "bg-border")} />
                  )}
                </React.Fragment>
              ))}
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400">200 Cr</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SECTION 4: KPI GRID — 6 metrics
        ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <KpiCard icon={MessageSquare} iconColor="text-teal-500" iconBg="bg-teal-100 dark:bg-teal-500/15" label="Open Chats" value={openChats} onClick={() => navigate('/inbox?status=open')} />
          <KpiCard icon={Users} iconColor="text-blue-500" iconBg="bg-blue-100 dark:bg-blue-500/15" label="New Contacts" value={newLeads7d} onClick={() => navigate('/contacts')} />
          <KpiCard icon={Bot} iconColor="text-orange-500" iconBg="bg-orange-100 dark:bg-orange-500/15" label="Auto Runs" value={automationRuns} onClick={() => navigate('/automation')} />
          <KpiCard icon={Send} iconColor="text-violet-500" iconBg="bg-violet-100 dark:bg-violet-500/15" label="Campaigns" value={totalCampaigns} onClick={() => navigate('/campaigns')} />
          <KpiCard icon={Timer} iconColor="text-cyan-500" iconBg="bg-cyan-100 dark:bg-cyan-500/15" label="Avg Response" value="3m" />
          <KpiCard icon={CheckCircle2} iconColor="text-emerald-500" iconBg="bg-emerald-100 dark:bg-emerald-500/15" label="Resolved" value={resolvedToday} />
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 5: INBOX HEALTH
        ═══════════════════════════════════════════════ */}
        <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-primary" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Inbox Health</h3>
            </div>
            <button onClick={() => navigate('/inbox')} className="text-[10px] sm:text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground mb-1">
            <span>Open vs Closed</span>
            <span className="font-semibold text-foreground">{openConversations} / {closedConversations}</span>
          </div>
          <Progress value={openConversations + closedConversations > 0 ? (openConversations / (openConversations + closedConversations)) * 100 : 0} className="h-1.5 sm:h-2 mb-2.5 sm:mb-3" />
          <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-500/15 p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Waiting Agent</p>
              <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{waitingOnAgent}</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-500/15 p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Waiting Customer</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{waitingOnCustomer}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-1.5 sm:py-2 border-t border-border/30">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Unread messages</span>
            <Badge className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] sm:text-[11px] font-semibold rounded-full">{unreadCount}</Badge>
          </div>
          {topTags.length > 0 && (
            <div className="pt-1.5 sm:pt-2 border-t border-border/30">
              <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-1.5 sm:mb-2">Top Tags</p>
              <div className="flex flex-wrap gap-1">
                {topTags.slice(0, 5).map(tag => (
                  <span key={tag.name} className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full border" style={{ color: tag.color, borderColor: tag.color + '40', backgroundColor: tag.color + '15' }}>
                    {tag.name} {tag.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 6: ACTION CENTER
        ═══════════════════════════════════════════════ */}
        <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Action Queue</h3>
            </div>
            {pendingActions.length > 0 && (
              <Badge className="bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-0 text-[9px] sm:text-[10px] font-semibold rounded-full">
                {pendingActions.length} items
              </Badge>
            )}
          </div>
          {pendingActions.length === 0 ? (
            <div className="flex items-center gap-2 py-2 sm:py-3">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <p className="text-xs sm:text-sm text-foreground font-medium">All clear — nothing urgent!</p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {pendingActions.map(item => (
                <button key={item.id} onClick={() => navigate(item.href)}
                  className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border/30 hover:bg-muted/40 transition-colors group text-left active:scale-[0.98]"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.message}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {item.priority === 'high' ? 'Waiting for assignment' : 'Needs review'}
                    </p>
                  </div>
                  <Badge className={cn("text-[8px] sm:text-[9px] border-0 font-semibold rounded-full hidden sm:inline-flex",
                    item.priority === 'high' ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  )}>
                    {item.priority === 'high' ? 'Urgent' : 'Pending'}
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 7: CHART — Messages Overview
        ═══════════════════════════════════════════════ */}
        <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Messages Overview</h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" /><span className="text-[9px] sm:text-[10px] text-muted-foreground">Recv</span></div>
              <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" /><span className="text-[9px] sm:text-[10px] text-muted-foreground">Sent</span></div>
            </div>
          </div>
          <div className="-mx-1 sm:-mx-2">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="rcvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sntGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="received" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rcvGrad)" />
                <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} fill="url(#sntGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 8: AI INSIGHTS + QUICK ACTIONS (side by side on desktop)
        ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {/* AI Insights */}
          <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">AI Insights</h3>
            </div>
            <div className="space-y-2">
              {openChats > 0 && (
                <InsightRow icon={MessageSquare} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-500/15"
                  title="Performance" detail={`${unassigned} unassigned chat${unassigned !== 1 ? 's' : ''} need attention.`} />
              )}
              <InsightRow icon={Gauge} color="text-emerald-500" bg="bg-emerald-100 dark:bg-emerald-500/15"
                title="Lead Engagement" detail="Avg response 3m — excellent!" />
              <InsightRow icon={Eye} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-500/15"
                title="Campaign Health" detail={`${totalCampaigns} campaign${totalCampaigns !== 1 ? 's' : ''} sent.`} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-foreground mb-2 sm:mb-3">Quick Actions</h3>
            <div className="space-y-0.5">
              <QuickActionRow icon={FileText} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-500/15" title="Templates" sub="50+ pre-approved" onClick={() => navigate('/templates')} />
              <QuickActionRow icon={Inbox} color="text-rose-500" bg="bg-rose-100 dark:bg-rose-500/15" title="Inbox" sub="Manage chats" onClick={() => navigate('/inbox')} />
              <QuickActionRow icon={Zap} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-500/15" title="Create Flow" sub="Build automations" onClick={() => navigate('/flows/new')} />
              <QuickActionRow icon={Send} color="text-orange-500" bg="bg-orange-100 dark:bg-orange-500/15" title="Campaign" sub="Broadcast messages" onClick={() => navigate('/campaigns/create')} />
              <QuickActionRow icon={FileText} color="text-purple-500" bg="bg-purple-100 dark:bg-purple-500/15" title="New Template" sub="Design templates" onClick={() => navigate('/templates?action=create')} />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 9: BUSINESS PROFILE
        ═══════════════════════════════════════════════ */}
        <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Business Profile</h3>
            </div>
            <button onClick={() => navigate('/settings')} className="text-[10px] sm:text-[11px] text-primary font-medium hover:underline">Edit</button>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xs sm:text-sm">
              {currentTenant?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{currentTenant?.name}</p>
              {primaryPhone?.phoneNumber && (
                <p className="text-[10px] sm:text-xs text-primary font-medium">{primaryPhone.phoneNumber}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border/30">
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground">Free Service Conversations</span>
              <span className="font-medium text-foreground">Unlimited</span>
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs">
              <span className="text-muted-foreground">Conversation Credits</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-foreground">₹{creditsBalance.toFixed(2)}</span>
                <Button size="sm" className="h-5 sm:h-6 text-[9px] sm:text-[10px] px-2 sm:px-3 rounded-full" onClick={() => navigate('/billing')}>Buy More</Button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 10: RECENT ACTIVITY
        ═══════════════════════════════════════════════ */}
        <div className="rounded-lg sm:rounded-xl border border-border/40 bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-foreground">Recent Activity</h3>
            <button className="text-[10px] sm:text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0">
            {timelineEvents.map(ev => {
              const Icon = ev.icon;
              return (
                <div key={ev.id} className="flex items-start gap-2 sm:gap-3 py-2 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", ev.bg)}>
                    <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", ev.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-sm font-medium text-foreground truncate">{ev.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">{ev.sub}</p>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom spacer for mobile */}
        <div className="h-4" />
      </div>

      {/* Embedded Signup Dialog */}
      <Dialog open={embeddedSignupOpen} onOpenChange={setEmbeddedSignupOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>{hasPhoneConnected ? 'Reconnect WhatsApp Business' : 'Connect WhatsApp Business'}</DialogTitle>
            <DialogDescription>
              {hasPhoneConnected ? 'Re-authenticate your existing WhatsApp Business Account.' : 'Use Meta\'s secure signup flow to connect your WhatsApp Business Account.'}
            </DialogDescription>
          </DialogHeader>
          <MetaEmbeddedSignup
            onSuccess={() => { setEmbeddedSignupOpen(false); refetch(); }}
            onError={(error) => console.error('Embedded signup error:', error)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, iconColor, iconBg, label, value, onClick }: {
  icon: React.ElementType; iconColor: string; iconBg: string; label: string; value: number | string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={cn(
      "rounded-lg sm:rounded-xl border border-border/40 bg-card p-2.5 sm:p-4 shadow-sm transition-all duration-200",
      onClick && "cursor-pointer hover:shadow-md active:scale-[0.97]"
    )}>
      <div className={cn("h-6 w-6 sm:h-7 sm:w-7 rounded-md sm:rounded-lg flex items-center justify-center mb-1.5 sm:mb-2", iconBg)}>
        <Icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", iconColor)} />
      </div>
      <p className="text-lg sm:text-2xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium mt-0.5 sm:mt-1">{label}</p>
    </div>
  );
}

/* ─── Insight Row ─── */
function InsightRow({ icon: Icon, color, bg, title, detail }: {
  icon: React.ElementType; color: string; bg: string; title: string; detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", bg)}>
        <Icon className={cn("h-3.5 w-3.5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ─── Quick Action Row ─── */
function QuickActionRow({ icon: Icon, color, bg, title, sub, onClick }: {
  icon: React.ElementType; color: string; bg: string; title: string; sub: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left group">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
