import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const normalizeText = (v: unknown) => String(v ?? '').trim();

// Map a Meta API error to (code, friendly message). Returns null when the
// response is not a recognizable Meta error.
function classifyMetaError(data: any, isCoexistence: boolean): {
  code: string;
  message: string;
  http: number;
} | null {
  const err = data?.error;
  if (!err) return null;
  const metaCode = Number(err.code);
  const metaSub = Number(err.error_subcode);
  const msg = String(err.message || '');

  if (metaCode === 190 || /token.*expired|invalid.*token|session has expired/i.test(msg)) {
    return {
      code: 'token_expired',
      message: 'WhatsApp access token has expired. Please reconnect this number from WhatsApp setup.',
      http: 401,
    };
  }
  if (metaCode === 4 || metaSub === 2207051 || /rate limit|too many calls/i.test(msg)) {
    return {
      code: 'rate_limited',
      message: 'Meta rate limit reached. Please wait a moment and try again.',
      http: 429,
    };
  }
  if (metaCode === 200 || metaCode === 10 || /permission/i.test(msg)) {
    if (isCoexistence) {
      return {
        code: 'coexistence_blocked',
        message:
          'This number is connected with WhatsApp Business App Coexistence. Profile fields for Coexistence numbers must be edited inside the WhatsApp Business App on the device that owns this number.',
        http: 200, // soft fail – UI shows banner, does not break connection
      };
    }
    return {
      code: 'meta_permission_required',
      message: `Meta rejected this update: ${msg}. Reconnect this number from WhatsApp setup with profile management permission, then try again.`,
      http: 200,
    };
  }
  if (metaCode === 100 || /invalid parameter|missing/i.test(msg)) {
    return {
      code: 'invalid_field',
      message: `Meta rejected a field: ${msg}`,
      http: 400,
    };
  }
  return {
    code: 'meta_api_error',
    message: msg || 'Meta API error',
    http: 200,
  };
}

