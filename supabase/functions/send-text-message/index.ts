import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface SendMessageRequest {
  tenant_id: string;
  phone_number_id: string;
  to_wa_id: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document';
  text?: string;
  media_url?: string;
  contact_name?: string;
  conversation_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body: SendMessageRequest = await req.json();
    const { tenant_id, phone_number_id, to_wa_id, type = 'text', text, media_url, contact_name, conversation_id } = body;

    if (!tenant_id || !phone_number_id || !to_wa_id) {
      return new Response(JSON.stringify({ error: 'tenant_id, phone_number_id, and to_wa_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'text' && !text) {
      return new Response(JSON.stringify({ error: 'text is required for text messages' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (['image', 'video', 'audio', 'document'].includes(type) && !media_url) {
      return new Response(JSON.stringify({ error: `media_url is required for ${type} messages` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing send-text-message:', { tenant_id, phone_number_id, to_wa_id, type });

    // === PARALLEL BATCH 1: All independent lookups ===
    const [membershipRes, phoneRes, contactRes] = await Promise.all([
      // 1. Verify tenant membership
      supabase.from('tenant_members').select('id').eq('tenant_id', tenant_id).eq('user_id', userId).maybeSingle(),
      // 2. Get phone number + WABA in one join
      supabase.from('phone_numbers')
        .select('id, phone_number_id, tenant_id, waba_account_id, status, waba_account:waba_accounts!inner(id, encrypted_access_token, status)')
        .eq('id', phone_number_id)
        .eq('tenant_id', tenant_id)
        .single(),
      // 3. Find existing contact
      supabase.from('contacts').select('id, name').eq('tenant_id', tenant_id).eq('wa_id', to_wa_id).maybeSingle(),
    ]);

    if (!membershipRes.data) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const phoneNumber = phoneRes.data;
    if (!phoneNumber) {
      return new Response(JSON.stringify({ error: 'Phone number not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (phoneNumber.status === 'disconnected') {
      return new Response(JSON.stringify({ error: 'Phone number is disconnected. Please reconnect.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const wabaAccount = (phoneNumber as any).waba_account;
    if (!wabaAccount?.encrypted_access_token || wabaAccount.status !== 'active') {
      return new Response(JSON.stringify({ error: 'WABA account not available' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // === Resolve contact ===
    let contactId: string;
    if (contactRes.data) {
      contactId = contactRes.data.id;
      if (contact_name && !contactRes.data.name) {
        // Fire-and-forget
        supabase.from('contacts').update({ name: contact_name }).eq('id', contactId).then(() => {});
      }
    } else {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({ tenant_id, wa_id: to_wa_id, name: contact_name || null })
        .select('id')
        .single();
      if (contactError) {
        return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      contactId = newContact.id;
    }

    // === Resolve conversation ===
    let conversationIdFinal: string;
    if (conversation_id) {
      conversationIdFinal = conversation_id;
    } else {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('phone_number_id', phone_number_id)
        .eq('contact_id', contactId)
        .maybeSingle();

      if (existingConv) {
        conversationIdFinal = existingConv.id;
      } else {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({ tenant_id, phone_number_id, contact_id: contactId, status: 'open', last_message_at: new Date().toISOString() })
          .select('id')
          .single();
        if (convError) {
          return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        conversationIdFinal = newConv.id;
      }
    }

    // === Build WhatsApp API payload ===
    const messagePayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to_wa_id,
    };

    switch (type) {
      case 'text':
        messagePayload.type = 'text';
        messagePayload.text = { body: text };
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        messagePayload.type = type;
        messagePayload[type] = { link: media_url };
        if (text) messagePayload[type].caption = text;
        break;
    }

    // === PARALLEL: Create pending message + call WhatsApp API simultaneously ===
    const [msgRes, waResponse] = await Promise.all([
      supabase.from('messages').insert({
        tenant_id,
        conversation_id: conversationIdFinal,
        direction: 'outbound',
        type,
        text: text || null,
        media_url: media_url || null,
        status: 'pending',
      }).select('id').single(),
      fetch(`${WHATSAPP_API_BASE}/${phoneNumber.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wabaAccount.encrypted_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      }),
    ]);

    if (msgRes.error) {
      return new Response(JSON.stringify({ error: 'Failed to create message' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const messageId = msgRes.data.id;
    const waResult = await waResponse.json();
    console.log('WhatsApp API response:', JSON.stringify(waResult));

    if (!waResponse.ok) {
      const errorCode = waResult.error?.code;
      const errorMsg = waResult.error?.message || 'Failed to send message';

      // Permission error — do NOT attempt auto-registration (PIN unknown, will always fail if 2-step verification is enabled)
      // The user needs to reconnect their number via the Embedded Signup flow with the correct PIN

      // Mark failed
      let userFacingError = errorMsg;
      let errorCodeStr = errorCode?.toString();
      if (errorCode === 200 && (errorMsg || '').toLowerCase().includes('permission')) {
        // This commonly happens right after a workspace/number is recreated and Meta is still provisioning,
        // or the token scopes/WABA linkage aren't fully ready yet.
        userFacingError = 'Messaging permission is not ready yet for this number. If you just reconnected/recreated the workspace, wait 10–30 minutes and try again. If it still fails, reconnect the number.';
        errorCodeStr = 'MISSING_MESSAGING_PERMISSION';

        // Also reflect a non-ready state on the number to avoid "connected but cannot send".
        supabase
          .from('phone_numbers')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', phone_number_id)
          .then(() => {});
      }

      supabase.from('messages').update({
        status: 'failed', failed_at: new Date().toISOString(),
        error_code: errorCodeStr, error_message: errorMsg,
      }).eq('id', messageId).then(() => {});

      return new Response(JSON.stringify({ ok: false, message_id: messageId, error: userFacingError, code: errorCodeStr }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // === Success: fire-and-forget post-send updates ===
    const wamid = waResult.messages?.[0]?.id;
    const preview = type === 'text' ? (text || '').substring(0, 100) : `📎 ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const now = new Date().toISOString();

    // Don't await these - return response immediately
    Promise.all([
      supabase.from('messages').update({ wamid, status: 'sent', sent_at: now }).eq('id', messageId),
      supabase.from('conversations').update({ last_message_at: now, last_message_preview: preview, last_message_id: messageId, status: 'open' }).eq('id', conversationIdFinal),
      supabase.rpc('increment_usage', { p_tenant_id: tenant_id, p_counter: 'messages_sent', p_amount: 1 }).then(() => {}),
      supabase.from('rate_limit_logs').insert({ tenant_id, action: 'send_message' }).then(() => {}),
    ]).catch(e => console.error('Post-send update error:', e));

    return new Response(JSON.stringify({
      ok: true,
      wamid,
      message_id: messageId,
      conversation_id: conversationIdFinal,
      contact_id: contactId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-text-message:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
