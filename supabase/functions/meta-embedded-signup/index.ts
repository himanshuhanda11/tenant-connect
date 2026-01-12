import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, tenantId } = await req.json();

    // Get config action - returns public app ID and config ID
    if (action === 'get_config') {
      const appId = Deno.env.get('META_APP_ID');
      const configId = Deno.env.get('META_CONFIG_ID');

      if (!appId || !configId) {
        console.error('Missing META_APP_ID or META_CONFIG_ID');
        return new Response(
          JSON.stringify({ error: 'Meta configuration not available' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ appId, configId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code action - requires authentication
    if (action === 'exchange_code') {
      if (!code || !tenantId) {
        return new Response(
          JSON.stringify({ error: 'Missing code or tenantId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify user authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Verify user token and membership
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error('Auth error:', userError);
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify tenant membership
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

      // Only admin/owner can connect WABA
      if (!['owner', 'admin'].includes(membership.role)) {
        return new Response(
          JSON.stringify({ error: 'Only admins can connect WhatsApp Business accounts' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const appId = Deno.env.get('META_APP_ID');
      const appSecret = Deno.env.get('META_APP_SECRET');

      if (!appId || !appSecret) {
        console.error('Missing META_APP_ID or META_APP_SECRET');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Exchange code for access token
      console.log('Exchanging code for access token...');
      const tokenUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        code: code
      });

      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('Token exchange error:', tokenData.error);
        return new Response(
          JSON.stringify({ error: tokenData.error.message || 'Failed to exchange code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const accessToken = tokenData.access_token;
      console.log('Access token obtained successfully');

      // Debug token to get shared WABA ID
      console.log('Debugging token to get WABA info...');
      const debugUrl = `${GRAPH_API_BASE}/debug_token?` + new URLSearchParams({
        input_token: accessToken,
        access_token: accessToken
      });

      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();

      if (debugData.error) {
        console.error('Debug token error:', debugData.error);
        return new Response(
          JSON.stringify({ error: 'Failed to verify token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract WABA info from granular_scopes
      const granularScopes = debugData.data?.granular_scopes || [];
      const wabaScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_management');
      const wabaIds = wabaScope?.target_ids || [];
      
      const phoneScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_messaging');
      const phoneNumberIds = phoneScope?.target_ids || [];

      console.log('WABA IDs:', wabaIds);
      console.log('Phone Number IDs:', phoneNumberIds);

      if (wabaIds.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No WhatsApp Business Account found in response' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get WABA details
      const wabaId = wabaIds[0];
      console.log('Fetching WABA details for:', wabaId);
      
      const wabaResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaId}?fields=id,name,currency,timezone_id,owner_business_info`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const wabaData = await wabaResponse.json();

      if (wabaData.error) {
        console.error('WABA fetch error:', wabaData.error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch WABA details' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const businessId = wabaData.owner_business_info?.id || 'unknown';
      console.log('Business ID:', businessId);

      // Create or update WABA account in database
      const { data: existingWaba, error: wabaCheckError } = await supabase
        .from('waba_accounts')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('waba_id', wabaId)
        .maybeSingle();

      let wabaAccountId: string;

      if (existingWaba) {
        // Update existing
        const { error: updateError } = await supabase
          .from('waba_accounts')
          .update({
            encrypted_access_token: accessToken,
            status: 'active',
            name: wabaData.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWaba.id);

        if (updateError) {
          console.error('WABA update error:', updateError);
          throw updateError;
        }
        wabaAccountId = existingWaba.id;
        console.log('Updated existing WABA account:', wabaAccountId);
      } else {
        // Create new
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
          throw insertError;
        }
        wabaAccountId = newWaba.id;
        console.log('Created new WABA account:', wabaAccountId);
      }

      // Get phone numbers from WABA
      console.log('Fetching phone numbers...');
      const phonesResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const phonesData = await phonesResponse.json();

      if (phonesData.error) {
        console.error('Phone numbers fetch error:', phonesData.error);
        // Continue anyway, phone numbers can be added later
      }

      const phoneNumbers = phonesData.data || [];
      console.log('Found phone numbers:', phoneNumbers.length);

      // Store phone numbers
      let firstPhoneNumberId: string | null = null;
      for (const phone of phoneNumbers) {
        const { data: existingPhone } = await supabase
          .from('phone_numbers')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('phone_number_id', phone.id)
          .maybeSingle();

        if (existingPhone) {
          // Update existing
          await supabase
            .from('phone_numbers')
            .update({
              display_number: phone.display_phone_number,
              verified_name: phone.verified_name,
              quality_rating: phone.quality_rating || 'UNKNOWN',
              status: 'connected',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPhone.id);
          
          if (!firstPhoneNumberId) firstPhoneNumberId = existingPhone.id;
        } else {
          // Create new
          const { data: newPhone, error: phoneInsertError } = await supabase
            .from('phone_numbers')
            .insert({
              tenant_id: tenantId,
              waba_account_id: wabaAccountId,
              phone_number_id: phone.id,
              display_number: phone.display_phone_number,
              verified_name: phone.verified_name,
              quality_rating: phone.quality_rating || 'UNKNOWN',
              status: 'connected'
            })
            .select()
            .single();

          if (phoneInsertError) {
            console.error('Phone insert error:', phoneInsertError);
          } else if (!firstPhoneNumberId) {
            firstPhoneNumberId = newPhone.id;
          }
        }
      }

      console.log('Embedded signup completed successfully');

      return new Response(
        JSON.stringify({
          success: true,
          wabaId: wabaId,
          wabaAccountId: wabaAccountId,
          phoneNumberId: firstPhoneNumberId,
          phoneCount: phoneNumbers.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Embedded signup error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
