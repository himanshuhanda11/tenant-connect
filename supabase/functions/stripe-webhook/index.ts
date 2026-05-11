// Stripe webhook → updates subscriptions, invoices, billing events for any workspace.
// Idempotent via platform_billing_events.uq_billing_events_provider_event_id.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function buildPriceLookup() {
  const map: Record<string, { plan: string; cycle: "monthly" | "yearly" }> = {};
  for (const plan of ["basic", "pro", "business"]) {
    for (const cycle of ["monthly", "yearly"] as const) {
      // Plain + region-suffixed env vars
      for (const suffix of ["", "_IN", "_GULF", "_OTHER"]) {
        const v = Deno.env.get(`STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}${suffix}`);
        if (v) map[v] = { plan, cycle };
      }
    }
  }
  return map;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const skKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!whSecret || !skKey) return new Response("Stripe secrets not configured", { status: 503 });

  const body = await req.text();
  const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno");
  const stripe = new Stripe(skKey, { apiVersion: "2023-10-16" });

  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, whSecret);
  } catch (err: any) {
    console.error("Signature verify failed:", err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotency: refuse duplicate event ids
  const { data: existing } = await supabase
    .from("platform_billing_events")
    .select("id").eq("provider", "stripe").eq("provider_event_id", event.id).maybeSingle();
  if (existing) {
    console.log(`Duplicate event ${event.id} ignored`);
    return new Response("ok (dup)", { status: 200 });
  }

  const priceLookup = buildPriceLookup();

  // Resolve workspace id from any Stripe object the event carries.
  const resolveWorkspace = async (obj: any): Promise<string | null> => {
    const md = obj?.metadata?.workspace_id
      || obj?.subscription_details?.metadata?.workspace_id
      || obj?.lines?.data?.[0]?.metadata?.workspace_id;
    if (md) return md;
    const customerId = obj?.customer || obj?.customer_id;
    if (customerId) {
      const { data } = await supabase.from("subscriptions")
        .select("tenant_id").eq("stripe_customer_id", customerId).maybeSingle();
      if (data?.tenant_id) return data.tenant_id;
    }
    const subId = obj?.subscription || obj?.id;
    if (subId && typeof subId === "string" && subId.startsWith("sub_")) {
      const { data } = await supabase.from("subscriptions")
        .select("tenant_id").eq("stripe_subscription_id", subId).maybeSingle();
      if (data?.tenant_id) return data.tenant_id;
    }
    return null;
  };

  const insertEvent = async (eventType: string, workspaceId: string | null, amount: number, payload: any) => {
    await supabase.from("platform_billing_events").insert({
      provider: "stripe",
      event_type: eventType,
      workspace_id: workspaceId,
      amount,
      currency: (payload?.currency || "usd").toUpperCase(),
      provider_event_id: event.id,
      payload,
    });
  };

  const upsertSubscriptionFromStripe = async (sub: any, workspaceId: string) => {
    const item = sub.items?.data?.[0];
    const priceId = item?.price?.id as string | undefined;
    const lookup = priceId ? priceLookup[priceId] : null;
    // Prefer metadata.plan_id (set by checkout + change-workspace-plan), fall back to env map
    const planRaw = sub.metadata?.plan_id || lookup?.plan || "basic";
    const planId = planRaw.replace(/^plan_/, "");
    const billingCycle = sub.metadata?.billing_cycle || lookup?.cycle ||
      (item?.price?.recurring?.interval === "year" ? "yearly" : "monthly");

    const trialStatus = sub.status === "trialing"
      ? "active"
      : (sub.trial_end && Math.floor(Date.now() / 1000) > sub.trial_end ? "ended" : "none");

    const currency = (item?.price?.currency || sub.metadata?.currency || "").toUpperCase() || null;
    const pricingRegion = sub.metadata?.pricing_region || null;

    // Read existing pending fields so we can clear them when a scheduled change settles
    const { data: existing } = await supabase.from("subscriptions")
      .select("pending_plan_id, pending_billing_cycle")
      .eq("tenant_id", workspaceId).maybeSingle();

    const clearPending = existing?.pending_plan_id &&
      existing.pending_plan_id === planId &&
      (!existing.pending_billing_cycle || existing.pending_billing_cycle === billingCycle);

    await supabase.from("subscriptions").upsert({
      tenant_id: workspaceId,
      plan_id: planId,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      status: sub.status as any,
      billing_cycle: billingCycle,
      currency,
      pricing_region: pricingRegion,
      current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: !!sub.cancel_at_period_end,
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      trial_status: trialStatus,
      ...(clearPending ? {
        pending_plan_id: null,
        pending_billing_cycle: null,
        scheduled_change_at: null,
      } : {}),
    }, { onConflict: "tenant_id" });

    // Recompute entitlements (existing helper)
    await supabase.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });

    // Update tenant onboarding status if still 'new'
    await supabase.from("tenants").update({ onboarding_status: "plan_selected" })
      .eq("id", workspaceId).eq("onboarding_status", "new");

    return { planId, billingCycle };
  };

  try {
    console.log(`stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const workspaceId = await resolveWorkspace(session);
        if (!workspaceId) { console.warn("No workspace for session", session.id); break; }

        // Fetch full subscription
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const { planId, billingCycle } = await upsertSubscriptionFromStripe(sub, workspaceId);
          await insertEvent("checkout_completed", workspaceId, 0, {
            session_id: session.id, subscription_id: sub.id, plan_id: planId, billing_cycle: billingCycle,
          });
          await supabase.from("audit_logs").insert({
            tenant_id: workspaceId,
            action: "subscription.activated",
            resource_type: "subscription",
            details: { provider: "stripe", session_id: session.id, subscription_id: sub.id },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const workspaceId = await resolveWorkspace(sub);
        if (!workspaceId) { console.warn("No workspace for sub", sub.id); break; }
        await upsertSubscriptionFromStripe(sub, workspaceId);
        await insertEvent("subscription_" + (event.type.endsWith("created") ? "created" : "updated"),
          workspaceId, 0, { subscription_id: sub.id, status: sub.status });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const workspaceId = await resolveWorkspace(sub);
        if (workspaceId) {
          await supabase.from("subscriptions").update({
            plan_id: "free",
            status: "cancelled" as any,
            stripe_subscription_id: null,
            stripe_price_id: null,
            cancel_at_period_end: false,
            pending_plan_id: null,
            pending_billing_cycle: null,
            scheduled_change_at: null,
            trial_status: "ended",
            canceled_at: new Date().toISOString(),
          }).eq("tenant_id", workspaceId);
          await supabase.rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId });
          await insertEvent("subscription_cancelled", workspaceId, 0, { subscription_id: sub.id });
        }
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.finalized":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const workspaceId = await resolveWorkspace(invoice);
        if (!workspaceId) break;

        const succeeded = event.type === "invoice.payment_succeeded";
        const failed = event.type === "invoice.payment_failed";
        const amount = (invoice.amount_paid || invoice.amount_due || 0) / 100;
        const currency = (invoice.currency || "usd").toUpperCase();

        // Mirror invoice
        const { data: invNum } = await supabase.rpc("next_invoice_number");
        await supabase.from("platform_invoices").upsert({
          workspace_id: workspaceId,
          provider: "stripe",
          provider_invoice_id: invoice.id,
          invoice_number: invoice.number || invNum || `INV-${Date.now()}`,
          amount,
          currency,
          status: succeeded ? "paid" : (failed ? "failed" : invoice.status || "open"),
          billed_to: { email: invoice.customer_email, name: invoice.customer_name },
          line_items: (invoice.lines?.data || []).map((l: any) => ({
            name: l.description, qty: l.quantity, unit_amount: (l.amount || 0) / 100, amount: (l.amount || 0) / 100,
          })),
          period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
          period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
          pdf_path: invoice.invoice_pdf || null,
        }, { onConflict: "provider_invoice_id" });

        // Update subscription payment status
        if (invoice.subscription) {
          await supabase.from("subscriptions").update({
            last_payment_status: succeeded ? "succeeded" : (failed ? "failed" : "open"),
            latest_invoice_id: invoice.id,
            ...(failed ? { status: "past_due" as any } : {}),
            ...(succeeded ? { trial_status: "ended" } : {}),
          }).eq("stripe_subscription_id", invoice.subscription);
        }

        await insertEvent(
          succeeded ? "payment_succeeded" : (failed ? "payment_failed" : "invoice_finalized"),
          workspaceId, amount,
          { invoice_id: invoice.id, hosted_invoice_url: invoice.hosted_invoice_url, currency },
        );

        if (failed) {
          await supabase.from("audit_logs").insert({
            tenant_id: workspaceId,
            action: "subscription.payment_failed",
            resource_type: "subscription",
            details: { invoice_id: invoice.id },
          });
        }
        break;
      }

      case "payment_method.attached": {
        const pm = event.data.object;
        const workspaceId = await resolveWorkspace(pm);
        if (workspaceId) {
          await insertEvent("payment_method_attached", workspaceId, 0,
            { brand: pm.card?.brand, last4: pm.card?.last4 });
        }
        break;
      }

      default:
        // Still log for audit, but don't do anything else
        await insertEvent(event.type, null, 0, { ignored: true });
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
