import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyAbandonedCheckout,
} from '@/types/shopify';

interface DataQueryParams {
  storeId: string | undefined;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

async function fetchShopifyTable<T>(
  table: string,
  { storeId, search, page = 0, pageSize = 25 }: DataQueryParams,
  searchColumns: string[] = []
): Promise<{ data: T[]; count: number }> {
  if (!storeId) return { data: [], count: 0 };

  const from = page * pageSize;
  const to = (page + 1) * pageSize - 1;

  let query = (supabase as any)
    .from(table)
    .select('*', { count: 'exact' })
    .eq('store_id', storeId)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (search && searchColumns.length > 0) {
    const orFilter = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',');
    query = query.or(orFilter);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as T[], count: count || 0 };
}

export function useShopifyProducts(params: DataQueryParams) {
  return useQuery({
    queryKey: ['shopify-products', params.storeId, params.search, params.status, params.page],
    queryFn: () => fetchShopifyTable<ShopifyProduct>('shopify_products', params, ['title', 'handle', 'vendor']),
    enabled: !!params.storeId,
  });
}

export function useShopifyCollections(params: DataQueryParams) {
  return useQuery({
    queryKey: ['shopify-collections', params.storeId, params.search, params.page],
    queryFn: () => fetchShopifyTable<ShopifyCollection>('shopify_collections', params, ['title', 'handle']),
    enabled: !!params.storeId,
  });
}

export function useShopifyCustomers(params: DataQueryParams) {
  return useQuery({
    queryKey: ['shopify-customers', params.storeId, params.search, params.page],
    queryFn: () => fetchShopifyTable<ShopifyCustomer>('shopify_customers', params, ['email', 'phone', 'first_name', 'last_name']),
    enabled: !!params.storeId,
  });
}

export function useShopifyOrders(params: DataQueryParams) {
  return useQuery({
    queryKey: ['shopify-orders', params.storeId, params.search, params.status, params.page],
    queryFn: () => fetchShopifyTable<ShopifyOrder>('shopify_orders', params, ['order_number', 'order_name', 'email']),
    enabled: !!params.storeId,
  });
}

export function useShopifyAbandonedCheckouts(params: DataQueryParams) {
  return useQuery({
    queryKey: ['shopify-abandoned-checkouts', params.storeId, params.search, params.page],
    queryFn: () => fetchShopifyTable<ShopifyAbandonedCheckout>('shopify_abandoned_checkouts', params, ['email', 'phone']),
    enabled: !!params.storeId,
  });
}
