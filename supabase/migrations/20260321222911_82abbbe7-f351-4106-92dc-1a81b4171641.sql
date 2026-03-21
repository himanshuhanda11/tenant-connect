
-- =============================================
-- Shopify Integration Schema - Step 1
-- =============================================

-- Status enums
CREATE TYPE public.shopify_store_status AS ENUM ('pending','connected','disconnected','error','uninstalled');
CREATE TYPE public.shopify_sync_job_type AS ENUM ('initial_sync','products_sync','collections_sync','customers_sync','orders_sync','abandoned_checkouts_sync','webhook_replay');
CREATE TYPE public.shopify_sync_status AS ENUM ('queued','running','completed','failed','partial');
CREATE TYPE public.shopify_webhook_status AS ENUM ('received','processing','processed','failed','ignored');
CREATE TYPE public.shopify_recovery_status AS ENUM ('new','contacted','recovered','expired','ignored');
CREATE TYPE public.shopify_log_level AS ENUM ('info','warning','error');
CREATE TYPE public.shopify_match_source AS ENUM ('email','phone','manual','cookie','order_lookup','checkout_lookup','ai_inferred');

-- 1. connected_stores
CREATE TABLE public.connected_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'shopify' CHECK (platform IN ('shopify')),
  store_name text,
  store_domain text NOT NULL,
  shopify_shop_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  scopes text[],
  store_plan text,
  store_currency text,
  store_timezone text,
  store_email text,
  status public.shopify_store_status NOT NULL DEFAULT 'pending',
  installed_at timestamptz,
  last_synced_at timestamptz,
  app_embed_enabled boolean DEFAULT false,
  webhooks_registered boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, store_domain)
);

CREATE INDEX idx_connected_stores_tenant ON public.connected_stores(tenant_id);
CREATE INDEX idx_connected_stores_domain ON public.connected_stores(store_domain);
CREATE INDEX idx_connected_stores_status ON public.connected_stores(status);

-- 2. store_settings
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE UNIQUE,
  widget_enabled boolean DEFAULT true,
  widget_pages text[] DEFAULT '{}',
  show_on_home boolean DEFAULT true,
  show_on_product boolean DEFAULT true,
  show_on_collection boolean DEFAULT false,
  show_on_cart boolean DEFAULT true,
  show_on_checkout boolean DEFAULT false,
  ai_enabled boolean DEFAULT false,
  whatsapp_enabled boolean DEFAULT false,
  business_hours_enabled boolean DEFAULT false,
  business_hours_json jsonb,
  default_agent_id uuid REFERENCES public.profiles(id),
  default_team text,
  brand_settings jsonb,
  trigger_rules jsonb,
  page_targeting jsonb,
  localization jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. shopify_products
CREATE TABLE public.shopify_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_product_id text NOT NULL,
  title text,
  handle text,
  vendor text,
  product_type text,
  status text,
  tags text[],
  description_html text,
  featured_image_url text,
  collections_cache text[],
  published_at timestamptz,
  raw_json jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, shopify_product_id)
);

CREATE INDEX idx_shopify_products_store ON public.shopify_products(store_id);
CREATE INDEX idx_shopify_products_tenant ON public.shopify_products(tenant_id);
CREATE INDEX idx_shopify_products_title ON public.shopify_products(title);
CREATE INDEX idx_shopify_products_handle ON public.shopify_products(handle);

-- 4. shopify_product_variants
CREATE TABLE public.shopify_product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.shopify_products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_variant_id text NOT NULL,
  title text,
  sku text,
  barcode text,
  price numeric,
  compare_at_price numeric,
  inventory_quantity integer DEFAULT 0,
  inventory_policy text,
  requires_shipping boolean DEFAULT true,
  taxable boolean DEFAULT true,
  image_url text,
  raw_json jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, shopify_variant_id)
);

-- 5. shopify_collections
CREATE TABLE public.shopify_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_collection_id text NOT NULL,
  title text,
  handle text,
  collection_type text,
  description_html text,
  image_url text,
  raw_json jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, shopify_collection_id)
);

