// Campaign worker — invoked by pg_cron every minute. Claims a batch of due
// queued campaign_jobs, sends each via WhatsApp Cloud API, updates progress.
//
// Auth: shared secret via `x-worker-secret` header (PLATFORM_WEBHOOK_SECRET).
// Marked verify_jwt = false so cron can call without a user JWT.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-worker-secret',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
const BATCH_SIZE = 50;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supa = createClient(url, serviceKey);

  // Auth: shared secret stored in app_secrets
  const provided = req.headers.get('x-worker-secret');
  const { data: secretVal } = await supa.rpc('get_app_secret', { p_key: 'campaign_worker_secret' });
  if (!secretVal || provided !== secretVal) {
    return j({ error: 'forbidden' }, 403);
  }

  try {
    // 1. Activate scheduled campaigns whose time has come
    await supa
      .from('campaigns')
      .update({ status: 'running', started_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString());

    // 2. Claim a batch of due queued jobs across tenants
    const { data: jobs, error: claimErr } = await supa.rpc('lock_campaign_jobs', {
      p_limit: BATCH_SIZE,
      p_locked_by: `worker-${crypto.randomUUID().slice(0, 8)}`,
    });
    if (claimErr) {
      console.error('claim error', claimErr);
      return j({ error: 'claim_failed', detail: claimErr.message }, 500);
    }
    if (!jobs || jobs.length === 0) {
      return j({ ok: true, processed: 0 });
    }

    // 3. Cache phone_number + waba per phone_number_id
    const phoneIds = Array.from(new Set(jobs.map((j: any) => j.phone_number_id)));
    const { data: phoneRows } = await supa
      .from('phone_numbers')
      .select('id, phone_number_id, tenant_id, waba_account_id')
      .in('id', phoneIds);
    const wabaIds = Array.from(new Set((phoneRows || []).map((p: any) => p.waba_account_id).filter(Boolean)));
    const { data: wabaRows } = await supa
      .from('waba_accounts')
      .select('id, encrypted_access_token, status')
      .in('id', wabaIds);

    const phoneMap = new Map((phoneRows || []).map((p: any) => [p.id, p]));
    const wabaMap = new Map((wabaRows || []).map((w: any) => [w.id, w]));

    const campaignsTouched = new Set<string>();
    let okCount = 0;
    let failCount = 0;

    // 4. Send each job
    for (const job of jobs as any[]) {
      campaignsTouched.add(job.campaign_id);
      const phone = phoneMap.get(job.phone_number_id);
      const waba = phone ? wabaMap.get(phone.waba_account_id) : null;
      if (!phone || !waba?.encrypted_access_token || waba.status !== 'active') {
        await supa.rpc('complete_campaign_job', {
          p_job_id: job.id,
          p_status: 'failed',
          p_error_code: 'NO_WABA',
          p_error_message: 'WABA account not available',
        });
        failCount++;
        continue;
      }

      // Build template payload
      const templateVars = (job.template_variables || {}) as Record<string, string>;
      const bodyParams = Object.keys(templateVars)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => ({ type: 'text', text: String(templateVars[k]) }));
      const components: any[] = [];
      if (bodyParams.length > 0) components.push({ type: 'body', parameters: bodyParams });
      if (job.header_media_url) {
        components.unshift({ type: 'header', parameters: [{ type: 'image', image: { link: job.header_media_url } }] });
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: job.recipient_phone,
        type: 'template',
        template: {
          name: job.template_name,
          language: { code: job.template_language || 'en' },
          ...(components.length > 0 ? { components } : {}),
        },
      };

      try {
        const res = await fetch(`${WHATSAPP_API_BASE}/${phone.phone_number_id}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${waba.encrypted_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
          await supa.rpc('complete_campaign_job', {
            p_job_id: job.id,
            p_status: 'failed',
            p_error_code: result?.error?.code?.toString() || String(res.status),
            p_error_message: result?.error?.message || 'WhatsApp API error',
          });
          failCount++;
        } else {
          const wamid = result?.messages?.[0]?.id || null;
          await supa.rpc('complete_campaign_job', {
            p_job_id: job.id,
            p_status: 'sent',
            p_wamid: wamid,
          });
          // Track campaign source on contact (best-effort, non-blocking)
          await supa
            .from('contacts')
            .update({ campaign_source: job.campaign_id })
            .eq('id', job.contact_id)
            .is('campaign_source', null);
          okCount++;
        }
      } catch (e: any) {
        console.error('send failed', e);
        await supa.rpc('complete_campaign_job', {
          p_job_id: job.id,
          p_status: 'failed',
          p_error_code: 'NETWORK',
          p_error_message: e?.message || 'Network error',
        });
        failCount++;
      }
    }

    // 5. Flip campaign status as needed
    for (const cid of campaignsTouched) {
      await supa.rpc('mark_campaign_running', { p_campaign_id: cid });
      await supa.rpc('mark_campaign_completed_if_done', { p_campaign_id: cid });
    }

    return j({ ok: true, processed: jobs.length, sent: okCount, failed: failCount });
  } catch (e: any) {
    console.error('worker fatal', e);
    return j({ error: e.message || 'worker_failed' }, 500);
  }
});

function j(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
