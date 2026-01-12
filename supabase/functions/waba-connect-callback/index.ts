import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GRAPH_API_VERSION = 'v21.0';
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

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorReason = url.searchParams.get('error_reason');
    const errorDescription = url.searchParams.get('error_description');

    // Get the app URL for redirects (remove trailing slash if present)
    const rawAppUrl = Deno.env.get('APP_URL') || 'https://9ee3464f-477f-4b1e-b642-f9597c9a83d5.lovableproject.com';
    const appUrl = rawAppUrl.replace(/\/+$/, '');
    
    // Handle OAuth errors (return JSON so we can see exactly what Meta sent)
    if (error) {
      console.error('OAuth error:', { error, errorReason, errorDescription });
      return new Response(
        JSON.stringify({
          ok: false,
          error,
          errorReason,
          errorDescription,
          receivedParams: Object.fromEntries(url.searchParams.entries()),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If Meta fails before completing the flow, it may redirect without ?code=
    // Return JSON (instead of redirect) so we can inspect the parameters.
    if (!code) {
      console.error('Missing authorization code');
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Missing authorization code',
          hint:
            'Meta did not redirect with ?code=. This is usually a Meta app config/permission issue or the user cancelled the flow.',
          receivedParams: Object.fromEntries(url.searchParams.entries()),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!state) {
      console.error('Missing state');
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Missing state',
          hint: 'Meta redirected without ?state=. Check the OAuth URL generation and that the flow was completed.',
          receivedParams: Object.fromEntries(url.searchParams.entries()),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const appSecret = Deno.env.get('META_APP_SECRET');
    if (!appSecret) {
      console.error('Missing META_APP_SECRET');
      return Response.redirect(
        `${appUrl}/phone-numbers?error=${encodeURIComponent('Server configuration error')}`,
        302
      );
    }

    // Verify state signature
    const { valid, payload } = await verifyState(state, appSecret);
    if (!valid) {
      console.error('Invalid state signature');
      return Response.redirect(
        `${appUrl}/phone-numbers?error=${encodeURIComponent('Invalid or expired session')}`,
        302
      );
    }

    const { tenantId, userId } = payload;
    console.log('Processing callback for tenant:', tenantId, 'user:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user still has access to tenant
    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership || !['owner', 'admin'].includes(membership.role)) {
      console.error('Membership verification failed:', memberError);
      return Response.redirect(
        `${appUrl}/phone-numbers?error=${encodeURIComponent('Access denied')}`,
        302
      );
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
      return Response.redirect(
        `${appUrl}/phone-numbers?error=${encodeURIComponent(tokenData.error.message || 'Failed to exchange code')}`,
        302
      );
    }

    const accessToken = tokenData.access_token;
    console.log('Access token obtained successfully');

    // Debug token to get shared WABA ID and phone numbers
    console.log('Debugging token to get WABA info...');
    const debugUrl = `${GRAPH_API_BASE}/debug_token?` + new URLSearchParams({
      input_token: accessToken,
      access_token: accessToken
    });

    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    if (debugData.error) {
      console.error('Debug token error:', debugData.error);
      return Response.redirect(
        `${appUrl}/phone-numbers?error=${encodeURIComponent('Failed to verify token')}`,
        302
      );
    }

    // Extract WABA info from granular_scopes
    const granularScopes = debugData.data?.granular_scopes || [];
    const wabaScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_management');
    let wabaIds = wabaScope?.target_ids || [];

    console.log('WABA IDs from granular_scopes:', wabaIds);

    // Fallback: If no WABAs in granular_scopes, try fetching from user's businesses
    if (wabaIds.length === 0) {
      console.log('No WABAs in granular_scopes, trying to fetch from businesses...');
      
      // First get user's businesses
      const businessesResponse = await fetch(
        `${GRAPH_API_BASE}/me/businesses?fields=id,name&access_token=${accessToken}`
      );
      const businessesData = await businessesResponse.json();
      console.log('Businesses found:', businessesData.data?.length || 0);

      // For each business, try to get owned WABAs
      for (const business of (businessesData.data || [])) {
        console.log('Checking business:', business.id, business.name);
        const wabasResponse = await fetch(
          `${GRAPH_API_BASE}/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
        );
        const wabasData = await wabasResponse.json();
        
        if (wabasData.data && wabasData.data.length > 0) {
          console.log('Found WABAs in business', business.id, ':', wabasData.data.map((w: any) => w.id));
          wabaIds = wabaIds.concat(wabasData.data.map((w: any) => w.id));
        }
      }
    }

    console.log('Total WABA IDs found:', wabaIds);

    if (wabaIds.length === 0) {
      return Response.redirect(
        `${appUrl}/phone-numbers?error=${encodeURIComponent('No WhatsApp Business Account found. Please ensure you have a WABA linked to your Meta Business account, or use the Embedded Signup flow.')}`,
        302
      );
    }

    // Process each WABA
    let totalPhones = 0;
    for (const wabaId of wabaIds) {
      console.log('Processing WABA:', wabaId);

      // Get WABA details
      const wabaResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaId}?fields=id,name,currency,timezone_id,owner_business_info`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const wabaData = await wabaResponse.json();

      if (wabaData.error) {
        console.error('WABA fetch error for', wabaId, ':', wabaData.error);
        continue;
      }

      const businessId = wabaData.owner_business_info?.id || 'unknown';

      // Upsert WABA account
      const { data: existingWaba } = await supabase
        .from('waba_accounts')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('waba_id', wabaId)
        .maybeSingle();

      let wabaAccountId: string;

      if (existingWaba) {
        await supabase
          .from('waba_accounts')
          .update({
            encrypted_access_token: accessToken,
            status: 'active',
            name: wabaData.name,
            business_id: businessId,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWaba.id);
        wabaAccountId = existingWaba.id;
        console.log('Updated WABA account:', wabaAccountId);
      } else {
        const { data: newWaba, error: insertError } = await supabase
          .from('waba_accounts')
          .insert({
            tenant_id: tenantId,
            waba_id: wabaId,
            business_id: businessId,
            name: wabaData.name,
            encrypted_access_token: accessToken,
            status: 'active'
          })
          .select()
          .single();

        if (insertError) {
          console.error('WABA insert error:', insertError);
          continue;
        }
        wabaAccountId = newWaba.id;
        console.log('Created WABA account:', wabaAccountId);
      }

      // Get and store phone numbers
      const phonesResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const phonesData = await phonesResponse.json();

      const phoneNumbers = phonesData.data || [];
      console.log('Found', phoneNumbers.length, 'phone numbers for WABA', wabaId);

      for (const phone of phoneNumbers) {
        const { data: existingPhone } = await supabase
          .from('phone_numbers')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('phone_number_id', phone.id)
          .maybeSingle();

        if (existingPhone) {
          await supabase
            .from('phone_numbers')
            .update({
              display_number: phone.display_phone_number,
              verified_name: phone.verified_name,
              quality_rating: phone.quality_rating || 'UNKNOWN',
              status: 'connected',
              waba_account_id: wabaAccountId,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPhone.id);
        } else {
          await supabase
            .from('phone_numbers')
            .insert({
              tenant_id: tenantId,
              waba_account_id: wabaAccountId,
              phone_number_id: phone.id,
              display_number: phone.display_phone_number,
              verified_name: phone.verified_name,
              quality_rating: phone.quality_rating || 'UNKNOWN',
              status: 'connected'
            });
        }
        totalPhones++;
      }

      // Auto-subscribe to webhooks for this WABA
      try {
        console.log('Subscribing to webhooks for WABA:', wabaId);
        const subscribeResponse = await fetch(
          `${GRAPH_API_BASE}/${wabaId}/subscribed_apps`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        const subscribeData = await subscribeResponse.json();
        
        if (subscribeData.success) {
          console.log('Webhook subscription successful for WABA:', wabaId);
        } else {
          console.error('Webhook subscription failed:', subscribeData);
        }
      } catch (webhookError) {
        console.error('Webhook subscription error:', webhookError);
        // Continue anyway, webhooks can be set up later
      }
    }

    console.log('Callback completed. Total phones connected:', totalPhones);

    // Redirect to success page
    return Response.redirect(
      `${appUrl}/phone-numbers?connected=1&phones=${totalPhones}`,
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
