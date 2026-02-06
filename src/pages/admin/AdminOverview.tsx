import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Button } from '@/components/ui/button';
import { Building2, Phone, Users, Globe, MessageSquare, Loader2, AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';
import { AdminKPICard } from '@/components/admin/AdminKPICard';
import { AdminHealthChips } from '@/components/admin/AdminHealthChips';
import { AdminAttentionPanel, buildAttentionItems } from '@/components/admin/AdminAttentionPanel';

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

export default function AdminOverview() {
  const { get } = useAdminApi();
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          onViewDetails={() => navigate('/admin/workspaces')}
        />
        <AdminKPICard
          label="Phone Numbers"
          value={kpi.total_phone_numbers}
          subtitle={`${kpi.connected_phone_numbers} connected · ${pendingPhones} pending`}
          icon={Phone}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <AdminKPICard
          label="Total Users"
          value={kpi.total_users}
          subtitle="Unique registered accounts"
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <AdminKPICard
          label="Conversations"
          value={kpi.total_conversations.toLocaleString()}
          subtitle={`${kpi.total_contacts.toLocaleString()} contacts across workspaces`}
          icon={MessageSquare}
          iconBg="bg-pink-50"
          iconColor="text-pink-600"
          onViewDetails={() => navigate('/admin/workspaces')}
        />
      </div>

      {/* Attention Panel */}
      <AdminAttentionPanel items={attentionItems} />
    </div>
  );
}
