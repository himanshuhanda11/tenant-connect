// Create a Stripe Checkout Session for a workspace subscription, with 30-day free trial.
// Free plan → no Stripe call, activates instantly via billing-apply-plan.
import {
  corsHeaders, json, getStripe, getServiceClient, getAuthedUser,
  assertWorkspaceAdmin, resolveStripePriceId, appUrl,
  REGION_CURRENCY, type PricingRegion,
} from "../_shared/stripe.ts";
import { callFunction } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const workspaceId: string | undefined = body.workspaceId;
    const planId: string | undefined = body.planId;
    const billingCycle: "monthly" | "yearly" =
      body.billingCycle === "yearly" ? "yearly" : "monthly";
    // Provider kept for backwards-compat with Razorpay path (delegated to legacy flow)
    const provider: string = body.provider ?? "stripe";

    if (!workspaceId || !planId) {
      return json({ error: "workspaceId and planId are required" }, 400);
    }

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const service = getServiceClient();

    // Authorization: only workspace admins/owners can subscribe
    const allowed = await assertWorkspaceAdmin(service, workspaceId, user.id);
    if (!allowed) return json({ error: "Only workspace admins can change billing" }, 403);

    // ── FREE PLAN: instant activation, no Stripe ──
    if (planId === "free") {
      await callFunction(
        "billing-apply-plan",
        {
          workspaceId,
          planId: "free",
          billingCycle: "monthly",
          provider: "manual",
        },
        { "x-platform-secret": Deno.env.get("PLATFORM_WEBHOOK_SECRET") || "" },
      ).catch((e) => console.error("billing-apply-plan failed:", e));

      // Direct upsert as a safety net so onboarding can move on instantly
      await service.from("subscriptions").upsert({
        tenant_id: workspaceId,
        plan_id: "plan_free",
        status: "active" as any,
        billing_cycle: "monthly",
        trial_status: "none",
      }, { onConflict: "tenant_id" });

      await service.from("tenants").update({ onboarding_status: "plan_selected" })
        .eq("id", workspaceId);

      return json({ free: true, planId: "free" });
    }

    // ── Razorpay legacy fallback (unchanged) ──
    if (provider === "razorpay") {
      // delegate to legacy implementation by calling the non-stripe path
      // Keep simple — this matches existing callers; full flow lives elsewhere.
      return json({
        error: "Razorpay flow handled by legacy endpoint; switch provider to 'stripe' to use Stripe Checkout.",
      }, 400);
    }

    // ── PAID PLAN: Stripe Checkout with 30-day trial ──
    // Resolve workspace pricing region (request override > tenant > default)
    const { data: tenantRow } = await service
      .from("tenants")
      .select("name, billing_email, country, pricing_region, currency")
      .eq("id", workspaceId)
      .maybeSingle();

    const requestedRegion = (body.region || body.pricingRegion || "").toUpperCase();
    const region: PricingRegion =
      (requestedRegion === "IN" || requestedRegion === "GULF" || requestedRegion === "OTHER")
        ? requestedRegion
        : ((tenantRow?.pricing_region as PricingRegion) || "OTHER");
    const currency = REGION_CURRENCY[region];

    // Persist region/currency on tenant if not yet set or if changed by request
    if (tenantRow && (tenantRow.pricing_region !== region || tenantRow.currency !== currency)) {
      await service.from("tenants").update({
        pricing_region: region,
        currency,
        ...(body.country ? { country: String(body.country).toUpperCase() } : {}),
      }).eq("id", workspaceId);
    }

    const priceId = await resolveStripePriceId(service, planId, billingCycle, region);
    if (!priceId) {
      return json({
        error: `Stripe price not configured for ${planId}/${billingCycle}/${region}. Add it to platform_plans.stripe_prices or set STRIPE_PRICE_${planId.toUpperCase()}_${billingCycle.toUpperCase()}_${region}.`,
      }, 503);
    }

    const stripe = await getStripe();

    // Look up or create Stripe Customer (per workspace)
    let customerId: string | null = null;
    const { data: existingSub } = await service
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("tenant_id", workspaceId)
      .maybeSingle();
    customerId = existingSub?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenantRow?.billing_email || user.email,
        name: tenantRow?.name || undefined,
        metadata: {
          workspace_id: workspaceId,
          user_id: user.id,
          pricing_region: region,
          currency,
        },
      });
      customerId = customer.id;
      await service.from("subscriptions").upsert({
        tenant_id: workspaceId,
        plan_id: `plan_${planId}`,
        stripe_customer_id: customerId,
        status: "incomplete" as any,
        billing_cycle: billingCycle,
        currency,
        pricing_region: region,
      }, { onConflict: "tenant_id" });
    }

    // Build success/cancel URLs (include workspace context)
    const origin = req.headers.get("origin") || appUrl();
    const successUrl = body.successUrl ||
      `${origin}/billing?status=success&session_id={CHECKOUT_SESSION_ID}&workspace=${workspaceId}`;
    const cancelUrl = body.cancelUrl ||
      `${origin}/billing?status=cancelled&workspace=${workspaceId}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          workspace_id: workspaceId,
          plan_id: planId,
          billing_cycle: billingCycle,
          user_id: user.id,
          pricing_region: region,
          currency,
        },
      },
      metadata: {
        workspace_id: workspaceId,
        plan_id: planId,
        billing_cycle: billingCycle,
        user_id: user.id,
        pricing_region: region,
        currency,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return json({
      provider: "stripe",
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err: any) {
    console.error("billing-create-checkout error:", err);
    return json({ error: err?.message || "Internal server error" }, 500);
  }
});
