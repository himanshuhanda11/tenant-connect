import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Temporary diagnostic: runs the Meta upload-session + file upload steps for a
// WhatsApp number WITHOUT applying the photo to the profile. Deleted after use.
Deno.serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: waba } = await supabase
    .from('waba_accounts')
    .select('id, encrypted_access_token, onboarding_type, is_on_biz_app, coexistence_enabled')
    .eq('id', 'ffafb669-6a93-4332-9ce5-e387fe6d4ee0')
    .single();
  const tok = waba?.encrypted_access_token;
  const appId = Deno.env.get('META_APP_ID');
  // 1x1 white PNG
  const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='), (c) => c.charCodeAt(0));
  const out: Record<string, unknown> = {
    onboarding_type: waba?.onboarding_type, is_on_biz_app: waba?.is_on_biz_app, coexistence_enabled: waba?.coexistence_enabled,
  };
  const s = await fetch(`https://graph.facebook.com/v21.0/${appId}/uploads?file_length=${png.byteLength}&file_type=image/png&access_token=${tok}`, { method: 'POST' });
  const sd = await s.json();
  out.session = { status: s.status, ok: !!sd.id, error: sd.error ?? null };
  if (sd.id) {
    const u = await fetch(`https://graph.facebook.com/v21.0/${sd.id}`, {
      method: 'POST', headers: { Authorization: `OAuth ${tok}`, file_offset: '0', 'Content-Type': 'image/png' }, body: png,
    });
    const ud = await u.json();
    out.upload = { status: u.status, gotHandle: !!ud.h, error: ud.error ?? null };
  }
  const dbg = await fetch(`https://graph.facebook.com/v21.0/debug_token?input_token=${tok}&access_token=${appId}|${Deno.env.get('META_APP_SECRET')}`);
  const dd = await dbg.json();
  out.token = { type: dd.data?.type, app_id_matches: dd.data?.app_id === appId, scopes: dd.data?.scopes, valid: dd.data?.is_valid };
  return new Response(JSON.stringify(out, null, 2), { headers: { 'Content-Type': 'application/json' } });
});
