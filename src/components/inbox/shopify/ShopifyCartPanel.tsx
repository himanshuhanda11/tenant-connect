import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart, Clock, AlertTriangle, Send, Percent, Package,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ShopifyAbandonedCheckout } from '@/types/shopify';

interface Props {
  checkouts: ShopifyAbandonedCheckout[];
  currency?: string | null;
  onSendReminder?: (checkout: ShopifyAbandonedCheckout) => void;
  onOfferDiscount?: (checkout: ShopifyAbandonedCheckout) => void;
}

function getAbandonmentRisk(abandonedAt: string | null): { label: string; color: string } {
  if (!abandonedAt) return { label: 'Unknown', color: 'bg-muted text-muted-foreground' };
  const hours = (Date.now() - new Date(abandonedAt).getTime()) / 3600000;
  if (hours < 1) return { label: 'Low', color: 'bg-green-100 text-green-700' };
  if (hours < 6) return { label: 'Medium', color: 'bg-amber-100 text-amber-700' };
  if (hours < 24) return { label: 'High', color: 'bg-orange-100 text-orange-700' };
  return { label: 'Critical', color: 'bg-red-100 text-red-700' };
}

const RECOVERY_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  recovered: 'bg-green-100 text-green-700',
  expired: 'bg-muted text-muted-foreground',
  ignored: 'bg-muted text-muted-foreground',
};

export function ShopifyCartPanel({ checkouts, currency = 'USD', onSendReminder, onOfferDiscount }: Props) {
  if (!checkouts.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
        No abandoned checkouts
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Abandoned Checkouts ({checkouts.length})
      </h5>
      {checkouts.map(checkout => {
        const risk = getAbandonmentRisk(checkout.abandoned_at);
        const items = (checkout.line_items_json || []) as Array<Record<string, any>>;

        return (
          <Card key={checkout.id}>
            <CardContent className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{currency} {checkout.cart_value?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className={`text-[10px] border-0 ${risk.color}`}>
                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {risk.label}
                  </Badge>
                  <Badge variant="secondary" className={`text-[10px] border-0 ${RECOVERY_COLORS[checkout.recovery_status] || ''}`}>
                    {checkout.recovery_status}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div className="space-y-1">
                  {items.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="truncate flex-1">{item.title}</span>
                      <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                    </div>
                  ))}
                  {items.length > 4 && (
                    <p className="text-[10px] text-muted-foreground">+{items.length - 4} more items</p>
                  )}
                </div>
              )}

              {checkout.abandoned_at && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Abandoned {formatDistanceToNow(new Date(checkout.abandoned_at), { addSuffix: true })}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-1">
                {onSendReminder && checkout.recovery_status === 'new' && (
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => onSendReminder(checkout)}>
                    <Send className="h-3 w-3 mr-1" /> Remind
                  </Button>
                )}
                {onOfferDiscount && (
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => onOfferDiscount(checkout)}>
                    <Percent className="h-3 w-3 mr-1" /> Discount
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
