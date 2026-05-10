import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWidget, useWidgetEvents } from '@/hooks/useWidgets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, MousePointerClick, UserCheck, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

export default function WidgetAnalytics() {
  const { id } = useParams<{ id: string }>();
  const { widget } = useWidget(id);
  const { events, loading } = useWidgetEvents(id, 30);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const views = events.filter(e => e.event_type === 'view').length;
    const opens = events.filter(e => e.event_type === 'open').length;
    const clicks = events.filter(e => e.event_type === 'click').length;
    const leads = events.filter(e => e.event_type === 'lead').length;
    const ctr = views ? Math.round((clicks / views) * 1000) / 10 : 0;
    const conv = views ? Math.round((leads / views) * 1000) / 10 : 0;
    return { views, opens, clicks, leads, ctr, conv };
  }, [events]);

  const series = useMemo(() => {
    const map = new Map<string, { date: string; views: number; clicks: number; leads: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(d, { date: d.slice(5), views: 0, clicks: 0, leads: 0 });
    }
    events.forEach(e => {
      const d = e.created_at.slice(0, 10);
      const k = d.slice(5);
      const row = Array.from(map.values()).find(r => r.date === k);
      if (!row) return;
      if (e.event_type === 'view') row.views++;
      if (e.event_type === 'click') row.clicks++;
      if (e.event_type === 'lead') row.leads++;
    });
    return Array.from(map.values());
  }, [events]);

  const topPages = useMemo(() => {
    const m: Record<string, number> = {};
    events.filter(e => e.event_type === 'view').forEach(e => {
      const p = (e.page_url || '/').split('?')[0];
      m[p] = (m[p] || 0) + 1;
    });
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([page, count]) => ({ page, count }));
  }, [events]);

  const devices = useMemo(() => {
    const m: Record<string, number> = {};
    events.filter(e => e.event_type === 'view').forEach(e => {
      const d = e.device || 'unknown';
      m[d] = (m[d] || 0) + 1;
    });
    return Object.entries(m).map(([device, count]) => ({ device, count }));
  }, [events]);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(`/widgets/${id}`)}><ArrowLeft className="h-4 w-4" />Back</Button>
        <h1 className="text-2xl font-bold">Widget analytics {widget ? `· ${widget.name}` : ''}</h1>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi label="Views" value={stats.views} icon={<Eye className="h-4 w-4" />} accent="from-emerald-500 to-teal-600" />
          <Kpi label="Opens" value={stats.opens} icon={<MousePointerClick className="h-4 w-4" />} accent="from-sky-500 to-cyan-600" />
          <Kpi label="Clicks" value={stats.clicks} icon={<MousePointerClick className="h-4 w-4" />} accent="from-violet-500 to-fuchsia-600" />
          <Kpi label="Leads" value={stats.leads} icon={<UserCheck className="h-4 w-4" />} accent="from-amber-500 to-orange-600" />
          <Kpi label="Conversion" value={`${stats.conv}%`} icon={<TrendingUp className="h-4 w-4" />} accent="from-rose-500 to-pink-600" />
        </div>

        <Card className="p-4">
          <div className="text-sm font-semibold mb-2">Last 30 days</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="#0EA5E9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leads" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm font-semibold mb-3">Top pages</div>
            {topPages.length === 0 ? <div className="text-xs text-muted-foreground">No data yet.</div> : (
              <div className="space-y-2">
                {topPages.map(p => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <div className="truncate text-muted-foreground">{p.page}</div>
                    <div className="font-semibold">{p.count}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold mb-3">Device split</div>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={devices}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="device" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {loading && <div className="text-xs text-muted-foreground">Refreshing…</div>}
      </div>
    </DashboardLayout>
  );
}

function Kpi({ label, value, icon, accent }: { label: string; value: number | string; icon: React.ReactNode; accent: string }) {
  return (
    <Card className="p-4 relative overflow-hidden">
      <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${accent}`} />
      <div className="relative">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>{icon}
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