-- 6. shopify_customers
CREATE TABLE public.shopify_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_customer_id text NOT NULL,
  first_name text,
  last_name text,
  full_name text GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
  email text,
  phone text,
  tags text[],
  accepts_marketing boolean DEFAULT false,
  total_spent numeric DEFAULT 0,
  orders_count integer DEFAULT 0,
  last_order_id text,
  last_order_at timestamptz,
  default_address jsonb,
  note text,
  verified_email boolean DEFAULT false,
  state text,
  raw_json jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, shopify_customer_id)
);

CREATE INDEX idx_shopify_customers_email ON public.shopify_customers(email);
CREATE INDEX idx_shopify_customers_phone ON public.shopify_customers(phone);

-- 7. shopify_orders
CREATE TABLE public.shopify_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_order_id text NOT NULL,
  shopify_customer_id text,
  order_number text,
  order_name text,
  email text,
  phone text,
  currency text,
  total_price numeric,
  subtotal_price numeric,
  total_discounts numeric,
  financial_status text,
  fulfillment_status text,
  cancel_reason text,
  cancelled_at timestamptz,
  closed_at timestamptz,
  processed_at timestamptz,
  tags text[],
  shipping_address jsonb,
  billing_address jsonb,
  customer_json jsonb,
  line_items_json jsonb,
  fulfillments_json jsonb,
  tracking_json jsonb,
  raw_json jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, shopify_order_id)
);

CREATE INDEX idx_shopify_orders_number ON public.shopify_orders(order_number);
CREATE INDEX idx_shopify_orders_financial ON public.shopify_orders(financial_status);
CREATE INDEX idx_shopify_orders_fulfillment ON public.shopify_orders(fulfillment_status);
CREATE INDEX idx_shopify_orders_email ON public.shopify_orders(email);

-- 8. shopify_abandoned_checkouts
CREATE TABLE public.shopify_abandoned_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_checkout_id text NOT NULL,
  checkout_token text,
  email text,
  phone text,
  customer_json jsonb,
  line_items_json jsonb,
  cart_value numeric,
  currency text,
  abandoned_at timestamptz,
  recovery_status public.shopify_recovery_status DEFAULT 'new',
  recovery_source text,
  checkout_url text,
  raw_json jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, shopify_checkout_id)
);

-- 9. shopify_webhook_events
CREATE TABLE public.shopify_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  source text DEFAULT 'shopify',
  topic text NOT NULL,
  shop_domain text,
  event_id text,
  payload jsonb,
  headers jsonb,
  signature_valid boolean DEFAULT false,
  processing_status public.shopify_webhook_status DEFAULT 'received',
  error_message text,
  retry_count integer DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shopify_webhook_store ON public.shopify_webhook_events(store_id);
CREATE INDEX idx_shopify_webhook_topic ON public.shopify_webhook_events(topic);
CREATE INDEX idx_shopify_webhook_status ON public.shopify_webhook_events(processing_status);

-- 10. shopify_sync_jobs
CREATE TABLE public.shopify_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  job_type public.shopify_sync_job_type NOT NULL,
  resource_type text,
  status public.shopify_sync_status DEFAULT 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  last_cursor text,
  items_processed integer DEFAULT 0,
  items_failed integer DEFAULT 0,
  error_log text,
  metadata jsonb,
  triggered_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shopify_sync_store ON public.shopify_sync_jobs(store_id);
CREATE INDEX idx_shopify_sync_status ON public.shopify_sync_jobs(status);

