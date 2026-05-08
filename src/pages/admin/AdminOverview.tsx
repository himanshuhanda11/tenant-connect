import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { useAdminQuery } from '@/hooks/useAdminQuery';
import { KpiSkeleton, ListSkeleton } from '@/components/admin/AdminSkeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2, Phone, MessageSquare, Loader2, AlertTriangle, RefreshCw,
  UserCircle2, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Search,
  ShieldOff, CreditCard, Activity, Bell, Zap, Filter,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  totals: {
    totalAccounts: number; confirmedAccounts: number; incompleteAccounts: number;
    totalWorkspaces: number; activeWorkspaces: number; suspendedWorkspaces: number;
    workspacesWithPhone: number; workspacesWithoutPhone: number;
    activePaid: number; freeTrial: number;
    totalWaba?: number; activeWaba?: number; pendingWaba?: number;
    expiredPlans?: number; trialPlans?: number;
    messagesToday?: number; inactiveAccounts?: number;
    messagesInbound24h?: number; messagesOutbound24h?: number;
    subAccountsCount?: number;
    revenue30d?: number; paymentsSucceeded?: number; paymentsFailed?: number;
  };
  growth: {
    accountsToday: number; accountsWeek: number; accountsMonth: number;
    workspacesToday: number; workspacesWeek: number; workspacesMonth: number;
  };
  series: { date: string; accounts: number; workspaces: number; phones: number }[];
  revenueSeries?: { date: string; label: string; revenue: number }[];
  planDistribution: { name: string; value: number }[];
  phoneStatus: { name: string; value: number }[];
  phoneStatusDetail?: { name: string; value: number }[];
  conversationsByWorkspace?: { tenant_id: string; name: string; display_number: string | null; messages_today: number; inbound: number; outbound: number; conversations_active: number }[];
  recentActivity: { id: string; action: string; actor_role: string; created_at: string; note?: string; target_table?: string }[];
}

const PIE_COLORS = ['hsl(152, 60%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 55%)', 'hsl(340, 75%, 55%)', 'hsl(280, 65%, 60%)'];

interface KPIProps {
  label: string; value: string | number; subtitle?: string;
  icon: React.ElementType; gradient: string; trend?: number;
  onClick?: () => void;
}

function KPI({ label, value, subtitle, icon: Icon, gradient, trend, onClick }: KPIProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border-border/50 transition-all duration-300 group bg-card',
        onClick && 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:border-primary/30'
      )}
    >
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ background: gradient }}
      />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-md text-white"
            style={{ background: gradient }}
          >
            <Icon className="h-5 w-5" />
          </div>
          {trend !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                'rounded-full text-[10px] gap-1 font-semibold',
                trend >= 0
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                  : 'border-red-500/30 bg-red-500/10 text-red-700'
              )}
            >
              <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
              {trend > 0 ? '+' : ''}{trend}
            </Badge>
          )}
        </div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

const RANGE_OPTIONS = [
  { key: '7d', label: '7d', days: 7 },
  { key: '14d', label: '14d', days: 14 },
  { key: '30d', label: '30d', days: 30 },
] as const;

