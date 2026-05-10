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

  const variantPerf = useMemo(() => {
    const variants = (widget?.variants ?? []) as Array<{ id: string; name: string; traffic_pct: number }>;
    if (!variants.length) return [];
    const buckets: Record<string, { id: string; name: string; views: number; clicks: number; leads: number }> = {
      __control: { id: '__control', name: 'Control', views: 0, clicks: 0, leads: 0 },
    };
    variants.forEach(v => { buckets[v.id] = { id: v.id, name: v.name, views: 0, clicks: 0, leads: 0 }; });
    events.forEach(e => {
      const key = e.variant_id && buckets[e.variant_id] ? e.variant_id : '__control';
      if (e.event_type === 'view') buckets[key].views++;
      if (e.event_type === 'click') buckets[key].clicks++;
      if (e.event_type === 'lead') buckets[key].leads++;
    });
    return Object.values(buckets).map(b => ({
      ...b,
      conv: b.views ? Math.round((b.leads / b.views) * 1000) / 10 : 0,
    }));
  }, [events, widget]);

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

        {variantPerf.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">A/B variants performance</div>
              <div className="text-[11px] text-muted-foreground">Higher conversion = winner</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground border-b border-border/50">
                  <th className="py-2">Variant</th><th className="py-2 text-right">Views</th><th className="py-2 text-right">Clicks</th><th className="py-2 text-right">Leads</th><th className="py-2 text-right">Conv. rate</th>
                </tr></thead>
                <tbody>
                  {variantPerf.map(v => {
                    const top = Math.max(...variantPerf.map(x => x.conv));
                    const isWinner = v.conv > 0 && v.conv === top;
                    return (
                      <tr key={v.id} className="border-b border-border/30">
                        <td className="py-2 font-medium flex items-center gap-2">{v.name}{isWinner && <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Winner</span>}</td>
                        <td className="py-2 text-right tabular-nums">{v.views}</td>
                        <td className="py-2 text-right tabular-nums">{v.clicks}</td>
                        <td className="py-2 text-right tabular-nums">{v.leads}</td>
                        <td className="py-2 text-right tabular-nums font-semibold">{v.conv}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

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
