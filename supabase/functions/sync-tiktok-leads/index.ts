// Cron-driven TikTok Lead Ads → Aireatro CRM + WhatsApp template sync
// Runs every 2 minutes via pg_cron. Multi-tenant safe.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TT_API = 'https://business-api.tiktok.com/open_api/v1.3';

interface SyncSetting {
  id: string;
  workspace_id: string;
  tiktok_connection_id: string;
  advertiser_id: string;
  form_id: string;
  form_name: string | null;
  whatsapp_phone_number_id: string;
  whatsapp_template_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  assigned_user_id: string | null;
  tags: string[] | null;
  auto_reply_enabled: boolean;
  sync_enabled: boolean;
  sync_frequency_minutes: number;
  last_sync_at: string | null;
}

interface TTConnection {
  id: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
}

async function refreshTikTokToken(supabase: any, conn: TTConnection): Promise<string> {
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
  const fresh = expiresAt - Date.now() > 5 * 60 * 1000; // > 5 min headroom
  if (fresh && conn.access_token) return conn.access_token;
  if (!conn.refresh_token) return conn.access_token;

  const clientKey = Deno.env.get('TIKTOK_CLIENT_KEY');
  const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET');
  if (!clientKey || !clientSecret) return conn.access_token;

  try {
    const res = await fetch(`${TT_API}/oauth2/refresh_token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: clientKey,
        secret: clientSecret,
        refresh_token: conn.refresh_token,
      }),
    });
    const json = await res.json();
    const newToken = json?.data?.access_token;
    const newRefresh = json?.data?.refresh_token;
    const expiresIn = json?.data?.access_token_expire_in ?? 86400;
    if (newToken) {
      await supabase
        .from('tiktok_connections')
        .update({
          access_token: newToken,
          refresh_token: newRefresh ?? conn.refresh_token,
          token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        })
        .eq('id', conn.id);
      return newToken;
    }
  } catch (e) {
    console.error('Token refresh failed', e);
  }
  return conn.access_token;
}

async function fetchTikTokLeads(
  accessToken: string,
  advertiserId: string,
  formId: string,
  startTime: string,
): Promise<any[]> {
  const url = new URL(`${TT_API}/pages/leads/get/`);
  url.searchParams.set('advertiser_id', advertiserId);
  url.searchParams.set('page_id', formId);
  url.searchParams.set('start_time', startTime);
  url.searchParams.set('page_size', '100');

  const res = await fetch(url.toString(), {
    headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (json?.code && json.code !== 0) {
    throw new Error(`TikTok API error: ${json.message || JSON.stringify(json)}`);
  }
  return json?.data?.list ?? json?.data?.leads ?? [];
}

function pickField(fields: any, keys: string[]): string | null {
  if (!fields) return null;
  // TikTok returns either an array of {name,value} or an object map
  if (Array.isArray(fields)) {
    for (const f of fields) {
      const k = String(f?.name || f?.key || '').toLowerCase();
      if (keys.some((x) => k.includes(x))) return String(f?.value ?? '').trim() || null;
    }
  } else if (typeof fields === 'object') {
    for (const [k, v] of Object.entries(fields)) {
      if (keys.some((x) => k.toLowerCase().includes(x))) {
        return String(v ?? '').trim() || null;
      }
    }
  }
  return null;
}

function normalizePhone(p: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/[^\d+]/g, '');
  if (!digits) return null;
  return digits.startsWith('+') ? digits.slice(1) : digits;
}

async function upsertContact(
  supabase: any,
  workspaceId: string,
  name: string | null,
  phone: string | null,
  tags: string[] | null,
  assignedAgentId: string | null,
): Promise<string | null> {
  if (!phone) return null;

  const { data: existing } = await supabase
    .from('contacts')
    .select('id')
    .eq('tenant_id', workspaceId)
    .eq('wa_id', phone)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from('contacts')
      .update({
        name: name || undefined,
        source: 'tiktok_ads',
        campaign_source: 'tiktok',
        ...(assignedAgentId ? { assigned_agent_id: assignedAgentId } : {}),
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from('contacts')
    .insert({
      tenant_id: workspaceId,
      wa_id: phone,
      name: name || phone,
      source: 'tiktok_ads',
      campaign_source: 'tiktok',
      assigned_agent_id: assignedAgentId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Contact insert failed', error);
    return null;
  }

  // Apply tags (best effort)
  if (created?.id && tags && tags.length > 0) {
    for (const tagName of tags) {
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('tenant_id', workspaceId)
        .eq('name', tagName)
        .maybeSingle();
      let tagId = tag?.id;
      if (!tagId) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ tenant_id: workspaceId, name: tagName })
          .select('id')
          .maybeSingle();
        tagId = newTag?.id;
      }
      if (tagId) {
        await supabase
          .from('contact_tags')
          .insert({ contact_id: created.id, tag_id: tagId })
          .then(() => {}, () => {});
      }
    }
  }
  return created?.id ?? null;
}

async function sendWhatsAppTemplate(
  supabase: any,
  workspaceId: string,
  phoneNumberId: string,
  templateId: string,
  toWaId: string,
  contactName: string | null,
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const { data: tmpl } = await supabase
    .from('wa_templates')
    .select('meta_template_name, language, status')
    .eq('id', templateId)
    .maybeSingle();

  if (!tmpl?.meta_template_name) return { ok: false, error: 'Template not found' };
  if (String(tmpl.status || '').toLowerCase() !== 'approved') {
    return { ok: false, error: 'Template not approved' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-template-message', {
      body: {
        tenant_id: workspaceId,
        phone_number_id: phoneNumberId,
        to_wa_id: toWaId,
        template_name: tmpl.meta_template_name,
        template_language: tmpl.language || 'en',
        contact_name: contactName || undefined,
      },
    });
    if (error) return { ok: false, error: error.message || 'invoke_failed' };
    const messageId = data?.message_id || data?.wamid || null;
    return { ok: true, messageId };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'send_failed' };
  }
}

async function processSetting(supabase: any, setting: SyncSetting) {
  const log = {
    workspace_id: setting.workspace_id,
    sync_setting_id: setting.id,
    status: 'success' as string,
    message: '' as string | null,
    error_details: null as any,
    leads_fetched: 0,
    leads_created: 0,
    messages_sent: 0,
  };

  try {
    // Load + refresh connection token
    const { data: connRow } = await supabase
      .from('tiktok_connections')
      .select('id, access_token, refresh_token, token_expires_at')
      .eq('id', setting.tiktok_connection_id)
      .maybeSingle();

    if (!connRow) throw new Error('TikTok connection missing');
    const accessToken = await refreshTikTokToken(supabase, connRow as TTConnection);

    // Fetch leads since last sync (or 24h back as initial)
    const startIso =
      setting.last_sync_at ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const leads = await fetchTikTokLeads(
      accessToken,
      setting.advertiser_id,
      setting.form_id,
      startIso,
    );
    log.leads_fetched = leads.length;

    for (const raw of leads) {
      const ttLeadId = String(raw?.lead_id || raw?.id || raw?.leadgen_id || '').trim();
      if (!ttLeadId) continue;

      // Duplicate guard
      const { data: dupe } = await supabase
        .from('tiktok_leads')
        .select('id')
        .eq('workspace_id', setting.workspace_id)
        .eq('tiktok_lead_id', ttLeadId)
        .maybeSingle();
      if (dupe) continue;

      const fields = raw?.field_data ?? raw?.fields ?? raw?.lead_info ?? raw;
      const name = pickField(fields, ['full_name', 'name', 'first_name']);
      const phoneRaw = pickField(fields, ['phone', 'mobile', 'whatsapp']);
      const email = pickField(fields, ['email']);
      const phone = normalizePhone(phoneRaw);

      const contactId = await upsertContact(
        supabase,
        setting.workspace_id,
        name,
        phone,
        setting.tags ?? [],
        setting.assigned_user_id,
      );

      let messageStatus = 'skipped';
      let messageId: string | null = null;
      let messageError: string | null = null;

      if (
        setting.auto_reply_enabled &&
        setting.whatsapp_template_id &&
        phone &&
        setting.whatsapp_phone_number_id
      ) {
        const sendRes = await sendWhatsAppTemplate(
          supabase,
          setting.workspace_id,
          setting.whatsapp_phone_number_id,
          setting.whatsapp_template_id,
          phone,
          name,
        );
        if (sendRes.ok) {
          messageStatus = 'sent';
          messageId = sendRes.messageId ?? null;
          log.messages_sent += 1;
        } else {
          messageStatus = 'failed';
          messageError = sendRes.error ?? 'unknown';
        }
      } else if (!phone) {
        messageStatus = 'no_phone';
      }

      const { error: insErr } = await supabase.from('tiktok_leads').insert({
        workspace_id: setting.workspace_id,
        tiktok_connection_id: setting.tiktok_connection_id,
        sync_setting_id: setting.id,
        tiktok_lead_id: ttLeadId,
        advertiser_id: setting.advertiser_id,
        form_id: setting.form_id,
        form_name: setting.form_name,
        campaign_name: raw?.campaign_name ?? null,
        ad_name: raw?.ad_name ?? null,
        name,
        phone,
        email,
        raw_payload: raw,
        crm_contact_id: contactId,
        whatsapp_message_id: messageId,
        message_status: messageError ? `failed:${messageError}`.slice(0, 100) : messageStatus,
      });
      if (!insErr) log.leads_created += 1;
    }

    await supabase
      .from('tiktok_lead_sync_settings')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_error: null,
      })
      .eq('id', setting.id);

    log.message = `Synced ${log.leads_created}/${log.leads_fetched} leads, sent ${log.messages_sent} messages`;
  } catch (e: any) {
    log.status = 'error';
    log.message = e?.message || 'Sync failed';
    log.error_details = { error: String(e?.stack || e) };
    await supabase
      .from('tiktok_lead_sync_settings')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_sync_error: log.message,
      })
      .eq('id', setting.id);
  }

  await supabase.from('tiktok_sync_logs').insert(log);
  return log;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const body = await req.json().catch(() => ({}));
    const targetWorkspace = body?.workspace_id as string | undefined;
    const targetSetting = body?.sync_setting_id as string | undefined;

    let q = supabase
      .from('tiktok_lead_sync_settings')
      .select('*')
      .eq('sync_enabled', true);
    if (targetWorkspace) q = q.eq('workspace_id', targetWorkspace);
    if (targetSetting) q = q.eq('id', targetSetting);

    const { data: settings, error } = await q;
    if (error) throw error;

    const results: any[] = [];
    for (const s of (settings as SyncSetting[]) ?? []) {
      results.push(await processSetting(supabase, s));
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
