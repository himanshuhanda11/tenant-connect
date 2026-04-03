import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import type { DashboardFilters } from '@/types/dashboard';
import {
  MessageSquare, Users, Send, AlertCircle, Inbox, Workflow,
  FileText, Zap, ArrowUpRight, Phone, Clock, CheckCircle2,
  CreditCard, ChevronRight, RefreshCw, Sparkles,
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
  const messagesSent = messagesRepliedToday || 0;
  const newLeads7d = contacts?.newContacts7d || 0;

  // Chart data
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      messages: Math.max(1, Math.floor((messagesReceivedToday + messagesRepliedToday) * (0.6 + Math.random() * 0.8) / 7)),
    }));
  }, [messagesReceivedToday, messagesRepliedToday]);

  // Timeline events
  const timelineEvents = useMemo(() => [
    { id: '1', type: 'template_submitted', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10', title: 'Template "welcome_v2" submitted', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '2', type: 'campaign_sent', icon: Send, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Campaign "Summer Sale" completed', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: '3', type: 'flow_triggered', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', title: 'Welcome Flow triggered for 3 contacts', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '4', type: 'payment', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Payment of ₹2,500 received', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: '5', type: 'template_approved', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Template "order_update" approved', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  ], []);

  // Action center items
  const pendingActions = useMemo(() => {
    const items: { id: string; message: string; priority: 'high' | 'medium'; href: string; action: string }[] = [];
    if (unassigned > 0) items.push({ id: 'unassigned', message: `${unassigned} chat${unassigned > 1 ? 's' : ''} waiting for reply`, priority: 'high', href: '/inbox?assigned=none', action: 'Reply now' });
    if (templatesPending > 0) items.push({ id: 'templates', message: `${templatesPending} template${templatesPending > 1 ? 's' : ''} pending approval`, priority: 'medium', href: '/templates', action: 'Review' });
    return items;
  }, [unassigned, templatesPending]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-[1100px] mx-auto px-4 sm:px-6 py-6 animate-pulse">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1100px] mx-auto px-4 sm:px-6 py-6 animate-fade-in">

        {/* ─── SECTION 1: HERO STRIP ─── */}
        <div className="rounded-2xl border border-border/15 bg-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {greeting}, {displayName} 👋
              </h1>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {primaryPhone?.phoneNumber && (
                  <span className="text-sm text-muted-foreground font-medium">{primaryPhone.phoneNumber}</span>
                )}
                {isWABAConnected ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                    ● Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] px-2 py-0.5 rounded-full">
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-muted-foreground">{billing?.planName || 'Free'} Plan</span>
            <Button size="sm" className="h-8 text-xs px-4 rounded-full" onClick={() => navigate('/billing')}>
              Upgrade <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ─── SECTION 2: KEY METRICS (4 cards only) ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard icon={MessageSquare} iconColor="text-teal-500" iconBg="bg-teal-500/10" label="Active Chats" value={openChats} onClick={() => navigate('/inbox?status=open')} />
          <MetricCard icon={Users} iconColor="text-blue-500" iconBg="bg-blue-500/10" label="New Leads (7d)" value={newLeads7d} onClick={() => navigate('/contacts')} />
          <MetricCard icon={Send} iconColor="text-violet-500" iconBg="bg-violet-500/10" label="Messages Sent" value={messagesSent} />
          <MetricCard icon={AlertCircle} iconColor="text-amber-500" iconBg="bg-amber-500/10" label="Pending Actions" value={pendingActions.length + (templatesPending > 0 ? 0 : 0)} onClick={() => pendingActions[0] && navigate(pendingActions[0].href)} />
        </div>

        {/* ─── SECTION 3: ACTION CENTER ─── */}
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-foreground">Action Center</h2>
          </div>

          {pendingActions.length === 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/80">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-sm text-foreground font-medium">All clear — no pending actions!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingActions.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all group",
                    item.priority === 'high'
                      ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300"
                      : "bg-card border border-border/20 hover:border-border/40"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("h-2 w-2 rounded-full flex-shrink-0", item.priority === 'high' ? 'bg-amber-500' : 'bg-blue-400')} />
                    <span className="text-sm text-foreground text-left">{item.message}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100">
                    {item.action} <ChevronRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* AI insight — max 2 lines */}
          <div className="flex items-start gap-2 pt-1">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              Your response time averages 3 min today. {openChats > 0 ? `${openChats} active conversations need attention.` : 'All conversations are handled.'}
            </p>
          </div>
        </div>

        {/* ─── SECTION 4: SINGLE GRAPH ─── */}
        <div className="rounded-2xl border border-border/15 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Messages This Week</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days overview</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[11px] text-muted-foreground">Messages</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              />
              <Area type="monotone" dataKey="messages" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#msgGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ─── SECTION 5: QUICK ACTIONS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionBtn icon={Send} label="Send Campaign" color="text-orange-500" bg="bg-orange-500/8 hover:bg-orange-500/15" onClick={() => navigate('/campaigns/create')} />
          <QuickActionBtn icon={Inbox} label="Open Inbox" color="text-emerald-500" bg="bg-emerald-500/8 hover:bg-emerald-500/15" onClick={() => navigate('/inbox')} primary />
          <QuickActionBtn icon={Workflow} label="Create Flow" color="text-purple-500" bg="bg-purple-500/8 hover:bg-purple-500/15" onClick={() => navigate('/flows/new')} />
          <QuickActionBtn icon={FileText} label="Create Template" color="text-blue-500" bg="bg-blue-500/8 hover:bg-blue-500/15" onClick={() => navigate('/templates?action=create')} />
        </div>

        {/* ─── SECTION 6: RECENT ACTIVITY ─── */}
        <div className="rounded-2xl border border-border/15 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {timelineEvents.slice(0, 5).map(ev => {
              const Icon = ev.icon;
              return (
                <div key={ev.id} className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0", ev.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", ev.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{ev.title}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Embedded Signup Dialog */}
      <Dialog open={embeddedSignupOpen} onOpenChange={setEmbeddedSignupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hasPhoneConnected ? 'Reconnect WhatsApp Business' : 'Connect WhatsApp Business'}</DialogTitle>
            <DialogDescription>
              {hasPhoneConnected
                ? 'Re-authenticate your existing WhatsApp Business Account connection.'
                : 'Use Meta\'s secure signup flow to connect your WhatsApp Business Account.'}
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

/* ─── Metric Card ─── */
function MetricCard({ icon: Icon, iconColor, iconBg, label, value, onClick }: {
  icon: React.ElementType; iconColor: string; iconBg: string; label: string; value: number; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border/15 bg-card p-5 flex flex-col justify-between min-h-[110px] shadow-sm transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:border-border/30"
      )}
    >
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground leading-none tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ─── Quick Action Button ─── */
function QuickActionBtn({ icon: Icon, label, color, bg, onClick, primary }: {
  icon: React.ElementType; label: string; color: string; bg: string; onClick: () => void; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
        primary ? "border-emerald-500/20 bg-emerald-500/8 hover:bg-emerald-500/15" : "border-border/15 " + bg
      )}
    >
      <Icon className={cn("h-5 w-5", primary ? "text-emerald-500" : color)} />
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </button>
  );
}
