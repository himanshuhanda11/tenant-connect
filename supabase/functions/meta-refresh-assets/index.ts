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

    const { tenantId, adAccountId } = await req.json();
    if (!tenantId || !adAccountId) return json({ error: 'Missing params' }, 400);

    const { data: membership } = await supabase
      .from('tenant_members').select('role')
      .eq('tenant_id', tenantId).eq('user_id', user.id).single();
    if (!membership) return json({ error: 'Not a member' }, 403);

    const { data: account } = await supabase
      .from('smeksh_meta_ad_accounts').select('*')
      .eq('id', adAccountId).eq('workspace_id', tenantId).single();
    if (!account?.meta_access_token) return json({ error: 'Account not found' }, 404);

    const accessToken = account.meta_access_token;
    const updates: Record<string, unknown> = {};
    const assets: Record<string, unknown[]> = {};

    // Refresh ad accounts list
    try {
      const res = await fetch(`${GRAPH}/me/adaccounts?fields=id,name,account_status,currency&access_token=${accessToken}`);
      const data = await res.json();
      assets.ad_accounts = data.data || [];
    } catch { assets.ad_accounts = []; }

    // Refresh pages
    try {
      const res = await fetch(`${GRAPH}/me/accounts?fields=id,name,category,access_token&access_token=${accessToken}`);
      const data = await res.json();
      assets.pages = data.data || [];
    } catch { assets.pages = []; }

    // Refresh Instagram accounts (via page)
    if (account.page_id) {
      try {
        const res = await fetch(`${GRAPH}/${account.page_id}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${accessToken}`);
        const data = await res.json();
        if (data.instagram_business_account) {
          updates.instagram_account_id = data.instagram_business_account.id;
          updates.instagram_username = data.instagram_business_account.username;
          assets.instagram = [data.instagram_business_account];
        }
      } catch { /* optional */ }
    }

    // Refresh pixels
    try {
      const actId = account.meta_account_id;
      const res = await fetch(`${GRAPH}/${actId}/adspixels?fields=id,name&access_token=${accessToken}`);
      const data = await res.json();
      assets.pixels = data.data || [];
      if (data.data?.[0]) {
        updates.pixel_id = data.data[0].id;
        updates.pixel_name = data.data[0].name;
      }
    } catch { assets.pixels = []; }

    // Check permissions
    try {
      const res = await fetch(`${GRAPH}/me/permissions?access_token=${accessToken}`);
      const data = await res.json();
      const granted = (data.data || []).filter((p: any) => p.status === 'granted').map((p: any) => p.permission);
      updates.scopes_granted = granted;
      assets.permissions = granted;
    } catch { /* optional */ }

    // Check business
    try {
      const res = await fetch(`${GRAPH}/me?fields=id,name&access_token=${accessToken}`);
      const data = await res.json();
      updates.meta_user_name = data.name;
    } catch { /* optional */ }

    // Save updates
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      await supabase.from('smeksh_meta_ad_accounts').update(updates).eq('id', adAccountId);
    }

    return json({ success: true, assets, updates });

  } catch (err: any) {
    console.error('meta-refresh-assets error:', err);
    return json({ error: err.message || 'Internal server error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
