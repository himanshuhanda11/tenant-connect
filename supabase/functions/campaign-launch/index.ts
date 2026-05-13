import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LaunchRequest {
  tenant_id: string;
  name: string;
  goal?: string;
  campaign_type?: string;
  phone_number_id: string;
  template_id: string;
  template_name: string;
  template_language?: string;
  template_category?: string;
  template_variables?: Record<string, unknown>;
  contact_ids: string[];
  send_type: 'now' | 'scheduled';
  scheduled_at?: string | null;
  timezone?: string;
  messages_per_minute?: number;
  audience_config?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return j({ error: 'Unauthorized' }, 401);

    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supaAuth = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const supa = createClient(url, serviceKey);

    const { data: { user }, error: uErr } = await supaAuth.auth.getUser();
    if (uErr || !user) return j({ error: 'Unauthorized' }, 401);

    const body = (await req.json()) as LaunchRequest;
    if (!body.tenant_id || !body.phone_number_id || !body.template_id || !body.template_name || !Array.isArray(body.contact_ids) || body.contact_ids.length === 0) {
      return j({ error: 'Missing required fields' }, 400);
    }

    // Verify membership
    const { data: member } = await supa.from('tenant_members').select('id, role').eq('tenant_id', body.tenant_id).eq('user_id', user.id).maybeSingle();
    if (!member) return j({ error: 'Access denied' }, 403);

    // Plan gate
    const { data: planAccess } = await supa.rpc('check_plan_access', { p_tenant_id: body.tenant_id, p_feature_key: 'send_campaign' });
    if (!planAccess?.allowed) {
      return j({ error: 'plan_access_denied', reason: planAccess?.reason, current_plan: planAccess?.current_plan, upgrade_to: planAccess?.upgrade_to, feature: 'send_campaign' }, 402);
    }

    // Resolve recipient phones + country
    const { data: contacts, error: cErr } = await supa
      .from('contacts')
      .select('id, wa_id, name, country')
      .eq('tenant_id', body.tenant_id)
      .in('id', body.contact_ids);
    if (cErr) return j({ error: 'Failed to load contacts', detail: cErr.message }, 500);
    const valid = (contacts || []).filter((c) => c.wa_id);

    // Per-plan recipient cap
    const { data: capData } = await supa.rpc('get_broadcast_recipient_limit', { p_tenant_id: body.tenant_id });
    const cap = typeof capData === 'number' ? capData : 100;
    if (valid.length > cap) {
      return j({ error: 'recipient_limit_exceeded', limit: cap, requested: valid.length, current_plan: planAccess?.current_plan }, 402);
    }

    // Server-side cost estimation (country + template category aware)
    const category = (body.template_category || 'marketing').toLowerCase();
    const { data: estimate, error: estErr } = await supa.rpc('estimate_broadcast_cost', {
      p_tenant_id: body.tenant_id,
      p_contact_ids: valid.map((c) => c.id),
      p_template_category: category,
    });
    if (estErr) return j({ error: 'estimate_failed', detail: estErr.message }, 500);
    const est = estimate as any;
    if (!est?.sufficient) {
      return j({
        error: 'insufficient_credits',
        available: est?.available ?? 0,
        required: est?.total_credits ?? 0,
        breakdown: est?.breakdown ?? [],
        shortfall: est?.shortfall ?? 0,
      }, 402);
    }

    const sendNow = body.send_type === 'now';
    const scheduled_at = sendNow ? null : (body.scheduled_at ? new Date(body.scheduled_at).toISOString() : null);
    if (!sendNow && !scheduled_at) return j({ error: 'scheduled_at required for scheduled campaigns' }, 400);

    // Build per-country rate map for fast per-job lookup
    const rateMap = new Map<string, number>();
    for (const row of (est?.breakdown || [])) {
      rateMap.set(String(row.country_code), Number(row.rate));
    }

    // Insert campaign with estimate + breakdown
    const { data: campaign, error: campErr } = await supa
      .from('campaigns')
      .insert({
        tenant_id: body.tenant_id,
        name: body.name || 'Untitled broadcast',
        phone_number_id: body.phone_number_id,
        template_id: body.template_id,
        status: sendNow ? 'scheduled' : 'scheduled',
        scheduled_at: sendNow ? new Date().toISOString() : scheduled_at,
        campaign_type: (body.campaign_type as any) || 'broadcast',
        goal: (body.goal as any) || null,
        timezone: body.timezone || 'UTC',
        messages_per_minute: body.messages_per_minute || 30,
        template_variables: body.template_variables || {},
        template_category: category,
        audience_source: 'contacts',
        audience_config: body.audience_config || {},
        total_recipients: valid.length,
        queued_count: valid.length,
        estimated_credits_required: est?.total_credits ?? 0,
        pricing_breakdown: est?.breakdown ?? [],
        credit_status: 'reserved',
        created_by: user.id,
      })
      .select('id')
      .single();
    if (campErr) return j({ error: 'Failed to create campaign', detail: campErr.message }, 500);

    const tmplLang = body.template_language || 'en';
    const tmplVars = body.template_variables || {};

    // Helper: detect country code from phone (best-effort, fallback OTHER)
    const cc = (phone: string | null | undefined, fallback?: string): string => {
      if (fallback) return fallback.toUpperCase();
      if (!phone) return 'OTHER';
      const p = phone.replace(/\D/g, '');
      const prefixes: Array<[string, string]> = [
        ['971','AE'],['966','SA'],['973','BH'],['974','QA'],['965','KW'],['968','OM'],
        ['880','BD'],['977','NP'],['92','PK'],['94','LK'],['91','IN'],
        ['20','EG'],['27','ZA'],['34','ES'],['39','IT'],['33','FR'],['49','DE'],['44','GB'],
        ['55','BR'],['52','MX'],['54','AR'],['57','CO'],
        ['60','MY'],['62','ID'],['63','PH'],['65','SG'],['66','TH'],
        ['81','JP'],['82','KR'],['84','VN'],['86','CN'],['90','TR'],
        ['7','RU'],['1','US'],
      ];
      for (const [pre, code] of prefixes) if (p.startsWith(pre)) return code;
      return 'OTHER';
    };

    const BATCH = 500;
    let inserted = 0;
    for (let i = 0; i < valid.length; i += BATCH) {
      const slice = valid.slice(i, i + BATCH);
      const rows = slice.map((c) => {
        const code = cc(c.wa_id, (c as any).country);
        const rate = rateMap.get(code) ?? rateMap.get('OTHER') ?? 1;
        return {
          tenant_id: body.tenant_id,
          campaign_id: campaign.id,
          contact_id: c.id,
          phone_number_id: body.phone_number_id,
          template_name: body.template_name,
          template_language: tmplLang,
          template_variables: tmplVars,
          recipient_phone: c.wa_id!,
          recipient_name: c.name,
          scheduled_at: sendNow ? new Date().toISOString() : scheduled_at,
          status: 'queued',
          country_code: code,
          template_category: category,
          rate_per_message: rate,
        };
      });
      const { error: jErr, count } = await supa
        .from('campaign_jobs')
        .upsert(rows, { onConflict: 'campaign_id,contact_id', ignoreDuplicates: true, count: 'exact' });
      if (jErr) {
        console.error('job insert failed', jErr);
      } else {
        inserted += count || slice.length;
      }
    }

    return j({
      ok: true,
      campaign_id: campaign.id,
      jobs_queued: inserted,
      total_recipients: valid.length,
      estimated_credits: est?.total_credits ?? 0,
      breakdown: est?.breakdown ?? [],
      scheduled_at: sendNow ? null : scheduled_at,
    });
  } catch (e: any) {
    console.error('campaign-launch error', e);
    return j({ error: e.message || 'Internal error' }, 500);
  }
});

function j(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
