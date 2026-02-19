// Meta Ads OAuth start function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function signState(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = JSON.stringify(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sigHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const base64Payload = btoa(data);
  return `${base64Payload}.${sigHex}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: 'Missing tenantId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const token = authHeader.replace('Bearer ', '');

    // Verify user via Supabase REST API directly (no SDK import needed)
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseKey },
    });
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const user = await userRes.json();

    // Verify tenant membership (admin/owner) via REST
    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/tenant_members?tenant_id=eq.${tenantId}&user_id=eq.${user.id}&select=role`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const members = await memberRes.json();

    if (!members?.length || !['owner', 'admin'].includes(members[0].role)) {
      return new Response(
        JSON.stringify({ error: 'Only admins can connect Meta Ads' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');

    if (!appId || !appSecret) {
      return new Response(
        JSON.stringify({ error: 'Meta configuration not available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statePayload = {
      tenantId,
      userId: user.id,
      flow: 'meta-ads',
      nonce: crypto.randomUUID(),
      ts: Date.now()
    };

    const signedState = await signState(statePayload, appSecret);
    const callbackUrl = `${supabaseUrl}/functions/v1/meta-ads-connect-callback`;

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      state: signedState,
      scope: 'public_profile,email',
    });

    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;

    console.log('Meta Ads OAuth URL generated for tenant:', tenantId);

    return new Response(
      JSON.stringify({ url: oauthUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Meta Ads connect start error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
