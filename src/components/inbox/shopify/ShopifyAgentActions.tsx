import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Copy, Truck, RotateCcw, CreditCard, PhoneCall, ExternalLink,
  Tag, UserPlus, Package,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ShopifyCustomer, ShopifyOrder } from '@/types/shopify';

interface Props {
  customer: ShopifyCustomer | null;
  latestOrder: ShopifyOrder | null;
  storeDomain: string | null;
  onInsertReply?: (text: string) => void;
}

export function ShopifyAgentActions({ customer, latestOrder, storeDomain, onInsertReply }: Props) {
  const shopifyAdminUrl = storeDomain ? `https://${storeDomain}/admin` : null;

  const quickReplies = [
    {
      label: 'Send Tracking',
      icon: Truck,
      enabled: !!latestOrder?.fulfillment_status,
      action: () => {
        const text = `Hi! Your order ${latestOrder?.order_name} is on its way. You can track it using your order confirmation email. Let me know if you need anything else!`;
        onInsertReply?.(text);
      },
    },
    {
      label: 'Return Policy',
      icon: RotateCcw,
      enabled: true,
      action: () => {
        onInsertReply?.('We offer easy returns within 30 days of delivery. Would you like me to help you start a return?');
      },
    },
    {
      label: 'Payment Issue',
      icon: CreditCard,
      enabled: true,
      action: () => {
        onInsertReply?.('I understand you\'re having a payment issue. Could you please share your order number so I can look into this for you?');
      },
    },
    {
      label: 'COD Confirm',
      icon: PhoneCall,
      enabled: true,
      action: () => {
        onInsertReply?.(`Hi! I'm confirming your Cash on Delivery order. Please keep the exact amount ready at the time of delivery. Is there anything else I can help with?`);
      },
    },
  ];

  const copyCustomerDetails = () => {
    if (!customer) return;
    const text = `Customer: ${customer.full_name || 'N/A'}\nEmail: ${customer.email || 'N/A'}\nPhone: ${customer.phone || 'N/A'}\nOrders: ${customer.orders_count}\nTotal Spent: ${customer.total_spent}`;
    navigator.clipboard.writeText(text);
    toast.success('Customer details copied');
  };

  return (
    <div className="space-y-3">
      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Replies</h5>
      <div className="grid grid-cols-2 gap-1.5">
        {quickReplies.map(item => (
          <Button
            key={item.label}
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-start"
            disabled={!item.enabled}
            onClick={item.action}
          >
            <item.icon className="h-3 w-3 mr-1.5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Button>
        ))}
      </div>

      <Separator />

      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</h5>
      <div className="space-y-1.5">
        {customer && (
          <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start" onClick={copyCustomerDetails}>
            <Copy className="h-3 w-3 mr-1.5" /> Copy Customer Info
          </Button>
        )}
        {shopifyAdminUrl && customer && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs justify-start"
            onClick={() => window.open(`${shopifyAdminUrl}/customers/${customer.shopify_customer_id}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1.5" /> Open in Shopify
          </Button>
        )}
        {shopifyAdminUrl && latestOrder && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs justify-start"
            onClick={() => window.open(`${shopifyAdminUrl}/orders/${latestOrder.shopify_order_id}`, '_blank')}
          >
            <Package className="h-3 w-3 mr-1.5" /> View Order in Shopify
          </Button>
        )}
      </div>
    </div>
  );
}
