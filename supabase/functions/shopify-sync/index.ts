import { corsHeaders, json } from "../_shared/supabase.ts";
import { requireUser } from "../_shared/guards.ts";
import { getAdminClient } from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.res;

    const { jobId, storeId, resource, retry } = await req.json();
    const admin = getAdminClient();

    // Get store and access token
    const { data: store } = await admin
      .from("connected_stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (!store || store.status !== "connected") {
      return json({ error: "Store not connected" }, 400);
    }

    const accessToken = store.access_token_encrypted; // TODO: decrypt
    const shop = store.store_domain;

    // Update job status
    await admin
      .from("shopify_sync_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", jobId);

    const logEntry = async (level: string, message: string, context?: any) => {
      await admin.from("shopify_sync_logs").insert({
        job_id: jobId,
        store_id: storeId,
        level,
        message,
        context: context || null,
      });
    };

    try {
      const resources = resource === "all"
        ? ["products", "customers", "orders", "collections"]
        : [resource];

      let totalProcessed = 0;
      let totalFailed = 0;

      for (const res of resources) {
        await logEntry("info", `Starting sync for ${res}`);
        const result = await syncResource(admin, store, accessToken, shop, res, logEntry);
        totalProcessed += result.processed;
        totalFailed += result.failed;
      }

      await admin
        .from("shopify_sync_jobs")
        .update({
          status: totalFailed > 0 ? "partial" : "completed",
          finished_at: new Date().toISOString(),
          items_processed: totalProcessed,
          items_failed: totalFailed,
        })
        .eq("id", jobId);

      // Update last_synced_at on store
      await admin
        .from("connected_stores")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", storeId);

      await logEntry("info", `Sync completed: ${totalProcessed} processed, ${totalFailed} failed`);

      return json({ ok: true, processed: totalProcessed, failed: totalFailed });
    } catch (err) {
      await admin
        .from("shopify_sync_jobs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_log: err.message,
        })
        .eq("id", jobId);

      await logEntry("error", `Sync failed: ${err.message}`);
      return json({ error: err.message }, 500);
    }
  } catch (err) {
    console.error("shopify-sync error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});

async function syncResource(
  admin: any,
  store: any,
  accessToken: string,
  shop: string,
  resource: string,
  log: (level: string, msg: string, ctx?: any) => Promise<void>
) {
  let processed = 0;
  let failed = 0;
  let pageInfo: string | null = null;
  const apiVersion = "2024-01";

  const resourceMap: Record<string, string> = {
    products: "products",
    customers: "customers",
    orders: "orders",
    collections: "custom_collections",
  };

  const endpoint = resourceMap[resource] || resource;

  do {
    const url = pageInfo
      ? `https://${shop}/admin/api/${apiVersion}/${endpoint}.json?page_info=${pageInfo}&limit=250`
      : `https://${shop}/admin/api/${apiVersion}/${endpoint}.json?limit=250`;

    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });

    if (!res.ok) {
      await log("error", `API error for ${resource}: ${res.status}`);
      break;
    }

    const data = await res.json();
    const items = data[endpoint] || [];

    for (const item of items) {
      try {
        await upsertItem(admin, store, resource, item);
        processed++;
      } catch (err) {
        failed++;
        await log("warning", `Failed to upsert ${resource} ${item.id}: ${err.message}`);
      }
    }

    // Parse Link header for pagination
    const linkHeader = res.headers.get("Link") || "";
    const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&]*).*?rel="next"/);
    pageInfo = nextMatch ? nextMatch[1] : null;

    await log("info", `Synced ${items.length} ${resource} (page)`);
  } while (pageInfo);

  return { processed, failed };
}

async function upsertItem(admin: any, store: any, resource: string, item: any) {
  const now = new Date().toISOString();

  switch (resource) {
    case "products":
      await admin.from("shopify_products").upsert(
        {
          tenant_id: store.tenant_id,
          store_id: store.id,
          shopify_product_id: String(item.id),
          title: item.title,
          handle: item.handle,
          vendor: item.vendor,
          product_type: item.product_type,
          status: item.status,
          tags: typeof item.tags === "string" ? item.tags.split(", ") : null,
          description_html: item.body_html,
          featured_image_url: item.image?.src || null,
          published_at: item.published_at,
          raw_json: item,
          synced_at: now,
        },
        { onConflict: "store_id,shopify_product_id" }
      );

      // Sync variants
      for (const v of item.variants || []) {
        await admin.from("shopify_product_variants").upsert(
          {
            store_id: store.id,
            shopify_variant_id: String(v.id),
            title: v.title,
            sku: v.sku,
            barcode: v.barcode,
            price: parseFloat(v.price) || 0,
            compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
            inventory_quantity: v.inventory_quantity || 0,
            inventory_policy: v.inventory_policy,
            requires_shipping: v.requires_shipping,
            taxable: v.taxable,
            raw_json: v,
            synced_at: now,
          },
          { onConflict: "store_id,shopify_variant_id" }
        );
      }
      break;

    case "customers":
      await admin.from("shopify_customers").upsert(
        {
          tenant_id: store.tenant_id,
          store_id: store.id,
          shopify_customer_id: String(item.id),
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          phone: item.phone,
          tags: typeof item.tags === "string" ? item.tags.split(", ") : null,
          accepts_marketing: item.accepts_marketing,
          total_spent: parseFloat(item.total_spent || "0"),
          orders_count: item.orders_count || 0,
          last_order_id: item.last_order_id ? String(item.last_order_id) : null,
          default_address: item.default_address || null,
          note: item.note,
          verified_email: item.verified_email,
          state: item.state,
          raw_json: item,
          synced_at: now,
        },
        { onConflict: "store_id,shopify_customer_id" }
      );
      break;

    case "orders":
      await admin.from("shopify_orders").upsert(
        {
          tenant_id: store.tenant_id,
          store_id: store.id,
          shopify_order_id: String(item.id),
          shopify_customer_id: item.customer ? String(item.customer.id) : null,
          order_number: String(item.order_number),
          order_name: item.name,
          email: item.email,
          phone: item.phone,
          currency: item.currency,
          total_price: parseFloat(item.total_price || "0"),
          subtotal_price: parseFloat(item.subtotal_price || "0"),
          total_discounts: parseFloat(item.total_discounts || "0"),
          financial_status: item.financial_status,
          fulfillment_status: item.fulfillment_status,
          cancel_reason: item.cancel_reason,
          cancelled_at: item.cancelled_at,
          closed_at: item.closed_at,
          processed_at: item.processed_at,
          tags: typeof item.tags === "string" ? item.tags.split(", ") : null,
          shipping_address: item.shipping_address,
          billing_address: item.billing_address,
          customer_json: item.customer,
          line_items_json: item.line_items,
          fulfillments_json: item.fulfillments,
          raw_json: item,
          synced_at: now,
        },
        { onConflict: "store_id,shopify_order_id" }
      );
      break;

    case "collections":
      await admin.from("shopify_collections").upsert(
        {
          tenant_id: store.tenant_id,
          store_id: store.id,
          shopify_collection_id: String(item.id),
          title: item.title,
          handle: item.handle,
          collection_type: "custom",
          description_html: item.body_html,
          image_url: item.image?.src || null,
          raw_json: item,
          synced_at: now,
        },
        { onConflict: "store_id,shopify_collection_id" }
      );
      break;
  }
}
