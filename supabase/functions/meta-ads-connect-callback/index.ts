import { createClient } from 'npm:@supabase/supabase-js@2';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

async function verifyState(signedState: string, secret: string): Promise<{ valid: boolean; payload: any }> {
  try {
    const [base64Payload, signature] = signedState.split('.');
    if (!base64Payload || !signature) return { valid: false, payload: null };

    const data = atob(base64Payload);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const expectedHex = Array.from(new Uint8Array(expectedSig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedHex) return { valid: false, payload: null };

    const payload = JSON.parse(data);
    // Valid for 1 hour
    if (Date.now() - payload.ts > 3600000) return { valid: false, payload: null };

    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    const rawAppUrl = Deno.env.get('APP_URL') || 'https://9ee3464f-477f-4b1e-b642-f9597c9a83d5.lovableproject.com';
    const appUrl = rawAppUrl.replace(/\/+$/, '');
    const errorRedirect = (msg: string) => Response.redirect(
      `${appUrl}/meta-ads/setup?error=${encodeURIComponent(msg)}`, 302
    );

    if (error) {
      const msg = url.searchParams.get('error_description') || error;
      return errorRedirect(`Meta OAuth error: ${msg}`);
    }

    if (!code) return errorRedirect('Meta did not return an authorization code.');
    if (!state) return errorRedirect('Missing state parameter.');

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');
    if (!appSecret || !appId) return errorRedirect('Server configuration error');

    const { valid, payload } = await verifyState(state, appSecret);
    if (!valid) return errorRedirect('Invalid or expired session');

    const { tenantId, userId } = payload;
    console.log('Meta Ads callback for tenant:', tenantId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify membership
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return errorRedirect('Access denied');
    }

    // Exchange code for access token
    const callbackUrl = `${supabaseUrl}/functions/v1/meta-ads-connect-callback`;
    const tokenUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: callbackUrl,
    });

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return errorRedirect(tokenData.error.message || 'Failed to exchange code');
    }

    let accessToken = tokenData.access_token;

    // Exchange for long-lived token
    const longLivedUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: accessToken,
    });
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();
    if (longLivedData.access_token) {
      accessToken = longLivedData.access_token;
      console.log('Long-lived token obtained');
    }

    // Fetch user info (only basic profile with email scope)
    const meResponse = await fetch(`${GRAPH_API_BASE}/me?fields=id,name&access_token=${accessToken}`);
    const meData = await meResponse.json();
    const fbUserName = meData.name || 'Facebook User';
    const fbUserId = meData.id;
    console.log('Facebook user:', fbUserName, fbUserId);

    // With basic email scope, we can't fetch ad accounts or pages
    // User will enter these manually in the setup UI
    const setupData = { fbUserName, fbUserId };
    
    const { data: pendingRow, error: insertError } = await supabase
      .from('smeksh_meta_ad_accounts')
      .insert({
        workspace_id: tenantId,
        meta_account_id: `pending_${crypto.randomUUID().slice(0, 8)}`,
        meta_user_name: fbUserName,
        meta_access_token: accessToken,
        setup_data: setupData,
        status: 'pending_setup',
        is_active: false,
        connected_by: userId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to store pending setup:', insertError);
      return errorRedirect('Failed to save connection data');
    }

    console.log('Pending setup row created:', pendingRow.id);

    // Redirect back to setup page with session ID
    return Response.redirect(
      `${appUrl}/meta-ads/setup?session=${pendingRow.id}&connected=1`,
      302
    );

  } catch (error: any) {
    console.error('Meta Ads callback error:', error);
    const appUrl = Deno.env.get('APP_URL') || 'https://9ee3464f-477f-4b1e-b642-f9597c9a83d5.lovableproject.com';
    return Response.redirect(
      `${appUrl}/meta-ads/setup?error=${encodeURIComponent(error.message || 'Connection failed')}`,
      302
    );
  }
});
