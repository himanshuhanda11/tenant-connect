// Returns a normalized billing snapshot for a workspace.
import {
  corsHeaders, json, getServiceClient, getAuthedUser,
} from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId") ||
      (req.method === "POST" ? (await req.json().catch(() => ({}))).workspaceId : null);
    if (!workspaceId) return json({ error: "workspaceId required" }, 400);

    const user = await getAuthedUser(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const service = getServiceClient();

    // Member check (read-only OK for any member)
    const { data: member } = await service.from("tenant_members")
      .select("role").eq("tenant_id", workspaceId).eq("user_id", user.id).maybeSingle();
    if (!member) return json({ error: "Not a member of this workspace" }, 403);

    const [{ data: sub }, { data: ent }, { data: tenant }] = await Promise.all([
      service.from("subscriptions")
        .select("*").eq("tenant_id", workspaceId).maybeSingle(),
      service.from("workspace_entitlements")
        .select("*").eq("workspace_id", workspaceId).maybeSingle(),
      service.from("tenants")
        .select("country, pricing_region, currency").eq("id", workspaceId).maybeSingle(),
    ]);

    const rawStatus = sub?.status || "inactive";
    const inactiveStatuses = new Set(["incomplete", "incomplete_expired", "canceled", "cancelled"]);
    // Entitlement fallback: if a Super Admin set workspace_entitlements.plan to a non-free
    // plan (status='active') but no subscription row exists yet, treat it as a manual_admin
    // plan so the user is not blocked behind the upgrade / Stripe gate.
    const entPlanRaw = (ent as any)?.plan ? String((ent as any).plan).toLowerCase() : null;
    const entActive = ((ent as any)?.status || "active") === "active";
    const entIsManualPlan = entPlanRaw && entPlanRaw !== "free" && entActive;
    const useEntitlementFallback = !sub && entIsManualPlan;

    const planSource: "stripe" | "manual_admin" | "free" =
      (sub?.plan_source as any) || (sub?.stripe_subscription_id ? "stripe" : (useEntitlementFallback ? "manual_admin" : "free"));
    const isManualAdmin = planSource === "manual_admin";
    const normalizedSubPlan = sub?.plan_id
      ? sub.plan_id.replace(/^plan_/, "")
      : (useEntitlementFallback ? entPlanRaw : null);
    const effectiveStatus = sub ? rawStatus : (useEntitlementFallback ? "active" : rawStatus);
    const hasSelectedPlan =
      (!!sub || useEntitlementFallback) &&
      !inactiveStatuses.has(effectiveStatus) &&
      !!normalizedSubPlan &&
      (isManualAdmin || normalizedSubPlan === "free" || !!sub?.stripe_subscription_id);
    const hasConfirmedSubscription =
      (!!sub?.stripe_subscription_id && !inactiveStatuses.has(rawStatus)) ||
      (isManualAdmin && (effectiveStatus === "active"));
    const planId = hasSelectedPlan ? normalizedSubPlan : null;
    const status = hasSelectedPlan ? effectiveStatus : "inactive";
    const stripeRequired = !isManualAdmin && planId !== null && planId !== "free" && !sub?.stripe_subscription_id;
    const trialEnd = sub?.trial_end ? new Date(sub.trial_end) : null;
    const now = Date.now();
    const trialDaysLeft = trialEnd
      ? Math.max(0, Math.ceil((trialEnd.getTime() - now) / 86400000))
      : 0;
    const isTrialing = status === "trialing" || trialDaysLeft > 0;
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
    const pendingPlan = hasSelectedPlan ? (sub?.pending_plan_id || (sub?.cancel_at_period_end ? "free" : null)) : null;
    const scheduledAt = hasSelectedPlan ? (sub?.scheduled_change_at ? new Date(sub.scheduled_change_at) : periodEnd) : null;

    const fmt = (d: Date | null) => d ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
    let nextPlanMessage: string | null = null;
    if (pendingPlan && pendingPlan !== planId && scheduledAt) {
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      nextPlanMessage = pendingPlan === "free"
        ? `Your ${cap(planId)} plan will end on ${fmt(scheduledAt)} and switch to Free.`
        : `Your ${cap(planId)} plan will downgrade to ${cap(pendingPlan)} on ${fmt(scheduledAt)}.`;
    }

    return json({
      workspace_id: workspaceId,
      plan_id: planId,
      plan_name: planId ? planId.charAt(0).toUpperCase() + planId.slice(1) : null,
      billing_cycle: sub?.billing_cycle || "monthly",
      status,
      trial_status: sub?.trial_status || "none",
      is_trialing: isTrialing,
      trial_days_left: trialDaysLeft,
      trial_end: trialEnd?.toISOString() || null,
      current_period_end: periodEnd?.toISOString() || null,
      next_billing_date: periodEnd?.toISOString() || null,
      cancel_at_period_end: !!sub?.cancel_at_period_end,
      last_payment_status: sub?.last_payment_status || null,
      stripe_customer_id: sub?.stripe_customer_id || null,
      has_subscription: hasConfirmedSubscription,
      has_selected_plan: hasSelectedPlan,
      plan_source: planSource,
      assigned_by_admin: !!sub?.assigned_by_admin,
      stripe_required: stripeRequired,
      is_paid: hasConfirmedSubscription && planId !== "free" && planId !== null,
      pending_plan_id: pendingPlan,
      pending_billing_cycle: sub?.pending_billing_cycle || null,
      scheduled_change_at: scheduledAt?.toISOString() || null,
      next_plan_message: nextPlanMessage,
      role: member.role,
      country: tenant?.country || null,
      pricing_region: sub?.pricing_region || tenant?.pricing_region || "OTHER",
      currency: sub?.currency || tenant?.currency || "USD",
      entitlements: ent || null,
    });
  } catch (err: any) {
    console.error("billing-status error:", err);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});