async function logProfileEvent(
  supabase: ReturnType<typeof createClient>,
  row: {
    tenant_id?: string | null;
    phone_number_id?: string | null;
    waba_account_id?: string | null;
    action: string;
    request_payload?: any;
    meta_response?: any;
    status: 'success' | 'failed';
    error_code?: string | null;
    error_message?: string | null;
  },
) {
  try {
    await supabase.from('whatsapp_profile_logs').insert({
      tenant_id: row.tenant_id || null,
      phone_number_id: row.phone_number_id || null,
      waba_account_id: row.waba_account_id || null,
      action: row.action,
      request_payload: row.request_payload ?? null,
      meta_response: row.meta_response ?? null,
      status: row.status,
      error_code: row.error_code || null,
      error_message: row.error_message || null,
    });
  } catch (e) {
    console.warn('Failed to write profile log:', e);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const contentType = req.headers.get('content-type') || '';

    // ---------- Multipart: profile picture upload ----------
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const phone_number_id = formData.get('phone_number_id') as string;
      const waba_account_id = formData.get('waba_account_id') as string;

      if (!file || !phone_number_id || !waba_account_id) {
        return json({ success: false, error: 'file, phone_number_id, and waba_account_id are required' }, 400);
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        return json({ success: false, code: 'invalid_image_format', error: 'Only PNG and JPG images are supported.' }, 400);
      }
      if (file.size > 5 * 1024 * 1024) {
        return json({ success: false, code: 'image_too_large', error: 'Image must be smaller than 5MB.' }, 400);
      }

      const { data: waba } = await supabase
        .from('waba_accounts')
        .select('encrypted_access_token, tenant_id, is_on_biz_app, coexistence_enabled, onboarding_type')
        .eq('id', waba_account_id)
        .single();

      if (!waba?.encrypted_access_token) {
        return json({
          success: false,
          code: 'reconnect_required',
          error: 'WhatsApp connection needs to be re-authorized. Please reconnect this number from WhatsApp setup.',
        }, 200);
      }

      const isCoexistence = !!(waba.is_on_biz_app || waba.coexistence_enabled || waba.onboarding_type === 'business_app_coexistence');
      const accessToken = waba.encrypted_access_token;
      const sysToken = Deno.env.get('META_SYSTEM_USER_TOKEN');
      const fileBytes = await file.arrayBuffer();
      const mimeType = file.type;
      const appId = Deno.env.get('META_APP_ID');
      if (!appId) return json({ success: false, error: 'META_APP_ID not configured' }, 500);

      // Try with primary token first, then fall back to system-user token if available.
      const tokensToTry = sysToken && sysToken !== accessToken ? [accessToken, sysToken] : [accessToken];
      let lastError: any = null;

      for (const tok of tokensToTry) {
        const sessionRes = await fetch(
          `${WHATSAPP_API_BASE}/${appId}/uploads?file_length=${fileBytes.byteLength}&file_type=${encodeURIComponent(mimeType)}&access_token=${tok}`,
          { method: 'POST' },
        );
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.id) {
          lastError = sessionData;
          continue;
        }
        const uploadRes = await fetch(`${WHATSAPP_API_BASE}/${sessionData.id}`, {
          method: 'POST',
          headers: { Authorization: `OAuth ${tok}`, file_offset: '0', 'Content-Type': mimeType },
          body: new Uint8Array(fileBytes),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.h) {
          lastError = uploadData;
          continue;
        }
        const profileRes = await fetch(
          `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messaging_product: 'whatsapp', profile_picture_handle: uploadData.h }),
          },
        );
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          await logProfileEvent(supabase, {
            tenant_id: waba.tenant_id, phone_number_id, waba_account_id,
            action: 'upload_profile_picture',
            request_payload: { mimeType, size: fileBytes.byteLength },
            meta_response: profileData, status: 'success',
          });
          return json({ success: true, message: 'Profile picture updated successfully' });
        }
        lastError = profileData;
      }

      const cls = classifyMetaError(lastError, isCoexistence) ?? {
        code: 'upload_failed', message: lastError?.error?.message || 'Failed to upload profile picture', http: 400,
      };
      await logProfileEvent(supabase, {
        tenant_id: waba.tenant_id, phone_number_id, waba_account_id,
        action: 'upload_profile_picture',
        request_payload: { mimeType, size: fileBytes.byteLength },
        meta_response: lastError, status: 'failed',
        error_code: cls.code, error_message: cls.message,
      });
      return json({ success: false, code: cls.code, error: cls.message, coexistence: isCoexistence, details: lastError?.error?.message }, cls.http);
    }

    // ---------- JSON requests (get/update/ice_breakers) ----------
    const body = await req.json();
    const { action, phone_number_id, waba_account_id, profile_data } = body;
    console.log('WhatsApp Profile action:', { action, phone_number_id, waba_account_id });

    if (!phone_number_id || !waba_account_id) {
      return json({ success: false, error: 'phone_number_id and waba_account_id are required' }, 400);
    }

    const { data: waba, error: wabaErr } = await supabase
      .from('waba_accounts')
      .select('encrypted_access_token, tenant_id, is_on_biz_app, coexistence_enabled, onboarding_type, status')
      .eq('id', waba_account_id)
      .single();

    if (wabaErr || !waba?.encrypted_access_token) {
      return json({
        success: false,
        code: 'reconnect_required',
        error: 'WhatsApp connection needs to be re-authorized. Please reconnect this number from WhatsApp setup.',
        details: wabaErr?.message,
      }, 200);
    }

    const isCoexistence = !!(waba.is_on_biz_app || waba.coexistence_enabled || waba.onboarding_type === 'business_app_coexistence');
    const accessToken = waba.encrypted_access_token;
    const sysToken = Deno.env.get('META_SYSTEM_USER_TOKEN');
    const tokensToTry = sysToken && sysToken !== accessToken ? [accessToken, sysToken] : [accessToken];

    if (action === 'get') {
      let lastErr: any = null;
      for (const tok of tokensToTry) {
        const r = await fetch(
          `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`,
          { headers: { Authorization: `Bearer ${tok}` } },
        );
        const d = await r.json();
        if (r.ok) {
          await logProfileEvent(supabase, {
            tenant_id: waba.tenant_id, phone_number_id, waba_account_id,
            action: 'fetch_profile', meta_response: d, status: 'success',
          });
          return json({ success: true, profile: d.data?.[0] || {}, coexistence: isCoexistence });
        }
        lastErr = d;
      }
      const cls = classifyMetaError(lastErr, isCoexistence) ?? {
        code: 'fetch_failed', message: 'Failed to fetch profile', http: 200,
      };
      await logProfileEvent(supabase, {
        tenant_id: waba.tenant_id, phone_number_id, waba_account_id,
        action: 'fetch_profile', meta_response: lastErr, status: 'failed',
        error_code: cls.code, error_message: cls.message,
      });
      return json({ success: false, code: cls.code, error: cls.message, coexistence: isCoexistence, details: lastErr?.error?.message }, cls.http);
    }

    if (action === 'update') {
      if (!profile_data) return json({ success: false, error: 'profile_data is required' }, 400);

      const payload: Record<string, any> = { messaging_product: 'whatsapp' };
      if (profile_data.about !== undefined) payload.about = normalizeText(profile_data.about);
      if (profile_data.address !== undefined) payload.address = normalizeText(profile_data.address);
      if (profile_data.description !== undefined) payload.description = normalizeText(profile_data.description);
      if (profile_data.email !== undefined) payload.email = normalizeText(profile_data.email);
      if (profile_data.websites && profile_data.websites.length > 0) {
        payload.websites = profile_data.websites.filter((w: string) => w.trim());
      }
      if (profile_data.vertical !== undefined) payload.vertical = normalizeText(profile_data.vertical);

      console.log('Profile UPDATE payload:', JSON.stringify(payload));

      let lastErr: any = null;
      for (const tok of tokensToTry) {
        const r = await fetch(
          `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        const d = await r.json();
        console.log('Profile UPDATE response:', JSON.stringify(d));
        if (r.ok) {
          await logProfileEvent(supabase, {
            tenant_id: waba.tenant_id, phone_number_id, waba_account_id,
            action: 'update_profile', request_payload: payload,
            meta_response: d, status: 'success',
          });
          return json({ success: true, message: 'Profile updated successfully', coexistence: isCoexistence });
        }
        lastErr = d;
      }

      const cls = classifyMetaError(lastErr, isCoexistence) ?? {
        code: 'update_failed', message: 'Failed to update profile', http: 200,
      };
      await logProfileEvent(supabase, {
        tenant_id: waba.tenant_id, phone_number_id, waba_account_id,
        action: 'update_profile', request_payload: payload,
        meta_response: lastErr, status: 'failed',
        error_code: cls.code, error_message: cls.message,
      });
      return json({
        success: false,
        code: cls.code,
        error: cls.message,
        coexistence: isCoexistence,
        details: lastErr?.error?.message,
      }, cls.http);
    }

    if (action === 'get_ice_breakers') {
      const r = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile?fields=ice_breakers`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const d = await r.json();
      if (!r.ok) return json({ success: false, error: 'Failed to fetch ice breakers', details: d.error?.message }, r.status);
      return json({ success: true, ice_breakers: d.data?.[0]?.ice_breakers || [] });
    }

    if (action === 'set_ice_breakers') {
      const { ice_breakers } = body;
      if (!Array.isArray(ice_breakers)) return json({ success: false, error: 'ice_breakers array is required' }, 400);
      if (ice_breakers.length > 4) return json({ success: false, error: 'Maximum 4 ice breakers allowed' }, 400);
      const simplePayload = {
        messaging_product: 'whatsapp',
        ice_breakers: ice_breakers.map((ib: { title: string }) => ib.title),
      };
      const r = await fetch(
        `${WHATSAPP_API_BASE}/${phone_number_id}/whatsapp_business_profile`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(simplePayload),
        },
      );
      const d = await r.json();
      if (!r.ok) return json({ success: false, error: 'Failed to set ice breakers', details: d.error?.message }, r.status);
      return json({ success: true, message: 'Ice breakers updated on Meta successfully' });
    }

    return json({ success: false, error: 'Invalid action' }, 400);
  } catch (error: any) {
    console.error('Error in whatsapp-profile:', error);
    return json({ success: false, error: error.message || 'Internal server error' }, 500);
  }
});
