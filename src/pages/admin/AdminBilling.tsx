import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AdminKPICard } from '@/components/admin/AdminKPICard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { DollarSign, Receipt, RefreshCw, AlertTriangle, FileText, PlusCircle } from 'lucide-react';

const MOCK_INVOICES = [
  { id: 'INV-001', workspace: 'Acme Corp', amount: 4900, provider: 'Razorpay', date: '2025-02-01', status: 'paid' },
  { id: 'INV-002', workspace: 'Beta Labs', amount: 2900, provider: 'Razorpay', date: '2025-02-01', status: 'paid' },
  { id: 'INV-003', workspace: 'Gamma Inc', amount: 9900, provider: 'Stripe', date: '2025-01-15', status: 'paid' },
];

const MOCK_REFUNDS = [
  { id: 'REF-001', workspace: 'Delta Co', amount: 2900, reason: 'Duplicate charge', date: '2025-01-28', status: 'completed' },
];

const MOCK_FAILED = [
  { id: 'FAIL-001', workspace: 'Epsilon LLC', amount: 4900, error: 'Card declined', date: '2025-02-03', attempts: 3 },
];

export default function AdminBilling() {
  const { role } = useOutletContext<{ role: string }>();
  const isSuperAdmin = role === 'super_admin';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKPICard label="30-Day Revenue" value="$17,700" subtitle="+12% vs last period" icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={12} />
        <AdminKPICard label="Lifetime Revenue" value="$142,800" subtitle="All time" icon={DollarSign} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <AdminKPICard label="Paid Invoices (30d)" value="48" subtitle="Last 30 days" icon={Receipt} iconBg="bg-purple-50" iconColor="text-purple-600" trend={5} />
        <AdminKPICard label="Refunds (30d)" value="2" subtitle="$5,800 total" icon={RefreshCw} iconBg="bg-orange-50" iconColor="text-orange-600" trend={-50} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList className="rounded-xl">
          <TabsTrigger value="invoices" className="rounded-lg text-sm gap-1"><Receipt className="h-3.5 w-3.5" />Paid Invoices</TabsTrigger>
          <TabsTrigger value="refunds" className="rounded-lg text-sm gap-1"><RefreshCw className="h-3.5 w-3.5" />Refunds</TabsTrigger>
          <TabsTrigger value="failed" className="rounded-lg text-sm gap-1"><AlertTriangle className="h-3.5 w-3.5" />Failed</TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="adjustments" className="rounded-lg text-sm gap-1"><FileText className="h-3.5 w-3.5" />Manual Adj.</TabsTrigger>
          )}
        </TabsList>

        {/* Paid Invoices */}
        <TabsContent value="invoices" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_INVOICES.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                      <TableCell className="font-medium text-sm">{inv.workspace}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">₹{(inv.amount / 100).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[11px]">{inv.provider}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{inv.date}</TableCell>
                      <TableCell><AdminStatusBadge status="active" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds */}
        <TabsContent value="refunds" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Refund ID</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_REFUNDS.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="font-medium text-sm">{r.workspace}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">₹{(r.amount / 100).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                      <TableCell><AdminStatusBadge status="active" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Payments */}
        <TabsContent value="failed" className="mt-4">
          <Card className="rounded-2xl shadow-sm border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attempts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_FAILED.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-xs">{f.id}</TableCell>
                      <TableCell className="font-medium text-sm">{f.workspace}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">₹{(f.amount / 100).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-destructive">{f.error}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{f.date}</TableCell>
                      <TableCell><Badge variant="destructive" className="text-[11px]">{f.attempts} attempts</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Adjustments */}
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
