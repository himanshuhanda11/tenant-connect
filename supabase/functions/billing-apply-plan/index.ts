import { getAdminClient, json, corsHeaders } from "../_shared/supabase.ts";
import { requireUser, requireTenantRole, requirePlatformSecret } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const isInternal = requirePlatformSecret(req);
    let actorUserId: string | null = null;

    if (!isInternal) {
      const auth = await requireUser(req);
      if (!auth.ok) return auth.res;
      actorUserId = auth.user.id;
    }

    const body = await req.json().catch(() => ({}));
    const workspaceId = body.workspaceId as string;
    const planId = body.planId as string;
    const billingCycle = (body.billingCycle as string) ?? "monthly";
    const provider = (body.provider as string) ?? "manual";
    const providerSubscriptionId = body.providerSubscriptionId ?? null;
    const providerCustomerId = body.providerCustomerId ?? null;

    if (!workspaceId || !planId) {
      return json({ error: "workspaceId and planId required" }, 400);
    }

    // Permission check for user-initiated calls
    if (!isInternal && actorUserId) {
      const perm = await requireTenantRole(workspaceId, actorUserId, ["owner", "admin"]);
      if (!perm.ok) return json({ error: perm.error }, 403);
    }

    const admin = getAdminClient();

    // Validate plan exists
    const { data: plan } = await admin
      .from("platform_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle();

    if (!plan) return json({ error: "Plan not found" }, 404);

    const isFree = planId === "free";

    // Phone requirement for paid plans
    if (!isFree) {
      const { data: phone } = await admin
        .from("workspace_phone_numbers")
        .select("status, phone_e164")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (!phone) {
        return json({
          error: "Connect a WhatsApp phone number before activating a paid plan.",
          code: "PHONE_REQUIRED",
        }, 409);
      }
      if (phone.status !== "active") {
        return json({
          error: "Phone number must be active before activating a paid plan.",
          code: "PHONE_NOT_ACTIVE",
        }, 409);
      }
    }

    // Upsert subscription
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(
      now.getTime() + (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: sub, error: subErr } = await admin
      .from("subscriptions")
      .upsert(
        {
          tenant_id: workspaceId,
          plan_id: planId,
          status: "active",
          billing_cycle: billingCycle,
          stripe_customer_id: provider === "stripe" ? providerCustomerId : null,
          stripe_subscription_id: provider === "stripe" ? providerSubscriptionId : null,
          current_period_start: periodStart,
          current_period_end: periodEnd,
        },
        { onConflict: "tenant_id" }
      )
      .select("*")
      .single();

    if (subErr) return json({ error: subErr.message }, 400);

    // Recompute entitlements
    await admin
      .rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId })
      .catch(() => null);

    // Write billing event
    await admin
      .from("platform_billing_events")
      .insert({
        provider,
        event_type: "subscription_applied",
        workspace_id: workspaceId,
        amount: 0,
        currency: "INR",
        status: "ok",
        provider_event_id: null,
        occurred_at: now.toISOString(),
        payload: { planId, billingCycle, providerSubscriptionId },
      })
      .catch(() => null);

    // Create invoice record
    const { data: invNum } = await admin.rpc("next_invoice_number").catch(() => ({ data: null }));
    const invoiceNumber = invNum || `INV-${Date.now()}`;

    await admin
      .from("platform_invoices")
      .insert({
        workspace_id: workspaceId,
        provider,
        provider_invoice_id: null,
        invoice_number: invoiceNumber,
        amount: 0,
        currency: "INR",
        status: "paid",
        billed_to: body.billed_to ?? { company: "Customer", email: body.email ?? null },
        line_items: body.line_items ?? [
          { name: `Plan: ${plan.name || planId}`, qty: 1, unit_amount: 0, amount: 0 },
        ],
        period_start: periodStart,
        period_end: periodEnd,
      })
      .catch(() => null);

    // Update onboarding status
    await admin
      .from("tenants")
      .update({ onboarding_status: "billing_active" })
      .eq("id", workspaceId)
      .catch(() => null);

    // Audit log
    await admin
      .from("audit_logs")
      .insert({
        tenant_id: workspaceId,
        user_id: actorUserId,
        action: "billing_apply_plan",
        resource_type: "subscription",
        resource_id: sub?.id,
        details: { planId, billingCycle, provider },
      })
      .catch(() => null);

    return json({ ok: true, subscription: sub });
  } catch (e) {
    console.error("billing-apply-plan error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
