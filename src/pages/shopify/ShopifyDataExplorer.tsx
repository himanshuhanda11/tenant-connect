import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  Search,
  Package,
  FolderOpen,
  Users,
  ShoppingCart,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  useShopifyProducts,
  useShopifyCollections,
  useShopifyCustomers,
  useShopifyOrders,
  useShopifyAbandonedCheckouts,
} from '@/hooks/useShopifyData';

function DataTable<T extends Record<string, any>>({
  data,
  count,
  isLoading,
  columns,
  page,
  onPageChange,
  emptyIcon: EmptyIcon,
  emptyMessage,
}: {
  data: T[];
  count: number;
  isLoading: boolean;
  columns: { key: string; label: string; render?: (item: T) => React.ReactNode }[];
  page: number;
  onPageChange: (p: number) => void;
  emptyIcon: React.ElementType;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <EmptyIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const pageSize = 25;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map(col => (
                <th key={col.key} className="text-left py-2 px-3 font-medium text-muted-foreground">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={item.id || i} className="border-b last:border-0 hover:bg-muted/50">
                {columns.map(col => (
                  <td key={col.key} className="py-2 px-3">
                    {col.render ? col.render(item) : String(item[col.key] || '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">{count} total records</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopifyDataExplorer() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('products');
  const [page, setPage] = useState(0);

  const params = { storeId, search, page };
  const products = useShopifyProducts(params);
  const collections = useShopifyCollections(params);
  const customers = useShopifyCustomers(params);
  const orders = useShopifyOrders(params);
  const checkouts = useShopifyAbandonedCheckouts(params);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/app/integrations/shopify/${storeId}`)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          Data Explorer
        </h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search across all data..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(0); }}>
          <TabsList className="mb-4">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-1.5" />
              Products
              {products.data && <Badge variant="secondary" className="ml-1.5 text-xs">{products.data.count}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="collections">
              <FolderOpen className="w-4 h-4 mr-1.5" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="w-4 h-4 mr-1.5" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="checkouts">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Abandoned
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="pt-4">
              <TabsContent value="products" className="mt-0">
                <DataTable
                  data={products.data?.data || []}
                  count={products.data?.count || 0}
                  isLoading={products.isLoading}
                  page={page}
                  onPageChange={setPage}
                  emptyIcon={Package}
                  emptyMessage="No products synced yet"
                  columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'vendor', label: 'Vendor' },
                    { key: 'product_type', label: 'Type' },
                    { key: 'status', label: 'Status', render: (p) => <Badge variant="outline" className="capitalize text-xs">{p.status}</Badge> },
                    { key: 'handle', label: 'Handle' },
                  ]}
                />
              </TabsContent>

              <TabsContent value="collections" className="mt-0">
                <DataTable
                  data={collections.data?.data || []}
                  count={collections.data?.count || 0}
                  isLoading={collections.isLoading}
                  page={page}
                  onPageChange={setPage}
                  emptyIcon={FolderOpen}
                  emptyMessage="No collections synced yet"
                  columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'handle', label: 'Handle' },
                    { key: 'collection_type', label: 'Type' },
                  ]}
                />
              </TabsContent>

              <TabsContent value="customers" className="mt-0">
                <DataTable
                  data={customers.data?.data || []}
                  count={customers.data?.count || 0}
                  isLoading={customers.isLoading}
                  page={page}
                  onPageChange={setPage}
                  emptyIcon={Users}
                  emptyMessage="No customers synced yet"
                  columns={[
                    { key: 'full_name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'orders_count', label: 'Orders' },
                    { key: 'total_spent', label: 'Spent', render: (c) => c.total_spent ? `$${c.total_spent}` : '—' },
                  ]}
                />
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <DataTable
                  data={orders.data?.data || []}
                  count={orders.data?.count || 0}
                  isLoading={orders.isLoading}
                  page={page}
                  onPageChange={setPage}
                  emptyIcon={ShoppingCart}
                  emptyMessage="No orders synced yet"
                  columns={[
                    { key: 'order_name', label: 'Order' },
                    { key: 'email', label: 'Email' },
                    { key: 'total_price', label: 'Total', render: (o) => o.total_price ? `${o.currency || '$'}${o.total_price}` : '—' },
                    { key: 'financial_status', label: 'Payment', render: (o) => <Badge variant="outline" className="capitalize text-xs">{o.financial_status}</Badge> },
                    { key: 'fulfillment_status', label: 'Fulfillment', render: (o) => <Badge variant="outline" className="capitalize text-xs">{o.fulfillment_status || 'unfulfilled'}</Badge> },
                  ]}
                />
              </TabsContent>

              <TabsContent value="checkouts" className="mt-0">
                <DataTable
                  data={checkouts.data?.data || []}
                  count={checkouts.data?.count || 0}
                  isLoading={checkouts.isLoading}
                  page={page}
                  onPageChange={setPage}
                  emptyIcon={AlertTriangle}
                  emptyMessage="No abandoned checkouts synced yet"
                  columns={[
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'cart_value', label: 'Cart Value', render: (c) => c.cart_value ? `${c.currency || '$'}${c.cart_value}` : '—' },
                    { key: 'recovery_status', label: 'Recovery', render: (c) => <Badge variant="outline" className="capitalize text-xs">{c.recovery_status}</Badge> },
                    { key: 'abandoned_at', label: 'Abandoned' },
                  ]}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
