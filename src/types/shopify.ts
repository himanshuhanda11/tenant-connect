// Shopify Integration Types

export type ShopifyStoreStatus = 'pending' | 'connected' | 'disconnected' | 'error' | 'uninstalled';
export type ShopifySyncJobType = 'initial_sync' | 'products_sync' | 'collections_sync' | 'customers_sync' | 'orders_sync' | 'abandoned_checkouts_sync' | 'webhook_replay';
export type ShopifySyncStatus = 'queued' | 'running' | 'completed' | 'failed' | 'partial';
export type ShopifyWebhookStatus = 'received' | 'processing' | 'processed' | 'failed' | 'ignored';
export type ShopifyRecoveryStatus = 'new' | 'contacted' | 'recovered' | 'expired' | 'ignored';
export type ShopifyLogLevel = 'info' | 'warning' | 'error';
export type ShopifyMatchSource = 'email' | 'phone' | 'manual' | 'cookie' | 'order_lookup' | 'checkout_lookup' | 'ai_inferred';

export interface ConnectedStore {
  id: string;
  tenant_id: string;
  platform: 'shopify';
  store_name: string | null;
  store_domain: string;
  shopify_shop_id: string | null;
  scopes: string[] | null;
  store_plan: string | null;
  store_currency: string | null;
  store_timezone: string | null;
  store_email: string | null;
  status: ShopifyStoreStatus;
  installed_at: string | null;
  last_synced_at: string | null;
  app_embed_enabled: boolean;
  webhooks_registered: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  store_id: string;
  widget_enabled: boolean;
  widget_pages: string[];
  show_on_home: boolean;
  show_on_product: boolean;
  show_on_collection: boolean;
  show_on_cart: boolean;
  show_on_checkout: boolean;
  ai_enabled: boolean;
  whatsapp_enabled: boolean;
  business_hours_enabled: boolean;
  business_hours_json: Record<string, unknown> | null;
  default_agent_id: string | null;
  default_team: string | null;
  brand_settings: Record<string, unknown> | null;
  trigger_rules: Record<string, unknown> | null;
  page_targeting: Record<string, unknown> | null;
  localization: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyProduct {
  id: string;
  tenant_id: string;
  store_id: string;
  shopify_product_id: string;
  title: string | null;
  handle: string | null;
  vendor: string | null;
  product_type: string | null;
  status: string | null;
  tags: string[] | null;
  description_html: string | null;
  featured_image_url: string | null;
  collections_cache: string[] | null;
  published_at: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyProductVariant {
  id: string;
  product_id: string;
  store_id: string;
  shopify_variant_id: string;
  title: string | null;
  sku: string | null;
  barcode: string | null;
  price: number | null;
  compare_at_price: number | null;
  inventory_quantity: number;
  inventory_policy: string | null;
  requires_shipping: boolean;
  taxable: boolean;
  image_url: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyCollection {
  id: string;
  tenant_id: string;
  store_id: string;
  shopify_collection_id: string;
  title: string | null;
  handle: string | null;
  collection_type: string | null;
  description_html: string | null;
  image_url: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyCustomer {
  id: string;
  tenant_id: string;
  store_id: string;
  shopify_customer_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  tags: string[] | null;
  accepts_marketing: boolean;
  total_spent: number;
  orders_count: number;
  last_order_id: string | null;
  last_order_at: string | null;
  default_address: Record<string, unknown> | null;
  note: string | null;
  verified_email: boolean;
  state: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyOrder {
  id: string;
  tenant_id: string;
  store_id: string;
  shopify_order_id: string;
  shopify_customer_id: string | null;
  order_number: string | null;
  order_name: string | null;
  email: string | null;
  phone: string | null;
  currency: string | null;
  total_price: number | null;
  subtotal_price: number | null;
  total_discounts: number | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  closed_at: string | null;
  processed_at: string | null;
  tags: string[] | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  line_items_json: Record<string, unknown>[] | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyAbandonedCheckout {
  id: string;
  tenant_id: string;
  store_id: string;
  shopify_checkout_id: string;
  checkout_token: string | null;
  email: string | null;
  phone: string | null;
  line_items_json: Record<string, unknown>[] | null;
  cart_value: number | null;
  currency: string | null;
  abandoned_at: string | null;
  recovery_status: ShopifyRecoveryStatus;
  recovery_source: string | null;
  checkout_url: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyWebhookEvent {
  id: string;
  tenant_id: string;
  store_id: string;
  source: string;
  topic: string;
  shop_domain: string | null;
  event_id: string | null;
  payload: Record<string, unknown> | null;
  headers: Record<string, unknown> | null;
  signature_valid: boolean;
  processing_status: ShopifyWebhookStatus;
  error_message: string | null;
  retry_count: number;
  received_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifySyncJob {
  id: string;
  tenant_id: string;
  store_id: string;
  job_type: ShopifySyncJobType;
  resource_type: string | null;
  status: ShopifySyncStatus;
  started_at: string | null;
  finished_at: string | null;
  last_cursor: string | null;
  items_processed: number;
  items_failed: number;
  error_log: string | null;
  metadata: Record<string, unknown> | null;
  triggered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifySyncLog {
  id: string;
  job_id: string;
  store_id: string;
  level: ShopifyLogLevel;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

export interface ConversationShopifyLink {
  id: string;
  conversation_id: string;
  tenant_id: string;
  store_id: string;
  shopify_customer_record_id: string | null;
  shopify_order_record_id: string | null;
  shopify_checkout_record_id: string | null;
  match_source: ShopifyMatchSource;
  match_confidence: number;
  linked_by: string | null;
  created_at: string;
  updated_at: string;
}

// Sync resource types for the sync trigger
export type SyncResource = 'all' | 'products' | 'collections' | 'customers' | 'orders' | 'abandoned_checkouts';

// Store health summary
export interface StoreHealthSummary {
  authValid: boolean;
  webhooksRegistered: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: ShopifySyncStatus | null;
  productCount: number;
  customerCount: number;
  orderCount: number;
  appEmbedEnabled: boolean;
}
