// Sync per-country/category WhatsApp rates from Meta Graph API
// Strategy: pull conversation_analytics from each active WABA for the last 30 days,
// derive avg cost per message per (country_code, category), upsert with source='meta_api'.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH = 'https://graph.facebook.com/v21.0';

interface AggKey { country: string; category: string; }
interface AggVal { cost: number; messages: number; currency: string; }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supa = createClient(url, serviceKey);

  // Auth: must be platform admin OR called via cron with service role key in header
  const authHeader = req.headers.get('Authorization') || '';
  const cronKey = req.headers.get('x-cron-key') || '';
  const isCron = cronKey && cronKey === Deno.env.get('CRON_SECRET');

  if (!isCron) {
    if (!authHeader.startsWith('Bearer ')) return j({ error: 'Unauthorized' }, 401);
    const supaAuth = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supaAuth.auth.getUser();
    if (!user) return j({ error: 'Unauthorized' }, 401);
    const { data: isAdmin } = await supa.rpc('is_platform_admin', { _user_id: user.id });
    if (!isAdmin) return j({ error: 'Forbidden — platform admin only' }, 403);
  }

  // Start run
  const { data: run } = await supa.from('meta_pricing_sync_runs').insert({ status: 'running' }).select('id').single();
  const runId = run?.id;

  try {
    const { data: wabas, error: wErr } = await supa
      .from('waba_accounts')
      .select('id, waba_id, encrypted_access_token, status')
      .eq('status', 'active')
      .not('encrypted_access_token', 'is', null);
    if (wErr) throw wErr;

    const aggregates = new Map<string, AggVal>();
    let processed = 0;
    const errors: { waba: string; message: string }[] = [];

    const since = Math.floor((Date.now() - 30 * 86400 * 1000) / 1000);
    const until = Math.floor(Date.now() / 1000);

    for (const w of (wabas || [])) {
      try {
        // conversation_analytics returns spend per (country, conversation_category) buckets
        const u = `${GRAPH}/${w.waba_id}?fields=conversation_analytics.start(${since}).end(${until}).granularity(DAILY).dimensions(["COUNTRY","CONVERSATION_CATEGORY"]).metric_types(["COST","CONVERSATION"])`;
        const r = await fetch(u, { headers: { Authorization: `Bearer ${w.encrypted_access_token}` } });
        const data = await r.json();
        if (!r.ok) {
          const msg = data?.error?.message || `HTTP ${r.status}`;
          console.warn(`waba ${w.waba_id} analytics failed`, msg);
          errors.push({ waba: w.waba_id, message: msg });
          continue;
        }
        processed++;
        const points = data?.conversation_analytics?.data?.[0]?.data_points || [];
        for (const p of points) {
          const country = (p.country || 'OTHER').toUpperCase();
          const catRaw = String(p.conversation_category || 'MARKETING').toLowerCase();
          const category = ['marketing', 'utility', 'authentication', 'service'].includes(catRaw) ? catRaw : 'marketing';
          const cost = Number(p.cost || 0); // already in USD on most accounts
          const messages = Number(p.conversation || p.message || 0);
          if (messages <= 0) continue;
          const key = `${country}|${category}`;
          const cur = aggregates.get(key) || { cost: 0, messages: 0, currency: 'USD' };
          cur.cost += cost;
          cur.messages += messages;
          aggregates.set(key, cur);
        }
      } catch (e) {
        console.warn(`waba ${w.waba_id} fetch error`, e);
      }
    }

    // Upsert each aggregate (rate = cost/messages converted to credits using 1 credit = $0.02 ref)
    const CREDIT_USD = 0.02;
    let upserted = 0;
    for (const [key, agg] of aggregates) {
      const [country, category] = key.split('|');
      if (agg.messages < 5) continue; // sample size guard
      const ratePerMsgUsd = agg.cost / agg.messages;
      const credits = ratePerMsgUsd / CREDIT_USD;
      const { error } = await supa.from('whatsapp_meta_pricing_rates').upsert({
        country_code: country,
        country_name: country,
        template_category: category,
        rate_per_message: Number(credits.toFixed(4)),
        currency: 'USD',
        active: true,
        source: 'meta_api',
        synced_at: new Date().toISOString(),
        sample_size: agg.messages,
      }, { onConflict: 'country_code,template_category' });
      if (!error) upserted++;
    }

    await supa.from('meta_pricing_sync_runs').update({
      status: 'success', finished_at: new Date().toISOString(),
      wabas_processed: processed, rates_upserted: upserted,
      detail: { aggregates: aggregates.size },
    }).eq('id', runId);

    return j({ ok: true, wabas_processed: processed, rates_upserted: upserted, aggregates: aggregates.size });
  } catch (e: any) {
    await supa.from('meta_pricing_sync_runs').update({
      status: 'error', finished_at: new Date().toISOString(), error: e?.message || String(e),
    }).eq('id', runId);
    return j({ error: e?.message || 'Internal error' }, 500);
  }
});

function j(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
