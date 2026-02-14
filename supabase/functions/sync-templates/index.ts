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

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const { tenant_id } = await req.json();
    if (!tenant_id) {
      return new Response(JSON.stringify({ error: 'tenant_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify membership
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active WABA accounts for this tenant
    const { data: wabaAccounts, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('id, waba_id, encrypted_access_token')
      .eq('tenant_id', tenant_id)
      .eq('status', 'active');

    if (wabaError || !wabaAccounts?.length) {
      return new Response(JSON.stringify({ error: 'No active WABA accounts found', count: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalSynced = 0;

    for (const waba of wabaAccounts) {
      if (!waba.encrypted_access_token) continue;

      try {
        // Fetch all message templates from Meta
        const url = `${WHATSAPP_API_BASE}/${waba.waba_id}/message_templates?limit=250&fields=name,language,status,category,components,id`;
        console.log('Fetching templates from Meta:', url);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${waba.encrypted_access_token}` },
        });

        if (!response.ok) {
          const errBody = await response.json();
          console.error('Meta API error:', JSON.stringify(errBody));
          continue;
        }

        const result = await response.json();
        const metaTemplates = result.data || [];
        console.log(`Fetched ${metaTemplates.length} templates from Meta for WABA ${waba.waba_id}`);

        for (const mt of metaTemplates) {
          const components = mt.components || [];
          const metaStatus = mt.status || 'PENDING';

          // Upsert: match by name + waba_account_id + language
          const { data: existing } = await supabase
            .from('templates')
            .select('id')
            .eq('tenant_id', tenant_id)
            .eq('waba_account_id', waba.id)
            .eq('name', mt.name)
            .eq('language', mt.language)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('templates')
              .update({
                components_json: components,
                status: metaStatus,
                category: mt.category || 'UTILITY',
                meta_template_id: mt.id || '',
                last_synced_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('templates')
              .insert({
                tenant_id,
                waba_account_id: waba.id,
                name: mt.name,
                language: mt.language,
                category: mt.category || 'UTILITY',
                status: metaStatus,
                components_json: components,
                meta_template_id: mt.id || '',
                last_synced_at: new Date().toISOString(),
              });
          }

          totalSynced++;
        }
      } catch (err) {
        console.error(`Error syncing templates for WABA ${waba.waba_id}:`, err);
      }
    }

    return new Response(JSON.stringify({ ok: true, count: totalSynced }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in sync-templates:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
