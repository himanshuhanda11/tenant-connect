import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ALLOWED_PLANS = new Set(['free', 'basic', 'pro', 'business']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'missing authorization' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: 'invalid token' }, 401);
    }

    let body: { plan_id?: string } = {};
    try {
      body = await req.json();
    } catch {
      return json({ error: 'invalid body' }, 400);
    }

    const planId = String(body.plan_id ?? '').toLowerCase();
    if (!ALLOWED_PLANS.has(planId)) {
      return json({ error: 'invalid plan_id' }, 400);
    }

    const { data, error } = await supabase.rpc('claim_launch_offer', {
      _plan_id: planId,
    });

    if (error) {
      return json({ error: error.message }, 400);
    }

    return json({ ok: true, result: data }, 200);
  } catch (e) {
    console.error('claim-launch-offer error', e);
    return json({ error: 'internal error' }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
