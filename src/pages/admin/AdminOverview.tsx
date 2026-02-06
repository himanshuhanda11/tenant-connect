import React, { useEffect, useState } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Phone, Users, MessageSquare, Globe, Loader2 } from 'lucide-react';

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
  const { get, loading } = useAdminApi();
  const [kpi, setKpi] = useState<KPI | null>(null);

  useEffect(() => {
    get('overview').then(data => setKpi(data.kpi)).catch(() => {});
  }, []);

  if (loading && !kpi) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!kpi) return null;

  const cards = [
    { label: 'Total Workspaces', value: kpi.total_workspaces, sub: `${kpi.active_workspaces} active, ${kpi.suspended_workspaces} suspended`, icon: Building2, color: 'text-blue-600' },
    { label: 'Phone Numbers', value: kpi.total_phone_numbers, sub: `${kpi.connected_phone_numbers} connected`, icon: Phone, color: 'text-green-600' },
    { label: 'Total Users', value: kpi.total_users, sub: 'Unique registered', icon: Users, color: 'text-purple-600' },
    { label: 'Total Contacts', value: kpi.total_contacts.toLocaleString(), sub: 'Across all workspaces', icon: Globe, color: 'text-orange-600' },
    { label: 'Conversations', value: kpi.total_conversations.toLocaleString(), sub: 'All time', icon: MessageSquare, color: 'text-pink-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
