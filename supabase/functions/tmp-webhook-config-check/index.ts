import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Temporary diagnostic: shows where Meta sends webhooks for one phone number. No tokens returned.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.headers.get('x-check') !== 'aireatro-diag-7731') return new Response('no', { status: 404, headers: corsHeaders });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: w } = await sb.from('waba_accounts').select('encrypted_access_token').eq('waba_id', '950657670332409').maybeSingle();
  const tok = encodeURIComponent(w?.encrypted_access_token || '');
  const a = await (await fetch(`https://graph.facebook.com/v21.0/661674340360654?fields=webhook_configuration,display_phone_number,platform_type,status&access_token=${tok}`)).json();
  const b = await (await fetch(`https://graph.facebook.com/v21.0/950657670332409/subscribed_apps?fields=whatsapp_business_api_data,override_callback_uri&access_token=${tok}`)).json();
  const c = await (await fetch(`https://graph.facebook.com/v21.0/950657670332409?fields=webhook_configuration&access_token=${tok}`)).json();
  return new Response(JSON.stringify({ phone: a, waba_apps: b, waba: c }, null, 2), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
