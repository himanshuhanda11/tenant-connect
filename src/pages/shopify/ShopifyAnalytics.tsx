import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, ShoppingCart, Users, DollarSign,
  MessageSquare, Bot, UserCheck, Package, BarChart3, PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export default function ShopifyAnalytics() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['shopify-analytics', storeId],
    queryFn: async () => {
      if (!storeId || !currentTenant) return null;
      const { data } = await (supabase as any)
        .from('shopify_sales_analytics')
        .select('*')
        .eq('store_id', storeId)
        .order('snapshot_date', { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!storeId && !!currentTenant,
  });

  // Aggregate stats from orders + checkouts + recovery
  const { data: orderStats } = useQuery({
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
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/app/integrations/shopify/${storeId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Sales Analytics</h1>
            <p className="text-sm text-muted-foreground">Track conversions, revenue, and agent performance</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.abandonedCount}</p>
                  <p className="text-xs text-muted-foreground">Abandoned Carts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.recoveredValue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Revenue Recovered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funnel & Recovery */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FunnelStep label="Store Visitors" value={stats.totalOrders + stats.abandonedCount} total={stats.totalOrders + stats.abandonedCount} />
              <FunnelStep label="Added to Cart" value={stats.totalOrders + stats.abandonedCount} total={stats.totalOrders + stats.abandonedCount} />
              <FunnelStep label="Started Checkout" value={Math.round((stats.totalOrders + stats.abandonedCount) * 0.7)} total={stats.totalOrders + stats.abandonedCount} />
              <FunnelStep label="Completed Purchase" value={stats.totalOrders} total={stats.totalOrders + stats.abandonedCount} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cart Recovery</CardTitle>
            </CardHeader>
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
                <div className="text-center p-3 bg-green-50 rounded-lg">
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
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">AI Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Agent Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Chat to Purchase</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
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
