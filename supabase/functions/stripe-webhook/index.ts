import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Verify webhook signature using Stripe SDK
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

    // Handle checkout.session.completed → activate plan
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

      // Check if subscriptions table uses tenant_id or workspace_id
      await supabase.from('subscriptions').upsert({
        tenant_id: workspaceId,
        plan_id: planId.startsWith('plan_') ? planId : `plan_${planId}`,
        status: 'active',
        billing_cycle: billingCycle || 'monthly',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'tenant_id' });

      // Recompute entitlements
      await supabase.rpc('compute_workspace_entitlements', {
        p_workspace_id: workspaceId,
      });

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

    // Handle subscription cancelled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { workspaceId } = subscription.metadata || {};

      if (workspaceId) {
        await supabase.from('subscriptions').update({
          status: 'cancelled',
        }).eq('tenant_id', workspaceId);

        // Revert to free plan entitlements
        await supabase.rpc('compute_workspace_entitlements', {
          p_workspace_id: workspaceId,
        });

        await supabase.from('audit_logs').insert({
          tenant_id: workspaceId,
          action: 'subscription.cancelled',
          resource_type: 'subscription',
          details: { provider: 'stripe', stripe_subscription_id: subscription.id },
        });
      }
    }

    // Handle payment failed
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const { workspaceId } = invoice.subscription_details?.metadata || {};

      if (workspaceId) {
        await supabase.from('subscriptions').update({
          status: 'past_due',
        }).eq('tenant_id', workspaceId);

        await supabase.from('audit_logs').insert({
          tenant_id: workspaceId,
          action: 'subscription.payment_failed',
          resource_type: 'subscription',
          details: { provider: 'stripe', invoice_id: invoice.id },
        });
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
