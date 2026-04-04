import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Receipt,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  paid: { label: 'Paid', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0' },
  open: { label: 'Open', icon: <Clock className="h-3 w-3" />, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0' },
  draft: { label: 'Draft', icon: <FileText className="h-3 w-3" />, className: 'bg-muted text-muted-foreground border-0' },
  void: { label: 'Void', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0' },
  uncollectible: { label: 'Uncollectible', icon: <AlertCircle className="h-3 w-3" />, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0' },
};

export function InvoiceHistory() {
  const { currentTenant } = useTenant();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', currentTenant?.id, page, statusFilter],
    queryFn: async () => {
      if (!currentTenant?.id) return { invoices: [], total: 0 };

      let query = supabase
        .from('platform_invoices')
        .select('*', { count: 'exact' })
        .eq('workspace_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: invoices, error, count } = await query;
      if (error) throw error;
      return { invoices: invoices ?? [], total: count ?? 0 };
    },
    enabled: !!currentTenant?.id,
  });

  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatCurrency = (amount: number, currency: string = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Invoice History
            </CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">No invoices yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Invoices will appear here once your first billing cycle completes or you make a purchase.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Invoice</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => {
                    const sc = statusConfig[inv.status] ?? statusConfig.draft;
                    return (
                      <TableRow key={inv.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{inv.invoice_number || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(inv.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {inv.period_start && inv.period_end
                            ? `${format(new Date(inv.period_start), 'MMM d')} — ${format(new Date(inv.period_end), 'MMM d, yyyy')}`
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold">
                            {formatCurrency(inv.amount, inv.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] gap-1 px-2 py-0.5 ${sc.className}`}>
                            {sc.icon} {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {inv.pdf_path && (
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" asChild>
                                <a href={inv.pdf_path} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3" /> PDF
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                              <ExternalLink className="h-3 w-3" /> View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {invoices.map((inv: any) => {
                const sc = statusConfig[inv.status] ?? statusConfig.draft;
                return (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{inv.invoice_number || '—'}</span>
                        <span className="text-sm font-bold">{formatCurrency(inv.amount, inv.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(inv.created_at), 'MMM d, yyyy')}
                        </span>
                        <Badge className={`text-[10px] gap-1 px-1.5 py-0 h-4 ${sc.className}`}>
                          {sc.icon} {sc.label}
                        </Badge>
                      </div>
                    </div>
                    {inv.pdf_path && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" asChild>
                        <a href={inv.pdf_path} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
