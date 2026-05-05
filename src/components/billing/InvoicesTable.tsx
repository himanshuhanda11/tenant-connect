import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Download, ExternalLink, FileText, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInvoices } from '@/hooks/useBilling';
import { format } from 'date-fns';
import type { Invoice } from '@/types/billing';

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 border-green-300',
  open: 'bg-blue-100 text-blue-700 border-blue-300',
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  void: 'bg-red-100 text-red-700 border-red-300',
  uncollectible: 'bg-red-100 text-red-700 border-red-300',
};

export function InvoicesTable() {
  const { data: invoices, isLoading } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency.toLowerCase() === 'inr') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invoice.invoice_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.amount_due, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={statusColors[invoice.status] || ''}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(invoice.invoice_pdf_url || '#', '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No invoices yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => {
            const statusLabel = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
            const itemCount = invoice.line_items?.length || 0;
            return (
              <div
                key={invoice.id}
                className="rounded-xl border border-border/60 bg-card p-4 shadow-sm active:scale-[0.99] transition-transform"
                onClick={() => setSelectedInvoice(invoice)}
                role="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{invoice.invoice_number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                        {itemCount > 0 && ` · ${itemCount} item${itemCount > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-base tabular-nums">
                        {formatCurrency(invoice.amount_due, invoice.currency)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`${statusColors[invoice.status] || ''} text-[10px] mt-1 px-1.5 py-0`}
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-1.5 -mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Invoice actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="h-4 w-4 mr-2" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!invoice.invoice_pdf_url}
                          onClick={() => invoice.invoice_pdf_url && window.open(invoice.invoice_pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!invoice.hosted_invoice_url}
                          onClick={() => invoice.hosted_invoice_url && window.open(invoice.hosted_invoice_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" /> Open online
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {invoice.status === 'paid' && invoice.paid_at && (
                  <p className="text-[11px] text-green-600 mt-2.5 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Paid {format(new Date(invoice.paid_at), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 border rounded-xl border-dashed">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No invoices yet</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Sheet */}
      <Sheet open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Invoice {selectedInvoice?.invoice_number}</SheetTitle>
            <SheetDescription>
              {selectedInvoice && format(new Date(selectedInvoice.created_at), 'MMMM d, yyyy')}
            </SheetDescription>
          </SheetHeader>
          
          {selectedInvoice && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge 
                  variant="outline" 
                  className={statusColors[selectedInvoice.status] || ''}
                >
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                </Badge>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Line Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.line_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.description}</span>
                      <span className="font-medium">
                        {formatCurrency(item.amount, selectedInvoice.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.amount_due, selectedInvoice.currency)}</span>
                </div>
                {selectedInvoice.status === 'paid' && (
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Paid on</span>
                    <span>
                      {selectedInvoice.paid_at && format(new Date(selectedInvoice.paid_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => window.open(selectedInvoice.invoice_pdf_url || '#', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.open(selectedInvoice.hosted_invoice_url || '#', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Online
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
