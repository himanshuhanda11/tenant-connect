import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Temporary diagnostic: which apps are subscribed to a WABA. Returns no secrets or tokens.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.headers.get('x-check') !== 'aireatro-diag-7731') return new Response('no', { status: 404, headers: corsHeaders });
  const wabaId = new URL(req.url).searchParams.get('waba') || '';
  if (!/^\d{5,25}$/.test(wabaId)) return new Response('bad', { status: 400, headers: corsHeaders });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: rows } = await sb.from('waba_accounts').select('id, tenant_id, waba_id, encrypted_access_token, updated_at, status').eq('waba_id', wabaId);
  const out: any[] = [];
  for (const row of rows || []) {
    const tok = row.encrypted_access_token;
    const r = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps?access_token=${encodeURIComponent(tok || '')}`);
    const j = await r.json();
    out.push({ tenant_id: row.tenant_id, status: row.status, updated_at: row.updated_at, subscribed_apps: j.data ?? null, error: j.error ? { code: j.error.code, message: j.error.message } : null });
  }
  const sys = Deno.env.get('META_SYSTEM_USER_TOKEN') || '';
  const r2 = await fetch(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps?access_token=${encodeURIComponent(sys)}`);
  const j2 = await r2.json();
  return new Response(JSON.stringify({ rows: out, via_system_token: j2.data ?? j2.error?.message }, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
