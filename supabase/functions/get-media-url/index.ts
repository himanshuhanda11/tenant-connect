import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WHATSAPP_API_BASE = 'https://graph.facebook.com/v21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { bucket, path, message_id } = await req.json();
    if ((!bucket || !path) && !message_id) {
      return new Response(JSON.stringify({ error: 'bucket/path or message_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message_id) {
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('id, tenant_id, conversation_id, type, media_url, media_mime_type, media_bucket, media_path')
        .eq('id', message_id)
        .maybeSingle();

      if (messageError || !message) {
        return new Response(JSON.stringify({ error: 'Message not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: membership } = await supabase
        .from('tenant_members')
        .select('id')
        .eq('tenant_id', message.tenant_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (message.media_bucket && message.media_path) {
        const { data, error } = await supabase.storage
          .from(message.media_bucket)
          .createSignedUrl(message.media_path, 3600);
        if (error) throw error;
        return new Response(JSON.stringify({ url: data.signedUrl }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const existingUrl = (message.media_url || '').trim();
      if (/^https?:\/\//i.test(existingUrl)) {
        return new Response(JSON.stringify({ url: existingUrl }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!/^\d+$/.test(existingUrl)) {
        return new Response(JSON.stringify({ error: 'Media source unavailable' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: conversation } = await supabase
        .from('conversations')
        .select('phone_number_id')
        .eq('id', message.conversation_id)
        .eq('tenant_id', message.tenant_id)
        .maybeSingle();

      const { data: phone } = conversation?.phone_number_id
        ? await supabase
          .from('phone_numbers')
          .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
          .eq('id', conversation.phone_number_id)
          .eq('tenant_id', message.tenant_id)
          .maybeSingle()
        : { data: null } as any;

      const wabaAccount = Array.isArray(phone?.waba_account) ? phone.waba_account[0] : phone?.waba_account;
      const accessToken = wabaAccount?.encrypted_access_token;
      if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Media token unavailable' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const metaMediaResp = await fetch(`${WHATSAPP_API_BASE}/${existingUrl}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const metaMedia = await metaMediaResp.json().catch(() => ({}));
      if (!metaMediaResp.ok || !metaMedia?.url) {
        console.error('Failed to resolve WhatsApp media:', metaMediaResp.status, metaMedia);
        return new Response(JSON.stringify({ error: 'Failed to resolve media' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const mediaResp = await fetch(metaMedia.url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!mediaResp.ok) {
        console.error('Failed to download WhatsApp media:', mediaResp.status);
        return new Response(JSON.stringify({ error: 'Failed to download media' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const mediaBuffer = await mediaResp.arrayBuffer();
      const sourceContentType = message.media_mime_type || mediaResp.headers.get('content-type') || metaMedia.mime_type || 'application/octet-stream';
      const contentType = sourceContentType.split(';')[0].trim().toLowerCase() || 'application/octet-stream';
      const ext = (contentType.split('/')[1] || 'bin').split('+')[0].replace(/[^a-z0-9]/gi, '') || 'bin';
      const filePath = `${message.tenant_id}/legacy/${message.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('wa-media')
        .upload(filePath, mediaBuffer, { contentType, upsert: false });
      if (uploadError) throw uploadError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from('wa-media')
        .createSignedUrl(filePath, 3600);
      if (signedError) throw signedError;

      await supabase.from('messages').update({
        media_url: signedData.signedUrl,
        media_bucket: 'wa-media',
        media_path: filePath,
        media_mime_type: contentType,
        media_size_bytes: mediaBuffer.byteLength,
      }).eq('id', message.id);

      return new Response(JSON.stringify({ url: signedData.signedUrl }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user has access to this tenant (path starts with tenant_id)
    const tenantId = path.split('/')[0];
    if (tenantId) {
      const { data: membership } = await supabase
        .from('tenant_members')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate a fresh signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (error) {
      console.error('Signed URL error:', error);
      return new Response(JSON.stringify({ error: 'Failed to generate URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: data.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
