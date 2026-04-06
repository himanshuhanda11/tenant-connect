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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return json({ error: 'Invalid token' }, 401);

    const { tenantId, action, pageId } = await req.json();
    if (!tenantId) return json({ error: 'Missing tenantId' }, 400);

    // Verify membership
    const { data: membership } = await supabase
      .from('tenant_members').select('role')
      .eq('tenant_id', tenantId).eq('user_id', user.id).single();
    if (!membership) return json({ error: 'Not a member' }, 403);

    // Get Meta access token
    const { data: account } = await supabase
      .from('smeksh_meta_ad_accounts')
      .select('meta_access_token, facebook_page_id, facebook_page_name, meta_page_access_token')
      .eq('workspace_id', tenantId)
      .limit(1)
      .maybeSingle();

    let accessToken = account?.meta_access_token || Deno.env.get('META_SYSTEM_USER_TOKEN');
    if (!accessToken) return json({ error: 'No Meta access token configured' }, 400);

    if (action === 'sync_forms') {
      // Get all pages for this workspace
      const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`);
      const pagesData = await pagesRes.json();
      const pages = pagesData?.data || [];

      if (pages.length === 0) {
        return json({ pages: [], forms: [], message: 'No pages found' });
      }

      const allForms: any[] = [];

      for (const page of pages) {
        const pageAccessToken = page.access_token || accessToken;
        
        try {
          const formsRes = await fetch(
            `${GRAPH}/${page.id}/leadgen_forms?fields=id,name,status,created_time,leads_count&access_token=${pageAccessToken}`
          );
          const formsData = await formsRes.json();
          const forms = formsData?.data || [];

          for (const form of forms) {
            // Upsert lead form record
            await supabase.from('meta_lead_forms').upsert({
              tenant_id: tenantId,
              page_id: page.id,
              page_name: page.name,
              form_id: form.id,
              form_name: form.name,
              status: form.status === 'ACTIVE' ? 'active' : 'paused',
              last_sync_at: new Date().toISOString(),
            }, { onConflict: 'tenant_id,form_id' });

            allForms.push({
              form_id: form.id,
              form_name: form.name,
              page_id: page.id,
              page_name: page.name,
              status: form.status,
              leads_count: form.leads_count,
            });
          }

          // Upsert webhook subscription record
          await supabase.from('meta_webhook_subscriptions').upsert({
            tenant_id: tenantId,
            page_id: page.id,
            page_name: page.name,
          }, { onConflict: 'tenant_id,page_id' });

        } catch (err) {
          console.error(`Failed to fetch forms for page ${page.id}:`, err);
        }
      }

      return json({ pages: pages.map((p: any) => ({ id: p.id, name: p.name })), forms: allForms });
    }

    if (action === 'subscribe_webhook' && pageId) {
      // Subscribe to leadgen webhooks for a specific page
      const pageToken = account?.meta_page_access_token || accessToken;
      
      const subRes = await fetch(
        `${GRAPH}/${pageId}/subscribed_apps?subscribed_fields=leadgen&access_token=${pageToken}`,
        { method: 'POST' }
      );
      const subData = await subRes.json();

      if (subData.success) {
        await supabase.from('meta_webhook_subscriptions').upsert({
          tenant_id: tenantId,
          page_id: pageId,
          is_subscribed: true,
          subscribed_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id,page_id' });

        await supabase.from('meta_lead_forms').update({
          is_webhook_subscribed: true,
        }).eq('tenant_id', tenantId).eq('page_id', pageId);

        return json({ success: true, message: 'Webhook subscribed' });
      } else {
        return json({ success: false, error: subData.error || 'Subscription failed' }, 400);
      }
    }

    if (action === 'test_webhook') {
      // Simulate a lead submission for testing
      const testLead = {
        entry: [{
          id: pageId || 'test_page',
          changes: [{
            field: 'leadgen',
            value: {
              leadgen_id: `test_${Date.now()}`,
              form_id: 'test_form',
              page_id: pageId || 'test_page',
              created_time: Math.floor(Date.now() / 1000),
            }
          }]
        }]
      };

      // Insert test event
      await supabase.from('lead_events').insert({
        tenant_id: tenantId,
        form_id: 'test_form',
        lead_id: `test_${Date.now()}`,
        page_id: pageId || 'test_page',
        raw_payload: testLead,
        status: 'success',
        error_text: 'Test webhook simulation',
      });

      return json({ success: true, message: 'Test webhook event created' });
    }

    return json({ error: 'Unknown action' }, 400);

  } catch (err) {
    console.error('[meta-sync-lead-forms] Error:', err);
    return json({ error: err.message || 'Internal error' }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    },
  });
}
