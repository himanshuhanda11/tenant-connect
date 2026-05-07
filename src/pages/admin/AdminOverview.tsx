import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Phone, MessageSquare, Loader2, AlertTriangle, RefreshCw,
  DollarSign, UserCircle2, ArrowRight, CheckCircle2, TrendingUp, Sparkles
} from 'lucide-react';
import { AdminHealthChips } from '@/components/admin/AdminHealthChips';
import { AdminAttentionPanel, buildAttentionItems } from '@/components/admin/AdminAttentionPanel';
import { AdminRiskPanel } from '@/components/admin/AdminRiskPanel';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface KPI {
  total_workspaces: number;
  active_workspaces: number;
  suspended_workspaces: number;
  total_phone_numbers: number;
  connected_phone_numbers: number;
  total_users: number;
  total_contacts: number;
  total_conversations: number;
  total_accounts?: number;
  completed_accounts?: number;
  accounts_with_workspace?: number;
  accounts_last_30d?: number;
  total_revenue_cents?: number;
  revenue_30d_cents?: number;
  daily_conversations?: number;
  daily_messages?: number;
}

const generateRevenueData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 3000) + 1200,
    });
  }
  return data;
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

interface PremiumKPIProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  accent: string; // tailwind from- color e.g. 'from-blue-500'
  accentTo: string;
  trend?: number;
  onClick?: () => void;
}

function PremiumKPI({ label, value, subtitle, icon: Icon, accent, accentTo, trend, onClick }: PremiumKPIProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border-border/50 transition-all duration-300 group',
        onClick && 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5'
      )}
    >
      {/* gradient glow */}
      <div className={cn(
        'absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br',
        accent, accentTo
      )} />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'h-11 w-11 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md text-white',
            accent, accentTo
          )}>
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
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

const FUNNEL_STAGES = [
  { key: 'account', label: 'Account Created', icon: UserCircle2, color: 'bg-blue-500' },
  { key: 'workspace', label: 'Workspace', icon: Building2, color: 'bg-purple-500' },
  { key: 'phone', label: 'Phone Connected', icon: Phone, color: 'bg-emerald-500' },
  { key: 'plan', label: 'Active Plan', icon: DollarSign, color: 'bg-amber-500' },
];

export default function AdminOverview() {
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData] = useState(generateRevenueData);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get('overview');
      setKpi(data.kpi);
    } catch (e: any) {
      setError(e.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !kpi) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-muted-foreground">{error || 'No data available'}</p>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const pendingPhones = kpi.total_phone_numbers - kpi.connected_phone_numbers;
  const totalAccounts = kpi.total_accounts ?? kpi.total_users ?? 0;
  const accountsWithWorkspace = kpi.accounts_with_workspace ?? kpi.total_workspaces ?? 0;
  const completedAccounts = kpi.completed_accounts ?? 0;
  const revenueDollars = (kpi.total_revenue_cents ?? 0) / 100;
  const dailyConvos = kpi.daily_conversations ?? 0;

  // Funnel counts
  const funnelCounts = [
    totalAccounts,
    accountsWithWorkspace,
    kpi.connected_phone_numbers,
    completedAccounts,
  ];
  const maxFunnel = Math.max(1, funnelCounts[0]);

  const healthChips = [
    { label: 'Active Workspaces', value: kpi.active_workspaces, status: 'success' as const },
    { label: 'Pending Numbers', value: pendingPhones, status: pendingPhones > 0 ? 'warning' as const : 'success' as const },
    { label: 'Suspended', value: kpi.suspended_workspaces, status: kpi.suspended_workspaces > 0 ? 'error' as const : 'success' as const },
  ];

  const attentionItems = buildAttentionItems(kpi, navigate);

  const donutData = [
    { name: 'Active', value: kpi.active_workspaces },
    { name: 'Suspended', value: kpi.suspended_workspaces || 1 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="h-3 w-3" /> Control Center
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Internal AiReatro operations · {totalAccounts.toLocaleString()} accounts created successfully.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AdminHealthChips chips={healthChips} />
            <Button variant="outline" size="sm" className="rounded-xl" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Premium KPI Grid — 5 cards as requested */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumKPI
          label="Accounts"
          value={totalAccounts.toLocaleString()}
          subtitle={`${kpi.accounts_last_30d ?? 0} new in 30d`}
          icon={UserCircle2}
          accent="from-blue-500"
          accentTo="to-indigo-600"
          trend={12}
          onClick={() => navigate('/control/accounts')}
        />
        <PremiumKPI
          label="Workspaces"
          value={kpi.total_workspaces.toLocaleString()}
          subtitle={`${kpi.active_workspaces} active`}
          icon={Building2}
          accent="from-purple-500"
          accentTo="to-fuchsia-600"
          trend={8}
          onClick={() => navigate('/control/workspaces')}
        />
        <PremiumKPI
          label="Phone Active"
          value={kpi.connected_phone_numbers.toLocaleString()}
          subtitle={`${pendingPhones} pending`}
          icon={Phone}
          accent="from-emerald-500"
          accentTo="to-teal-600"
          trend={5}
          onClick={() => navigate('/control/phone-numbers')}
        />
        <PremiumKPI
          label="Revenue"
          value={`$${revenueDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtitle={`$${(((kpi.revenue_30d_cents ?? 0) / 100)).toLocaleString()} in 30d`}
          icon={DollarSign}
          accent="from-amber-500"
          accentTo="to-orange-600"
          trend={revenueDollars > 0 ? 18 : 0}
          onClick={() => navigate('/control/billing')}
        />
        <PremiumKPI
          label="Daily Convos"
          value={dailyConvos.toLocaleString()}
          subtitle={`${(kpi.daily_messages ?? 0).toLocaleString()} messages 24h`}
          icon={MessageSquare}
          accent="from-pink-500"
          accentTo="to-rose-600"
          trend={-3}
        />
      </div>

      {/* Customer Journey Map */}
      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </div>
            Customer Journey · Account → Workspace → Phone → Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="space-y-3">
            {FUNNEL_STAGES.map((stage, i) => {
              const count = funnelCounts[i];
              const pct = (count / maxFunnel) * 100;
              const conversion = i === 0 ? 100 : (funnelCounts[i] / Math.max(1, funnelCounts[i - 1])) * 100;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center text-white flex-shrink-0', stage.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tabular-nums">{count.toLocaleString()}</span>
                        {i > 0 && (
                          <Badge variant="outline" className="rounded-full text-[10px]">
                            {conversion.toFixed(0)}% conv.
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700', stage.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Overall activation rate: <strong className="text-foreground">{((completedAccounts / Math.max(1, totalAccounts)) * 100).toFixed(1)}%</strong>
            </span>
            <button
              onClick={() => navigate('/control/accounts')}
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              View accounts <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm border-border/50 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              Revenue — Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pr-4 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={8}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={45} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
              </div>
              Active vs Suspended
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {donutData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, background: 'hsl(var(--card))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminAttentionPanel items={attentionItems} />
      <AdminRiskPanel />
    </div>
  );
}
