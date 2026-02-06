import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Phone, Users, MessageSquare, Loader2, AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';
import { AdminKPICard } from '@/components/admin/AdminKPICard';
import { AdminHealthChips } from '@/components/admin/AdminHealthChips';
import { AdminAttentionPanel, buildAttentionItems } from '@/components/admin/AdminAttentionPanel';
import { AdminRiskPanel } from '@/components/admin/AdminRiskPanel';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface KPI {
  total_workspaces: number;
  active_workspaces: number;
  suspended_workspaces: number;
  total_phone_numbers: number;
  connected_phone_numbers: number;
  total_users: number;
  total_contacts: number;
  total_conversations: number;
}

// Generate mock 30-day revenue data
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
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor clients, numbers, billing and risk in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminHealthChips chips={healthChips} />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPICard
          label="Workspaces"
          value={kpi.total_workspaces}
          subtitle={`${kpi.active_workspaces} active · ${kpi.suspended_workspaces} suspended`}
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={12}
          trendLabel="vs last 30d"
          onViewDetails={() => navigate('/admin/workspaces')}
        />
        <AdminKPICard
          label="Phone Numbers"
          value={kpi.total_phone_numbers}
          subtitle={`${kpi.connected_phone_numbers} connected · ${pendingPhones} pending`}
          icon={Phone}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={5}
          trendLabel="vs last 30d"
        />
        <AdminKPICard
          label="Total Users"
          value={kpi.total_users}
          subtitle="Unique registered accounts"
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={8}
          trendLabel="vs last 30d"
        />
        <AdminKPICard
          label="Conversations"
          value={kpi.total_conversations.toLocaleString()}
          subtitle={`${kpi.total_contacts.toLocaleString()} contacts across workspaces`}
          icon={MessageSquare}
          iconBg="bg-pink-50"
          iconColor="text-pink-600"
          trend={-3}
          trendLabel="vs last 30d"
          onViewDetails={() => navigate('/admin/workspaces')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Chart */}
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
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    fontSize: 12,
                    background: 'hsl(var(--card))',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active vs Suspended Donut */}
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
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    fontSize: 12,
                    background: 'hsl(var(--card))',
                  }}
                />
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

      {/* Attention Panel */}
      <AdminAttentionPanel items={attentionItems} />

      {/* Risk & Compliance */}
      <AdminRiskPanel />
    </div>
  );
}
