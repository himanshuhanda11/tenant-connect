import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AdminKPICard } from '@/components/admin/AdminKPICard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { DollarSign, Receipt, RefreshCw, AlertTriangle, FileText, PlusCircle, TrendingUp, ShieldAlert, Download, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RevenueChart } from '@/components/admin/billing/RevenueChart';
import { InvoicesPanel } from '@/components/admin/billing/InvoicesPanel';
import { RiskEventsPanel } from '@/components/admin/billing/RiskEventsPanel';
import { BillingEventsTable } from '@/components/admin/billing/BillingEventsTable';

export default function AdminBilling() {
  const { role } = useOutletContext<{ role: string }>();
  const isSuperAdmin = role === 'super_admin';

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('platform_revenue_summary', { p_days: 30 });
      if (!error && data) {
        setSummary(Array.isArray(data) ? data[0] : data);
      }
    } catch (e) {
      console.error('Revenue summary error:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Revenue & Billing</h1>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchSummary}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminKPICard
          label="Gross Revenue (30d)"
          value={loading ? '...' : formatCurrency(summary?.gross)}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <AdminKPICard
          label="Net Revenue (30d)"
          value={loading ? '...' : formatCurrency(summary?.net)}
          icon={TrendingUp}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <AdminKPICard
          label="Refunds (30d)"
          value={loading ? '...' : formatCurrency(summary?.refunds)}
          icon={RefreshCw}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <AdminKPICard
          label="Payments (30d)"
          value={loading ? '...' : String(summary?.payments_count || 0)}
          icon={Receipt}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <AdminKPICard
          label="Active Subscriptions"
          value={loading ? '...' : String(summary?.active_subscriptions || 0)}
          icon={BarChart3}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-sm gap-1">
            <TrendingUp className="h-3.5 w-3.5" />Revenue
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg text-sm gap-1">
            <Receipt className="h-3.5 w-3.5" />Invoices
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-lg text-sm gap-1">
            <FileText className="h-3.5 w-3.5" />Billing Events
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="risk" className="rounded-lg text-sm gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />Anti-Fraud
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="adjustments" className="rounded-lg text-sm gap-1">
              <PlusCircle className="h-3.5 w-3.5" />Adjustments
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <RevenueChart />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <InvoicesPanel />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <BillingEventsTable />
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="risk" className="mt-4">
            <RiskEventsPanel />
          </TabsContent>
        )}

        {isSuperAdmin && (
          <TabsContent value="adjustments" className="mt-4">
            <Card className="rounded-2xl shadow-sm border-border/50">
              <CardContent className="py-12 text-center">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <PlusCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Manual Adjustments</p>
                <p className="text-xs text-muted-foreground mb-4">Credit or debit workspaces manually. Available soon.</p>
                <Button variant="outline" size="sm" className="rounded-xl" disabled>
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> New Adjustment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
