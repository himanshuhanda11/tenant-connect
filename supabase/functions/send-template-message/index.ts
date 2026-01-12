import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: number;
  parameters?: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    text?: string;
    currency?: { fallback_value: string; code: string; amount_1000: number };
    date_time?: { fallback_value: string };
    image?: { link: string };
    document?: { link: string; filename?: string };
    video?: { link: string };
  }>;
}

interface SendTemplateRequest {
  tenant_id: string;
  phone_number_id: string; // Our internal phone_numbers.id
  to_wa_id: string; // Recipient WhatsApp ID (phone number)
  template_name: string;
  template_language?: string;
  components?: TemplateComponent[];
  contact_name?: string; // Optional name for new contacts
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
    // Verify authentication
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
    
    // Use anon key for user auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    // Use service role for database operations (bypass RLS for server-side inserts)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SendTemplateRequest = await req.json();
    const { 
      tenant_id, 
      phone_number_id, 
      to_wa_id, 
      template_name,
      template_language = 'en',
      components = [],
      contact_name 
    } = body;

    // Validate required fields
    if (!tenant_id || !phone_number_id || !to_wa_id || !template_name) {
      return new Response(JSON.stringify({ 
        error: 'tenant_id, phone_number_id, to_wa_id, and template_name are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing send-template-message:', { tenant_id, phone_number_id, to_wa_id, template_name });

    // 1. Verify user belongs to tenant
    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('id, role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !membership) {
      console.error('Membership check failed:', memberError);
      return new Response(JSON.stringify({ error: 'Access denied - not a tenant member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Verify phone number belongs to tenant and get WABA details
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select(`
        id,
        phone_number_id,
        tenant_id,
        waba_account_id
      `)
      .eq('id', phone_number_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (phoneError || !phoneNumber) {
      console.error('Phone number not found:', phoneError);
      return new Response(JSON.stringify({ error: 'Phone number not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get WABA account separately
    const { data: wabaAccount, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('id, encrypted_access_token, status')
      .eq('id', phoneNumber.waba_account_id)
      .single();

    if (wabaError || !wabaAccount) {
      console.error('WABA account not found:', wabaError);
      return new Response(JSON.stringify({ error: 'WABA account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!wabaAccount.encrypted_access_token) {
      return new Response(JSON.stringify({ error: 'WhatsApp access token not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (wabaAccount.status !== 'active') {
      return new Response(JSON.stringify({ error: 'WABA account is not active' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Verify template exists and is approved (optional, for better error messages)
    const { data: template } = await supabase
      .from('templates')
      .select('id, name, status')
      .eq('tenant_id', tenant_id)
      .eq('name', template_name)
      .maybeSingle();

    if (template && template.status !== 'APPROVED') {
      console.warn(`Template ${template_name} status is ${template.status}`);
      // Don't block - Meta might have approved it but we haven't synced yet
    }

    // 4. Upsert contact by tenant_id + wa_id
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('tenant_id', tenant_id)
      .eq('wa_id', to_wa_id)
      .maybeSingle();

    let contactId: string;
    if (existingContact) {
      contactId = existingContact.id;
      // Update name if provided and contact has no name
      if (contact_name && !existingContact.name) {
        await supabase
          .from('contacts')
          .update({ name: contact_name, updated_at: new Date().toISOString() })
          .eq('id', contactId);
      }
    } else {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          tenant_id,
          wa_id: to_wa_id,
          name: contact_name || null,
        })
        .select()
        .single();

      if (contactError) {
        console.error('Failed to create contact:', contactError);
        return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      contactId = newContact.id;
    }

    // 5. Upsert conversation by tenant_id + phone_id + contact_id
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('phone_number_id', phone_number_id)
      .eq('contact_id', contactId)
      .maybeSingle();

    let conversationId: string;
    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          tenant_id,
          phone_number_id: phone_number_id,
          contact_id: contactId,
          status: 'open',
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError) {
        console.error('Failed to create conversation:', convError);
        return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      conversationId = newConversation.id;
    }

    // 6. Build WhatsApp template API payload
    const templatePayload: any = {
      name: template_name,
      language: { code: template_language },
    };

    if (components.length > 0) {
      templatePayload.components = components;
    }

    const messagePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to_wa_id,
      type: 'template',
      template: templatePayload,
    };

    // 7. Create pending message in database
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        tenant_id,
        conversation_id: conversationId,
        direction: 'outbound',
        type: 'template',
        text: `Template: ${template_name}`,
        metadata: {
          template_name,
          template_language,
          components,
        },
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

    // 8. Call Meta Cloud API
    try {
      console.log('Sending template to WhatsApp API:', phoneNumber.phone_number_id);
      const waResponse = await fetch(
        `${WHATSAPP_API_BASE}/${phoneNumber.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${wabaAccount.encrypted_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        }
      );

      const waResult = await waResponse.json();
      console.log('WhatsApp API response:', JSON.stringify(waResult));

      if (!waResponse.ok) {
        // Update message as failed
        await supabase
          .from('messages')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_code: waResult.error?.code?.toString(),
            error_message: waResult.error?.message,
          })
          .eq('id', message.id);

        return new Response(JSON.stringify({
          ok: false,
          message_id: message.id,
          error: waResult.error?.message || 'Failed to send template',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 9. Update message with wamid + status=sent + sent_at
      const wamid = waResult.messages?.[0]?.id;
      await supabase
        .from('messages')
        .update({
          wamid,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          status: 'open'
        })
        .eq('id', conversationId);

      // Increment usage counter
      try {
        await supabase.rpc('increment_usage', {
          p_tenant_id: tenant_id,
          p_counter: 'messages_sent',
          p_amount: 1
        });
      } catch (e) {
        console.error('Failed to increment usage:', e);
      }

      return new Response(JSON.stringify({
        ok: true,
        wamid,
        message_id: message.id,
        conversation_id: conversationId,
        contact_id: contactId,
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
          failed_at: new Date().toISOString(),
          error_message: 'Failed to connect to WhatsApp API',
        })
        .eq('id', message.id);

      return new Response(JSON.stringify({
        ok: false,
        message_id: message.id,
        error: 'Failed to connect to WhatsApp API',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Error in send-template-message:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
