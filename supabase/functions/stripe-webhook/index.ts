import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callFunction } from "../_shared/http.ts";

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 503 });
    }

    const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno");
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`Stripe event: ${event.type}`);

    // ── Helper: insert billing event ──
    const insertBillingEvent = async (eventType: string, workspaceId: string | null, amount: number, payload: any) => {
      await supabase.from('platform_billing_events').insert({
        provider: 'stripe',
        event_type: eventType,
        workspace_id: workspaceId,
        amount,
        currency: 'INR',
        provider_event_id: event.id,
        payload,
      });
    };

    // ── Helper: create invoice record ──
    const createInvoice = async (workspaceId: string, amount: number, planName: string, billingCycle: string) => {
      const { data: invNum } = await supabase.rpc('next_invoice_number');
      const invoiceNumber = invNum || `INV-${Date.now()}`;

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

      await supabase.from('platform_invoices').insert({
        workspace_id: workspaceId,
        provider: 'stripe',
        invoice_number: invoiceNumber,
        amount,
        currency: 'INR',
        status: 'paid',
        billed_to: {},
        line_items: [{ name: `${planName} Plan (${billingCycle})`, qty: 1, unit_amount: amount, amount }],
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      });
    };

    // ── checkout.session.completed → activate plan ──
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { workspaceId, planId, billingCycle, paymentId } = session.metadata || {};

      if (!workspaceId || !planId) {
        console.error('Missing metadata in session:', session.id);
        return new Response('ok');
      }

      // Update payment record
      if (paymentId) {
        await supabase.from('platform_payments').update({
          status: 'paid',
          provider_payment_id: session.payment_intent,
          provider_subscription_id: session.subscription,
        }).eq('id', paymentId);
      }

      // Upsert subscription
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

      await supabase.from('subscriptions').upsert({
        tenant_id: workspaceId,
        plan_id: planId.startsWith('plan_') ? planId : `plan_${planId}`,
        status: 'active',
        billing_cycle: billingCycle || 'monthly',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'tenant_id' });

      // Fetch plan for invoice
      const { data: plan } = await supabase.from('platform_plans').select('name, price_monthly').eq('id', planId).single();
      const amount = billingCycle === 'yearly'
        ? Math.round((plan?.price_monthly || 0) * 12 * 0.8)
        : (plan?.price_monthly || 0);

      // Insert billing event
      await insertBillingEvent('payment_succeeded', workspaceId, amount, {
        stripe_session_id: session.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      });

      // Create invoice
      await createInvoice(workspaceId, amount, plan?.name || planId, billingCycle || 'monthly');

      // Recompute entitlements
      await supabase.rpc('compute_workspace_entitlements', { p_workspace_id: workspaceId });

      // Also call billing-apply-plan for consistency
      await callFunction("billing-apply-plan", {
        workspaceId,
        planId,
        billingCycle: billingCycle || "monthly",
        provider: "stripe",
        providerSubscriptionId: session.subscription,
        providerCustomerId: session.customer,
      }, { "x-platform-secret": Deno.env.get("PLATFORM_WEBHOOK_SECRET") || "" }).catch(() => null);

      // Audit log
      await supabase.from('audit_logs').insert({
        tenant_id: workspaceId,
        action: 'subscription.activated',
        resource_type: 'subscription',
        resource_id: planId,
        details: {
          provider: 'stripe',
          plan_id: planId,
          billing_cycle: billingCycle,
          stripe_session_id: session.id,
          stripe_subscription_id: session.subscription,
        },
      });

      console.log(`Plan ${planId} activated for workspace ${workspaceId}`);
    }

    // ── subscription deleted ──
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { workspaceId } = subscription.metadata || {};

      if (workspaceId) {
        await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('tenant_id', workspaceId);
        await supabase.rpc('compute_workspace_entitlements', { p_workspace_id: workspaceId });
        await insertBillingEvent('subscription_cancelled', workspaceId, 0, { stripe_subscription_id: subscription.id });

        await supabase.from('audit_logs').insert({
          tenant_id: workspaceId,
          action: 'subscription.cancelled',
          resource_type: 'subscription',
          details: { provider: 'stripe', stripe_subscription_id: subscription.id },
        });
      }
    }

    // ── payment failed ──
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const { workspaceId } = invoice.subscription_details?.metadata || {};

      if (workspaceId) {
        await supabase.from('subscriptions').update({ status: 'past_due' }).eq('tenant_id', workspaceId);
        await insertBillingEvent('payment_failed', workspaceId, (invoice.amount_due || 0) / 100, { invoice_id: invoice.id });

        // Record risk event
        await supabase.from('platform_risk_events').insert({
          action: 'payment_failed',
          meta: { provider: 'stripe', workspace_id: workspaceId, invoice_id: invoice.id },
        });

        await supabase.from('audit_logs').insert({
          tenant_id: workspaceId,
          action: 'subscription.payment_failed',
          resource_type: 'subscription',
          details: { provider: 'stripe', invoice_id: invoice.id },
        });
      }
    }

    // ── refund ──
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const { workspaceId } = charge.metadata || {};
      const refundAmount = (charge.amount_refunded || 0) / 100;

      if (workspaceId) {
        await insertBillingEvent('refund', workspaceId, refundAmount, { charge_id: charge.id });
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
