import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase.rpc('platform_revenue_daily', { p_days: 30 });
      if (!error && rows) {
        setData(
          (rows as any[]).map((r: any) => ({
            day: new Date(r.day).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            gross: Number(r.gross) || 0,
            refunds: Number(r.refunds) || 0,
            net: Number(r.net) || 0,
          }))
        );
      }
    } catch (e) {
      console.error('Revenue chart error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No revenue data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="gross" fill="hsl(var(--primary))" name="Gross" radius={[4, 4, 0, 0]} />
              <Bar dataKey="refunds" fill="hsl(var(--destructive))" name="Refunds" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
