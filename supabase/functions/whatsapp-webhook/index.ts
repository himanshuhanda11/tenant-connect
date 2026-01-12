import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook verification token (should match what you set in Meta's dashboard)
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'whatsapp-isv-verify-token';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('Webhook verification request:', { mode, token, challenge });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    console.log('Webhook verification failed');
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  // Process webhook payload (POST request from Meta)
  if (req.method === 'POST') {
    try {
      const payload = await req.json();
      console.log('Received webhook payload:', JSON.stringify(payload).substring(0, 500));

      // Respond immediately with 200 to acknowledge receipt
      // Process the webhook asynchronously
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Store raw webhook event for later processing
      const eventType = extractEventType(payload);
      
      const { error: insertError } = await supabase
        .from('webhook_events')
        .insert({
          event_type: eventType,
          payload: payload,
          processed: false,
        });

      if (insertError) {
        console.error('Failed to store webhook event:', insertError);
      } else {
        console.log('Webhook event stored for processing');
      }

      // Process the webhook in the background
      // Use globalThis to access EdgeRuntime
      (globalThis as any).EdgeRuntime?.waitUntil?.(processWebhook(supabase, payload)) 
        || processWebhook(supabase, payload);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Still return 200 to prevent Meta from retrying
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});

function extractEventType(payload: any): string {
  try {
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) return 'message';
    if (value?.statuses) return 'status';
    if (value?.contacts) return 'contact';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function processWebhook(supabase: any, payload: any) {
  try {
    const entry = payload?.entry?.[0];
    if (!entry) return;

    const changes = entry.changes?.[0];
    if (!changes) return;

    const value = changes.value;
    const wabaId = entry.id; // WABA ID from the webhook

    // Find the tenant by WABA ID
    const { data: wabaAccount, error: wabaError } = await supabase
      .from('waba_accounts')
      .select('id, tenant_id')
      .eq('waba_id', wabaId)
      .maybeSingle();

    if (wabaError || !wabaAccount) {
      console.log('WABA account not found for:', wabaId);
      return;
    }

    const tenantId = wabaAccount.tenant_id;
    const phoneNumberId = value?.metadata?.phone_number_id;

    // Find the phone number
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone_number_id', phoneNumberId)
      .maybeSingle();

    if (phoneError || !phoneNumber) {
      console.log('Phone number not found:', phoneNumberId);
      return;
    }

    // Process messages
    if (value?.messages) {
      for (const msg of value.messages) {
        await processInboundMessage(supabase, tenantId, phoneNumber.id, msg, value.contacts?.[0]);
      }
    }

    // Process status updates
    if (value?.statuses) {
      for (const status of value.statuses) {
        await processStatusUpdate(supabase, status);
      }
    }
  } catch (error) {
    console.error('Error in background webhook processing:', error);
  }
}

async function processInboundMessage(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  message: any,
  contactInfo: any
) {
  try {
    const waId = message.from;
    const contactName = contactInfo?.profile?.name || waId;

    // Upsert contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert(
        {
          tenant_id: tenantId,
          wa_id: waId,
          name: contactName,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,wa_id' }
      )
      .select()
      .single();

    if (contactError) {
      console.error('Error upserting contact:', contactError);
      return;
    }

    // Upsert conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .upsert(
        {
          tenant_id: tenantId,
          phone_number_id: phoneNumberId,
          contact_id: contact.id,
          status: 'open',
          last_message_at: new Date().toISOString(),
        },
        { onConflict: 'phone_number_id,contact_id' }
      )
      .select()
      .single();

    if (convError) {
      console.error('Error upserting conversation:', convError);
      return;
    }

    // Increment unread count
    await supabase
      .from('conversations')
      .update({ 
        unread_count: conversation.unread_count + 1,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    // Extract message content
    const messageType = message.type || 'unknown';
    let text = '';
    let mediaUrl = '';
    let mediaMimeType = '';

    switch (messageType) {
      case 'text':
        text = message.text?.body || '';
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
      case 'sticker':
        mediaUrl = message[messageType]?.id || '';
        mediaMimeType = message[messageType]?.mime_type || '';
        text = message[messageType]?.caption || '';
        break;
      case 'location':
        text = `Location: ${message.location?.latitude}, ${message.location?.longitude}`;
        break;
      case 'reaction':
        text = message.reaction?.emoji || '';
        break;
    }

    // Insert message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: conversation.id,
        wamid: message.id,
        direction: 'inbound',
        type: messageType,
        text,
        media_url: mediaUrl || null,
        media_mime_type: mediaMimeType || null,
        status: 'delivered',
        metadata: message,
      });

    if (msgError) {
      console.error('Error inserting message:', msgError);
    } else {
      console.log('Inbound message processed:', message.id);
    }
  } catch (error) {
    console.error('Error processing inbound message:', error);
  }
}

async function processStatusUpdate(supabase: any, status: any) {
  try {
    const wamid = status.id;
    const newStatus = mapStatus(status.status);

    const { error } = await supabase
      .from('messages')
      .update({ status: newStatus })
      .eq('wamid', wamid);

    if (error) {
      console.error('Error updating message status:', error);
    } else {
      console.log('Message status updated:', wamid, newStatus);
    }
  } catch (error) {
    console.error('Error processing status update:', error);
  }
}

function mapStatus(metaStatus: string): string {
  switch (metaStatus) {
    case 'sent': return 'sent';
    case 'delivered': return 'delivered';
    case 'read': return 'read';
    case 'failed': return 'failed';
    default: return 'pending';
  }
}
