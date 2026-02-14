import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
const RATE_LIMIT_PER_SECOND = 5;
const RATE_LIMIT_PER_MINUTE = 100;

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
  phone_number_id: string;
  to_wa_id: string;
  template_name: string;
  template_language?: string;
  components?: TemplateComponent[];
  contact_name?: string;
  conversation_id?: string;
}

async function checkRateLimit(supabase: any, tenantId: string): Promise<{ allowed: boolean; error?: string }> {
  const now = new Date();
  const oneSecondAgo = new Date(now.getTime() - 1000);
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  const { count: secondCount } = await supabase
    .from('rate_limit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', oneSecondAgo.toISOString());

  if ((secondCount || 0) >= RATE_LIMIT_PER_SECOND) {
    return { allowed: false, error: 'Rate limit exceeded (max 5/second)' };
  }

  const { count: minuteCount } = await supabase
    .from('rate_limit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', oneMinuteAgo.toISOString());

  if ((minuteCount || 0) >= RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, error: 'Rate limit exceeded (max 100/minute)' };
  }

  await supabase.from('rate_limit_logs').insert({ tenant_id: tenantId, action: 'send_template' });
  return { allowed: true };
}

async function checkPlanLimits(supabase: any, tenantId: string): Promise<{ allowed: boolean; error?: string; code?: string }> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .maybeSingle();

  let planLimits: any = null;
  if (subscription?.plan_id) {
    const { data: plan } = await supabase
      .from('plans')
      .select('limits_json')
      .eq('id', subscription.plan_id)
      .single();
    planLimits = plan?.limits_json;
  }

  if (!planLimits) {
    const { data: freePlan } = await supabase
      .from('plans')
      .select('limits_json')
      .eq('name', 'Free')
      .single();
    planLimits = freePlan?.limits_json || { monthly_messages: 1000 };
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supabase
    .from('usage_counters')
    .select('messages_sent')
    .eq('tenant_id', tenantId)
    .eq('year_month', currentMonth)
    .maybeSingle();

  const messagesSent = usage?.messages_sent || 0;
  const monthlyLimit = planLimits.monthly_messages || 1000;

  if (monthlyLimit !== -1 && messagesSent >= monthlyLimit) {
    return { allowed: false, error: 'Monthly message limit exceeded', code: 'LIMIT_EXCEEDED' };
  }

  return { allowed: true };
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

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SendTemplateRequest = await req.json();
    const { tenant_id, phone_number_id, to_wa_id, template_name, template_language = 'en', components = [], contact_name, conversation_id } = body;

    if (!tenant_id || !phone_number_id || !to_wa_id || !template_name) {
      return new Response(JSON.stringify({ error: 'tenant_id, phone_number_id, to_wa_id, and template_name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing send-template-message:', { tenant_id, phone_number_id, to_wa_id, template_name });

    // 1. Verify tenant membership
    const { data: membership, error: memberError } = await supabase
      .from('tenant_members')
      .select('id, role')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Access denied - not a tenant member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Deduct message credit
    const { data: creditDeducted, error: creditError } = await supabase
      .rpc('deduct_message_credit', {
        p_tenant_id: tenant_id,
        p_reference_id: null,
        p_description: `Template: ${template_name} to ${to_wa_id}`,
      });

    if (creditError || creditDeducted === false) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient message credits. Please purchase more credits to send template messages.',
        code: 'NO_CREDITS' 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Check plan limits
    const planCheck = await checkPlanLimits(supabase, tenant_id);
    if (!planCheck.allowed) {
      return new Response(JSON.stringify({ error: planCheck.error, code: planCheck.code }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Check rate limit
    const rateCheck = await checkRateLimit(supabase, tenant_id);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: rateCheck.error, code: 'RATE_LIMIT' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Verify phone number
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('id, phone_number_id, tenant_id, waba_account_id')
      .eq('id', phone_number_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (phoneError || !phoneNumber) {
      return new Response(JSON.stringify({ error: 'Phone number not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Get WABA account
    const { data: wabaAccount, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('id, encrypted_access_token, status')
      .eq('id', phoneNumber.waba_account_id)
      .single();

    if (wabaError || !wabaAccount?.encrypted_access_token || wabaAccount.status !== 'active') {
      return new Response(JSON.stringify({ error: 'WABA account not available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Upsert contact
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('tenant_id', tenant_id)
      .eq('wa_id', to_wa_id)
      .maybeSingle();

    let contactId: string;
    if (existingContact) {
      contactId = existingContact.id;
      if (contact_name && !existingContact.name) {
        await supabase.from('contacts').update({ name: contact_name }).eq('id', contactId);
      }
    } else {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({ tenant_id, wa_id: to_wa_id, name: contact_name || null })
        .select()
        .single();

      if (contactError) {
        return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      contactId = newContact.id;
    }

    // 7. Upsert conversation
    let conversationIdFinal: string;
    if (conversation_id) {
      conversationIdFinal = conversation_id;
    } else {
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('phone_number_id', phone_number_id)
        .eq('contact_id', contactId)
        .maybeSingle();

      if (existingConversation) {
        conversationIdFinal = existingConversation.id;
      } else {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            tenant_id,
            phone_number_id,
            contact_id: contactId,
            status: 'open',
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (convError) {
          return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        conversationIdFinal = newConversation.id;
      }
    }

    // 8. Build template payload (NO 24h window check - templates allowed anytime)
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

    // 9. Create pending message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        tenant_id,
        conversation_id: conversationIdFinal,
        direction: 'outbound',
        type: 'template',
        text: `Template: ${template_name}`,
        metadata: { template_name, template_language, components },
        status: 'pending',
      })
      .select()
      .single();

    if (msgError) {
      return new Response(JSON.stringify({ error: 'Failed to create message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 10. Call Meta Cloud API
    try {
      const waResponse = await fetch(`${WHATSAPP_API_BASE}/${phoneNumber.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wabaAccount.encrypted_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const waResult = await waResponse.json();
      console.log('WhatsApp API response:', JSON.stringify(waResult));

      if (!waResponse.ok) {
        await supabase.from('messages').update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error_code: waResult.error?.code?.toString(),
          error_message: waResult.error?.message,
        }).eq('id', message.id);

        return new Response(JSON.stringify({
          ok: false,
          message_id: message.id,
          error: waResult.error?.message || 'Failed to send template',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 11. Update message
      const wamid = waResult.messages?.[0]?.id;
      await supabase.from('messages').update({
        wamid,
        status: 'sent',
        sent_at: new Date().toISOString(),
      }).eq('id', message.id);

      await supabase.from('conversations').update({
        last_message_at: new Date().toISOString(),
        status: 'open'
      }).eq('id', conversationIdFinal);

      // 12. Increment usage
      await supabase.rpc('increment_usage', {
        p_tenant_id: tenant_id,
        p_counter: 'messages_sent',
        p_amount: 1
      });

      return new Response(JSON.stringify({
        ok: true,
        wamid,
        message_id: message.id,
        conversation_id: conversationIdFinal,
        contact_id: contactId,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError: any) {
      console.error('WhatsApp API error:', apiError);
      
      await supabase.from('messages').update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: 'Failed to connect to WhatsApp API',
      }).eq('id', message.id);

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
