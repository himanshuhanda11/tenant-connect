import { json } from "../_shared/supabase.ts";
import { getAdminClient } from "../_shared/supabase.ts";

const SHOPIFY_API_SECRET = Deno.env.get("SHOPIFY_API_SECRET") || "";

async function verifyShopifyHmac(
  body: string,
  hmacHeader: string
): Promise<boolean> {
  if (!SHOPIFY_API_SECRET || !hmacHeader) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SHOPIFY_API_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return computed === hmacHeader;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const topic = req.headers.get("x-shopify-topic") || "";
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const webhookId = req.headers.get("x-shopify-webhook-id") || "";

  // Verify signature
  const signatureValid = await verifyShopifyHmac(rawBody, hmac);

  const admin = getAdminClient();

  // Find store
  const { data: store } = await admin
    .from("connected_stores")
    .select("id, tenant_id")
    .eq("store_domain", shopDomain)
    .eq("platform", "shopify")
    .eq("status", "connected")
    .maybeSingle();

  if (!store) {
    console.warn("Webhook from unknown store:", shopDomain);
    return json({ ok: true, ignored: true }, 200);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = { raw: rawBody };
  }

  // Store event
  const { data: event, error: eventErr } = await admin
    .from("shopify_webhook_events")
    .insert({
      tenant_id: store.tenant_id,
      store_id: store.id,
      source: "shopify",
      topic,
      shop_domain: shopDomain,
      event_id: webhookId,
      payload,
      headers: {
        "x-shopify-topic": topic,
        "x-shopify-shop-domain": shopDomain,
        "x-shopify-webhook-id": webhookId,
      },
      signature_valid: signatureValid,
      processing_status: signatureValid ? "received" : "ignored",
      received_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (eventErr) {
    console.error("Failed to store webhook event:", eventErr);
  }

  // Handle app/uninstalled
  if (topic === "app/uninstalled" && signatureValid) {
    await admin
      .from("connected_stores")
      .update({ status: "uninstalled", webhooks_registered: false })
      .eq("id", store.id);

    await admin.from("audit_logs").insert({
      tenant_id: store.tenant_id,
      action: "shopify.store.uninstalled",
      resource_type: "connected_store",
      resource_id: store.id,
      details: { shop_domain: shopDomain },
    });
  }

  // Process product events
  if (signatureValid && topic.startsWith("products/") && event) {
    try {
      await processProductEvent(admin, store, topic, payload);
      await admin
        .from("shopify_webhook_events")
        .update({ processing_status: "processed", processed_at: new Date().toISOString() })
        .eq("id", event.id);
    } catch (err) {
      await admin
        .from("shopify_webhook_events")
        .update({
          processing_status: "failed",
          error_message: err.message,
        })
        .eq("id", event.id);
    }
  }

  // Process customer events
  if (signatureValid && topic.startsWith("customers/") && event) {
    try {
      await processCustomerEvent(admin, store, payload);
      await admin
        .from("shopify_webhook_events")
        .update({ processing_status: "processed", processed_at: new Date().toISOString() })
        .eq("id", event.id);
    } catch (err) {
      await admin
        .from("shopify_webhook_events")
        .update({ processing_status: "failed", error_message: err.message })
        .eq("id", event.id);
    }
  }

  // Process order events
  if (signatureValid && topic.startsWith("orders/") && event) {
    try {
      await processOrderEvent(admin, store, payload);
      await admin
        .from("shopify_webhook_events")
        .update({ processing_status: "processed", processed_at: new Date().toISOString() })
        .eq("id", event.id);
    } catch (err) {
      await admin
        .from("shopify_webhook_events")
        .update({ processing_status: "failed", error_message: err.message })
        .eq("id", event.id);
    }
  }

  // Fast 200 response
  return json({ ok: true }, 200);
});

async function processProductEvent(
  admin: any,
  store: { id: string; tenant_id: string },
  topic: string,
  payload: Record<string, unknown>
) {
  const productId = String(payload.id || "");
  if (!productId) return;

  if (topic === "products/delete") {
    await admin
      .from("shopify_products")
      .delete()
      .eq("store_id", store.id)
      .eq("shopify_product_id", productId);
    return;
  }

  await admin.from("shopify_products").upsert(
    {
      tenant_id: store.tenant_id,
      store_id: store.id,
      shopify_product_id: productId,
      title: payload.title || null,
      handle: payload.handle || null,
      vendor: payload.vendor || null,
      product_type: payload.product_type || null,
      status: payload.status || null,
      tags: typeof payload.tags === "string" ? (payload.tags as string).split(", ") : null,
      description_html: payload.body_html || null,
      featured_image_url: (payload.image as any)?.src || null,
      raw_json: payload,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "store_id,shopify_product_id" }
  );

  // Upsert variants
  const variants = (payload.variants as any[]) || [];
  for (const v of variants) {
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
        image_url: v.image_id ? null : null,
        raw_json: v,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "store_id,shopify_variant_id" }
    );
  }
}

async function processCustomerEvent(
  admin: any,
  store: { id: string; tenant_id: string },
  payload: Record<string, unknown>
) {
  const customerId = String(payload.id || "");
  if (!customerId) return;

  const address = (payload.default_address as any) || null;

  await admin.from("shopify_customers").upsert(
    {
      tenant_id: store.tenant_id,
      store_id: store.id,
      shopify_customer_id: customerId,
      first_name: payload.first_name || null,
      last_name: payload.last_name || null,
      email: payload.email || null,
      phone: payload.phone || null,
      tags: typeof payload.tags === "string" ? (payload.tags as string).split(", ") : null,
      accepts_marketing: payload.accepts_marketing || false,
      total_spent: parseFloat(String(payload.total_spent || "0")),
      orders_count: Number(payload.orders_count || 0),
      last_order_id: (payload.last_order_id as string) || null,
      default_address: address,
      note: (payload.note as string) || null,
      verified_email: payload.verified_email || false,
      state: (payload.state as string) || null,
      raw_json: payload,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "store_id,shopify_customer_id" }
  );
}

async function processOrderEvent(
  admin: any,
  store: { id: string; tenant_id: string },
  payload: Record<string, unknown>
) {
  const orderId = String(payload.id || "");
  if (!orderId) return;

  await admin.from("shopify_orders").upsert(
    {
      tenant_id: store.tenant_id,
      store_id: store.id,
      shopify_order_id: orderId,
      shopify_customer_id: payload.customer ? String((payload.customer as any).id) : null,
      order_number: String(payload.order_number || ""),
      order_name: (payload.name as string) || null,
      email: (payload.email as string) || null,
      phone: (payload.phone as string) || null,
      currency: (payload.currency as string) || null,
      total_price: parseFloat(String(payload.total_price || "0")),
      subtotal_price: parseFloat(String(payload.subtotal_price || "0")),
      total_discounts: parseFloat(String(payload.total_discounts || "0")),
      financial_status: (payload.financial_status as string) || null,
      fulfillment_status: (payload.fulfillment_status as string) || null,
      cancel_reason: (payload.cancel_reason as string) || null,
      cancelled_at: (payload.cancelled_at as string) || null,
      closed_at: (payload.closed_at as string) || null,
      processed_at: (payload.processed_at as string) || null,
      tags: typeof payload.tags === "string" ? (payload.tags as string).split(", ") : null,
      shipping_address: (payload.shipping_address as any) || null,
      billing_address: (payload.billing_address as any) || null,
      customer_json: (payload.customer as any) || null,
      line_items_json: (payload.line_items as any) || null,
      fulfillments_json: (payload.fulfillments as any) || null,
      raw_json: payload,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "store_id,shopify_order_id" }
  );
}
