import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const G = 'https://graph.facebook.com/v21.0';

Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: w } = await sb.from('waba_accounts').select('encrypted_access_token, waba_id').eq('id', '714524cf-8620-423a-a315-1f7ae09ea662').single();
  const tok = w!.encrypted_access_token as string;
  const appTok = `${Deno.env.get('META_APP_ID')}|${Deno.env.get('META_APP_SECRET')}`;
  const sysTok = Deno.env.get('META_SYSTEM_USER_TOKEN');
  const j = async (u: string) => { const r = await fetch(u); return { status: r.status, body: await r.json() }; };
  const out: Record<string, unknown> = {};
  const dbg = await j(`${G}/debug_token?input_token=${encodeURIComponent(tok)}&access_token=${encodeURIComponent(appTok)}`);
  const d = dbg.body?.data || {};
  out.debug = { status: dbg.status, type: d.type, app_id: d.app_id, user_id: d.user_id, is_valid: d.is_valid, expires_at: d.expires_at, data_access_expires_at: d.data_access_expires_at, scopes: d.scopes, granular_scopes: d.granular_scopes, error: d.error || dbg.body?.error };
  out.me = await j(`${G}/me?fields=id,name&access_token=${encodeURIComponent(tok)}`);
  out.phone = await j(`${G}/661674340360654?fields=id,display_phone_number,verified_name,status,code_verification_status,quality_rating,messaging_limit_tier,name_status,account_mode,platform_type,throughput&access_token=${encodeURIComponent(tok)}`);
  out.waba = await j(`${G}/${w!.waba_id}?fields=id,name,account_review_status,business_verification_status,health_status&access_token=${encodeURIComponent(tok)}`);
  out.waba_apps = await j(`${G}/${w!.waba_id}/subscribed_apps?access_token=${encodeURIComponent(tok)}`);
  out.assigned = await j(`${G}/${w!.waba_id}/assigned_users?business=982643213915017&access_token=${encodeURIComponent(tok)}`);
  out.me_biz = await j(`${G}/me/assigned_business_asset_groups?access_token=${encodeURIComponent(tok)}`);
  out.me_wabas = await j(`${G}/me/assigned_whatsapp_business_accounts?access_token=${encodeURIComponent(tok)}`);
  out.templates = await j(`${G}/${w!.waba_id}/message_templates?limit=1&fields=name,status&access_token=${encodeURIComponent(tok)}`);
  const pr = await fetch(`${G}/661674340360654/messages`, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: '0', type: 'text', text: { body: 'x' } }) });
  out.probe_send = { status: pr.status, body: await pr.json() };
  if (false) {
    const sd = await j(`${G}/debug_token?input_token=${encodeURIComponent(sysTok)}&access_token=${encodeURIComponent(appTok)}`);
    out.sys_debug = { type: sd.body?.data?.type, is_valid: sd.body?.data?.is_valid, user_id: sd.body?.data?.user_id, scopes: sd.body?.data?.scopes, granular_scopes: sd.body?.data?.granular_scopes };
    out.sys_phone = await j(`${G}/661674340360654?fields=id,display_phone_number,status,health_status&access_token=${encodeURIComponent(sysTok)}`);
    out.sys_waba = await j(`${G}/${w!.waba_id}?fields=id,name,health_status&access_token=${encodeURIComponent(sysTok)}`);
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { 'Content-Type': 'application/json' } });
});
