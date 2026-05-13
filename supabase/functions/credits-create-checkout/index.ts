// Create a Stripe Checkout Session (mode=payment) for a workspace message-credit top-up.
import {
  corsHeaders, json, getStripe, getServiceClient, getAuthedUser,
  resolveStripePriceId, appUrl,
} from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const workspaceId: string | undefined = body.workspaceId;
    const packageId: string | undefined = body.packageId;
    if (!workspaceId || !packageId) {
      return json({ error: "workspaceId and packageId are required" }, 400);
    }

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const service = getServiceClient();

    // Authorization: any workspace member can purchase credits for their workspace
    const { data: membership } = await service
      .from("tenant_members")
      .select("user_id")
      .eq("tenant_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) return json({ error: "Forbidden" }, 403);

    // Look up package
    const { data: pkg, error: pkgErr } = await service
      .from("credit_topup_packages")
      .select("*")
      .eq("id", packageId)
      .eq("active", true)
      .maybeSingle();
    if (pkgErr || !pkg) return json({ error: "Package not found" }, 404);

    // Tenant for billing email
    const { data: tenant } = await service
      .from("tenants")
      .select("name, billing_email, pricing_region")
      .eq("id", workspaceId)
      .maybeSingle();

    const stripe = await getStripe();
    const success = `${appUrl()}/billing?credits=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel = `${appUrl()}/billing?credits=cancelled`;

    // Prefer DB-stored Stripe price ID, fall back to ad-hoc price_data
    let lineItem: any;
    if (pkg.stripe_price_id) {
      lineItem = { price: pkg.stripe_price_id, quantity: 1 };
    } else {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: pkg.currency.toLowerCase(),
          unit_amount: Math.round(Number(pkg.price) * 100),
          product_data: {
            name: `${pkg.credits.toLocaleString()} Message Credits`,
            description: `${pkg.package_name} pack — Aireatro Message Credits`,
          },
        },
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [lineItem],
      customer_email: tenant?.billing_email || user.email,
      success_url: success,
      cancel_url: cancel,
      metadata: {
        purpose: "message_credits_topup",
        workspace_id: workspaceId,
        user_id: user.id,
        package_id: pkg.id,
        credits: String(pkg.credits),
      },
      payment_intent_data: {
        metadata: {
          purpose: "message_credits_topup",
          workspace_id: workspaceId,
          package_id: pkg.id,
          credits: String(pkg.credits),
        },
      },
    });

    return json({ url: session.url, id: session.id });
  } catch (e: any) {
    console.error("credits-create-checkout error:", e);
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
