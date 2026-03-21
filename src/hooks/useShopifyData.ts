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

function useShopifyTable<T>(
  table: string,
  queryKey: string,
  { storeId, search, status, page = 0, pageSize = 25 }: DataQueryParams,
  searchColumns: string[] = []
) {
  return useQuery({
    queryKey: [queryKey, storeId, search, status, page],
    queryFn: async () => {
      if (!storeId) return { data: [] as T[], count: 0 };

      let query = supabase
        .from(table as any)
        .select('*', { count: 'exact' })
        .eq('store_id', storeId)
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });

      if (search && searchColumns.length > 0) {
        const orFilter = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',');
        query = query.or(orFilter);
      }

      if (status) {
        query = query.eq('status' as any, status);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data || []) as T[], count: count || 0 };
    },
    enabled: !!storeId,
  });
}

export function useShopifyProducts(params: DataQueryParams) {
  return useShopifyTable<ShopifyProduct>(
    'shopify_products',
    'shopify-products',
    params,
    ['title', 'handle', 'vendor']
  );
}

export function useShopifyCollections(params: DataQueryParams) {
  return useShopifyTable<ShopifyCollection>(
    'shopify_collections',
    'shopify-collections',
    params,
    ['title', 'handle']
  );
}

export function useShopifyCustomers(params: DataQueryParams) {
  return useShopifyTable<ShopifyCustomer>(
    'shopify_customers',
    'shopify-customers',
    params,
    ['email', 'phone', 'first_name', 'last_name']
  );
}

export function useShopifyOrders(params: DataQueryParams) {
  return useShopifyTable<ShopifyOrder>(
    'shopify_orders',
    'shopify-orders',
    params,
    ['order_number', 'order_name', 'email']
  );
}

export function useShopifyAbandonedCheckouts(params: DataQueryParams) {
  return useShopifyTable<ShopifyAbandonedCheckout>(
    'shopify_abandoned_checkouts',
    'shopify-abandoned-checkouts',
    params,
    ['email', 'phone']
  );
}
