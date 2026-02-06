import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminKPICard } from '@/components/admin/AdminKPICard';
import { DollarSign, Receipt, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminBilling() {
  const { role } = useOutletContext<{ role: string }>();
  const isSuperAdmin = role === 'super_admin';

  // Placeholder data — will be wired to actual API
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPICard
          label="30-Day Revenue"
          value="—"
          subtitle="Data coming soon"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <AdminKPICard
          label="Lifetime Revenue"
          value="—"
          subtitle="All time"
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <AdminKPICard
          label="Paid Invoices (30d)"
          value="—"
          subtitle="Last 30 days"
          icon={Receipt}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <AdminKPICard
          label="Refunds (30d)"
          value="—"
          subtitle="Last 30 days"
          icon={RefreshCw}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList className="rounded-xl">
          <TabsTrigger value="invoices" className="rounded-lg text-sm">Paid Invoices</TabsTrigger>
          <TabsTrigger value="refunds" className="rounded-lg text-sm">Refunds</TabsTrigger>
          <TabsTrigger value="failed" className="rounded-lg text-sm">Failed Payments</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="adjustments" className="rounded-lg text-sm">Manual Adjustments</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="py-12 text-center">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Billing data will be available once Stripe integration is connected.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No refunds recorded.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="py-12 text-center">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">No failed payments.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="adjustments" className="mt-4">
            <Card className="rounded-2xl shadow-sm border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Manual adjustment features coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
