import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Temporary: returns only a short SHA-256 fingerprint of META_APP_SECRET, never the value.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.headers.get('x-check') !== 'aireatro-diag-7731') return new Response('no', { status: 404, headers: corsHeaders });
  const s = Deno.env.get('META_APP_SECRET') || '';
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  const hex = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
  return new Response(JSON.stringify({ fp: hex.slice(0, 12), len: s.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
