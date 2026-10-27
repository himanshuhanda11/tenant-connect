import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { keepOnlyPhone, releasePhoneFromMeta } from '../_shared/whatsappNumberRelease.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    let body: any;
    try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }
    const { tenantId, phoneId, action } = body || {};
    if (typeof tenantId !== 'string' || !UUID.test(tenantId)) return json({ error: 'Invalid workspace' }, 400);
    if (typeof phoneId !== 'string' || !UUID.test(phoneId)) return json({ error: 'Invalid phone number' }, 400);
    if (action !== 'disconnect' && action !== 'keep_only') return json({ error: 'Invalid action' }, 400);

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: userData, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !userData?.user) return json({ error: 'Invalid session' }, 401);

    const { data: membership } = await supabase
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return json({ error: 'Only workspace owners and admins can change the WhatsApp number' }, 403);
    }

    const { data: phone } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('id', phoneId)
      .eq('tenant_id', tenantId)
      .maybeSingle();
    if (!phone) return json({ error: 'Phone number not found in this workspace' }, 404);

    if (action === 'disconnect') {
      const result = await releasePhoneFromMeta(supabase, phoneId, { reason: 'disconnected_by_user' });
      return json({ success: true, results: [result] });
    }

    const results = await keepOnlyPhone(supabase, tenantId, phoneId);
    return json({ success: true, results });
  } catch (e) {
    console.error('whatsapp-release-number error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});
