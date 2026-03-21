import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User, Mail, Phone, MapPin, ShoppingBag, DollarSign,
  Calendar, Tag, CheckCircle, XCircle, Star,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { ShopifyCustomer } from '@/types/shopify';

interface Props {
  customer: ShopifyCustomer;
  currency?: string | null;
}

export function ShopifyCustomer360({ customer, currency = 'USD' }: Props) {
  const avgOrderValue = customer.orders_count > 0
    ? (customer.total_spent / customer.orders_count).toFixed(2)
    : '0.00';

  const address = customer.default_address as Record<string, string> | null;
  const addressLine = address
    ? [address.city, address.province, address.country].filter(Boolean).join(', ')
    : null;

  const initials = [customer.first_name?.[0], customer.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">
            {customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown'}
          </h4>
          <p className="text-xs text-muted-foreground">
            Shopify #{customer.shopify_customer_id}
          </p>
        </div>
        {customer.total_spent >= 500 && (
          <Badge className="bg-amber-100 text-amber-700 border-0">
            <Star className="h-3 w-3 mr-1" /> VIP
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-muted/50">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold">{customer.orders_count}</p>
            <p className="text-[10px] text-muted-foreground">Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold">{currency} {customer.total_spent.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-2.5 text-center">
            <p className="text-lg font-bold">{currency} {avgOrderValue}</p>
            <p className="text-[10px] text-muted-foreground">AOV</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Contact Details */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</h5>
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{customer.email}</span>
            {customer.verified_email && <CheckCircle className="h-3 w-3 text-green-500" />}
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
        )}
        {addressLine && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{addressLine}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Marketing & Tags */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profile</h5>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Marketing</span>
          <Badge variant={customer.accepts_marketing ? 'secondary' : 'outline'}>
            {customer.accepts_marketing ? 'Opted In' : 'Opted Out'}
          </Badge>
        </div>
        {customer.last_order_at && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Order</span>
            <span>{formatDistanceToNow(new Date(customer.last_order_at), { addSuffix: true })}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">State</span>
          <Badge variant="outline" className="capitalize">{customer.state || 'enabled'}</Badge>
        </div>
      </div>

      {customer.tags && customer.tags.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</h5>
            <div className="flex flex-wrap gap-1">
              {customer.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {customer.note && (
        <>
          <Separator />
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Note</h5>
            <p className="text-sm text-muted-foreground">{customer.note}</p>
          </div>
        </>
      )}
    </div>
  );
}
