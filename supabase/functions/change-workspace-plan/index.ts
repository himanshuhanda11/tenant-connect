// Upgrade / downgrade / cancel a workspace's Stripe subscription.
//
// Behavior matrix:
//   - No Stripe sub yet + paid plan      → return action: 'checkout_required'
//   - Trialing + paid → other paid       → swap price now, KEEP trial_end (no charge until trial ends)
//   - Trialing + paid → free             → cancel subscription IMMEDIATELY, drop to free
//   - Active paid → higher paid plan     → swap price now with proration_behavior 'always_invoice'
//   - Active paid → lower paid plan      → schedule downgrade at period end (Subscription Schedule)
//   - Active paid → free                 → set cancel_at_period_end = true, mark pending free
//   - Same plan + cycle                  → noop
import {
  corsHeaders, json, getStripe, getServiceClient, getAuthedUser,
  assertWorkspaceAdmin, resolveStripePriceId,
} from "../_shared/stripe.ts";

const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, business: 3 };

function strip(planId: string | null | undefined) {
  return (planId || "free").replace(/^plan_/, "");
}

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
      .select("stripe_subscription_id, stripe_customer_id, plan_id, billing_cycle, status, trial_end, current_period_end, pricing_region, pending_plan_id")
      .eq("tenant_id", workspaceId).maybeSingle();

    const currentPlan = strip(sub?.plan_id);
    const isTrialing = sub?.status === "trialing" ||
      (sub?.trial_end && new Date(sub.trial_end).getTime() > Date.now());

    // Noop guard
    if (currentPlan === planId && sub?.billing_cycle === cycle && !sub?.pending_plan_id) {
      return json({ ok: true, noop: true, message: "Already on this plan" });
    }

    // No active Stripe subscription → can't manage in Stripe; ask frontend to checkout
    if (planId !== "free" && !sub?.stripe_subscription_id) {
      return json({
        action: "checkout_required",
        message: "Start a paid plan via checkout first.",
      });
    }

    const stripe = await getStripe();

    // ───────────────── FREE TARGET ─────────────────
    if (planId === "free") {
      if (!sub?.stripe_subscription_id) {
        await service.from("subscriptions").upsert({
          tenant_id: workspaceId, plan_id: "free", status: "active" as any,
          billing_cycle: "monthly", trial_status: "none",
          pending_plan_id: null, pending_billing_cycle: null, scheduled_change_at: null,
          last_plan_change_at: new Date().toISOString(),
        }, { onConflict: "tenant_id" });
        await service.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });
        return json({ ok: true, kind: "downgrade", effective: "immediate", target: "free" });
      }

      // Trialing → cancel right now (no charge, free starts immediately)
      if (isTrialing) {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id, { prorate: false });
        await service.from("subscriptions").update({
          plan_id: "free",
          status: "cancelled" as any,
          stripe_subscription_id: null,
          stripe_price_id: null,
          trial_status: "ended",
          cancel_at_period_end: false,
          pending_plan_id: null,
          pending_billing_cycle: null,
          scheduled_change_at: null,
          canceled_at: new Date().toISOString(),
          last_plan_change_at: new Date().toISOString(),
        }).eq("tenant_id", workspaceId);
        await service.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });
        return json({ ok: true, kind: "downgrade", effective: "immediate", target: "free" });
      }

      // Paid active → cancel at period end (keep access until then)
      const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      await service.from("subscriptions").update({
        cancel_at_period_end: true,
        pending_plan_id: "free",
        pending_billing_cycle: "monthly",
        scheduled_change_at: updated.current_period_end
          ? new Date(updated.current_period_end * 1000).toISOString() : null,
        last_plan_change_at: new Date().toISOString(),
      }).eq("tenant_id", workspaceId);

      return json({
        ok: true, kind: "downgrade", effective: "next_period", target: "free",
        scheduled_at: updated.current_period_end
          ? new Date(updated.current_period_end * 1000).toISOString() : null,
      });
    }

    // ───────────────── PAID TARGET ─────────────────
    const region = (sub?.pricing_region || "OTHER") as "IN" | "GULF" | "OTHER";
    const newPriceId = await resolveStripePriceId(service, planId, cycle, region);
    if (!newPriceId) {
      return json({ error: `Stripe price not configured for ${planId}/${cycle}/${region}` }, 503);
    }

    const stripeSub = await stripe.subscriptions.retrieve(sub!.stripe_subscription_id!);
    const itemId = stripeSub.items.data[0].id;
    const currentRank = PLAN_RANK[currentPlan] ?? 0;
    const newRank = PLAN_RANK[planId] ?? 0;
    const isUpgrade = newRank > currentRank;

    // ── Trial: swap price, keep trial_end, no charge ──
    if (isTrialing) {
      const updated = await stripe.subscriptions.update(sub!.stripe_subscription_id!, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: "none",
        trial_end: stripeSub.trial_end ?? "now",
        cancel_at_period_end: false,
        metadata: {
          ...(stripeSub.metadata || {}),
          plan_id: planId, billing_cycle: cycle, workspace_id: workspaceId,
        },
      });
      await service.from("subscriptions").update({
        plan_id: planId,
        stripe_price_id: newPriceId,
        billing_cycle: cycle,
        cancel_at_period_end: false,
        pending_plan_id: null,
        pending_billing_cycle: null,
        scheduled_change_at: null,
        last_plan_change_at: new Date().toISOString(),
      }).eq("tenant_id", workspaceId);
      await service.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });
      return json({
        ok: true, kind: isUpgrade ? "upgrade" : "downgrade", effective: "trial_end",
        trial_end: updated.trial_end ? new Date(updated.trial_end * 1000).toISOString() : null,
      });
    }

    // ── Active paid → upgrade: immediate with proration ──
    if (isUpgrade) {
      await stripe.subscriptions.update(sub!.stripe_subscription_id!, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: "always_invoice",
        cancel_at_period_end: false,
        metadata: {
          ...(stripeSub.metadata || {}),
          plan_id: planId, billing_cycle: cycle, workspace_id: workspaceId,
        },
      });
      await service.from("subscriptions").update({
        plan_id: planId,
        stripe_price_id: newPriceId,
        billing_cycle: cycle,
        cancel_at_period_end: false,
        pending_plan_id: null,
        pending_billing_cycle: null,
        scheduled_change_at: null,
        last_plan_change_at: new Date().toISOString(),
      }).eq("tenant_id", workspaceId);
      await service.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });
      return json({ ok: true, kind: "upgrade", effective: "immediate", proration: true });
    }

    // ── Active paid → downgrade: schedule at period end ──
    // Use Stripe Subscription Schedule so price changes at next renewal.
    let schedule = stripeSub.schedule
      ? await stripe.subscriptionSchedules.retrieve(stripeSub.schedule as string)
      : await stripe.subscriptionSchedules.create({ from_subscription: sub!.stripe_subscription_id! });

    const periodEnd = stripeSub.current_period_end;
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "release",
      phases: [
        {
          // Keep current plan until period end
          items: [{ price: stripeSub.items.data[0].price.id, quantity: 1 }],
          start_date: stripeSub.current_period_start,
          end_date: periodEnd,
          proration_behavior: "none",
        },
        {
          // Switch to downgraded plan from period end onward
          items: [{ price: newPriceId, quantity: 1 }],
          proration_behavior: "none",
          metadata: { plan_id: planId, billing_cycle: cycle, workspace_id: workspaceId },
        },
      ],
      metadata: { workspace_id: workspaceId, pending_plan_id: planId },
    });

    await service.from("subscriptions").update({
      pending_plan_id: planId,
      pending_billing_cycle: cycle,
      scheduled_change_at: new Date(periodEnd * 1000).toISOString(),
      cancel_at_period_end: false,
      last_plan_change_at: new Date().toISOString(),
    }).eq("tenant_id", workspaceId);

    return json({
      ok: true, kind: "downgrade", effective: "next_period",
      target: planId,
      scheduled_at: new Date(periodEnd * 1000).toISOString(),
    });
  } catch (err: any) {
    console.error("change-plan error:", err);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});
