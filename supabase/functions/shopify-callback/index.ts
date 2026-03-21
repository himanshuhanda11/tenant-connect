import { corsHeaders, json } from "../_shared/supabase.ts";
import { getAdminClient } from "../_shared/supabase.ts";

const SHOPIFY_API_KEY = Deno.env.get("SHOPIFY_API_KEY") || "";
const SHOPIFY_API_SECRET = Deno.env.get("SHOPIFY_API_SECRET") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const shop = url.searchParams.get("shop");
    const state = url.searchParams.get("state");
    const hmac = url.searchParams.get("hmac");

    if (!code || !shop || !state) {
      return json({ error: "Missing required parameters" }, 400);
    }

    // Decode state
    let stateData: { tenantId: string; userId: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return json({ error: "Invalid state parameter" }, 400);
    }

    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return json({ error: "Token exchange failed" }, 400);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope?.split(",") || [];

    // Fetch shop metadata
    const shopRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });

    let shopMeta: any = {};
    if (shopRes.ok) {
      const shopData = await shopRes.json();
      shopMeta = shopData.shop || {};
    }

    // Update connected store
    const admin = getAdminClient();
    const { data: store, error: storeErr } = await admin
      .from("connected_stores")
      .upsert(
        {
          tenant_id: stateData.tenantId,
          platform: "shopify",
          store_domain: shop,
          store_name: shopMeta.name || shop,
          shopify_shop_id: String(shopMeta.id || ""),
          access_token_encrypted: accessToken, // TODO: encrypt in production
          scopes,
          store_plan: shopMeta.plan_name || null,
          store_currency: shopMeta.currency || null,
          store_timezone: shopMeta.iana_timezone || null,
          store_email: shopMeta.email || null,
          status: "connected",
          installed_at: new Date().toISOString(),
          created_by: stateData.userId,
        },
        { onConflict: "tenant_id,store_domain" }
      )
      .select()
      .single();

    if (storeErr) {
      console.error("Store upsert error:", storeErr);
      return json({ error: "Failed to save store" }, 500);
    }

    // Initialize store settings
    await admin
      .from("store_settings")
      .upsert(
        { store_id: store.id },
        { onConflict: "store_id" }
      );

    // Create initial sync job
    await admin.from("shopify_sync_jobs").insert({
      tenant_id: stateData.tenantId,
      store_id: store.id,
      job_type: "initial_sync",
      resource_type: "all",
      status: "queued",
      triggered_by: stateData.userId,
    });

    // Log audit event
    await admin.from("audit_logs").insert({
      tenant_id: stateData.tenantId,
      user_id: stateData.userId,
      action: "shopify.store.connected",
      resource_type: "connected_store",
      resource_id: store.id,
      details: { shop, scopes },
    });

    // Register webhooks
    const webhookTopics = [
      "app/uninstalled",
      "products/create",
      "products/update",
      "products/delete",
      "customers/create",
      "customers/update",
      "orders/create",
      "orders/updated",
      "orders/paid",
      "fulfillments/create",
      "fulfillments/update",
    ];

    const webhookEndpoint = `${Deno.env.get("SUPABASE_URL")}/functions/v1/shopify-webhook`;

    for (const topic of webhookTopics) {
      try {
        await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            webhook: {
              topic,
              address: webhookEndpoint,
              format: "json",
            },
          }),
        });
      } catch (err) {
        console.error(`Failed to register webhook ${topic}:`, err);
      }
    }

    // Mark webhooks as registered
    await admin
      .from("connected_stores")
      .update({ webhooks_registered: true })
      .eq("id", store.id);

    // Redirect to store overview
    const APP_URL = Deno.env.get("APP_URL") || "https://aireatro.com";
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${APP_URL}/app/integrations/shopify/${store.id}?connected=true`,
      },
    });
  } catch (err) {
    console.error("shopify-callback error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