-- 11. shopify_sync_logs
CREATE TABLE public.shopify_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.shopify_sync_jobs(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  level public.shopify_log_level DEFAULT 'info',
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. conversation_shopify_links
CREATE TABLE public.conversation_shopify_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.connected_stores(id) ON DELETE CASCADE,
  shopify_customer_record_id uuid REFERENCES public.shopify_customers(id),
  shopify_order_record_id uuid REFERENCES public.shopify_orders(id),
  shopify_checkout_record_id uuid REFERENCES public.shopify_abandoned_checkouts(id),
  match_source public.shopify_match_source DEFAULT 'email',
  match_confidence numeric DEFAULT 0,
  linked_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Updated_at triggers
CREATE TRIGGER set_connected_stores_updated_at BEFORE UPDATE ON public.connected_stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_products_updated_at BEFORE UPDATE ON public.shopify_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_variants_updated_at BEFORE UPDATE ON public.shopify_product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_collections_updated_at BEFORE UPDATE ON public.shopify_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_customers_updated_at BEFORE UPDATE ON public.shopify_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_orders_updated_at BEFORE UPDATE ON public.shopify_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_checkouts_updated_at BEFORE UPDATE ON public.shopify_abandoned_checkouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_webhook_updated_at BEFORE UPDATE ON public.shopify_webhook_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_shopify_sync_jobs_updated_at BEFORE UPDATE ON public.shopify_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_conversation_shopify_links_updated_at BEFORE UPDATE ON public.conversation_shopify_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.connected_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_abandoned_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_shopify_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies: tenant member isolation
CREATE POLICY "connected_stores_select" ON public.connected_stores FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "connected_stores_insert" ON public.connected_stores FOR INSERT WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "connected_stores_update" ON public.connected_stores FOR UPDATE USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "connected_stores_delete" ON public.connected_stores FOR DELETE USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "store_settings_select" ON public.store_settings FOR SELECT USING (EXISTS (SELECT 1 FROM public.connected_stores cs WHERE cs.id = store_id AND public.is_tenant_member(auth.uid(), cs.tenant_id)));
CREATE POLICY "store_settings_insert" ON public.store_settings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.connected_stores cs WHERE cs.id = store_id AND public.is_tenant_member(auth.uid(), cs.tenant_id)));
CREATE POLICY "store_settings_update" ON public.store_settings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.connected_stores cs WHERE cs.id = store_id AND public.is_tenant_member(auth.uid(), cs.tenant_id)));

CREATE POLICY "shopify_products_select" ON public.shopify_products FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_products_all" ON public.shopify_products FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "shopify_variants_select" ON public.shopify_product_variants FOR SELECT USING (EXISTS (SELECT 1 FROM public.connected_stores cs WHERE cs.id = store_id AND public.is_tenant_member(auth.uid(), cs.tenant_id)));
CREATE POLICY "shopify_variants_all" ON public.shopify_product_variants FOR ALL USING (EXISTS (SELECT 1 FROM public.connected_stores cs WHERE cs.id = store_id AND public.is_tenant_member(auth.uid(), cs.tenant_id)));

CREATE POLICY "shopify_collections_select" ON public.shopify_collections FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_collections_all" ON public.shopify_collections FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "shopify_customers_select" ON public.shopify_customers FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_customers_all" ON public.shopify_customers FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "shopify_orders_select" ON public.shopify_orders FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_orders_all" ON public.shopify_orders FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "shopify_checkouts_select" ON public.shopify_abandoned_checkouts FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_checkouts_all" ON public.shopify_abandoned_checkouts FOR ALL USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "shopify_webhooks_select" ON public.shopify_webhook_events FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_webhooks_service_insert" ON public.shopify_webhook_events FOR INSERT WITH CHECK (true);
CREATE POLICY "shopify_webhooks_service_update" ON public.shopify_webhook_events FOR UPDATE USING (true);

CREATE POLICY "shopify_sync_jobs_select" ON public.shopify_sync_jobs FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_sync_jobs_insert" ON public.shopify_sync_jobs FOR INSERT WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "shopify_sync_jobs_update" ON public.shopify_sync_jobs FOR UPDATE USING (public.is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "shopify_sync_logs_select" ON public.shopify_sync_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.shopify_sync_jobs j WHERE j.id = job_id AND public.is_tenant_member(auth.uid(), j.tenant_id)));

CREATE POLICY "conversation_shopify_links_select" ON public.conversation_shopify_links FOR SELECT USING (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "conversation_shopify_links_insert" ON public.conversation_shopify_links FOR INSERT WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "conversation_shopify_links_update" ON public.conversation_shopify_links FOR UPDATE USING (public.is_tenant_member(auth.uid(), tenant_id));

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.connected_stores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopify_sync_jobs;
