import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = 'v21.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
const RATE_LIMIT_PER_SECOND = 5;
const RATE_LIMIT_PER_MINUTE = 100;

interface SendMessageRequest {
  tenant_id: string;
  phone_number_id: string;
  to_wa_id: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document';
  text?: string;
  media_url?: string;
  contact_name?: string;
  conversation_id?: string; // Optional - if provided, skip contact/conversation lookup
}

async function checkRateLimit(supabase: any, tenantId: string): Promise<{ allowed: boolean; error?: string }> {
  const now = new Date();
  const oneSecondAgo = new Date(now.getTime() - 1000);
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  // Check per-second limit
  const { count: secondCount } = await supabase
    .from('rate_limit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', oneSecondAgo.toISOString());

  if ((secondCount || 0) >= RATE_LIMIT_PER_SECOND) {
    return { allowed: false, error: 'Rate limit exceeded (max 5/second)' };
  }

  // Check per-minute limit
  const { count: minuteCount } = await supabase
    .from('rate_limit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', oneMinuteAgo.toISOString());

  if ((minuteCount || 0) >= RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, error: 'Rate limit exceeded (max 100/minute)' };
  }

  // Log this request for rate limiting
  await supabase.from('rate_limit_logs').insert({ tenant_id: tenantId, action: 'send_message' });

  return { allowed: true };
}

async function checkPlanLimits(supabase: any, tenantId: string): Promise<{ allowed: boolean; error?: string; code?: string }> {
  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan_id')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .maybeSingle();

  // Get plan limits
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
    // Use free plan defaults
    const { data: freePlan } = await supabase
      .from('plans')
      .select('limits_json')
      .eq('name', 'Free')
      .single();
    planLimits = freePlan?.limits_json || { monthly_messages: 1000 };
  }

  // Check monthly message quota
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
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

async function check24HourWindow(supabase: any, conversationId: string): Promise<{ withinWindow: boolean; lastInboundAt?: string }> {
  // Find last inbound message
  const { data: lastInbound } = await supabase
    .from('messages')
    .select('created_at')
    .eq('conversation_id', conversationId)
    .eq('direction', 'inbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastInbound) {
    return { withinWindow: false };
  }

  const lastInboundTime = new Date(lastInbound.created_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastInboundTime.getTime()) / (1000 * 60 * 60);

  return {
    withinWindow: hoursDiff <= 24,
    lastInboundAt: lastInbound.created_at
  };
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
      console.error('Auth failed:', claimsError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const user = { id: claimsData.claims.sub as string, email: claimsData.claims.email as string };

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

    // 2. Check plan limits
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

    // 4. Verify phone number belongs to tenant
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('id, phone_number_id, tenant_id, waba_account_id, status')
      .eq('id', phone_number_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (phoneError || !phoneNumber) {
      return new Response(JSON.stringify({ error: 'Phone number not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (phoneNumber.status === 'disconnected') {
      return new Response(JSON.stringify({ error: 'Phone number is disconnected. Please reconnect to send messages.' }), {
        status: 400,
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

    // 8. Check 24-hour window (only for non-template messages)
    const windowCheck = await check24HourWindow(supabase, conversationIdFinal);
    if (!windowCheck.withinWindow) {
      return new Response(JSON.stringify({
        error: 'Outside 24h window. Use template.',
        code: 'OUTSIDE_24H',
        last_inbound_at: windowCheck.lastInboundAt
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 9. Build WhatsApp API payload
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

    // 10. Create pending message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        tenant_id,
        conversation_id: conversationIdFinal,
        direction: 'outbound',
        type,
        text: text || null,
        media_url: media_url || null,
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

    // 11. Call Meta Cloud API
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
          error: waResult.error?.message || 'Failed to send message',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 12. Update message with wamid + status + sent_at
      const wamid = waResult.messages?.[0]?.id;
      await supabase.from('messages').update({
        wamid,
        status: 'sent',
        sent_at: new Date().toISOString(),
      }).eq('id', message.id);

      // Update conversation
      const preview = type === 'text' ? (text || '').substring(0, 100) : `📎 ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      await supabase.from('conversations').update({
        last_message_at: new Date().toISOString(),
        last_message_preview: preview,
        status: 'open'
      }).eq('id', conversationIdFinal);

      // 13. Increment usage counter
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
    console.error('Error in send-text-message:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
