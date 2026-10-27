import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Temporary: checks whether META_APP_SECRET is still accepted by Meta. Returns no secrets.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.headers.get('x-check') !== 'aireatro-diag-7731') return new Response('no', { status: 404, headers: corsHeaders });
  const appId = Deno.env.get('META_APP_ID') || '';
  const secret = Deno.env.get('META_APP_SECRET') || '';
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${encodeURIComponent(secret)}&grant_type=client_credentials`;
  const r = await fetch(url);
  const j = await r.json();
  let appName: string | null = null;
  if (j.access_token) {
    const a = await fetch(`https://graph.facebook.com/v21.0/${appId}?fields=name&access_token=${encodeURIComponent(j.access_token)}`);
    appName = (await a.json())?.name ?? null;
  }
  return new Response(JSON.stringify({
    app_id: appId,
    secret_length: secret.length,
    secret_accepted: !!j.access_token,
    app_name: appName,
    error: j.error ? { code: j.error.code, message: j.error.message } : null,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
