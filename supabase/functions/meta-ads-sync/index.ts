import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GRAPH_API_VERSION = 'v21.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { tenantId } = await req.json();
    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'Missing tenantId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify tenant membership
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'Not a member of this workspace' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get connected ad accounts for this workspace
    const { data: adAccounts, error: accError } = await supabase
      .from('smeksh_meta_ad_accounts')
      .select('*')
      .eq('workspace_id', tenantId)
      .eq('is_active', true)
      .eq('status', 'connected');

    if (accError) throw accError;
    if (!adAccounts || adAccounts.length === 0) {
      return new Response(JSON.stringify({ error: 'No connected ad accounts found', synced: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalSynced = 0;
    const errors: string[] = [];

    for (const account of adAccounts) {
      const accessToken = account.meta_access_token;
      const metaAccountId = account.meta_account_id;

      if (!accessToken || !metaAccountId) {
        errors.push(`Account ${account.id}: missing token or account ID`);
        continue;
      }

      try {
        // Fetch campaigns from Meta Graph API
        const campaignsUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${metaAccountId}/campaigns?fields=id,name,objective,status,start_time,stop_time&limit=100&access_token=${accessToken}`;
        const campaignsRes = await fetch(campaignsUrl);
        const campaignsData = await campaignsRes.json();

        if (campaignsData.error) {
          console.error(`Campaigns fetch error for ${metaAccountId}:`, campaignsData.error);
          errors.push(`Account ${metaAccountId}: ${campaignsData.error.message}`);

          // Update account sync error
          await supabase
            .from('smeksh_meta_ad_accounts')
            .update({ sync_error: campaignsData.error.message, updated_at: new Date().toISOString() })
            .eq('id', account.id);
          continue;
        }

        const campaigns = campaignsData.data || [];
        console.log(`Found ${campaigns.length} campaigns for ${metaAccountId}`);

        // Fetch insights for each campaign (last 30 days)
        for (const campaign of campaigns) {
          try {
            const insightsUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${campaign.id}/insights?fields=impressions,clicks,spend,ctr,cpc,actions&date_preset=last_30d&access_token=${accessToken}`;
            const insightsRes = await fetch(insightsUrl);
            const insightsData = await insightsRes.json();

            const insight = insightsData.data?.[0] || {};
            const actions = insight.actions || [];
            const leadsAction = actions.find((a: any) => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped');
            const messagingAction = actions.find((a: any) =>
              a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
              a.action_type === 'onsite_conversion.messaging_first_reply'
            );

            // Map campaign status
            let status: string = 'paused';
            if (campaign.status === 'ACTIVE') status = 'active';
            else if (campaign.status === 'PAUSED') status = 'paused';
            else if (campaign.status === 'ARCHIVED') status = 'completed';
            else if (campaign.status === 'DELETED') status = 'completed';

            const impressions = parseInt(insight.impressions || '0', 10);
            const clicks = parseInt(insight.clicks || '0', 10);
            const spend = parseFloat(insight.spend || '0');
            const leads = parseInt(leadsAction?.value || '0', 10);
            const conversations = parseInt(messagingAction?.value || '0', 10);
            const ctr = parseFloat(insight.ctr || '0');
            const cpc = parseFloat(insight.cpc || '0');
            const cpl = leads > 0 ? spend / leads : null;

            // Upsert campaign data
            const { error: upsertError } = await supabase
              .from('smeksh_meta_ad_campaigns')
              .upsert({
                workspace_id: tenantId,
                ad_account_id: account.id,
                meta_campaign_id: campaign.id,
                campaign_name: campaign.name,
                campaign_objective: campaign.objective || null,
                status,
                impressions,
                clicks,
                spend_amount: spend,
                spend_currency: 'USD',
                leads_count: leads,
                conversations_started: conversations,
                ctr,
                cpc,
                cpl,
                start_date: campaign.start_time ? campaign.start_time.split('T')[0] : null,
                end_date: campaign.stop_time ? campaign.stop_time.split('T')[0] : null,
                last_synced_at: new Date().toISOString(),
                raw_meta_data: { campaign, insight },
              }, {
                onConflict: 'workspace_id,meta_campaign_id',
                ignoreDuplicates: false,
              });

            if (upsertError) {
              console.error(`Upsert error for campaign ${campaign.id}:`, upsertError);
              // If unique constraint doesn't exist, try insert/update manually
              if (upsertError.code === '42P10' || upsertError.message?.includes('unique')) {
                // Try finding existing record
                const { data: existing } = await supabase
                  .from('smeksh_meta_ad_campaigns')
                  .select('id')
                  .eq('workspace_id', tenantId)
                  .eq('meta_campaign_id', campaign.id)
                  .single();

                if (existing) {
                  await supabase
                    .from('smeksh_meta_ad_campaigns')
                    .update({
                      campaign_name: campaign.name,
                      campaign_objective: campaign.objective || null,
                      status,
                      impressions,
                      clicks,
                      spend_amount: spend,
                      leads_count: leads,
                      conversations_started: conversations,
                      ctr, cpc, cpl,
                      last_synced_at: new Date().toISOString(),
                      raw_meta_data: { campaign, insight },
                    })
                    .eq('id', existing.id);
                } else {
                  await supabase
                    .from('smeksh_meta_ad_campaigns')
                    .insert({
                      workspace_id: tenantId,
                      ad_account_id: account.id,
                      meta_campaign_id: campaign.id,
                      campaign_name: campaign.name,
                      campaign_objective: campaign.objective || null,
                      status,
                      impressions, clicks, spend_amount: spend,
                      spend_currency: 'USD',
                      leads_count: leads, conversations_started: conversations,
                      ctr, cpc, cpl,
                      start_date: campaign.start_time ? campaign.start_time.split('T')[0] : null,
                      end_date: campaign.stop_time ? campaign.stop_time.split('T')[0] : null,
                      last_synced_at: new Date().toISOString(),
                      raw_meta_data: { campaign, insight },
                    });
                }
              }
            } else {
              totalSynced++;
            }
          } catch (insightErr: any) {
            console.error(`Insight fetch error for campaign ${campaign.id}:`, insightErr);
          }
        }

        // Update last_synced_at on the account
        await supabase
          .from('smeksh_meta_ad_accounts')
          .update({ last_synced_at: new Date().toISOString(), sync_error: null, updated_at: new Date().toISOString() })
          .eq('id', account.id);

      } catch (accountErr: any) {
        console.error(`Sync error for account ${account.id}:`, accountErr);
        errors.push(`Account ${metaAccountId}: ${accountErr.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      synced: totalSynced,
      accounts: adAccounts.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('meta-ads-sync error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
