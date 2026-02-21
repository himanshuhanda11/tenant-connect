import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GRAPH = 'https://graph.facebook.com/v21.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: 'Invalid token' }, 401);

    const { tenantId, adAccountId, searchType, query } = await req.json();
    if (!tenantId || !adAccountId || !searchType || !query) {
      return json({ error: 'Missing required params: tenantId, adAccountId, searchType, query' }, 400);
    }

    // Verify membership
    const { data: membership } = await supabase
      .from('tenant_members').select('role')
      .eq('tenant_id', tenantId).eq('user_id', user.id).single();
    if (!membership) return json({ error: 'Not a member' }, 403);

    // Get access token
    const { data: account } = await supabase
      .from('smeksh_meta_ad_accounts').select('meta_access_token')
      .eq('id', adAccountId).single();
    if (!account?.meta_access_token) return json({ error: 'Ad account not connected' }, 400);

    const accessToken = account.meta_access_token;
    let results: unknown[] = [];

    if (searchType === 'interests') {
      const url = `${GRAPH}/search?type=adinterest&q=${encodeURIComponent(query)}&limit=25&access_token=${accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) return json({ error: data.error.message, meta_code: data.error.code }, 400);
      results = (data.data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        audience_size_lower_bound: item.audience_size_lower_bound,
        audience_size_upper_bound: item.audience_size_upper_bound,
        path: item.path,
        type: 'interest',
      }));
    }

    if (searchType === 'geo') {
      const url = `${GRAPH}/search?type=adgeolocation&q=${encodeURIComponent(query)}&limit=25&location_types=["country","region","city"]&access_token=${accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) return json({ error: data.error.message, meta_code: data.error.code }, 400);
      results = (data.data || []).map((item: any) => ({
        key: item.key,
        name: item.name,
        type: item.type,
        country_code: item.country_code,
        country_name: item.country_name,
        region: item.region,
        supports_city: item.supports_city,
        supports_region: item.supports_region,
      }));
    }

    if (searchType === 'locale') {
      const url = `${GRAPH}/search?type=adlocale&q=${encodeURIComponent(query)}&limit=25&access_token=${accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) return json({ error: data.error.message, meta_code: data.error.code }, 400);
      results = (data.data || []).map((item: any) => ({
        key: item.key,
        name: item.name,
      }));
    }

    return json({ results });

  } catch (err: any) {
    console.error('meta-targeting-search error:', err);
    return json({ error: err.message || 'Internal server error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
