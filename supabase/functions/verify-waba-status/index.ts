import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { waba_account_id, phone_number_id } = body;

    if (!waba_account_id) {
      return new Response(JSON.stringify({ error: 'waba_account_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Verifying WABA status for:', { waba_account_id, phone_number_id });

    // 1. Get WABA account from database
    const { data: wabaAccount, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('*')
      .eq('id', waba_account_id)
      .single();

    if (wabaError || !wabaAccount) {
      return new Response(JSON.stringify({ 
        error: 'WABA account not found',
        details: wabaError?.message 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('WABA account found:', {
      id: wabaAccount.id,
      waba_id: wabaAccount.waba_id,
      status: wabaAccount.status,
      hasToken: !!wabaAccount.encrypted_access_token,
      tokenLength: wabaAccount.encrypted_access_token?.length
    });

    const results: any = {
      waba_account: {
        id: wabaAccount.id,
        waba_id: wabaAccount.waba_id,
        name: wabaAccount.name,
        status: wabaAccount.status,
        business_id: wabaAccount.business_id,
        has_access_token: !!wabaAccount.encrypted_access_token,
        token_length: wabaAccount.encrypted_access_token?.length || 0
      },
      api_tests: {}
    };

    if (!wabaAccount.encrypted_access_token) {
      results.api_tests.token_status = {
        valid: false,
        error: 'No access token stored'
      };
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = wabaAccount.encrypted_access_token;

    // 2. Test token validity by calling /me endpoint
    try {
      const meResponse = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const meData = await meResponse.json();
      
      results.api_tests.token_me = {
        status: meResponse.status,
        valid: meResponse.ok,
        data: meData
      };
      console.log('/me response:', JSON.stringify(meData));
    } catch (e: any) {
      results.api_tests.token_me = { error: e.message };
    }

    // 3. Test WABA account access
    try {
      const wabaResponse = await fetch(`${WHATSAPP_API_BASE}/${wabaAccount.waba_id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const wabaData = await wabaResponse.json();
      
      results.api_tests.waba_account = {
        status: wabaResponse.status,
        valid: wabaResponse.ok,
        data: wabaData
      };
      console.log('WABA account response:', JSON.stringify(wabaData));
    } catch (e: any) {
      results.api_tests.waba_account = { error: e.message };
    }

    // 4. Test phone number access if provided
    if (phone_number_id) {
      try {
        const phoneResponse = await fetch(`${WHATSAPP_API_BASE}/${phone_number_id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const phoneData = await phoneResponse.json();
        
        results.api_tests.phone_number = {
          status: phoneResponse.status,
          valid: phoneResponse.ok,
          data: phoneData
        };
        console.log('Phone number response:', JSON.stringify(phoneData));
      } catch (e: any) {
        results.api_tests.phone_number = { error: e.message };
      }
    }

    // 5. Get phone numbers registered under WABA
    try {
      const phonesResponse = await fetch(
        `${WHATSAPP_API_BASE}/${wabaAccount.waba_id}/phone_numbers`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const phonesData = await phonesResponse.json();
      
      results.api_tests.waba_phone_numbers = {
        status: phonesResponse.status,
        valid: phonesResponse.ok,
        data: phonesData
      };
      console.log('WABA phone numbers response:', JSON.stringify(phonesData));
    } catch (e: any) {
      results.api_tests.waba_phone_numbers = { error: e.message };
    }

    // 6. Debug token info
    try {
      const debugResponse = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`
      );
      const debugData = await debugResponse.json();
      
      results.api_tests.token_debug = {
        status: debugResponse.status,
        data: debugData
      };
      console.log('Token debug response:', JSON.stringify(debugData));
    } catch (e: any) {
      results.api_tests.token_debug = { error: e.message };
    }

    // Summary
    results.summary = {
      token_valid: results.api_tests.token_me?.valid === true,
      waba_accessible: results.api_tests.waba_account?.valid === true,
      phone_accessible: results.api_tests.phone_number?.valid === true,
      is_test_account: wabaAccount.name?.toLowerCase().includes('test'),
      issues: []
    };

    if (!results.summary.token_valid) {
      results.summary.issues.push('Access token is invalid or expired');
    }
    if (!results.summary.waba_accessible) {
      results.summary.issues.push('Cannot access WABA account - token may lack permissions');
    }
    if (phone_number_id && !results.summary.phone_accessible) {
      results.summary.issues.push('Cannot access phone number - may be a test number');
    }
    if (results.summary.is_test_account) {
      results.summary.issues.push('This appears to be a TEST WABA account - test numbers cannot send real messages');
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in verify-waba-status:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
