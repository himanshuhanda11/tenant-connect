import { getAdminClient, getUserClient, corsHeaders, json } from '../_shared/supabase.ts';

const GRAPH_API_VERSION = 'v21.0';
const CAMPAIGN_CONCURRENCY = 6;
const META_FETCH_TIMEOUT_MS = 12_000;

/** Meta calls must never hang the whole sync. */
function fetchMeta(url: string) {
  return fetch(url, { signal: AbortSignal.timeout(META_FETCH_TIMEOUT_MS) });
}

async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return json({ error: 'Missing authorization' }, 401);
    }

    const userClient = getUserClient(req);
    
    // Use getClaims for ES256 token compatibility
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error('Auth error:', claimsError?.message);
      return json({ error: 'Invalid token' }, 401);
    }
    const user = { id: claimsData.claims.sub as string };

    const supabase = getAdminClient();

    const { tenantId } = await req.json();
    if (!tenantId) {
      return json({ error: 'Missing tenantId' }, 400);
    }

    // Verify tenant membership
    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return json({ error: 'Not a member of this workspace' }, 403);
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
      return json({ error: 'No connected ad accounts found', synced: 0 });
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
        // Fetch ad account currency from Meta
        let accountCurrency = 'USD';
        try {
          const accInfoRes = await fetchMeta(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${metaAccountId}?fields=currency&access_token=${accessToken}`
          );
          const accInfo = await accInfoRes.json();
          if (accInfo.currency) {
            accountCurrency = accInfo.currency;
          }
        } catch (currErr) {
          console.warn(`Could not fetch currency for ${metaAccountId}, defaulting to USD`);
        }

        // Fetch campaigns from Meta Graph API
        const campaignsUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${metaAccountId}/campaigns?fields=id,name,objective,status,start_time,stop_time&limit=100&access_token=${accessToken}`;
        const campaignsRes = await fetchMeta(campaignsUrl);
        const campaignsData = await campaignsRes.json();

        if (campaignsData.error) {
          console.error(`Campaigns fetch error for ${metaAccountId}:`, campaignsData.error);
          errors.push(`Account ${metaAccountId}: ${campaignsData.error.message}`);

          await supabase
            .from('smeksh_meta_ad_accounts')
            .update({ sync_error: campaignsData.error.message, updated_at: new Date().toISOString() })
            .eq('id', account.id);
          continue;
        }

        const campaigns = [...(campaignsData.data || [])];
        // Follow Meta's paging so accounts with more than 100 campaigns are fully synced.
        let nextCampaignsUrl: string | null = campaignsData.paging?.next || null;
        for (let pageNo = 0; nextCampaignsUrl && pageNo < 9; pageNo++) {
          try {
            const more: any = await fetchMeta(nextCampaignsUrl).then(r => r.json());
            if (more?.error) break;
            campaigns.push(...(more?.data || []));
            nextCampaignsUrl = more?.paging?.next || null;
          } catch { break; }
        }
        console.log(`Found ${campaigns.length} campaigns for ${metaAccountId} (currency: ${accountCurrency})`);

        // All ads in the account in a few paged calls (id → live/paused status for routing).
        const adsByCampaign = new Map<string, any[]>();
        let adsFetchError: string | null = null;
        try {
          let adsPageUrl: string | null = `https://graph.facebook.com/${GRAPH_API_VERSION}/${metaAccountId}/ads?fields=id,name,status,effective_status,adset_id,campaign_id,adset{name}&limit=200&access_token=${accessToken}`;
          for (let pageNo = 0; adsPageUrl && pageNo < 15; pageNo++) {
            const page: any = await fetchMeta(adsPageUrl).then(r => r.json());
            if (page?.error) { adsFetchError = page.error.message || 'unknown'; break; }
            for (const ad of page?.data || []) {
              if (!ad.campaign_id) continue;
              adsByCampaign.set(ad.campaign_id, [...(adsByCampaign.get(ad.campaign_id) || []), ad]);
            }
            adsPageUrl = page?.paging?.next || null;
          }
        } catch (e) {
          adsFetchError = e instanceof Error ? e.message : String(e);
        }
        if (adsFetchError) console.warn(`Account-level ads fetch failed for ${metaAccountId}: ${adsFetchError}`);
        console.log(`Found ads for ${adsByCampaign.size} campaigns in ${metaAccountId}`);

        // Last-30-day numbers for every campaign in a few paged calls (not one call per campaign,
        // which hits Meta's request limit on big accounts).
        const insightByCampaign = new Map<string, any>();
        let insightsFetchError: string | null = null;
        try {
          let insightsPageUrl: string | null = `https://graph.facebook.com/${GRAPH_API_VERSION}/${metaAccountId}/insights?level=campaign&fields=campaign_id,impressions,clicks,spend,ctr,cpc,actions&date_preset=last_30d&limit=500&access_token=${accessToken}`;
          for (let pageNo = 0; insightsPageUrl && pageNo < 10; pageNo++) {
            const page: any = await fetchMeta(insightsPageUrl).then(r => r.json());
            if (page?.error) { insightsFetchError = page.error.message || 'unknown'; break; }
            for (const row of page?.data || []) if (row.campaign_id) insightByCampaign.set(row.campaign_id, row);
            insightsPageUrl = page?.paging?.next || null;
          }
        } catch (e) {
          insightsFetchError = e instanceof Error ? e.message : String(e);
        }
        if (insightsFetchError) console.warn(`Account-level insights fetch failed for ${metaAccountId}: ${insightsFetchError}`);

        // When Meta refuses (e.g. request limit), keep what we saved last time instead of blanking it.
        const previousByCampaign = new Map<string, any>();
        if (adsFetchError || insightsFetchError) {
          const { data: prevRows } = await supabase
            .from('smeksh_meta_ad_campaigns')
            .select('meta_campaign_id, raw_meta_data')
            .eq('ad_account_id', account.id);
          (prevRows || []).forEach((r: any) => previousByCampaign.set(r.meta_campaign_id, r.raw_meta_data || {}));
        }

        await runPool(campaigns, CAMPAIGN_CONCURRENCY, async (campaign: any) => {
          try {
            const previous = previousByCampaign.get(campaign.id) || {};
            const adsResult = adsFetchError
              ? { data: (previous.ads || []).map((a: any) => ({ ...a, adset: a.adset_name ? { name: a.adset_name } : undefined })) }
              : { data: adsByCampaign.get(campaign.id) || [] };

            const insight = insightsFetchError ? (previous.insight || {}) : (insightByCampaign.get(campaign.id) || {});
            const actions = insight.actions || [];
            const leadsAction = actions.find((a: any) => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped');
            const messagingAction = actions.find((a: any) =>
              a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
              a.action_type === 'onsite_conversion.messaging_first_reply'
            );

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

            // Fetch ads under this campaign to get ad-level IDs for CTWA matching
            let adIds: string[] = [];
            let adsetIds: string[] = [];
            let adSummaries: Array<{ id: string; name: string; status: string; effective_status: string | null; adset_id: string | null; adset_name: string | null }> = [];
            try {
              const adsData = adsResult;
              if (adsData?.error) console.warn(`Ads fetch error for campaign ${campaign.id}: ${adsData.error.message}`);
              if (adsData?.data) {
                adIds = adsData.data.map((ad: any) => ad.id);
                adsetIds = [...new Set(adsData.data.map((ad: any) => ad.adset_id).filter(Boolean))];
                adSummaries = adsData.data.map((ad: any) => ({
                  id: ad.id,
                  name: ad.name || `Ad ${ad.id}`,
                  status: ad.status || 'UNKNOWN',
                  effective_status: ad.effective_status || null,
                  adset_id: ad.adset_id || null,
                  adset_name: ad.adset?.name || null,
                }));
              }
            } catch (adFetchErr) {
              console.warn(`Could not fetch ads for campaign ${campaign.id}:`, adFetchErr);
            }

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
                spend_currency: accountCurrency,
                leads_count: leads,
                conversations_started: conversations,
                ctr,
                cpc,
                cpl,
                start_date: campaign.start_time ? campaign.start_time.split('T')[0] : null,
                end_date: campaign.stop_time ? campaign.stop_time.split('T')[0] : null,
                last_synced_at: new Date().toISOString(),
                ad_name: adSummaries.length === 1 ? adSummaries[0].name : null,
                raw_meta_data: { campaign, insight, ad_ids: adIds, adset_ids: adsetIds, ads: adSummaries },
              }, {
                onConflict: 'workspace_id,meta_campaign_id',
                ignoreDuplicates: false,
              });

            if (upsertError) {
              console.error(`Upsert error for campaign ${campaign.id}:`, upsertError);
              if (upsertError.code === '42P10' || upsertError.message?.includes('unique')) {
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
                      spend_currency: accountCurrency,
                      leads_count: leads,
                      conversations_started: conversations,
                      ctr, cpc, cpl,
                      last_synced_at: new Date().toISOString(),
                      ad_name: adSummaries.length === 1 ? adSummaries[0].name : null,
                      raw_meta_data: { campaign, insight, ad_ids: adIds, adset_ids: adsetIds, ads: adSummaries },
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
                      spend_currency: accountCurrency,
                      leads_count: leads, conversations_started: conversations,
                      ctr, cpc, cpl,
                      start_date: campaign.start_time ? campaign.start_time.split('T')[0] : null,
                      end_date: campaign.stop_time ? campaign.stop_time.split('T')[0] : null,
                      last_synced_at: new Date().toISOString(),
                      ad_name: adSummaries.length === 1 ? adSummaries[0].name : null,
                      raw_meta_data: { campaign, insight, ad_ids: adIds, adset_ids: adsetIds, ads: adSummaries },
                    });
                }
              }
            } else {
              totalSynced++;
            }
          } catch (insightErr: any) {
            console.error(`Insight fetch error for campaign ${campaign.id}:`, insightErr);
          }
        });

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

    return json({
      success: true,
      synced: totalSynced,
      accounts: adAccounts.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('meta-ads-sync error:', error);
    return json({ error: error.message || 'Internal server error' }, 500);
  }
});