export default function AdminOverview() {
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<typeof RANGE_OPTIONS[number]['key']>('30d');

  const { data: stats, loading, error: qError, refetch } = useAdminQuery<Stats>('dashboard-stats', { ttl: 60_000 });
  const error = qError;
  const loadData = () => refetch();
  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => refetch(), 60000);
    return () => clearInterval(t);
  }, [refetch]);

  const filteredSeries = useMemo(() => {
    if (!stats) return [];
    const days = RANGE_OPTIONS.find((r) => r.key === range)?.days ?? 30;
    return stats.series.slice(-days).map((s) => ({
      ...s,
      label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [stats, range]);

  if (loading && !stats) {
    const { KpiSkeleton, ListSkeleton } = require('@/components/admin/AdminSkeletons') as typeof import('@/components/admin/AdminSkeletons');
    return (
      <div className="space-y-6">
        <KpiSkeleton count={4} />
        <KpiSkeleton count={4} />
        <ListSkeleton rows={6} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-muted-foreground">{error || 'No data available'}</p>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const t = stats.totals;
  const g = stats.growth;
  const activationRate = t.totalAccounts > 0 ? (t.confirmedAccounts / t.totalAccounts) * 100 : 0;
  const phoneAttachRate = t.totalWorkspaces > 0 ? (t.workspacesWithPhone / t.totalWorkspaces) * 100 : 0;

  const funnelStages = [
    { key: 'account', label: 'Account Created', icon: UserCircle2, color: 'hsl(217, 91%, 60%)', count: t.totalAccounts },
    { key: 'confirmed', label: 'Email Confirmed', icon: CheckCircle2, color: 'hsl(280, 65%, 60%)', count: t.confirmedAccounts },
    { key: 'workspace', label: 'Workspace', icon: Building2, color: 'hsl(38, 92%, 55%)', count: t.totalWorkspaces },
    { key: 'phone', label: 'Phone Connected', icon: Phone, color: 'hsl(152, 60%, 45%)', count: t.workspacesWithPhone },
    { key: 'plan', label: 'Active Paid Plan', icon: CreditCard, color: 'hsl(340, 75%, 55%)', count: t.activePaid },
  ];
  const maxFunnel = Math.max(1, funnelStages[0].count);

  const filteredActivity = stats.recentActivity.filter((a) =>
    !search || JSON.stringify(a).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="h-3 w-3" /> Super Admin · Live
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Aireatro Control Center</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.totalAccounts.toLocaleString()} accounts · {t.totalWorkspaces.toLocaleString()} workspaces · {t.workspacesWithPhone.toLocaleString()} active numbers
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity..."
                className="pl-9 h-9 w-56 rounded-xl text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={loadData}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Top KPIs — accounts focus */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="Total Accounts" value={t.totalAccounts.toLocaleString()}
          subtitle={`+${g.accountsMonth} in 30d`}
          icon={UserCircle2} gradient="linear-gradient(135deg,#3b82f6,#6366f1)"
          trend={g.accountsToday}
          onClick={() => navigate('/control/accounts')} />
        <KPI label="Completed" value={t.confirmedAccounts.toLocaleString()}
          subtitle={`${activationRate.toFixed(1)}% activation`}
          icon={CheckCircle2} gradient="linear-gradient(135deg,#10b981,#059669)"
          onClick={() => navigate('/control/accounts')} />
        <KPI label="Incomplete" value={t.incompleteAccounts.toLocaleString()}
          subtitle="Email not confirmed"
          icon={AlertTriangle} gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          onClick={() => navigate('/control/accounts')} />
        <KPI label="Workspaces" value={t.totalWorkspaces.toLocaleString()}
          subtitle={`${t.activeWorkspaces} active · ${t.suspendedWorkspaces} suspended`}
          icon={Building2} gradient="linear-gradient(135deg,#8b5cf6,#a855f7)"
          trend={g.workspacesToday}
          onClick={() => navigate('/control/workspaces')} />
        <KPI label="WA Connected" value={t.workspacesWithPhone.toLocaleString()}
          subtitle={`${phoneAttachRate.toFixed(0)}% attach rate`}
          icon={Phone} gradient="linear-gradient(135deg,#14b8a6,#10b981)"
          onClick={() => navigate('/control/phone-numbers')} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active Paid Plans" value={t.activePaid.toLocaleString()}
          subtitle="Revenue generating"
          icon={CreditCard} gradient="linear-gradient(135deg,#ec4899,#f43f5e)"
          onClick={() => navigate('/control/billing')} />
        <KPI label="Free / Trial" value={t.freeTrial.toLocaleString()}
          subtitle="Conversion opportunities"
          icon={Zap} gradient="linear-gradient(135deg,#f59e0b,#f97316)" />
        <KPI label="Suspended" value={t.suspendedWorkspaces.toLocaleString()}
          subtitle="Workspaces blocked"
          icon={ShieldOff} gradient="linear-gradient(135deg,#ef4444,#dc2626)" />
        <KPI label="No WA Number" value={t.workspacesWithoutPhone.toLocaleString()}
          subtitle="Pending connection"
          icon={Phone} gradient="linear-gradient(135deg,#64748b,#475569)"
          onClick={() => navigate('/control/phone-numbers')} />
      </div>

      {/* Tertiary KPIs — Revenue, WABA, Messaging, Health */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="Revenue · 30d"
          value={(t.revenue30d ?? 0) > 0 ? `₹${((t.revenue30d ?? 0) / 100).toLocaleString()}` : '—'}
          subtitle={`${t.paymentsSucceeded ?? 0} paid · ${t.paymentsFailed ?? 0} failed`}
          icon={CreditCard} gradient="linear-gradient(135deg,#22c55e,#16a34a)"
          onClick={() => navigate('/control/billing')} />
        <KPI label="WABA Accounts" value={(t.totalWaba ?? 0).toLocaleString()}
          subtitle={`${t.activeWaba ?? 0} active · ${t.pendingWaba ?? 0} pending`}
          icon={Building2} gradient="linear-gradient(135deg,#0ea5e9,#0284c7)"
          onClick={() => navigate('/control/phone-numbers')} />
        <KPI label="Trial Plans" value={(t.trialPlans ?? 0).toLocaleString()}
          subtitle="In trial period"
          icon={Sparkles} gradient="linear-gradient(135deg,#a855f7,#7c3aed)" />
        <KPI label="Expired Plans" value={(t.expiredPlans ?? 0).toLocaleString()}
          subtitle="Need re-activation"
          icon={AlertTriangle} gradient="linear-gradient(135deg,#f97316,#ea580c)"
          onClick={() => navigate('/control/billing')} />
        <KPI label="Messages Today" value={(t.messagesToday ?? 0).toLocaleString()}
          subtitle={`${(t.inactiveAccounts ?? 0)} inactive users`}
          icon={MessageSquare} gradient="linear-gradient(135deg,#06b6d4,#0891b2)" />
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { l: 'Accounts · Today', v: g.accountsToday, c: 'text-blue-600' },
              { l: 'Accounts · Week', v: g.accountsWeek, c: 'text-blue-600' },
              { l: 'Accounts · Month', v: g.accountsMonth, c: 'text-blue-600' },
              { l: 'Workspaces · Today', v: g.workspacesToday, c: 'text-purple-600' },
              { l: 'Workspaces · Week', v: g.workspacesWeek, c: 'text-purple-600' },
              { l: 'Workspaces · Month', v: g.workspacesMonth, c: 'text-purple-600' },
            ].map((m) => (
              <div key={m.l}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{m.l}</p>
                <p className={cn('text-2xl font-bold tabular-nums mt-1', m.c)}>+{m.v}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Journey Funnel */}
      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </div>
            Customer Journey Map · Account → Workspace → Phone → Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5 space-y-3">
          {funnelStages.map((stage, i) => {
            const pct = (stage.count / maxFunnel) * 100;
            const conv = i === 0 ? 100 : (stage.count / Math.max(1, funnelStages[i - 1].count)) * 100;
            const Icon = stage.icon;
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: stage.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{stage.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums">{stage.count.toLocaleString()}</span>
                      {i > 0 && (
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          {conv.toFixed(0)}% conv.
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: stage.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Charts: Growth + Phone status + Plan distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              </div>
              Growth — Accounts & Workspaces
            </CardTitle>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              {RANGE_OPTIONS.map((r) => (
                <button key={r.key} onClick={() => setRange(r.key)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-md font-medium transition',
                    range === r.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}>
                  {r.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pl-0 pr-4 pb-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={filteredSeries}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(280, 65%, 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(280, 65%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.floor(filteredSeries.length / 8)} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Area type="monotone" dataKey="accounts" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#ga)" name="Accounts" />
                <Area type="monotone" dataKey="workspaces" stroke="hsl(280, 65%, 60%)" strokeWidth={2} fill="url(#gw)" name="Workspaces" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              WhatsApp Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.phoneStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {stats.phoneStatus.map((_, i) => <Cell key={i} fill={i === 0 ? 'hsl(152, 60%, 45%)' : 'hsl(var(--muted-foreground))'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1">
              {stats.phoneStatus.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: i === 0 ? 'hsl(152, 60%, 45%)' : 'hsl(var(--muted-foreground))' }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-pink-600" />
              </div>
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {stats.planDistribution.length === 0 ? (
              <div className="text-xs text-muted-foreground py-10 text-center">No plan data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.planDistribution} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={(e: any) => `${e.name}: ${e.value}`} labelLine={false} strokeWidth={0}>
                    {stats.planDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-amber-600" />
              </div>
              Phone Numbers Added — last {RANGE_OPTIONS.find(r=>r.key===range)?.days}d
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-4 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filteredSeries} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.floor(filteredSeries.length / 6)} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
                <Bar dataKey="phones" fill="hsl(152, 60%, 45%)" radius={[4, 4, 0, 0]} name="Phones" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Conversations per WABA-connected workspace */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-cyan-600" />
            </div>
            Conversations Today · WABA-Connected Workspaces
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">In: <b className="text-foreground tabular-nums">{(t.messagesInbound24h ?? 0).toLocaleString()}</b></span>
            <span className="text-muted-foreground">Out: <b className="text-foreground tabular-nums">{(t.messagesOutbound24h ?? 0).toLocaleString()}</b></span>
            <span className="text-muted-foreground">Total: <b className="text-foreground tabular-nums">{(t.messagesToday ?? 0).toLocaleString()}</b></span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {(stats.conversationsByWorkspace?.length ?? 0) === 0 ? (
            <div className="text-xs text-muted-foreground py-10 text-center">No WABA-connected workspaces yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                    <th className="text-left font-medium px-4 py-2.5">Workspace</th>
                    <th className="text-left font-medium px-4 py-2.5">WhatsApp #</th>
                    <th className="text-right font-medium px-4 py-2.5">Active Convs</th>
                    <th className="text-right font-medium px-4 py-2.5">Inbound</th>
                    <th className="text-right font-medium px-4 py-2.5">Outbound</th>
                    <th className="text-right font-medium px-4 py-2.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.conversationsByWorkspace || []).slice(0, 12).map(w => (
                    <tr key={w.tenant_id} className="border-b last:border-0 hover:bg-muted/40 cursor-pointer"
                        onClick={() => navigate(`/control/workspaces/${w.tenant_id}`)}>
                      <td className="px-4 py-2.5 font-medium truncate max-w-[200px]">{w.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{w.display_number || '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{w.conversations_active}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600">{w.inbound}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-blue-600">{w.outbound}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{w.messages_today}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue trend + WhatsApp status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Revenue — last 30d
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-4 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={(stats.revenueSeries || []).map(r => ({ ...r, revenue: (r.revenue || 0) / 100 }))}>
                <defs>
                  <linearGradient id="grev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.floor((stats.revenueSeries?.length || 1) / 8)} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(152, 60%, 45%)" strokeWidth={2} fill="url(#grev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-cyan-600" />
              </div>
              Numbers by status
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {(stats.phoneStatusDetail || []).length === 0 ? (
              <div className="text-xs text-muted-foreground py-10 text-center">No phone data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.phoneStatusDetail} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={(e: any) => `${e.name}: ${e.value}`} labelLine={false} strokeWidth={0}>
                    {(stats.phoneStatusDetail || []).map((d, i) => {
                      const color =
                        d.name === 'connected' ? 'hsl(152, 60%, 45%)' :
                        d.name === 'pending' ? 'hsl(38, 92%, 55%)' :
                        d.name === 'banned' ? 'hsl(0, 80%, 55%)' :
                        d.name === 'disconnected' ? 'hsl(var(--muted-foreground))' :
                        PIE_COLORS[i % PIE_COLORS.length];
                      return <Cell key={i} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Activity className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              Recent Activity
            </CardTitle>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs h-7" onClick={() => navigate('/control/audit-logs')}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pb-4">
            {filteredActivity.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8">No recent activity</div>
            ) : (
              <div className="space-y-2">
                {filteredActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.actor_role} · {a.target_table || 'platform'}
                        {a.note ? ` · ${a.note}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-rose-600" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {t.suspendedWorkspaces > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <ShieldOff className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-red-700">{t.suspendedWorkspaces} suspended workspace{t.suspendedWorkspaces > 1 ? 's' : ''}</p>
                  <p className="text-muted-foreground">Review status</p>
                </div>
              </div>
            )}
            {t.incompleteAccounts > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-amber-700">{t.incompleteAccounts} unconfirmed signups</p>
                  <p className="text-muted-foreground">Email not verified yet</p>
                </div>
              </div>
            )}
            {t.workspacesWithoutPhone > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <Phone className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-blue-700">{t.workspacesWithoutPhone} workspaces without WA</p>
                  <p className="text-muted-foreground">Help them connect a number</p>
                </div>
              </div>
            )}
            {(t.expiredPlans ?? 0) > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                <CreditCard className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-orange-700">{t.expiredPlans} expired plan{(t.expiredPlans ?? 0) > 1 ? 's' : ''}</p>
                  <p className="text-muted-foreground">Trigger renewal outreach</p>
                </div>
              </div>
            )}
            {(t.paymentsFailed ?? 0) > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-rose-700">{t.paymentsFailed} failed payment{(t.paymentsFailed ?? 0) > 1 ? 's' : ''} · 30d</p>
                  <p className="text-muted-foreground">Review billing logs</p>
                </div>
              </div>
            )}
            {t.suspendedWorkspaces === 0 && t.incompleteAccounts === 0 && t.workspacesWithoutPhone === 0 && (t.expiredPlans ?? 0) === 0 && (t.paymentsFailed ?? 0) === 0 && (
              <div className="text-xs text-muted-foreground text-center py-8">All systems healthy ✨</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
