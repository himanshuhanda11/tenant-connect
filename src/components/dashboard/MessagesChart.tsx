import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dashboardChart from '@/assets/dashboard-chart.png';

interface MessagesChartProps {
  messagesReceived: number;
  messagesReplied: number;
  loading?: boolean;
}

export function MessagesChart({ messagesReceived, messagesReplied, loading }: MessagesChartProps) {
  const data = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      received: Math.max(1, Math.floor(messagesReceived * (0.6 + Math.random() * 0.8) / 7)),
      sent: Math.max(1, Math.floor(messagesReplied * (0.5 + Math.random() * 0.9) / 7)),
    }));
  }, [messagesReceived, messagesReplied]);

  if (loading) {
    return (
      <Card className="border border-border/20 shadow-soft rounded-2xl backdrop-blur-sm bg-card/80">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/20 shadow-soft rounded-2xl backdrop-blur-sm bg-card/80 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <img src={dashboardChart} alt="Chart" className="h-10 w-10 object-contain" loading="lazy" />
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Messages Overview</CardTitle>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Sent</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-2">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            />
            <Area type="monotone" dataKey="received" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#receivedGrad)" />
            <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2.5} fill="url(#sentGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
