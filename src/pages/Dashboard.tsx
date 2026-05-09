import React, { useState, useMemo, lazy, Suspense } from 'react';
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
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import OnboardingGate from '@/components/onboarding/OnboardingGate';
import { cn } from '@/lib/utils';
import type { DashboardFilters } from '@/types/dashboard';
import {
  MessageSquare, Users, Send, AlertCircle, Inbox, Workflow,
  FileText, Zap, ArrowUpRight, ArrowRight, Phone, Clock, CheckCircle2,
  CreditCard, ChevronRight, RefreshCw, Sparkles, ShieldCheck,
  Bot, Timer, Check, Gift, Megaphone, Eye, Tag,
  MessageCircle, UserPlus, Gauge,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MessagesAreaChart = lazy(() => import('@/components/dashboard/MessagesAreaChart'));
const SubscriptionStatusBanner = lazy(() => import('@/components/dashboard/SubscriptionStatusBanner'));


/* ─── Tone Map ─── */
const TONE_MAP: Record<string, { from: string; to: string; text: string; ring: string; soft: string }> = {
  emerald: { from: 'from-emerald-400', to: 'to-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20', soft: 'bg-emerald-500/10' },
  teal:    { from: 'from-teal-400',    to: 'to-teal-600',    text: 'text-teal-600 dark:text-teal-400',       ring: 'ring-teal-500/20',    soft: 'bg-teal-500/10' },
  blue:    { from: 'from-blue-400',    to: 'to-blue-600',    text: 'text-blue-600 dark:text-blue-400',       ring: 'ring-blue-500/20',    soft: 'bg-blue-500/10' },
  cyan:    { from: 'from-cyan-400',    to: 'to-cyan-600',    text: 'text-cyan-600 dark:text-cyan-400',       ring: 'ring-cyan-500/20',    soft: 'bg-cyan-500/10' },
  violet:  { from: 'from-violet-400',  to: 'to-violet-600',  text: 'text-violet-600 dark:text-violet-400',   ring: 'ring-violet-500/20',  soft: 'bg-violet-500/10' },
  orange:  { from: 'from-orange-400',  to: 'to-orange-600',  text: 'text-orange-600 dark:text-orange-400',   ring: 'ring-orange-500/20',  soft: 'bg-orange-500/10' },
  amber:   { from: 'from-amber-400',   to: 'to-amber-600',   text: 'text-amber-600 dark:text-amber-400',     ring: 'ring-amber-500/20',   soft: 'bg-amber-500/10' },
  rose:    { from: 'from-rose-400',    to: 'to-rose-600',    text: 'text-rose-600 dark:text-rose-400',       ring: 'ring-rose-500/20',    soft: 'bg-rose-500/10' },
  slate:   { from: 'from-slate-400',   to: 'to-slate-600',   text: 'text-slate-600 dark:text-slate-400',     ring: 'ring-slate-500/20',   soft: 'bg-slate-500/10' },
};

/* ─── Premium KPI Card ─── */
function KpiCard({ icon: Icon, tone, label, value, onClick }: {
  icon: React.ElementType; tone: keyof typeof TONE_MAP; label: string; value: number | string; onClick?: () => void;
}) {
  const t = TONE_MAP[tone];
  return (
    <div onClick={onClick} className={cn(
      "premium-card p-3 sm:p-4 group",
      onClick && "cursor-pointer active:scale-[0.97]"
    )}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={cn("h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br shadow-md ring-1 flex items-center justify-center transition-transform group-hover:scale-110", t.from, t.to, t.ring)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        {onClick && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      <p className="text-xl sm:text-3xl font-extrabold text-foreground leading-none tracking-tight">{value}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1 sm:mt-1.5 truncate">{label}</p>
    </div>
  );
}

/* ─── Hero Mini Stat ─── */
function HeroStat({ icon: Icon, label, value, tone, live }: {
  icon: React.ElementType; label: string; value: number | string; tone: keyof typeof TONE_MAP; live?: boolean;
}) {
  const t = TONE_MAP[tone];
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-3.5 relative">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br shadow-sm flex items-center justify-center", t.from, t.to)}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        {live && <span className="live-dot" />}
      </div>
      <p className="text-lg sm:text-xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-1 truncate">{label}</p>
    </div>
  );
}

