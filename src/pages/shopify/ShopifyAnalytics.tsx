import React from 'react';
import { useParams } from 'react-router-dom';
import {
  TrendingUp, ShoppingCart, DollarSign, Bot, UserCheck,
  MessageSquare, Package, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShopifyPageShell, ShopifyStatCard } from '@/components/shopify/ShopifyPageShell';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export default function ShopifyAnalytics() {
  const { storeId } = useParams<{ storeId: string }>();
  const { currentTenant } = useTenant();

  const { data: orderStats, isLoading } = useQuery({
    queryKey: ['shopify-order-stats', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      const [orders, checkouts, recoveries] = await Promise.all([
        (supabase as any).from('shopify_orders').select('id, total_price, financial_status', { count: 'exact' }).eq('store_id', storeId),
        (supabase as any).from('shopify_abandoned_checkouts').select('id, cart_value, recovery_status', { count: 'exact' }).eq('store_id', storeId),
        (supabase as any).from('shopify_cart_recovery_logs').select('id, recovered_value, status', { count: 'exact' }).eq('store_id', storeId),
      ]);
      const totalOrders = orders.count || 0;
      const totalRevenue = (orders.data || []).reduce((s: number, o: any) => s + (parseFloat(o.total_price) || 0), 0);
      const abandonedCount = checkouts.count || 0;
      const abandonedValue = (checkouts.data || []).reduce((s: number, c: any) => s + (parseFloat(c.cart_value) || 0), 0);
      const recovered = (recoveries.data || []).filter((r: any) => r.status === 'recovered');
      const recoveredValue = recovered.reduce((s: number, r: any) => s + (parseFloat(r.recovered_value) || 0), 0);
      const recoveryRate = abandonedCount > 0 ? (recovered.length / abandonedCount * 100) : 0;
      return { totalOrders, totalRevenue, abandonedCount, abandonedValue, recoveredCount: recovered.length, recoveredValue, recoveryRate };
    },
    enabled: !!storeId,
  });

  const stats = orderStats || { totalOrders: 0, totalRevenue: 0, abandonedCount: 0, abandonedValue: 0, recoveredCount: 0, recoveredValue: 0, recoveryRate: 0 };

  return (
    <ShopifyPageShell
      title="Sales Analytics"
      subtitle="Track conversions, revenue, and agent performance"
      icon={BarChart3}
      backTo={`/app/integrations/shopify/${storeId}`}
      backLabel="Back to Store"
      isLoading={isLoading}
      maxWidth="2xl"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ShopifyStatCard label="Total Orders" value={stats.totalOrders} icon={Package} />
        <ShopifyStatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon={DollarSign} iconColor="text-green-500" valueColor="text-green-600" />
        <ShopifyStatCard label="Abandoned Carts" value={stats.abandonedCount} icon={ShoppingCart} iconColor="text-amber-500" />
        <ShopifyStatCard label="Revenue Recovered" value={`$${stats.recoveredValue.toFixed(0)}`} icon={TrendingUp} iconColor="text-green-500" valueColor="text-green-600" />
      </div>

      {/* Funnel & Recovery */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FunnelStep label="Store Visitors" value={stats.totalOrders + stats.abandonedCount} total={stats.totalOrders + stats.abandonedCount} />
            <FunnelStep label="Added to Cart" value={stats.totalOrders + stats.abandonedCount} total={stats.totalOrders + stats.abandonedCount} />
            <FunnelStep label="Started Checkout" value={Math.round((stats.totalOrders + stats.abandonedCount) * 0.7)} total={stats.totalOrders + stats.abandonedCount} />
            <FunnelStep label="Completed Purchase" value={stats.totalOrders} total={stats.totalOrders + stats.abandonedCount} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Cart Recovery</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recovery Rate</span>
              <span className="text-lg font-bold text-green-600">{stats.recoveryRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.recoveryRate} className="h-2" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{stats.abandonedCount}</p>
                <p className="text-xs text-muted-foreground">Total Abandoned</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <p className="text-2xl font-bold text-green-600">{stats.recoveredCount}</p>
                <p className="text-xs text-muted-foreground">Recovered</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Abandoned Value</span>
                <span className="font-medium text-amber-600">${stats.abandonedValue.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recovered Value</span>
                <span className="font-medium text-green-600">${stats.recoveredValue.toFixed(0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution */}
      <div className="grid sm:grid-cols-3 gap-4">
        <ShopifyStatCard label="AI Resolved" value={0} icon={Bot} />
        <ShopifyStatCard label="Agent Resolved" value={0} icon={UserCheck} iconColor="text-green-500" />
        <ShopifyStatCard label="Chat to Purchase" value={0} icon={MessageSquare} iconColor="text-blue-500" />
      </div>
    </ShopifyPageShell>
  );
}

function FunnelStep({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value} <span className="text-muted-foreground">({pct.toFixed(0)}%)</span></span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
