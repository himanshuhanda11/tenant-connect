import { corsHeaders, json } from "../_shared/supabase.ts";
import { requireUser } from "../_shared/guards.ts";
import { getAdminClient } from "../_shared/supabase.ts";

const SHOPIFY_API_KEY = Deno.env.get("SHOPIFY_API_KEY") || "";
const SHOPIFY_API_SECRET = Deno.env.get("SHOPIFY_API_SECRET") || "";
const APP_URL = Deno.env.get("APP_URL") || "https://aireatro.com";

const REQUIRED_SCOPES = [
  "read_products",
  "read_customers",
  "read_orders",
  "read_checkouts",
  "read_inventory",
  "read_fulfillments",
  "read_content",
].join(",");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.res;

    const { storeDomain, tenantId } = await req.json();

    if (!storeDomain || !tenantId) {
      return json({ error: "storeDomain and tenantId required" }, 400);
    }

    // Normalize domain
    let shop = storeDomain.trim().toLowerCase();
    if (!shop.includes(".")) {
      shop = `${shop}.myshopify.com`;
    }
    shop = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");

    // Generate state for CSRF protection
    const state = btoa(
      JSON.stringify({
        tenantId,
        userId: auth.user.id,
        nonce: crypto.randomUUID(),
        timestamp: Date.now(),
      })
    );

    // Store pending connection
    const admin = getAdminClient();
    await admin.from("connected_stores").upsert(
      {
        tenant_id: tenantId,
        platform: "shopify",
        store_domain: shop,
        status: "pending",
        created_by: auth.user.id,
      },
      { onConflict: "tenant_id,store_domain" }
    );

    const redirectUri = `${APP_URL}/app/integrations/shopify/callback`;
    const authUrl =
      `https://${shop}/admin/oauth/authorize?` +
      `client_id=${SHOPIFY_API_KEY}` +
      `&scope=${REQUIRED_SCOPES}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;

    return json({ authUrl, shop, state });
  } catch (err) {
    console.error("shopify-connect error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
