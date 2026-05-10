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

    const planId = (sub?.plan_id || "plan_free").replace(/^plan_/, "");
    const status = sub?.status || "active";
    const trialEnd = sub?.trial_end ? new Date(sub.trial_end) : null;
    const now = Date.now();
    const trialDaysLeft = trialEnd
      ? Math.max(0, Math.ceil((trialEnd.getTime() - now) / 86400000))
      : 0;
    const isTrialing = status === "trialing" || trialDaysLeft > 0;
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;

    return json({
      workspace_id: workspaceId,
      plan_id: planId,
      plan_name: planId.charAt(0).toUpperCase() + planId.slice(1),
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
      has_subscription: !!sub?.stripe_subscription_id,
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
