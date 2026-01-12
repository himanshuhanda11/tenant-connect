import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple HMAC-like signature using Web Crypto
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
  
  // Return base64 encoded: payload.signature
  const base64Payload = btoa(data);
  return `${base64Payload}.${sigHex}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no auth header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify tenant membership with admin/owner role
    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      console.error('Membership error:', memberError);
      return new Response(
        JSON.stringify({ error: 'Not a member of this tenant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: 'Only admins can connect WhatsApp Business accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Meta configuration
    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');
    const configId = Deno.env.get('META_CONFIG_ID');

    if (!appId || !appSecret || !configId) {
      console.error('Missing Meta configuration:', { appId: !!appId, appSecret: !!appSecret, configId: !!configId });
      return new Response(
        JSON.stringify({ error: 'Meta configuration not available' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signed state with nonce
    const statePayload = {
      tenantId,
      userId: user.id,
      nonce: crypto.randomUUID(),
      ts: Date.now()
    };

    const signedState = await signState(statePayload, appSecret);
    
    // Build callback URL - use Supabase function URL
    const callbackUrl = `${supabaseUrl}/functions/v1/waba-connect-callback`;

    // Build Meta OAuth URL for WhatsApp Embedded Signup
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      config_id: configId,
      state: signedState,
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
    });

    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;

    console.log('Generated OAuth URL for tenant:', tenantId);
    console.log('Callback URL:', callbackUrl);

    return new Response(
      JSON.stringify({ url: oauthUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Start error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
