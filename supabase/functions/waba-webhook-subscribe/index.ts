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
    const { wabaAccountId, action } = await req.json();

    if (!wabaAccountId) {
      return new Response(
        JSON.stringify({ error: 'Missing wabaAccountId' }),
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

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WABA account with access token
    const { data: wabaAccount, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('*')
      .eq('id', wabaAccountId)
      .single();

    if (wabaError || !wabaAccount) {
      return new Response(
        JSON.stringify({ error: 'WABA account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has admin access to this tenant
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', wabaAccount.tenant_id)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = wabaAccount.encrypted_access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token stored for this WABA' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subscribe to webhooks
    if (action === 'subscribe' || !action) {
      console.log('Subscribing to webhooks for WABA:', wabaAccount.waba_id);
      
      const subscribeResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaAccount.waba_id}/subscribed_apps`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const subscribeData = await subscribeResponse.json();

      if (subscribeData.error) {
        console.error('Webhook subscription error:', subscribeData.error);
        return new Response(
          JSON.stringify({ error: subscribeData.error.message || 'Failed to subscribe' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Webhook subscription successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify connection / health check
    if (action === 'verify') {
      console.log('Verifying WABA connection:', wabaAccount.waba_id);

      // Check WABA status
      const wabaResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaAccount.waba_id}?fields=id,name,account_review_status`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const wabaData = await wabaResponse.json();

      if (wabaData.error) {
        // Token might be expired
        await supabase
          .from('waba_accounts')
          .update({ status: 'disconnected' })
          .eq('id', wabaAccountId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: wabaData.error.message,
            status: 'disconnected'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update phone number quality ratings
      const phonesResponse = await fetch(
        `${GRAPH_API_BASE}/${wabaAccount.waba_id}/phone_numbers?fields=id,quality_rating,code_verification_status`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const phonesData = await phonesResponse.json();

      for (const phone of (phonesData.data || [])) {
        await supabase
          .from('phone_numbers')
          .update({ 
            quality_rating: phone.quality_rating || 'UNKNOWN',
            status: 'connected'
          })
          .eq('phone_number_id', phone.id)
          .eq('tenant_id', wabaAccount.tenant_id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'connected',
          wabaName: wabaData.name,
          phoneCount: phonesData.data?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Webhook subscribe error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
