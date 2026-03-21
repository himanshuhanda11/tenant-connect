import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type {
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyAbandonedCheckout,
  ConversationShopifyLink,
} from '@/types/shopify';

export interface ShopifyConversationContext {
  link: ConversationShopifyLink | null;
  customer: ShopifyCustomer | null;
  orders: ShopifyOrder[];
  abandonedCheckouts: ShopifyAbandonedCheckout[];
  storeDomain: string | null;
  storeCurrency: string | null;
}

export function useShopifyContext(conversationId: string | null) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ['shopify-context', conversationId, currentTenant?.id],
    queryFn: async (): Promise<ShopifyConversationContext> => {
      if (!conversationId || !currentTenant) {
        return { link: null, customer: null, orders: [], abandonedCheckouts: [], storeDomain: null, storeCurrency: null };
      }

      // 1. Get link
      const { data: links } = await (supabase as any)
        .from('conversation_shopify_links')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('tenant_id', currentTenant.id)
        .order('match_confidence', { ascending: false })
        .limit(1);

      const link = links?.[0] as ConversationShopifyLink | undefined;
      if (!link) {
        return { link: null, customer: null, orders: [], abandonedCheckouts: [], storeDomain: null, storeCurrency: null };
      }

      // 2. Get store info
      const { data: store } = await (supabase as any)
        .from('connected_stores')
        .select('store_domain, store_currency')
        .eq('id', link.store_id)
        .single();

      // 3. Get customer
      let customer: ShopifyCustomer | null = null;
      if (link.shopify_customer_record_id) {
        const { data } = await (supabase as any)
          .from('shopify_customers')
          .select('*')
          .eq('id', link.shopify_customer_record_id)
          .single();
        customer = data;
      }

      // 4. Get orders (by customer's shopify_customer_id)
      let orders: ShopifyOrder[] = [];
      if (customer?.shopify_customer_id) {
        const { data } = await (supabase as any)
          .from('shopify_orders')
          .select('*')
          .eq('store_id', link.store_id)
          .eq('shopify_customer_id', customer.shopify_customer_id)
          .order('created_at', { ascending: false })
          .limit(10);
        orders = data || [];
      }

      // 5. Get abandoned checkouts
      let abandonedCheckouts: ShopifyAbandonedCheckout[] = [];
      if (customer?.email) {
        const { data } = await (supabase as any)
          .from('shopify_abandoned_checkouts')
          .select('*')
          .eq('store_id', link.store_id)
          .eq('email', customer.email)
          .order('abandoned_at', { ascending: false })
          .limit(5);
        abandonedCheckouts = data || [];
      }

      return {
        link,
        customer,
        orders,
        abandonedCheckouts,
        storeDomain: store?.store_domain || null,
        storeCurrency: store?.store_currency || null,
      };
    },
    enabled: !!conversationId && !!currentTenant,
    staleTime: 30000,
  });
}

/**
 * Hook to auto-link a conversation to Shopify by email/phone match
 */
export function useShopifyAutoLink() {
  const { currentTenant } = useTenant();

  const autoLink = async (conversationId: string, contactEmail?: string, contactPhone?: string) => {
    if (!currentTenant || (!contactEmail && !contactPhone)) return null;

    // Find matching Shopify customer
    let query = (supabase as any)
      .from('shopify_customers')
      .select('id, store_id, shopify_customer_id')
      .eq('tenant_id', currentTenant.id);

    if (contactEmail) {
      query = query.eq('email', contactEmail);
    } else if (contactPhone) {
      query = query.eq('phone', contactPhone);
    }

    const { data: customers } = await query.limit(1);
    const customer = customers?.[0];
    if (!customer) return null;

    // Check if link already exists
    const { data: existing } = await (supabase as any)
      .from('conversation_shopify_links')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('store_id', customer.store_id)
      .limit(1);

    if (existing?.length) return existing[0];

    // Create link
    const { data: newLink, error } = await (supabase as any)
      .from('conversation_shopify_links')
      .insert({
        conversation_id: conversationId,
        tenant_id: currentTenant.id,
        store_id: customer.store_id,
        shopify_customer_record_id: customer.id,
        match_source: contactEmail ? 'email' : 'phone',
        match_confidence: contactEmail ? 0.9 : 0.7,
      })
      .select()
      .single();

    if (error) {
      console.error('Auto-link error:', error);
      return null;
    }
    return newLink;
  };

  return { autoLink };
}
