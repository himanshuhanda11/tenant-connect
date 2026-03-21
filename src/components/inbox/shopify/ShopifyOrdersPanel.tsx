import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Package, ChevronDown, ChevronUp, Copy, Truck, CreditCard,
  Clock, CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { ShopifyOrder } from '@/types/shopify';

interface Props {
  orders: ShopifyOrder[];
  currency?: string | null;
  onSendTracking?: (order: ShopifyOrder) => void;
}

const FINANCIAL_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-red-100 text-red-700',
  partially_refunded: 'bg-orange-100 text-orange-700',
  voided: 'bg-muted text-muted-foreground',
};

const FULFILLMENT_COLORS: Record<string, string> = {
  fulfilled: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  unfulfilled: 'bg-red-100 text-red-700',
};

export function ShopifyOrdersPanel({ orders, currency = 'USD', onSendTracking }: Props) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (!orders.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
        No orders found
      </div>
    );
  }

  const copyOrderDetails = (order: ShopifyOrder) => {
    const text = `Order: ${order.order_name}\nStatus: ${order.financial_status} / ${order.fulfillment_status || 'Unfulfilled'}\nTotal: ${currency} ${order.total_price}\nDate: ${order.processed_at ? format(new Date(order.processed_at), 'MMM d, yyyy') : 'N/A'}`;
    navigator.clipboard.writeText(text);
    toast.success('Order details copied');
  };

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Orders ({orders.length})
      </h5>
      {orders.map(order => {
        const isExpanded = expandedOrder === order.id;
        const lineItems = (order.line_items_json || []) as Array<Record<string, any>>;

        return (
          <Collapsible key={order.id} open={isExpanded} onOpenChange={() => setExpandedOrder(isExpanded ? null : order.id)}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{order.order_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{currency} {order.total_price}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className={`text-[10px] border-0 ${FINANCIAL_COLORS[order.financial_status || ''] || ''}`}>
                      {order.financial_status || 'unknown'}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] border-0 ${FULFILLMENT_COLORS[order.fulfillment_status || 'unfulfilled'] || ''}`}>
                      {order.fulfillment_status || 'unfulfilled'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {order.processed_at && formatDistanceToNow(new Date(order.processed_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <Separator />
                <CardContent className="p-3 space-y-3">
                  {/* Line items */}
                  {lineItems.length > 0 && (
                    <div className="space-y-1.5">
                      <h6 className="text-[10px] font-medium text-muted-foreground uppercase">Items</h6>
                      {lineItems.slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="truncate flex-1">{item.title} {item.variant_title ? `(${item.variant_title})` : ''}</span>
                          <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shipping */}
                  {order.shipping_address && (
                    <div className="text-xs">
                      <h6 className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Shipping</h6>
                      <p className="text-muted-foreground">
                        {[
                          (order.shipping_address as any).city,
                          (order.shipping_address as any).province,
                          (order.shipping_address as any).country,
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => copyOrderDetails(order)}>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    {onSendTracking && order.fulfillment_status && (
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => onSendTracking(order)}>
                        <Truck className="h-3 w-3 mr-1" /> Send Tracking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
