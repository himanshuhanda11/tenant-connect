import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GRAPH = 'https://graph.facebook.com/v21.0';

interface PublishStep {
  step: string;
  status: 'pending' | 'success' | 'error';
  meta_id?: string;
  error?: string;
  error_code?: string;
}

async function metaPost(url: string, body: Record<string, unknown>, token: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: token }),
  });
  const data = await res.json();
  if (data.error) throw { meta: true, message: data.error.message, code: data.error.code, type: data.error.type, fbtrace: data.error.fbtrace_id };
  return data;
}

async function metaGet(url: string, token: string) {
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}access_token=${token}`);
  const data = await res.json();
  if (data.error) throw { meta: true, message: data.error.message, code: data.error.code };
  return data;
}

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

    const { draftId, tenantId } = await req.json();
    if (!draftId || !tenantId) return json({ error: 'Missing draftId or tenantId' }, 400);

    // Verify membership
    const { data: membership } = await supabase
      .from('tenant_members').select('role')
      .eq('tenant_id', tenantId).eq('user_id', user.id).single();
    if (!membership || !['owner', 'admin', 'manager'].includes(membership.role))
      return json({ error: 'Insufficient permissions' }, 403);

    // Load draft
    const { data: draft, error: draftErr } = await supabase
      .from('smeksh_meta_campaign_drafts').select('*')
      .eq('id', draftId).eq('workspace_id', tenantId).single();
    if (draftErr || !draft) return json({ error: 'Draft not found' }, 404);

    // Get access token from ad account
    const { data: adAccount } = await supabase
      .from('smeksh_meta_ad_accounts').select('meta_access_token, meta_account_id')
      .eq('id', draft.ad_account_id).single();
    if (!adAccount?.meta_access_token) return json({ error: 'Ad account not connected or token missing' }, 400);

    const accessToken = adAccount.meta_access_token;
    const actId = adAccount.meta_account_id; // e.g. act_123456
    const log: PublishStep[] = [];

    // Mark publishing started
    await supabase.from('smeksh_meta_campaign_drafts').update({
      publish_status: 'publishing',
      publish_started_at: new Date().toISOString(),
      publish_error: null,
      publish_error_code: null,
    }).eq('id', draftId);

    let metaCampaignId = draft.meta_campaign_id;
    let metaAdsetId = draft.meta_adset_id;
    let metaCreativeId = draft.meta_creative_id;
    let metaAdId = draft.meta_ad_id;
    let metaLeadFormId = draft.meta_lead_form_id;

    try {
      // ── Step 1: Create Lead Form (if form_leads) ──
      if (draft.campaign_type === 'form_leads' && !metaLeadFormId) {
        log.push({ step: 'lead_form', status: 'pending' });
        try {
          const questions = (draft.lead_form_questions || []).map((q: any) => {
            if (q.type === 'predefined') return { type: 'PREDEFINED', key: q.field };
            return { type: 'CUSTOM', key: q.field, label: q.label };
          });

          const formBody: Record<string, unknown> = {
            name: `${draft.campaign_name} - Lead Form`,
            questions: JSON.stringify(questions),
            privacy_policy: { url: draft.lead_form_privacy_url },
            follow_up_action_url: draft.lead_form_thankyou_url || draft.lead_form_privacy_url,
          };

          if (draft.lead_form_type === 'higher_intent') {
            formBody.block_display_for_non_targeted_viewer = true;
          }

          if (draft.lead_form_thankyou_title) {
            formBody.thank_you_page = {
              title: draft.lead_form_thankyou_title,
              body: draft.lead_form_thankyou_body || 'Thank you for your submission.',
              button_text: draft.lead_form_thankyou_cta || 'Visit Website',
              button_type: draft.lead_form_thankyou_url ? 'VISIT_SITE' : 'CLOSE',
              ...(draft.lead_form_thankyou_url && { website_url: draft.lead_form_thankyou_url }),
            };
          }

          const formRes = await metaPost(`${GRAPH}/${draft.page_id}/leadgen_forms`, formBody, accessToken);
          metaLeadFormId = formRes.id;
          log[log.length - 1] = { step: 'lead_form', status: 'success', meta_id: metaLeadFormId! };
        } catch (e: any) {
          log[log.length - 1] = { step: 'lead_form', status: 'error', error: e.message, error_code: e.code?.toString() };
          throw e;
        }
      }

      // ── Step 2: Create Campaign ──
      if (!metaCampaignId) {
        log.push({ step: 'campaign', status: 'pending' });
        try {
          const campaignBody: Record<string, unknown> = {
            name: draft.campaign_name,
            objective: mapObjective(draft.campaign_type, draft.objective),
            status: 'PAUSED',
            special_ad_categories: draft.special_ad_categories?.length ? JSON.stringify(draft.special_ad_categories) : '[]',
            buying_type: draft.buying_type || 'AUCTION',
          };

          if (draft.cbo_enabled && draft.budget_type === 'daily' && draft.daily_budget) {
            campaignBody.daily_budget = Math.round(draft.daily_budget * 100); // cents
          } else if (draft.cbo_enabled && draft.budget_type === 'lifetime' && draft.lifetime_budget) {
            campaignBody.lifetime_budget = Math.round(draft.lifetime_budget * 100);
          }

          const campRes = await metaPost(`${GRAPH}/${actId}/campaigns`, campaignBody, accessToken);
          metaCampaignId = campRes.id;
          log[log.length - 1] = { step: 'campaign', status: 'success', meta_id: metaCampaignId! };
        } catch (e: any) {
          log[log.length - 1] = { step: 'campaign', status: 'error', error: e.message, error_code: e.code?.toString() };
          throw e;
        }
      }

      // ── Step 3: Create Ad Set ──
      if (!metaAdsetId) {
        log.push({ step: 'adset', status: 'pending' });
        try {
          const targeting = buildTargeting(draft);
          const adsetBody: Record<string, unknown> = {
            name: draft.adset_name || `${draft.campaign_name} - Ad Set`,
            campaign_id: metaCampaignId,
            optimization_goal: mapOptimizationGoal(draft.campaign_type, draft.optimization_goal),
            billing_event: 'IMPRESSIONS',
            bid_strategy: mapBidStrategy(draft.bid_strategy),
            targeting: JSON.stringify(targeting),
            status: 'PAUSED',
          };

          // Budget at adset level if CBO is off
          if (!draft.cbo_enabled) {
            if (draft.budget_type === 'daily' && draft.daily_budget) {
              adsetBody.daily_budget = Math.round(draft.daily_budget * 100);
            } else if (draft.budget_type === 'lifetime' && draft.lifetime_budget) {
              adsetBody.lifetime_budget = Math.round(draft.lifetime_budget * 100);
            }
          }

          if (draft.schedule_start) adsetBody.start_time = draft.schedule_start;
          if (draft.schedule_end) adsetBody.end_time = draft.schedule_end;

          // CTWA: destination type
          if (draft.campaign_type === 'ctwa') {
            adsetBody.destination_type = 'WHATSAPP';
            adsetBody.promoted_object = JSON.stringify({ page_id: draft.page_id });
          }

          // Form leads: promoted object
          if (draft.campaign_type === 'form_leads') {
            adsetBody.promoted_object = JSON.stringify({ page_id: draft.page_id });
          }

          // Website traffic: promoted object with pixel
          if (draft.campaign_type === 'website_traffic' && draft.pixel_id) {
            adsetBody.promoted_object = JSON.stringify({ pixel_id: draft.pixel_id });
          }

          const adsetRes = await metaPost(`${GRAPH}/${actId}/adsets`, adsetBody, accessToken);
          metaAdsetId = adsetRes.id;
          log[log.length - 1] = { step: 'adset', status: 'success', meta_id: metaAdsetId! };
        } catch (e: any) {
          log[log.length - 1] = { step: 'adset', status: 'error', error: e.message, error_code: e.code?.toString() };
          throw e;
        }
      }

      // ── Step 4: Create Creative ──
      if (!metaCreativeId) {
        log.push({ step: 'creative', status: 'pending' });
        try {
          const creativeBody: Record<string, unknown> = {
            name: `${draft.ad_name || draft.campaign_name} - Creative`,
          };

          const linkData: Record<string, unknown> = {
            message: draft.primary_text || '',
            name: draft.headline || '',
            description: draft.description || '',
            call_to_action: { type: draft.call_to_action || 'LEARN_MORE' },
          };

          if (draft.media_url) {
            linkData.picture = draft.media_url;
          }

          if (draft.campaign_type === 'website_traffic') {
            let url = draft.destination_url || '';
            // Append UTMs
            if (draft.utm_source || draft.utm_medium || draft.utm_campaign) {
              const utmParams = new URLSearchParams();
              if (draft.utm_source) utmParams.set('utm_source', draft.utm_source);
              if (draft.utm_medium) utmParams.set('utm_medium', draft.utm_medium);
              if (draft.utm_campaign) utmParams.set('utm_campaign', draft.utm_campaign);
              if (draft.utm_content) utmParams.set('utm_content', draft.utm_content);
              if (draft.utm_term) utmParams.set('utm_term', draft.utm_term);
              url += (url.includes('?') ? '&' : '?') + utmParams.toString();
            }
            linkData.link = url;
            if (draft.display_link) linkData.caption = draft.display_link;
            linkData.call_to_action = { type: draft.call_to_action || 'LEARN_MORE', value: { link: url } };
          }

          if (draft.campaign_type === 'ctwa') {
            linkData.link = `https://api.whatsapp.com/send?phone=${draft.whatsapp_phone_id || ''}`;
            linkData.call_to_action = {
              type: 'WHATSAPP_MESSAGE',
              value: {
                app_destination: 'WHATSAPP',
                ...(draft.whatsapp_welcome_message && { lead_gen_form_id: undefined }),
              },
            };
            if (draft.whatsapp_welcome_message) {
              creativeBody.whatsapp_welcome_message = JSON.stringify([{
                type: 'BODY',
                text: draft.whatsapp_welcome_message,
              }]);
            }
          }

          if (draft.campaign_type === 'form_leads' && metaLeadFormId) {
            linkData.link = `https://fb.me/`;
            linkData.call_to_action = {
              type: draft.call_to_action || 'SIGN_UP',
              value: { lead_gen_form_id: metaLeadFormId },
            };
          }

          creativeBody.object_story_spec = JSON.stringify({
            page_id: draft.page_id,
            link_data: linkData,
            ...(draft.instagram_account_id && { instagram_actor_id: draft.instagram_account_id }),
          });

          const creativeRes = await metaPost(`${GRAPH}/${actId}/adcreatives`, creativeBody, accessToken);
          metaCreativeId = creativeRes.id;
          log[log.length - 1] = { step: 'creative', status: 'success', meta_id: metaCreativeId! };
        } catch (e: any) {
          log[log.length - 1] = { step: 'creative', status: 'error', error: e.message, error_code: e.code?.toString() };
          throw e;
        }
      }

      // ── Step 5: Create Ad ──
      if (!metaAdId) {
        log.push({ step: 'ad', status: 'pending' });
        try {
          const adBody: Record<string, unknown> = {
            name: draft.ad_name || `${draft.campaign_name} - Ad`,
            adset_id: metaAdsetId,
            creative: JSON.stringify({ creative_id: metaCreativeId }),
            status: 'PAUSED',
          };

          const adRes = await metaPost(`${GRAPH}/${actId}/ads`, adBody, accessToken);
          metaAdId = adRes.id;
          log[log.length - 1] = { step: 'ad', status: 'success', meta_id: metaAdId! };
        } catch (e: any) {
          log[log.length - 1] = { step: 'ad', status: 'error', error: e.message, error_code: e.code?.toString() };
          throw e;
        }
      }

      // ── All done → update draft ──
      await supabase.from('smeksh_meta_campaign_drafts').update({
        meta_campaign_id: metaCampaignId,
        meta_adset_id: metaAdsetId,
        meta_creative_id: metaCreativeId,
        meta_ad_id: metaAdId,
        meta_lead_form_id: metaLeadFormId,
        publish_status: 'published',
        publish_completed_at: new Date().toISOString(),
        publish_log: log,
        publish_error: null,
        status: 'published',
      }).eq('id', draftId);

      // Also upsert into campaigns table
      await supabase.from('smeksh_meta_ad_campaigns').upsert({
        workspace_id: tenantId,
        ad_account_id: draft.ad_account_id,
        meta_campaign_id: metaCampaignId,
        campaign_name: draft.campaign_name,
        campaign_objective: draft.objective,
        status: 'paused',
        meta_adset_id: metaAdsetId,
        meta_ad_id: metaAdId,
        meta_creative_id: metaCreativeId,
        draft_id: draftId,
        adset_name: draft.adset_name,
        last_synced_at: new Date().toISOString(),
      }, { onConflict: 'workspace_id,meta_campaign_id' });

      // Audit log
      await supabase.from('audit_logs').insert({
        tenant_id: tenantId,
        user_id: user.id,
        action: 'meta_campaign.published',
        resource_type: 'meta_campaign',
        resource_id: draftId,
        details: { meta_campaign_id: metaCampaignId, meta_ad_id: metaAdId, campaign_type: draft.campaign_type },
      });

      return json({ success: true, meta_campaign_id: metaCampaignId, meta_adset_id: metaAdsetId, meta_creative_id: metaCreativeId, meta_ad_id: metaAdId, meta_lead_form_id: metaLeadFormId, log });

    } catch (publishErr: any) {
      // Save partial progress
      await supabase.from('smeksh_meta_campaign_drafts').update({
        meta_campaign_id: metaCampaignId,
        meta_adset_id: metaAdsetId,
        meta_creative_id: metaCreativeId,
        meta_ad_id: metaAdId,
        meta_lead_form_id: metaLeadFormId,
        publish_status: 'error',
        publish_error: publishErr.message || 'Unknown error',
        publish_error_code: publishErr.code?.toString() || null,
        publish_log: log,
      }).eq('id', draftId);

      const errorDetail = formatMetaError(publishErr);
      return json({ success: false, error: errorDetail.message, error_code: errorDetail.code, error_help: errorDetail.help, log }, 200);
    }

  } catch (err: any) {
    console.error('meta-publish-bundle error:', err);
    return json({ error: err.message || 'Internal server error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function mapObjective(type: string, objective?: string): string {
  const map: Record<string, string> = {
    ctwa: 'OUTCOME_ENGAGEMENT',
    website_traffic: 'OUTCOME_TRAFFIC',
    form_leads: 'OUTCOME_LEADS',
  };
  return map[type] || objective || 'OUTCOME_TRAFFIC';
}

function mapOptimizationGoal(type: string, goal?: string): string {
  const map: Record<string, string> = {
    ctwa: 'CONVERSATIONS',
    website_traffic: goal === 'LANDING_PAGE_VIEWS' ? 'LANDING_PAGE_VIEWS' : 'LINK_CLICKS',
    form_leads: 'LEAD_GENERATION',
  };
  return map[type] || goal || 'LINK_CLICKS';
}

function mapBidStrategy(strategy?: string): string {
  const map: Record<string, string> = {
    lowest_cost: 'LOWEST_COST_WITHOUT_CAP',
    cost_cap: 'COST_CAP',
    bid_cap: 'LOWEST_COST_WITH_BID_CAP',
  };
  return map[strategy || 'lowest_cost'] || 'LOWEST_COST_WITHOUT_CAP';
}

function buildTargeting(draft: any): Record<string, unknown> {
  const targeting: Record<string, unknown> = {};

  if (draft.age_min) targeting.age_min = draft.age_min;
  if (draft.age_max) targeting.age_max = draft.age_max;

  if (draft.genders?.length) {
    const genderMap: Record<string, number> = { male: 1, female: 2 };
    targeting.genders = draft.genders.map((g: string) => genderMap[g]).filter(Boolean);
  }

  if (draft.locations?.length) {
    targeting.geo_locations = {
      countries: draft.locations.filter((l: any) => l.type === 'country').map((l: any) => l.key),
      cities: draft.locations.filter((l: any) => l.type === 'city').map((l: any) => ({ key: l.key, name: l.name })),
      regions: draft.locations.filter((l: any) => l.type === 'region').map((l: any) => ({ key: l.key, name: l.name })),
    };
    // Remove empty arrays
    Object.entries(targeting.geo_locations as Record<string, unknown[]>).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length === 0) delete (targeting.geo_locations as Record<string, unknown>)[k];
    });
  }

  if (draft.interests?.length) {
    targeting.flexible_spec = [{ interests: draft.interests.map((i: any) => ({ id: i.id, name: i.name })) }];
  }

  if (draft.languages?.length) {
    const langMap: Record<string, number> = { en: 6, ar: 28, fr: 16, es: 23, de: 10, hi: 45, ur: 57, zh: 1, pt: 20, ja: 9, ko: 22, tr: 24, it: 8, nl: 13, ru: 19 };
    targeting.locales = draft.languages.map((l: string) => langMap[l]).filter(Boolean);
  }

  // Placements
  if (draft.placements === 'automatic') {
    targeting.publisher_platforms = ['facebook', 'instagram', 'audience_network', 'messenger'];
  } else if (draft.manual_placements?.length) {
    const platforms = new Set<string>();
    const positions: Record<string, string[]> = {};
    for (const p of draft.manual_placements) {
      const [platform, position] = p.split('_');
      const plat = platform === 'instagram' ? 'instagram' : platform === 'messenger' ? 'messenger' : platform === 'audience' ? 'audience_network' : 'facebook';
      platforms.add(plat);
      if (!positions[plat]) positions[plat] = [];
      positions[plat].push(position || 'feed');
    }
    targeting.publisher_platforms = Array.from(platforms);
  }

  return targeting;
}

function formatMetaError(err: any): { message: string; code: string; help: string } {
  if (!err.meta) return { message: err.message || 'Unknown error', code: 'INTERNAL', help: 'Please try again or contact support.' };

  const code = err.code?.toString() || 'UNKNOWN';
  let help = 'Check the Meta Ads Manager for more details.';

  if (code === '100') help = 'A required parameter is missing or invalid. Check your campaign settings and try again.';
  if (code === '190') help = 'Your Meta access token has expired. Please reconnect your account in Meta Ads Settings.';
  if (code === '200') help = 'You don\'t have permission for this action. Make sure your Meta account has ads_management permission.';
  if (code === '294') help = 'Your ad account has been flagged or disabled by Meta. Check your Meta Business Manager.';
  if (code === '1487851') help = 'Your ad was rejected by Meta. Review the ad content for policy violations.';
  if (code === '2446079') help = 'Budget is too low. Meta requires a minimum daily budget based on your bid strategy.';
  if (err.message?.includes('targeting')) help = 'Your targeting is too narrow or uses restricted options. Adjust age, gender, or location settings.';

  return { message: err.message, code, help };
}
