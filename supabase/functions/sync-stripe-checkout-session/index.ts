// Syncs a completed Stripe Checkout Session after redirect back to Aireatro.
// This is a secure fallback for cases where Stripe webhooks are delayed or not configured.
import {
  corsHeaders, json, getStripe, getServiceClient, getAuthedUser,
  assertWorkspaceAdmin,
} from "../_shared/stripe.ts";

function normalizePlan(planId: string | null | undefined) {
  return (planId || "basic").replace(/^plan_/, "").toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return json({ error: "Valid Stripe checkout session_id required" }, 400);
    }

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const service = getServiceClient();
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items.data.price"],
    });

    const workspaceId = session.metadata?.workspace_id || session.subscription_details?.metadata?.workspace_id;
    if (!workspaceId) return json({ error: "Checkout session is missing workspace metadata" }, 400);

    if (!(await assertWorkspaceAdmin(service, workspaceId, user.id))) {
      return json({ error: "Only workspace admins can activate billing" }, 403);
    }

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return json({ ok: false, status: session.payment_status, message: "Checkout is not completed yet" }, 409);
    }

    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
    if (!subscriptionId) return json({ error: "Checkout session has no subscription" }, 400);

    const subscription = typeof session.subscription === "object" && session.subscription?.id
      ? session.subscription
      : await stripe.subscriptions.retrieve(subscriptionId);

    const item = subscription.items?.data?.[0];
    const priceId = item?.price?.id || session.line_items?.data?.[0]?.price?.id || null;
    const planId = normalizePlan(subscription.metadata?.plan_id || session.metadata?.plan_id);
    const billingCycle = subscription.metadata?.billing_cycle || session.metadata?.billing_cycle ||
      (item?.price?.recurring?.interval === "year" ? "yearly" : "monthly");
    const currency = (item?.price?.currency || subscription.metadata?.currency || session.currency || "").toUpperCase() || null;
    const pricingRegion = subscription.metadata?.pricing_region || session.metadata?.pricing_region || null;
    const trialStatus = subscription.status === "trialing"
      ? "active"
      : (subscription.trial_end && Math.floor(Date.now() / 1000) > subscription.trial_end ? "ended" : "none");

    const { error: upsertErr } = await service.from("subscriptions").upsert({
      tenant_id: workspaceId,
      plan_id: planId,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status as any,
      billing_cycle: billingCycle,
      currency,
      pricing_region: pricingRegion,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: !!subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      trial_status: trialStatus,
      pending_plan_id: null,
      pending_billing_cycle: null,
      scheduled_change_at: null,
    }, { onConflict: "tenant_id" });
    if (upsertErr) {
      console.error("subscriptions upsert error:", upsertErr);
      return json({ error: `subscriptions upsert failed: ${upsertErr.message}` }, 500);
    }

    const { error: rpcErr } = await service.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });
    if (rpcErr) console.error("compute_workspace_entitlements error:", rpcErr);
    await service.from("tenants").update({ onboarding_status: "plan_selected" })
      .eq("id", workspaceId).eq("onboarding_status", "new");


    return json({
      ok: true,
      workspace_id: workspaceId,
      plan_id: planId,
      status: subscription.status,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    });
  } catch (err: any) {
    console.error("sync-checkout-session error:", err);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});
