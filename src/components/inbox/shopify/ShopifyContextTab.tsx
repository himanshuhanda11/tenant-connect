import { Loader2, ShoppingBag, Link2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopifyCustomer360 } from './ShopifyCustomer360';
import { ShopifyOrdersPanel } from './ShopifyOrdersPanel';
import { ShopifyCartPanel } from './ShopifyCartPanel';
import { ShopifyAgentActions } from './ShopifyAgentActions';
import { useShopifyContext } from '@/hooks/useShopifyContext';
import { useState } from 'react';

interface Props {
  conversationId: string | null;
  onInsertReply?: (text: string) => void;
}

export function ShopifyContextTab({ conversationId, onInsertReply }: Props) {
  const { data: ctx, isLoading, error } = useShopifyContext(conversationId);
  const [subTab, setSubTab] = useState('customer');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ctx?.link) {
    return (
      <div className="text-center py-8 px-4 text-muted-foreground">
        <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium mb-1">No Shopify link</p>
        <p className="text-xs">This conversation is not linked to a Shopify customer yet. Links are created automatically by email or phone match.</p>
      </div>
    );
  }

  const { customer, orders, abandonedCheckouts, storeDomain, storeCurrency, link } = ctx;

  return (
    <div className="p-3 space-y-3">
      {/* Match Info */}
      <div className="flex items-center gap-2">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Matched by <strong>{link.match_source}</strong>
        </span>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {Math.round(link.match_confidence * 100)}% confidence
        </Badge>
      </div>

      <Separator />

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="grid grid-cols-4 h-8">
          <TabsTrigger value="customer" className="text-xs px-1">Customer</TabsTrigger>
          <TabsTrigger value="orders" className="text-xs px-1">
            Orders {orders.length > 0 && <Badge variant="secondary" className="ml-1 h-4 text-[10px]">{orders.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="cart" className="text-xs px-1">
            Cart {abandonedCheckouts.length > 0 && <Badge variant="secondary" className="ml-1 h-4 text-[10px]">{abandonedCheckouts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs px-1">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-3">
          {customer ? (
            <ShopifyCustomer360 customer={customer} currency={storeCurrency} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Customer data not available</p>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-3">
          <ShopifyOrdersPanel
            orders={orders}
            currency={storeCurrency}
            onSendTracking={(order) => {
              onInsertReply?.(`Your order ${order.order_name} status: ${order.fulfillment_status || 'Processing'}. Let me know if you need more details!`);
            }}
          />
        </TabsContent>

        <TabsContent value="cart" className="mt-3">
          <ShopifyCartPanel
            checkouts={abandonedCheckouts}
            currency={storeCurrency}
            onSendReminder={(checkout) => {
              onInsertReply?.(`Hi! I noticed you left some items in your cart. Would you like to complete your purchase? I can help with any questions!`);
            }}
            onOfferDiscount={(checkout) => {
              onInsertReply?.(`Great news! I can offer you a special discount on your cart. Would you like a coupon code?`);
            }}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-3">
          <ShopifyAgentActions
            customer={customer}
            latestOrder={orders[0] || null}
            storeDomain={storeDomain}
            onInsertReply={onInsertReply}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
