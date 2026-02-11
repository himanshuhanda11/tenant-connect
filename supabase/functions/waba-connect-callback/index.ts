import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GRAPH_API_VERSION = 'v24.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Verify HMAC signature
async function verifyState(signedState: string, secret: string): Promise<{ valid: boolean; payload: any }> {
  try {
    const [base64Payload, signature] = signedState.split('.');
    if (!base64Payload || !signature) {
      return { valid: false, payload: null };
    }

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

    if (signature !== expectedHex) {
      console.error('State signature mismatch');
      return { valid: false, payload: null };
    }

    const payload = JSON.parse(data);
    
    // Check timestamp (valid for 1 hour)
    if (Date.now() - payload.ts > 3600000) {
      console.error('State expired');
      return { valid: false, payload: null };
    }

    return { valid: true, payload };
  } catch (e) {
    console.error('State verification error:', e);
    return { valid: false, payload: null };
  }
}

function mapQuality(rating?: string): string {
  if (!rating) return 'UNKNOWN';
  const r = rating.toUpperCase();
  if (['GREEN', 'YELLOW', 'RED'].includes(r)) return r;
  return 'UNKNOWN';
}

function mapMessagingLimit(tier?: string): string {
  if (!tier) return 'TIER_1K';
  const t = tier.toUpperCase();
  if (t.includes('1K')) return 'TIER_1K';
  if (t.includes('10K')) return 'TIER_10K';
  if (t.includes('100K')) return 'TIER_100K';
  if (t.includes('UNLIMITED')) return 'TIER_UNLIMITED';
  return 'TIER_1K';
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorReason = url.searchParams.get('error_reason');
    const errorDescription = url.searchParams.get('error_description');

    const rawAppUrl = Deno.env.get('APP_URL') || 'https://9ee3464f-477f-4b1e-b642-f9597c9a83d5.lovableproject.com';
    const appUrl = rawAppUrl.replace(/\/+$/, '');
    
    if (error) {
      const received = Object.fromEntries(url.searchParams.entries());
      const metaCode = received.error_code || '';
      const metaMsg = received.error_message || errorDescription || error;
      console.error('OAuth error:', { error, errorReason, errorDescription, metaCode });
      const msg = metaCode ? `Meta OAuth error (${metaCode}): ${metaMsg}` : `Meta OAuth error: ${metaMsg}`;
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent(msg)}`, 302);
    }

    if (!code) {
      const received = Object.fromEntries(url.searchParams.entries());
      const metaCode = received.error_code || '';
      const metaMsg = received.error_message || 'Meta did not return an authorization code.';
      console.error('Missing authorization code', { metaCode, metaMsg, received });
      const msg = metaCode ? `Meta OAuth error (${metaCode}): ${metaMsg}` : metaMsg;
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent(msg)}`, 302);
    }

    if (!state) {
      console.error('Missing state');
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('Meta OAuth error: missing state parameter')}`, 302);
    }

    const appSecret = Deno.env.get('META_APP_SECRET');
    if (!appSecret) {
      console.error('Missing META_APP_SECRET');
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('Server configuration error')}`, 302);
    }

    const { valid, payload } = await verifyState(state, appSecret);
    if (!valid) {
      console.error('Invalid state signature');
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('Invalid or expired session')}`, 302);
    }

    const { tenantId, userId, phoneNumberId: selectedPhoneId } = payload;
    console.log('Processing callback for tenant:', tenantId, 'user:', userId, 'selectedPhone:', selectedPhoneId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || !['owner', 'admin'].includes(membership.role)) {
      console.error('Membership verification failed:', memberError);
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('Access denied')}`, 302);
    }

    // Exchange code for access token
    const appId = Deno.env.get('META_APP_ID');
    const callbackUrl = `${supabaseUrl}/functions/v1/waba-connect-callback`;

    console.log('Exchanging code for access token...');
    const tokenUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
      client_id: appId!,
      client_secret: appSecret,
      code: code,
      redirect_uri: callbackUrl
    });

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent(tokenData.error.message || 'Failed to exchange code')}`, 302);
    }

    let accessToken = tokenData.access_token;
    console.log('Short-lived access token obtained');

    // Exchange for long-lived token (60 days)
    const longLivedUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId!,
      client_secret: appSecret,
      fb_exchange_token: accessToken,
      set_token_expires_in_60_days: 'true',
    });

    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();

    if (longLivedData.access_token) {
      accessToken = longLivedData.access_token;
      console.log('Long-lived access token obtained');
    } else {
      console.warn('Could not get long-lived token, using short-lived');
    }

    // Debug token to get WABA IDs
    console.log('Debugging token to get WABA info...');
    const appAccessToken = `${appId}|${appSecret}`;
    const debugUrl = `${GRAPH_API_BASE}/debug_token?` + new URLSearchParams({
      input_token: accessToken,
      access_token: appAccessToken
    });

    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    const granularScopes = debugData.data?.granular_scopes || [];
    const wabaScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_management');
    let wabaIds = wabaScope?.target_ids || [];
    console.log('WABA IDs from granular_scopes:', wabaIds);

    if (wabaIds.length === 0) {
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('No WhatsApp Business Account found.')}`, 302);
    }

    // Use only the first (primary) WABA
    const primaryWabaId = wabaIds[0];
    console.log('Processing primary WABA:', primaryWabaId);

    const wabaResponse = await fetch(
      `${GRAPH_API_BASE}/${primaryWabaId}?fields=id,name,currency,timezone_id,owner_business_info`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const wabaData = await wabaResponse.json();

    if (wabaData.error) {
      console.error('WABA fetch error:', wabaData.error);
      return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('Failed to fetch WABA details')}`, 302);
    }

    const businessId = wabaData.owner_business_info?.id || 'unknown';

    // Upsert WABA account
    const { data: existingWaba } = await supabase
      .from('waba_accounts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('waba_id', primaryWabaId)
      .maybeSingle();

    let wabaAccountId: string;

    if (existingWaba) {
      await supabase.from('waba_accounts').update({
        encrypted_access_token: accessToken,
        status: 'active',
        name: wabaData.name,
        business_id: businessId,
        updated_at: new Date().toISOString()
      }).eq('id', existingWaba.id);
      wabaAccountId = existingWaba.id;
    } else {
      const { data: newWaba, error: insertError } = await supabase.from('waba_accounts').insert({
        tenant_id: tenantId,
        waba_id: primaryWabaId,
        business_id: businessId,
        name: wabaData.name,
        encrypted_access_token: accessToken,
        status: 'active'
      }).select().single();

      if (insertError) {
        console.error('WABA insert error:', insertError);
        return Response.redirect(`${appUrl}/phone-numbers?error=${encodeURIComponent('Failed to save WABA account')}`, 302);
      }
      wabaAccountId = newWaba.id;
    }

    // ── Get phone numbers from Meta ──
    const phonesResponse = await fetch(
      `${GRAPH_API_BASE}/${primaryWabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const phonesData = await phonesResponse.json();
    const allPhones = phonesData.data || [];
    console.log('Found', allPhones.length, 'phone numbers for WABA', primaryWabaId);

    // ── Select ONLY ONE phone number ──
    // Priority: 1) selectedPhoneId from state, 2) first phone in list
    let targetPhone = allPhones[0]; // default to first
    if (selectedPhoneId) {
      const found = allPhones.find((p: any) => p.id === selectedPhoneId);
      if (found) {
        targetPhone = found;
      } else {
        console.warn('Selected phone', selectedPhoneId, 'not found in WABA, using first available');
      }
    }

    let connectedPhoneId: string | null = null;

    if (targetPhone) {
      const qualityRating = mapQuality(targetPhone.quality_rating);
      const messagingLimit = mapMessagingLimit(targetPhone.messaging_limit_tier);

      // Enforce 1 phone per workspace: delete ALL existing phones first
      const { data: existingPhones } = await supabase
        .from('phone_numbers')
        .select('id')
        .eq('tenant_id', tenantId);
      if (existingPhones && existingPhones.length > 0) {
        const idsToDelete = existingPhones.map((p: any) => p.id);
        console.log('Removing existing phone(s) to enforce 1-per-workspace:', idsToDelete);
        await supabase.from('phone_numbers').delete().in('id', idsToDelete);
      }

      const { data: newPhone, error: phoneErr } = await supabase.from('phone_numbers').insert({
        tenant_id: tenantId,
        waba_account_id: wabaAccountId,
        phone_number_id: targetPhone.id,
        display_number: targetPhone.display_phone_number,
        verified_name: targetPhone.verified_name,
        quality_rating: qualityRating,
        messaging_limit: messagingLimit,
        status: 'connected',
      }).select().single();

      if (phoneErr) {
        console.error('Phone insert error:', phoneErr);
      } else {
        connectedPhoneId = newPhone.id;
        console.log('Connected single phone:', connectedPhoneId);
      }
    }

    // Auto-subscribe to webhooks
    try {
      const subRes = await fetch(`${GRAPH_API_BASE}/${primaryWabaId}/subscribed_apps`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const subData = await subRes.json();
      console.log('Webhook subscription:', subData.success ? 'OK' : 'FAILED');
    } catch (e) {
      console.error('Webhook subscription error:', e);
    }

    console.log('Callback completed. Phone connected:', connectedPhoneId);

    return Response.redirect(
      `${appUrl}/phone-numbers?connected=1&phones=${connectedPhoneId ? 1 : 0}`,
      302
    );

  } catch (error: any) {
    console.error('Callback error:', error);
    const appUrl = Deno.env.get('APP_URL') || 'https://9ee3464f-477f-4b1e-b642-f9597c9a83d5.lovableproject.com';
    return Response.redirect(
      `${appUrl}/phone-numbers?error=${encodeURIComponent(error.message || 'Connection failed')}`,
      302
    );
  }
});
