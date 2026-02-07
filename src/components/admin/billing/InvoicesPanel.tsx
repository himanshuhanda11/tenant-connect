import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) setInvoices(data);
    setLoading(false);
  };

  const handleDownload = async (invoice: any) => {
    if (invoice.pdf_path) {
      const { data } = await supabase.storage.from('invoices').createSignedUrl(invoice.pdf_path, 3600);
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        return;
      }
    }

    // Generate on-the-fly
    toast.info('Generating invoice...');
    const { data, error } = await supabase.functions.invoke('invoice-generate-pdf', {
      body: { invoiceId: invoice.id },
    });

    if (error) {
      toast.error('Failed to generate invoice');
      return;
    }

    if (data?.download_url) {
      window.open(data.download_url, '_blank');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'void': return 'secondary';
      case 'refunded': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No invoices yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">{inv.provider}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatCurrency(inv.amount, inv.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(inv.status) as any} className="text-[11px]">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(inv.created_at).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(inv)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
