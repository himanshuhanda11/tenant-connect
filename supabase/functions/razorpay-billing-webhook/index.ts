import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 503 });
    }

    // Verify HMAC signature
    if (signature) {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
      const expected = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      if (expected !== signature) {
        console.error('Invalid Razorpay signature');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const eventType = payload.event;

    console.log(`Razorpay billing event: ${eventType}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ── Helper: insert billing event ──
    const insertBillingEvent = async (evtType: string, workspaceId: string | null, amount: number, meta: any) => {
      await supabase.from('platform_billing_events').insert({
        provider: 'razorpay',
        event_type: evtType,
        workspace_id: workspaceId,
        amount,
        currency: 'INR',
        provider_event_id: payload.payload?.payment?.entity?.id,
        payload: meta,
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
        provider: 'razorpay',
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

    // ── payment captured ──
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = payload.payload?.payment?.entity;
      if (!payment) {
        console.error('No payment entity in payload');
        return new Response('ok');
      }

      const notes = payment.notes || {};
      const { workspaceId, planId, billingCycle, paymentId } = notes;

      if (!workspaceId || !planId) {
        console.log('No workspace/plan metadata, skipping billing activation');
        return new Response('ok');
      }

      const amount = payment.amount / 100; // Convert paise to rupees

      // Update payment record
      if (paymentId) {
        await supabase.from('platform_payments').update({
          status: 'paid',
          provider_payment_id: payment.id,
          provider_order_id: payment.order_id,
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
      const { data: plan } = await supabase.from('platform_plans').select('name').eq('id', planId).single();

      // Insert billing event
      await insertBillingEvent('payment_succeeded', workspaceId, amount, {
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        plan_id: planId,
        billing_cycle: billingCycle,
      });

      // Create invoice
      await createInvoice(workspaceId, amount, plan?.name || planId, billingCycle || 'monthly');

      // Recompute entitlements
      await supabase.rpc('compute_workspace_entitlements', { p_workspace_id: workspaceId });

      // Audit log
      await supabase.from('audit_logs').insert({
        tenant_id: workspaceId,
        action: 'subscription.activated',
        resource_type: 'subscription',
        resource_id: planId,
        details: {
          provider: 'razorpay',
          plan_id: planId,
          billing_cycle: billingCycle,
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          amount,
        },
      });

      console.log(`Plan ${planId} activated for workspace ${workspaceId} via Razorpay`);
    }

    // ── payment failed ──
    if (eventType === 'payment.failed') {
      const payment = payload.payload?.payment?.entity;
      const notes = payment?.notes || {};
      const { workspaceId, paymentId } = notes;

      if (paymentId) {
        await supabase.from('platform_payments').update({
          status: 'failed',
          metadata: { error: payment?.error_description || 'Payment failed' },
        }).eq('id', paymentId);
      }

      if (workspaceId) {
        await insertBillingEvent('payment_failed', workspaceId, (payment?.amount || 0) / 100, {
          error: payment?.error_description,
        });

        // Record risk event
        await supabase.from('platform_risk_events').insert({
          action: 'payment_failed',
          meta: { provider: 'razorpay', workspace_id: workspaceId, payment_id: payment?.id },
        });

        await supabase.from('audit_logs').insert({
          tenant_id: workspaceId,
          action: 'subscription.payment_failed',
          resource_type: 'subscription',
          details: {
            provider: 'razorpay',
            razorpay_payment_id: payment?.id,
            error: payment?.error_description,
          },
        });
      }
    }

    // ── refund ──
    if (eventType === 'refund.created' || eventType === 'payment.refunded') {
      const refund = payload.payload?.refund?.entity || payload.payload?.payment?.entity;
      const notes = refund?.notes || {};
      const { workspaceId, paymentId } = notes;
      const refundAmount = (refund?.amount || 0) / 100;

      if (workspaceId) {
        await insertBillingEvent('refund', workspaceId, refundAmount, {
          razorpay_refund_id: refund?.id,
        });
      }

      if (paymentId) {
        await supabase.from('platform_payments').update({ status: 'refunded' }).eq('id', paymentId);
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Razorpay billing webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