/* ─── Premium Status Tile ─── */
function PremiumStatusTile({ icon: Icon, label, tone, value, sub, live, onClick }: {
  icon: React.ElementType; label: string; tone: keyof typeof TONE_MAP; value: string; sub?: string; live?: boolean; onClick?: () => void;
}) {
  const t = TONE_MAP[tone];
  return (
    <div onClick={onClick} className={cn(
      "premium-card p-3 sm:p-4 relative overflow-hidden",
      onClick && "cursor-pointer"
    )}>
      <div className={cn("absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-60", t.soft)} />
      <div className="relative flex items-center gap-2.5 sm:gap-3">
        <div className={cn("h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br shadow-md flex items-center justify-center flex-shrink-0", t.from, t.to)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
          <div className="flex items-center gap-1.5">
            <p className={cn("text-sm sm:text-lg font-bold leading-tight truncate", t.text)}>{value}</p>
            {live && <span className="live-dot" />}
          </div>
          {sub && <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Insight Row ─── */
function InsightRow({ icon: Icon, color, bg, title, detail }: {
  icon: React.ElementType; color: string; bg: string; title: string; detail: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className={cn("h-6 w-6 sm:h-7 sm:w-7 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", bg)}>
        <Icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ─── Quick Action Tile (premium) ─── */
function QuickActionTile({ icon: Icon, tone, title, onClick }: {
  icon: React.ElementType; tone: keyof typeof TONE_MAP; title: string; onClick: () => void;
}) {
  const t = TONE_MAP[tone];
  return (
    <button onClick={onClick} className="group relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.96]">
      <div className={cn("h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br shadow-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-translate-y-0.5", t.from, t.to)}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
      <p className="text-[10px] sm:text-xs font-semibold text-foreground text-center leading-tight">{title}</p>
    </button>
  );
}

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
    totalTemplates, messagesReceivedToday, messagesRepliedToday, totalCampaigns,
    recentActivity, refetch,
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
    const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
    return days.map((day, i) => ({
      day,
      received: i === todayIdx ? messagesReceivedToday : 0,
      sent: i === todayIdx ? messagesRepliedToday : 0,
    }));
  }, [messagesReceivedToday, messagesRepliedToday]);

  const ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
    template: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/15' },
    campaign: { icon: Send, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/15' },
    automation: { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/15' },
    contact: { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    message: { icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-500/15' },
    auth: { icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/15' },
    generic: { icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted' },
  };

  const timelineEvents = useMemo(
    () => (recentActivity || []).map(ev => {
      const meta = ICON_MAP[ev.iconKey] || ICON_MAP.generic;
      return {
        id: ev.id,
        icon: meta.icon,
        color: meta.color,
        bg: meta.bg,
        title: ev.title,
        sub: ev.subtitle || (ev.resourceType ? `On ${ev.resourceType}` : ''),
        timestamp: ev.timestamp,
      };
    }),
    [recentActivity]
  );

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
      <OnboardingGate onConnectWhatsApp={() => setEmbeddedSignupOpen(true)}>
        <div className="space-y-4 sm:space-y-6 max-w-[1280px] mx-auto px-2 py-3 sm:px-6 sm:py-6 animate-fade-in">

        {/* ═══════════════════════════════════════════════
            SECTION 1: PREMIUM HERO
        ═══════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 hero-grid-bg bg-card p-4 sm:p-7">
          <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-5 sm:gap-7 items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur px-2.5 py-1 mb-3 sm:mb-4 shadow-xs">
                <span className="live-dot" />
                <span className="text-[10px] sm:text-[11px] font-medium text-foreground truncate max-w-[180px]">Live · {currentTenant?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                <span className="text-foreground">{greeting},</span>{' '}
                <span className="text-gradient-premium">{displayName}</span>
                <span className="ml-1.5">👋</span>
              </h1>
              <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-base text-muted-foreground max-w-md">
                Your WhatsApp business is <span className="font-semibold text-foreground">growing beautifully</span> today.
              </p>

              <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-2">
                {billing?.planName && (
                  <Badge
                    onClick={() => navigate('/billing')}
                    className={cn(
                      "cursor-pointer rounded-full border font-semibold gap-1 px-2.5 py-1 text-[10px] sm:text-xs",
                      billing.planName.toLowerCase() === 'free'
                        ? "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-300/60 dark:border-orange-500/30"
                        : "bg-gradient-to-r from-primary/15 to-blue-500/15 text-foreground border-primary/30"
                    )}
                  >
                    <Sparkles className="h-3 w-3" /> {billing.planName} Plan
                  </Badge>
                )}
                {billing?.planName?.toLowerCase() === 'free' && (
                  <Button size="sm" onClick={() => navigate('/billing')} className="h-7 sm:h-8 text-[11px] px-3 rounded-full gap-1 bg-gradient-to-r from-primary to-emerald-500 hover:opacity-90 shadow-md">
                    <ArrowUpRight className="h-3.5 w-3.5" /> Upgrade
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={refetch} className="h-7 sm:h-8 rounded-full text-[11px] gap-1.5 border-border/60 px-3 bg-background/60 backdrop-blur">
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <HeroStat icon={MessageSquare} label="Messages today" value={messagesSent || 0} tone="emerald" />
              <HeroStat icon={Inbox} label="Open chats" value={openChats} tone="blue" />
              <HeroStat icon={Users} label="New leads" value={newLeads7d} tone="violet" />
              <HeroStat icon={Bot} label="AI / Auto runs" value={automationRuns} tone="amber" live />
            </div>
          </div>
        </div>

        {/* Subscription status banner */}
        <Suspense fallback={<Skeleton className="h-20 rounded-2xl" />}>
          <SubscriptionStatusBanner />
        </Suspense>

        {/* ═══════════════════════════════════════════════
            SECTION 2: WHATSAPP STATUS — Premium Strip
        ═══════════════════════════════════════════════ */}
        {!loading && !hasPhoneConnected && (
          <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-destructive/15 flex items-center justify-center flex-shrink-0 shadow-md">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground">WhatsApp API Not Connected</h3>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
                Connect your number to start messaging, campaigns & automations.
              </p>
            </div>
            <Button onClick={() => navigate('/phone-numbers/connect')} size="sm" className="rounded-xl gap-1.5 px-4 sm:px-5 flex-shrink-0 w-full sm:w-auto h-9 text-xs bg-gradient-to-r from-primary to-emerald-500 shadow-md">
              <MessageSquare className="h-3.5 w-3.5" /> Connect Now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <PremiumStatusTile icon={MessageCircle} label="WhatsApp API" tone="emerald"
            value={isWABAConnected ? 'LIVE' : 'Offline'} sub={primaryPhone?.phoneNumber || 'No number'} live={isWABAConnected} />
          <PremiumStatusTile icon={Gauge} label="Quality"
            tone={primaryPhone?.qualityRating === 'green' ? 'emerald' : primaryPhone?.qualityRating === 'yellow' ? 'amber' : primaryPhone?.qualityRating === 'red' ? 'rose' : 'slate'}
            value={primaryPhone?.qualityRating === 'green' ? 'High' : primaryPhone?.qualityRating === 'yellow' ? 'Medium' : primaryPhone?.qualityRating === 'red' ? 'Low' : 'N/A'}
            sub="API quality rating" />
          <PremiumStatusTile icon={Send} label="Messaging Limit" tone="blue"
            value={primaryPhone?.messagingLimit || 'N/A'} sub="per 24 hours" />
          <PremiumStatusTile icon={CreditCard} label="Credits" tone="violet"
            value={`₹${creditsBalance.toLocaleString()}`} sub="Wallet balance" onClick={() => navigate('/billing')} />
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3: SETUP PROGRESS
        ═══════════════════════════════════════════════ */}
        {setupDone < setupTotal && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-500/25 bg-gradient-to-br from-amber-50 via-amber-50/40 to-transparent dark:from-amber-950/20 dark:to-transparent p-3.5 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
                    <div className={cn("h-7 w-7 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-all",
                      step.done ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md" : "border-2 border-muted-foreground/30 text-muted-foreground bg-background"
                    )}>
                      {step.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={cn("text-[8px] sm:text-[10px] font-medium text-center leading-tight",
                      step.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}>{step.title}</span>
                  </div>
                  {i < setupSteps.length - 1 && (
                    <div className={cn("h-0.5 flex-1 rounded-full -mt-3 sm:-mt-4 transition-colors", step.done ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-border")} />
                  )}
                </React.Fragment>
              ))}
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400">200 Cr</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SECTION 4: PREMIUM KPI GRID
        ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          <KpiCard icon={MessageSquare} tone="teal" label="Open Chats" value={openChats} onClick={() => navigate('/inbox?status=open')} />
          <KpiCard icon={Users} tone="blue" label="New Contacts" value={newLeads7d} onClick={() => navigate('/contacts')} />
          <KpiCard icon={Bot} tone="orange" label="Auto Runs" value={automationRuns} onClick={() => navigate('/automation')} />
          <KpiCard icon={Send} tone="violet" label="Campaigns" value={totalCampaigns} onClick={() => navigate('/campaigns')} />
          <KpiCard icon={Timer} tone="cyan" label="Avg Response" value="3m" />
          <KpiCard icon={CheckCircle2} tone="emerald" label="Resolved" value={resolvedToday} />
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
        <div className="premium-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 shadow-md flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">Messages Overview</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Last 7 days · live data</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10"><div className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="text-[9px] sm:text-[10px] font-medium text-primary">Recv</span></div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-[9px] sm:text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Sent</span></div>
            </div>
          </div>
          <div className="-mx-1 sm:-mx-2">
            <Suspense fallback={<Skeleton className="h-[140px] w-full rounded-md" />}>
              <MessagesAreaChart data={chartData} />
            </Suspense>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 8: AI INSIGHTS + QUICK ACTIONS
        ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
          {/* AI Insights — premium glow */}
          <div className="premium-card premium-card-gradient p-3.5 sm:p-5 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md glow-icon flex items-center justify-center float-anim">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">AI Insights</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Powered by Aireatro AI</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30 text-[9px] sm:text-[10px] font-semibold rounded-full">LIVE</Badge>
              </div>
              <div className="space-y-2.5">
                {openChats > 0 && (
                  <InsightRow icon={MessageSquare} color="text-amber-500" bg="bg-gradient-to-br from-amber-400/20 to-amber-500/10"
                    title="Performance" detail={`${unassigned} unassigned chat${unassigned !== 1 ? 's' : ''} need attention.`} />
                )}
                <InsightRow icon={Gauge} color="text-emerald-500" bg="bg-gradient-to-br from-emerald-400/20 to-emerald-500/10"
                  title="Lead Engagement" detail="Avg response 3m — excellent!" />
                <InsightRow icon={Eye} color="text-blue-500" bg="bg-gradient-to-br from-blue-400/20 to-blue-500/10"
                  title="Campaign Health" detail={`${totalCampaigns} campaign${totalCampaigns !== 1 ? 's' : ''} sent.`} />
              </div>
            </div>
          </div>

          {/* Quick Actions — floating tiles */}
          <div className="premium-card p-3.5 sm:p-5">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">Quick Actions</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Jump to popular tools</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <QuickActionTile icon={Inbox} tone="rose" title="Inbox" onClick={() => navigate('/inbox')} />
              <QuickActionTile icon={Send} tone="orange" title="Broadcast" onClick={() => navigate('/campaigns/create')} />
              <QuickActionTile icon={Zap} tone="amber" title="New Flow" onClick={() => navigate('/flows/new')} />
              <QuickActionTile icon={FileText} tone="blue" title="Templates" onClick={() => navigate('/templates')} />
              <QuickActionTile icon={UserPlus} tone="emerald" title="Add Team" onClick={() => navigate('/team')} />
              <QuickActionTile icon={Megaphone} tone="violet" title="Campaigns" onClick={() => navigate('/campaigns')} />
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
            {timelineEvents.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[11px] sm:text-xs text-muted-foreground">No recent activity yet.</p>
              </div>
            ) : timelineEvents.map(ev => {
              const Icon = ev.icon;
              return (
                <div key={ev.id} className="flex items-start gap-2 sm:gap-3 py-2 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", ev.bg)}>
                    <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", ev.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-sm font-medium text-foreground truncate">{ev.title}</p>
                    {ev.sub && <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{ev.sub}</p>}
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
      </OnboardingGate>

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
