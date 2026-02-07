import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId, planId, billingCycle, provider } = await req.json();

    if (!workspaceId || !planId || !provider) {
      return new Response(JSON.stringify({ error: 'Missing required fields: workspaceId, planId, provider' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['razorpay', 'stripe'].includes(provider)) {
      return new Response(JSON.stringify({ error: 'Unsupported provider. Use "razorpay" or "stripe"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is member of workspace
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid auth token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'Not a member of this workspace' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch plan
    const { data: plan, error: planError } = await supabase
      .from('platform_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (plan.is_custom) {
      return new Response(JSON.stringify({ error: 'Custom plans require sales contact' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const amount = cycle === 'yearly'
      ? Math.round(plan.price_monthly * 12 * 0.8)
      : plan.price_monthly;

    // Record payment attempt
    const { data: payment, error: paymentError } = await supabase
      .from('platform_payments')
      .insert({
        workspace_id: workspaceId,
        provider,
        plan_id: planId,
        billing_cycle: cycle,
        amount,
        currency: 'INR',
        status: 'created',
        metadata: { user_id: user.id, user_email: user.email },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      return new Response(JSON.stringify({ error: 'Failed to create payment record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://smeksh.lovable.app';

    // ──── STRIPE ────
    if (provider === 'stripe') {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeKey) {
        return new Response(JSON.stringify({ error: 'Stripe not configured. Please add STRIPE_SECRET_KEY.' }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno");
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'inr',
            recurring: { interval: cycle === 'yearly' ? 'year' : 'month' },
            product_data: { name: `Aireatro ${plan.name} Plan` },
            unit_amount: amount * 100, // Stripe uses smallest currency unit
          },
          quantity: 1,
        }],
        metadata: {
          workspaceId,
          planId,
          billingCycle: cycle,
          paymentId: payment.id,
        },
        success_url: `${appUrl}/billing?status=success&provider=stripe`,
        cancel_url: `${appUrl}/billing?status=cancelled&provider=stripe`,
      });

      // Update payment with provider refs
      await supabase.from('platform_payments').update({
        provider_order_id: session.id,
        status: 'pending',
      }).eq('id', payment.id);

      return new Response(JSON.stringify({
        provider: 'stripe',
        checkout_url: session.url,
        payment_id: payment.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ──── RAZORPAY ────
    if (provider === 'razorpay') {
      const keyId = Deno.env.get('RAZORPAY_KEY_ID');
      const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
      if (!keyId || !keySecret) {
        return new Response(JSON.stringify({ error: 'Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create Razorpay order via REST API
      const auth = btoa(`${keyId}:${keySecret}`);
      const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay uses paise
          currency: 'INR',
          receipt: payment.id,
          notes: {
            workspaceId,
            planId,
            billingCycle: cycle,
            paymentId: payment.id,
          },
        }),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        console.error('Razorpay order error:', errText);
        return new Response(JSON.stringify({ error: 'Failed to create Razorpay order' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const order = await orderRes.json();

      // Update payment with provider refs
      await supabase.from('platform_payments').update({
        provider_order_id: order.id,
        status: 'pending',
      }).eq('id', payment.id);

      return new Response(JSON.stringify({
        provider: 'razorpay',
        razorpay_order_id: order.id,
        razorpay_key: keyId,
        amount,
        currency: 'INR',
        payment_id: payment.id,
        plan_name: plan.name,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown provider' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
