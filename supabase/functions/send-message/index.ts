import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { conversation_id, type = 'text', text, media_url, template_name, template_params } = body;

    if (!conversation_id) {
      return new Response(JSON.stringify({ error: 'conversation_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending message:', { conversation_id, type, text: text?.substring(0, 50) });

    // Get conversation with phone number and contact
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        phone_number:phone_numbers!inner(
          id,
          phone_number_id,
          waba_account:waba_accounts!inner(
            id,
            encrypted_access_token
          )
        ),
        contact:contacts!inner(
          wa_id
        )
      `)
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      console.error('Conversation not found:', convError);
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is a member of the tenant
    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('id')
      .eq('tenant_id', conversation.tenant_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const phoneNumber = conversation.phone_number;
    const contact = conversation.contact;
    const accessToken = phoneNumber.waba_account.encrypted_access_token;

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'WhatsApp access token not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build WhatsApp API payload
    let messagePayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: contact.wa_id,
    };

    switch (type) {
      case 'text':
        if (!text) {
          return new Response(JSON.stringify({ error: 'text is required for text messages' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        messagePayload.type = 'text';
        messagePayload.text = { body: text };
        break;

      case 'template':
        if (!template_name) {
          return new Response(JSON.stringify({ error: 'template_name is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        messagePayload.type = 'template';
        messagePayload.template = {
          name: template_name,
          language: { code: 'en' },
          components: template_params ? [
            {
              type: 'body',
              parameters: Object.values(template_params).map(value => ({
                type: 'text',
                text: value,
              })),
            },
          ] : undefined,
        };
        break;

      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        if (!media_url) {
          return new Response(JSON.stringify({ error: `media_url is required for ${type} messages` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        messagePayload.type = type;
        messagePayload[type] = { link: media_url };
        if (text) {
          messagePayload[type].caption = text;
        }
        break;

      default:
        return new Response(JSON.stringify({ error: `Unsupported message type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Create pending message in database first
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        tenant_id: conversation.tenant_id,
        conversation_id: conversation.id,
        direction: 'outbound',
        type,
        text: text || null,
        media_url: media_url || null,
        status: 'pending',
      })
      .select()
      .single();

    if (msgError) {
      console.error('Failed to create message:', msgError);
      return new Response(JSON.stringify({ error: 'Failed to create message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send to WhatsApp API
    try {
      const waResponse = await fetch(
        `${WHATSAPP_API_BASE}/${phoneNumber.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        }
      );

      const waResult = await waResponse.json();
      console.log('WhatsApp API response:', waResult);

      if (!waResponse.ok) {
        // Update message as failed
        await supabase
          .from('messages')
          .update({
            status: 'failed',
            error_code: waResult.error?.code?.toString(),
            error_message: waResult.error?.message,
          })
          .eq('id', message.id);

        return new Response(JSON.stringify({
          success: false,
          message_id: message.id,
          error: waResult.error?.message || 'Failed to send message',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update message with WAMID and status
      const wamid = waResult.messages?.[0]?.id;
      await supabase
        .from('messages')
        .update({
          wamid,
          status: 'sent',
        })
        .eq('id', message.id);

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      return new Response(JSON.stringify({
        success: true,
        message_id: message.id,
        wamid,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('WhatsApp API error:', apiError);
      
      await supabase
        .from('messages')
        .update({
          status: 'failed',
          error_message: 'Failed to connect to WhatsApp API',
        })
        .eq('id', message.id);

      return new Response(JSON.stringify({
        success: false,
        message_id: message.id,
        error: 'Failed to connect to WhatsApp API',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in send-message:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
