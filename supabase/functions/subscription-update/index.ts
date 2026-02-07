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
    const { workspaceId, newPlanId, action } = await req.json();
    // action: 'upgrade' | 'downgrade' | 'cancel'

    if (!workspaceId || !action) {
      return new Response(JSON.stringify({ error: 'Missing workspaceId or action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid auth' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check workspace membership (owner/admin only)
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Only workspace owners/admins can manage subscriptions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('tenant_id', workspaceId)
      .eq('status', 'active')
      .single();

    // ── CANCEL ──
    if (action === 'cancel') {
      if (currentSub) {
        // If Stripe subscription, cancel via API
        if (currentSub.stripe_subscription_id) {
          const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
          if (stripeKey) {
            const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno");
            const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
            await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
              cancel_at_period_end: true,
            });
          }
        }

        await supabase.from('subscriptions').update({
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
        }).eq('id', currentSub.id);

        await supabase.from('audit_logs').insert({
          tenant_id: workspaceId,
          user_id: user.id,
          action: 'subscription.cancel_scheduled',
          resource_type: 'subscription',
          details: { plan_id: currentSub.plan_id },
        });
      }

      return new Response(JSON.stringify({ ok: true, action: 'cancel_scheduled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── DOWNGRADE ──
    if (action === 'downgrade' && newPlanId) {
      // Fetch new plan limits
      const { data: newPlan } = await supabase
        .from('platform_plans')
        .select('*')
        .eq('id', newPlanId)
        .single();

      if (!newPlan) {
        return new Response(JSON.stringify({ error: 'Plan not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check usage fits new plan
      const newLimits = newPlan.limits || {};
      const { data: teamCount } = await supabase
        .from('tenant_members')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', workspaceId);

      const blockers: string[] = [];
      if (newLimits.team_members && (teamCount?.length || 0) > newLimits.team_members) {
        blockers.push(`Remove ${(teamCount?.length || 0) - newLimits.team_members} team members`);
      }

      if (blockers.length > 0) {
        return new Response(JSON.stringify({
          error: 'downgrade_blocked',
          blockers,
          message: 'Reduce usage before downgrading',
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate Razorpay credit if applicable
      if (currentSub && !currentSub.stripe_subscription_id) {
        // Manual proration: credit remaining days
        const periodEnd = new Date(currentSub.current_period_end);
        const now = new Date();
        const totalDays = Math.ceil((periodEnd.getTime() - new Date(currentSub.current_period_start).getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const dailyRate = (currentSub.plan?.price_monthly || 0) / totalDays;
        const creditAmount = Math.round(dailyRate * remainingDays * 100) / 100;

        if (creditAmount > 0) {
          await supabase.from('workspace_credits').upsert({
            workspace_id: workspaceId,
            balance: creditAmount,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'workspace_id' });
        }
      }

      // Stripe: update subscription at period end
      if (currentSub?.stripe_subscription_id) {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (stripeKey) {
          const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno");
          const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
          // Schedule downgrade at period end
          await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
            cancel_at_period_end: true,
            metadata: { pending_downgrade_plan: newPlanId },
          });
        }
      }

      // Schedule downgrade for period end (Razorpay), or immediate for free
      if (newPlanId === 'free') {
        await supabase.from('subscriptions').update({
          plan_id: 'free',
          status: 'active',
        }).eq('tenant_id', workspaceId);

        await supabase.rpc('compute_workspace_entitlements', { p_workspace_id: workspaceId });
      }

      await supabase.from('audit_logs').insert({
        tenant_id: workspaceId,
        user_id: user.id,
        action: 'subscription.downgrade_scheduled',
        resource_type: 'subscription',
        details: { from_plan: currentSub?.plan_id, to_plan: newPlanId },
      });

      return new Response(JSON.stringify({ ok: true, action: 'downgrade_scheduled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Subscription update error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
