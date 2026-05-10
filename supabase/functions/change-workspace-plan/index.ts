// Upgrade or downgrade a workspace's Stripe subscription.
// Upgrades = immediate with proration. Downgrades = scheduled at period end.
import {
  corsHeaders, json, getStripe, getServiceClient, getAuthedUser,
  assertWorkspaceAdmin, resolveStripePriceId,
} from "../_shared/stripe.ts";

const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, business: 3 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { workspaceId, planId, billingCycle } = await req.json().catch(() => ({}));
    if (!workspaceId || !planId) return json({ error: "workspaceId and planId required" }, 400);
    const cycle: "monthly" | "yearly" = billingCycle === "yearly" ? "yearly" : "monthly";

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const service = getServiceClient();
    if (!(await assertWorkspaceAdmin(service, workspaceId, user.id))) {
      return json({ error: "Only workspace admins can change plans" }, 403);
    }

    const { data: sub } = await service.from("subscriptions")
      .select("stripe_subscription_id, plan_id, billing_cycle")
      .eq("tenant_id", workspaceId).maybeSingle();

    const currentPlan = (sub?.plan_id || "plan_free").replace(/^plan_/, "");
    if (currentPlan === planId && sub?.billing_cycle === cycle) {
      return json({ ok: true, message: "Already on this plan", noop: true });
    }

    // Free target → cancel subscription at period end
    if (planId === "free") {
      if (!sub?.stripe_subscription_id) {
        await service.from("subscriptions").upsert({
          tenant_id: workspaceId, plan_id: "plan_free", status: "active" as any,
        }, { onConflict: "tenant_id" });
        return json({ ok: true, downgraded_to: "free" });
      }
      const stripe = await getStripe();
      const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      await service.from("subscriptions").update({
        cancel_at_period_end: true,
      }).eq("tenant_id", workspaceId);
      return json({ ok: true, scheduled_cancel_at: updated.current_period_end });
    }

    // Need a Stripe sub to swap items
    if (!sub?.stripe_subscription_id) {
      return json({
        error: "No active Stripe subscription — start a paid plan via checkout first.",
        action: "checkout_required",
      }, 400);
    }

    const newPriceId = resolveStripePriceId(planId, cycle);
    if (!newPriceId) {
      return json({ error: `Stripe price not configured for ${planId}/${cycle}` }, 503);
    }

    const stripe = await getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    const itemId = stripeSub.items.data[0].id;

    const isUpgrade = (PLAN_RANK[planId] ?? 0) > (PLAN_RANK[currentPlan] ?? 0);

    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: isUpgrade ? "always_invoice" : "none",
      ...(isUpgrade
        ? {} // immediate
        : { billing_cycle_anchor: "unchanged", cancel_at_period_end: false }),
      metadata: {
        ...(stripeSub.metadata || {}),
        plan_id: planId,
        billing_cycle: cycle,
        workspace_id: workspaceId,
      },
    });

    // Webhook will sync — but optimistically update so UI is snappy
    await service.from("subscriptions").update({
      plan_id: `plan_${planId}`,
      stripe_price_id: newPriceId,
      billing_cycle: cycle,
      cancel_at_period_end: false,
    }).eq("tenant_id", workspaceId);

    return json({
      ok: true,
      kind: isUpgrade ? "upgrade" : "downgrade",
      effective: isUpgrade ? "immediate" : "next_period",
      subscription_id: updated.id,
    });
  } catch (err: any) {
    console.error("change-plan error:", err);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});
