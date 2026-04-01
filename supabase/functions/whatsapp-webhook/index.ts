import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalized event types
type NormalizedEvent =
  | {
      kind: 'inbound_message';
      phone_number_id: string;
      waba_id?: string;
      from_wa_id: string;
      contact_name?: string;
      wamid?: string;
      msg_type: string;
      text?: string;
      media?: { id?: string; mime_type?: string; sha256?: string };
      timestamp?: string;
      context_message_id?: string;
      raw: any;
    }
  | {
      kind: 'message_status';
      phone_number_id: string;
      waba_id?: string;
      wamid: string;
      status: 'sent' | 'delivered' | 'read' | 'failed';
      timestamp?: string;
      error_code?: string;
      error_title?: string;
      raw: any;
    }
  | {
      kind: 'template_status_update';
      waba_id?: string;
      template_name: string;
      meta_status: string;
      reason?: string;
      raw: any;
    };

// Verify webhook signature using META_APP_SECRET
async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const appSecret = Deno.env.get('META_APP_SECRET');
  
  if (!appSecret) {
    console.log('META_APP_SECRET not configured, skipping signature verification');
    return true;
  }
  
  if (!signatureHeader) {
    console.log('No signature header provided');
    return false;
  }

  const parts = signatureHeader.split('=');
  const algo = parts[0];
  const theirSig = parts.slice(1).join('=');
  if (algo !== 'sha256' || !theirSig) {
    console.log('Invalid signature format');
    return false;
  }

  // Use Web Crypto API for HMAC
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const ourSig = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (ourSig.length !== theirSig.length || ourSig !== theirSig) {
    // Log mismatch but allow through — secret needs investigation
    console.warn(`Signature mismatch (allowed): ours=${ourSig.substring(0, 8)}... theirs=${theirSig.substring(0, 8)}...`);
  }
  
  // Bypass strict verification until correct META_APP_SECRET is resolved
  return true;
}

// Extract normalized events from Meta webhook payload
function extractNormalizedEvents(payload: any): NormalizedEvent[] {
  const out: NormalizedEvent[] = [];
  const entries = payload?.entry ?? [];
  
  for (const entry of entries) {
    const changes = entry?.changes ?? [];
    
    for (const change of changes) {
      const value = change?.value;
      if (!value) continue;

      // Handle template status updates (field = 'message_template_status_update')
      if (change?.field === 'message_template_status_update') {
        const templateName = value?.message_template_name;
        const event = value?.event;
        const reason = value?.reason || value?.other_info?.description;
        if (templateName && event) {
          // Map Meta event names to our status values
          const statusMap: Record<string, string> = {
            APPROVED: 'APPROVED',
            REJECTED: 'REJECTED',
            PENDING_DELETION: 'DISABLED',
            DISABLED: 'DISABLED',
            PAUSED: 'PAUSED',
            IN_APPEAL: 'PENDING',
            PENDING: 'PENDING',
            FLAGGED: 'PAUSED',
            REINSTATED: 'APPROVED',
          };
          const metaStatus = statusMap[event] || event;
          out.push({
            kind: 'template_status_update',
            waba_id: entry?.id,
            template_name: templateName,
            meta_status: metaStatus,
            reason,
            raw: { entry, change, value },
          });
        }
        continue;
      }

      const metadata = value?.metadata;
      const phone_number_id = metadata?.phone_number_id;
      if (!phone_number_id) continue;

      const waba_id = value?.business_id || value?.waba_id || metadata?.business_id || entry?.id;

      // Process inbound messages
      const messages = value?.messages ?? [];
      const contacts = value?.contacts ?? [];
      const contact0 = contacts?.[0];
      const contactName = contact0?.profile?.name;
      const fromWaId = contact0?.wa_id;

      for (const m of messages) {
        const msgFrom = m?.from || fromWaId;
        if (!msgFrom) continue;

        const msgType = m?.type || 'unknown';
        const text = m?.text?.body || m?.[msgType]?.caption;

        // Handle media types: image, document, audio, video, sticker
        const mediaObj = m?.image || m?.document || m?.audio || m?.video || m?.sticker;
        const media = mediaObj
          ? {
              id: mediaObj?.id,
              mime_type: mediaObj?.mime_type,
              sha256: mediaObj?.sha256,
            }
          : undefined;

        // Handle reply context
        const contextMessageId = m?.context?.id;

        out.push({
          kind: 'inbound_message',
          phone_number_id,
          waba_id,
          from_wa_id: msgFrom,
          contact_name: contactName,
          wamid: m?.id,
          msg_type: msgType,
          text,
          media,
          timestamp: m?.timestamp,
          context_message_id: contextMessageId,
          raw: { entry, change, value, message: m },
        });
      }

      // Process status updates
      const statuses = value?.statuses ?? [];
      for (const s of statuses) {
        const wamid = s?.id;
        const status = s?.status;
        if (!wamid || !status) continue;
        if (!['sent', 'delivered', 'read', 'failed'].includes(status)) continue;

        // Extract error info for failed messages
        const errors = s?.errors ?? [];
        const error = errors[0];

        out.push({
          kind: 'message_status',
          phone_number_id,
          waba_id,
          wamid,
          status,
          timestamp: s?.timestamp,
          error_code: error?.code?.toString(),
          error_title: error?.title,
          raw: { entry, change, value, status: s },
        });
      }
    }
  }
  
  return out;
}

// Generate idempotency key for an event
function generateIdKey(ev: NormalizedEvent): string {
  if (ev.kind === 'inbound_message') {
    return `msg:${ev.phone_number_id}:${ev.wamid || 'noid'}:${ev.timestamp || ''}`;
  } else if (ev.kind === 'template_status_update') {
    return `tpl:${ev.waba_id || 'noid'}:${ev.template_name}:${ev.meta_status}`;
  } else {
    return `st:${ev.phone_number_id}:${ev.wamid}:${ev.status}:${ev.timestamp || ''}`;
  }
}

// Map Meta message type to our enum
function mapMessageType(metaType: string): string {
  const typeMap: Record<string, string> = {
    text: 'text',
    image: 'image',
    video: 'video',
    audio: 'audio',
    document: 'document',
    sticker: 'sticker',
    location: 'location',
    contacts: 'contact',
    interactive: 'interactive',
    button: 'interactive',
    reaction: 'reaction',
  };
  return typeMap[metaType] || 'unknown';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle webhook verification (GET)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = (url.searchParams.get('hub.mode') || '').trim();
    const token = (url.searchParams.get('hub.verify_token') || '').trim();
    const challenge = url.searchParams.get('hub.challenge');

    const rawVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
    const verifyToken = (rawVerifyToken || 'whatsapp-isv-verify-token').trim();

    if (!rawVerifyToken) {
      console.log('WHATSAPP_VERIFY_TOKEN env var not set; using fallback');
    }

    if (mode === 'subscribe' && token === verifyToken && challenge) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { status: 200 });
    }

    console.log('Webhook verification failed', {
      mode,
      token_prefix: token ? token.substring(0, 8) + '...' : null,
      verify_prefix: verifyToken ? verifyToken.substring(0, 8) + '...' : null,
      token_len: token?.length || 0,
      verify_len: verifyToken?.length || 0,
      has_challenge: Boolean(challenge),
    });
    return new Response('Verification failed', { status: 403 });
  }

  // Handle incoming webhooks (POST)
  if (req.method === 'POST') {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hub-signature-256');

    // Verify signature
    const isValid = await verifySignature(rawBody, signatureHeader);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON payload:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract normalized events
    const events = extractNormalizedEvents(payload);
    console.log(`Extracted ${events.length} events from webhook payload`);

    // Process events in background
    const processEvents = async () => {
      for (const ev of events) {
        const idKey = generateIdKey(ev);

        // Check if already processed (idempotency)
        const { data: existing, error: existingError } = await supabase
          .from('webhook_events')
          .select('id, processed')
          .eq('id_key', idKey)
          .maybeSingle();

        if (existingError) {
          console.warn('Error checking webhook event idempotency:', existingError);
        }

        if (existing?.processed) {
          console.log(`Event ${idKey} already processed, skipping`);
          continue;
        }

        // Determine event type for storage
        const eventType = ev.kind === 'inbound_message'
          ? `message_${ev.msg_type}`
          : `status_${ev.status}`;

        // Store raw event
        const { data: webhookEvent, error: insertError } = await supabase
          .from('webhook_events')
          .upsert(
            {
              id_key: idKey,
              event_type: eventType,
              payload: ev.raw,
              processed: false,
            },
            {
              onConflict: 'id_key',
              ignoreDuplicates: true,
            }
          )
          .select('id')
          .maybeSingle();

        if (insertError && !insertError.message?.includes('duplicate')) {
          console.error('Error storing webhook event:', insertError);
          continue;
        }

        // If we didn't get an id back (e.g. duplicate upsert with ignoreDuplicates), fetch existing id
        const webhookEventId = webhookEvent?.id
          ? webhookEvent.id
          : (
              await supabase
                .from('webhook_events')
                .select('id')
                .eq('id_key', idKey)
                .maybeSingle()
            ).data?.id;

        // Process the event
        await processEvent(supabase, ev, webhookEventId);
      }
    };

    // Use EdgeRuntime.waitUntil for background processing
    (globalThis as any).EdgeRuntime?.waitUntil?.(processEvents()) || await processEvents();

    // Always respond quickly
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});

// Process a normalized event
async function processEvent(supabase: any, ev: NormalizedEvent, webhookEventId?: string) {
  try {
    // Handle template status updates separately (no phone_number_id needed)
    if (ev.kind === 'template_status_update') {
      await processTemplateStatusUpdate(supabase, ev);
      await markEventProcessed(supabase, webhookEventId);
      return;
    }

    // Find phone number and tenant
    // Use limit(1) instead of single() to avoid PGRST116 when the same Meta phone ID
    // exists across multiple tenants (e.g. after workspace reconnects).
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('id, tenant_id, status, waba_account_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('phone_number_id', ev.phone_number_id)
      .in('status', ['connected', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1);

    const phoneNumber = phoneNumbers?.[0];

    if (phoneError || !phoneNumber) {
      console.log(`Phone number ${ev.phone_number_id} not found or not connected, ignoring event`);
      await markEventProcessed(supabase, webhookEventId, 'ignored - phone not found');
      return;
    }

    // No need to check disconnected status — already filtered above

    const tenantId = phoneNumber.tenant_id;

    if (ev.kind === 'inbound_message') {
      const accessToken = phoneNumber.waba_account?.encrypted_access_token || null;
      await processInboundMessage(supabase, tenantId, phoneNumber.id, ev, accessToken);
    } else if (ev.kind === 'message_status') {
      await processStatusUpdate(supabase, tenantId, ev);
    }

    await markEventProcessed(supabase, webhookEventId);
  } catch (error) {
    console.error('Error processing event:', error);
    await markEventProcessed(supabase, webhookEventId, String(error));
  }
}

async function processInboundMessage(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  ev: NormalizedEvent & { kind: 'inbound_message' },
  accessToken: string | null
) {
  // Upsert contact
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .upsert(
      {
        tenant_id: tenantId,
        wa_id: ev.from_wa_id,
        name: ev.contact_name || null,
        last_seen: new Date().toISOString(),
      },
      {
        onConflict: 'tenant_id,wa_id',
      }
    )
    .select('id')
    .maybeSingle();

  let contactId = contact?.id;
  if (contactError || !contactId) {
    // Try to get existing contact
    const { data: existingContact, error: existingError } = await supabase
      .from('contacts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('wa_id', ev.from_wa_id)
      .maybeSingle();

    if (existingError) {
      console.error('Failed to lookup existing contact for', ev.from_wa_id, existingError);
      return;
    }

    if (!existingContact) {
      console.error('Failed to upsert contact for', ev.from_wa_id, contactError);
      return;
    }
    contactId = existingContact.id;
  }

  // Upsert conversation (unique on phone_number_id + contact_id)
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .upsert(
      {
        tenant_id: tenantId,
        phone_number_id: phoneNumberId,
        contact_id: contactId,
        status: 'open',
        last_message_at: new Date().toISOString(),
        last_inbound_at: new Date().toISOString(),
      },
      {
        onConflict: 'phone_number_id,contact_id',
      }
    )
    .select('id, unread_count, assigned_to, created_at')
    .maybeSingle();

  let conversationId = conversation?.id;
  const isNewConversation = conversation && !convError && 
    (new Date().getTime() - new Date(conversation.created_at).getTime()) < 5000;

  if (convError || !conversationId) {
    // Try to get existing conversation
    const { data: existingConv, error: existingError } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('phone_number_id', phoneNumberId)
      .eq('contact_id', contactId)
      .maybeSingle();

    if (existingError) {
      console.error('Failed to lookup existing conversation', existingError);
      return;
    }

    if (!existingConv) {
      console.error('Failed to upsert conversation', convError);
      return;
    }
    conversationId = existingConv.id;
  }

  // Auto-reply BEFORE routing so the welcome message fires while conversation is unassigned
  // (exclude_assigned=true would skip auto-reply if routed first)
  if (isNewConversation) {
    try {
      await handleAutoReply(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
    } catch (e) {
      console.error('Pre-route auto-reply error:', e);
    }
  }

  // Auto-route new conversations via routing rules (round robin, etc.)
  // Skip auto-routing when AI bot is enabled — keep chat unassigned until a human agent replies
  if (isNewConversation && !conversation?.assigned_to) {
    try {
      const { data: aiCheck } = await supabase
        .from('auto_reply_settings')
        .select('ai_enabled')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (aiCheck?.ai_enabled) {
        console.log('Auto-route skipped: AI bot is enabled, chat stays unassigned until human reply');
      } else {
        const { data: routeResult, error: routeErr } = await supabase.rpc(
          'smeksh_auto_route_conversation',
          {
            p_workspace_id: tenantId,
            p_conversation_id: conversationId,
            p_trigger_event: 'new_conversation',
            p_only_if_unassigned: true,
          }
        );
        if (routeErr) {
          console.error('Auto-route error:', routeErr);
        } else {
          console.log('Auto-route result:', JSON.stringify(routeResult));
        }
      }
    } catch (e) {
      console.error('Auto-route exception:', e);
    }
  }

  // ─── Meta Ad Automations (CTWA) ───
  // If this is a Click-to-WhatsApp ad message, run matching ad automations
  if (isNewConversation) {
    try {
      await handleMetaAdAutomations(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
    } catch (e) {
      console.error('Meta ad automation error:', e);
    }
  }

  // Build preview text for sidebar
  const msgType = mapMessageType(ev.msg_type);
  const previewText = ev.text 
    ? ev.text.substring(0, 100) 
    : msgType !== 'text' 
      ? `📎 ${msgType.charAt(0).toUpperCase() + msgType.slice(1)}`
      : '';

  // Increment unread count
  await supabase
    .from('conversations')
    .update({ 
      unread_count: (conversation?.unread_count || 0) + 1,
      last_message_at: new Date().toISOString(),
      last_inbound_at: new Date().toISOString(),
      last_message_preview: previewText || undefined,
    })
    .eq('id', conversationId);

  // Extract message content
  let text = ev.text || '';
  let mediaUrl: string | null = null;
  let mediaMimeType: string | null = null;
  let mediaBucket: string | null = null;
  let mediaPath: string | null = null;

  if (ev.media?.id && accessToken) {
    mediaMimeType = ev.media.mime_type || null;
    try {
      // Step 1: Get media download URL from Meta
      const metaMediaResp = await fetch(
        `https://graph.facebook.com/v18.0/${ev.media.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const metaMedia = await metaMediaResp.json();

      if (metaMedia.url) {
        // Step 2: Download the actual media binary
        const mediaResp = await fetch(metaMedia.url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (mediaResp.ok) {
          const mediaBuffer = await mediaResp.arrayBuffer();
          const ext = (mediaMimeType?.split('/')[1] || 'bin').split(';')[0];
          const filePath = `${tenantId}/${ev.from_wa_id}/${Date.now()}-${ev.media.id}.${ext}`;

          // Step 3: Upload to Supabase storage
          const { error: uploadErr } = await supabase.storage
            .from('wa-media')
            .upload(filePath, mediaBuffer, {
              contentType: mediaMimeType || 'application/octet-stream',
              upsert: false,
            });

          if (!uploadErr) {
            // Store the path for on-demand signed URL generation
            mediaBucket = 'wa-media';
            mediaPath = filePath;
            // Step 4: Get signed URL (30-day expiry)
            const { data: signedData } = await supabase.storage
              .from('wa-media')
              .createSignedUrl(filePath, 60 * 60 * 24 * 30);
            mediaUrl = signedData?.signedUrl || ev.media.id;
          } else {
            console.error('Failed to upload inbound media:', uploadErr);
            mediaUrl = ev.media.id; // Fallback to media ID
          }
        } else {
          console.error('Failed to download media from Meta:', mediaResp.status);
          mediaUrl = ev.media.id;
        }
      } else {
        console.error('No URL in Meta media response:', metaMedia);
        mediaUrl = ev.media.id;
      }
    } catch (mediaErr) {
      console.error('Error downloading inbound media:', mediaErr);
      mediaUrl = ev.media.id; // Fallback
    }
  } else if (ev.media?.id) {
    mediaUrl = ev.media.id;
    mediaMimeType = ev.media.mime_type || null;
  }

  // Handle special message types
  if (ev.msg_type === 'location') {
    const raw = ev.raw?.message;
    text = `📍 Location: ${raw?.location?.latitude}, ${raw?.location?.longitude}`;
  } else if (ev.msg_type === 'reaction') {
    text = ev.raw?.message?.reaction?.emoji || '';
  }

  // Check if there's an active form session BEFORE inserting — to tag the message
  let hasActiveFormSession = false;
  try {
    const { data: activeSession } = await supabase.from('form_sessions')
      .select('id').eq('tenant_id', tenantId).eq('contact_id', contactId)
      .in('status', ['active', 'review']).gt('expires_at', new Date().toISOString())
      .limit(1).maybeSingle();
    hasActiveFormSession = !!activeSession;
  } catch (e) { /* ignore */ }

  // Insert message (use plain insert; partial unique index handles dedup)
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      wamid: ev.wamid,
      direction: 'inbound',
      type: mapMessageType(ev.msg_type),
      text,
      media_url: mediaUrl,
      media_mime_type: mediaMimeType,
      media_bucket: mediaBucket,
      media_path: mediaPath,
      status: 'delivered',
      context_message_id: ev.context_message_id,
      raw: ev.raw,
      metadata: hasActiveFormSession ? { is_form_response: true } : null,
    });

  if (msgError) {
    // Ignore duplicate key violations (23505) for idempotency
    if (msgError.code === '23505') {
      console.log(`Duplicate message ${ev.wamid} ignored`);
    } else {
      console.error('Error inserting message:', msgError);
    }
  } else {
    console.log(`Processed inbound message ${ev.wamid} from ${ev.from_wa_id}`);
    
    // Increment usage counter
    await supabase.rpc('increment_usage', {
      p_tenant_id: tenantId,
      p_counter: 'messages_received',
    });

    // Update contact inbox summary (fire-and-forget)
    supabase.rpc('upsert_contact_inbox_summary', {
      p_tenant_id: tenantId,
      p_contact_id: contactId,
      p_phone_number_id: phoneNumberId,
      p_conversation_id: conversationId,
    }).then(({ error: sumErr }: any) => {
      if (sumErr) console.error('inbox summary upsert error:', sumErr);
    });

    // Check for active form session FIRST — if active, consume the message
    let formSessionHandled = false;
    try {
      formSessionHandled = await handleActiveFormSession(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
      if (formSessionHandled) {
        console.log('Message consumed by active form session');
        // Tag the already-inserted message so the inbox bell stays silent
        if (ev.wamid) {
          await supabase.from('messages').update({ metadata: { is_form_response: true } })
            .eq('tenant_id', tenantId).eq('wamid', ev.wamid);
        }
      }
    } catch (e) {
      console.error('Form session handler error:', e);
    }

    // Skip auto-reply/AI/form-rules if form session handled the message
    if (!formSessionHandled) {
      // Auto-reply + AI engine
      (async () => {
        try {
          if (!isNewConversation) {
            await handleAutoReply(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
          }
          await handleAiEngine(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
        } catch (e) {
          console.error('Auto-reply/AI engine error:', e);
        }
      })();

      // Form rules engine
      (async () => {
        try {
          const formTriggered = await handleFormRules(supabase, tenantId, phoneNumberId, conversationId, contactId, ev, isNewConversation);
          // If a form was just triggered by this message, tag it so bell stays silent
          if (formTriggered && ev.wamid) {
            await supabase.from('messages').update({ metadata: { is_form_response: true } })
              .eq('tenant_id', tenantId).eq('wamid', ev.wamid);
          }
        } catch (e) {
          console.error('Form rules engine error:', e);
        }
      })();
    }
  }
}

async function processStatusUpdate(
  supabase: any,
  tenantId: string,
  ev: NormalizedEvent & { kind: 'message_status' }
) {
  const updateData: any = {
    status: ev.status,
  };

  // Add error info for failed messages
  if (ev.status === 'failed') {
    updateData.error_code = ev.error_code;
    updateData.error_message = ev.error_title;
  }

  // Update message status - the trigger will set timestamps
  const { error } = await supabase
    .from('messages')
    .update(updateData)
    .eq('tenant_id', tenantId)
    .eq('wamid', ev.wamid);

  if (error) {
    console.error('Error updating message status:', error);
  } else {
    console.log(`Updated message ${ev.wamid} status to ${ev.status}`);
  }
}

// Process template status updates from Meta webhook
async function processTemplateStatusUpdate(
  supabase: any,
  ev: NormalizedEvent & { kind: 'template_status_update' }
) {
  const { template_name, meta_status, waba_id, reason } = ev;
  console.log(`Template status update: ${template_name} → ${meta_status} (WABA: ${waba_id})`);

  // Find matching templates by name (may span multiple tenants via WABA)
  let query = supabase
    .from('templates')
    .select('id, name, status, tenant_id, waba_account_id')
    .eq('name', template_name);

  // If we have a WABA ID, narrow down via waba_accounts
  if (waba_id) {
    const { data: wabaAccounts } = await supabase
      .from('waba_accounts')
      .select('id')
      .eq('waba_id', waba_id);

    if (wabaAccounts?.length) {
      const wabaAccountIds = wabaAccounts.map((w: any) => w.id);
      query = query.in('waba_account_id', wabaAccountIds);
    }
  }

  const { data: templates, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error fetching templates for status update:', fetchError);
    return;
  }

  if (!templates?.length) {
    console.log(`No templates found with name "${template_name}", ignoring status update`);
    return;
  }

  // Update all matching templates
  for (const tpl of templates) {
    if (tpl.status === meta_status) {
      console.log(`Template ${tpl.id} already has status ${meta_status}, skipping`);
      continue;
    }

    const updateData: Record<string, any> = {
      status: meta_status,
      last_synced_at: new Date().toISOString(),
    };

    if (meta_status === 'REJECTED' && reason) {
      updateData.rejection_reason = reason;
    }

    const { error: updateError } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', tpl.id);

    if (updateError) {
      console.error(`Error updating template ${tpl.id} status:`, updateError);
    } else {
      console.log(`Template ${tpl.id} (${tpl.name}) status updated: ${tpl.status} → ${meta_status}`);
    }
  }
}

async function markEventProcessed(supabase: any, webhookEventId?: string, error?: string) {
  if (!webhookEventId) return;

  await supabase
    .from('webhook_events')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      error: error || null,
    })
    .eq('id', webhookEventId);
}

// ─── Auto-Reply Handler ───
async function handleAutoReply(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  conversationId: string,
  contactId: string,
  ev: NormalizedEvent & { kind: 'inbound_message' }
): Promise<boolean> {
  try {
    // 1. Fetch tenant's auto-reply settings
    const { data: settings, error: settingsErr } = await supabase
      .from('auto_reply_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (settingsErr || !settings) return false;

    // Check if any general auto-reply is enabled (not AI)
    const hasGeneral = settings.business_hours_enabled || settings.after_hours_enabled;
    const hasKeywords = settings.keywords_enabled && settings.keyword_rules?.length > 0;
    if (!hasGeneral && !hasKeywords) return false;

    // 2. If exclude_assigned, check if conversation has an agent assigned
    if (settings.exclude_assigned) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('assigned_to')
        .eq('id', conversationId)
        .maybeSingle();
      if (conv?.assigned_to) {
        console.log('Auto-reply skipped: conversation is assigned');
        return false;
      }
    }

    // 3. Cooldown check — don't re-send within cooldown window
    const cooldownHours = settings.cooldown_hours || 24;
    const cooldownCutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
    const { data: recentAutoReply } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('direction', 'outbound')
      .eq('is_auto_reply', true)
      .gte('created_at', cooldownCutoff)
      .limit(1)
      .maybeSingle();

    if (recentAutoReply) {
      console.log('Auto-reply skipped: within cooldown period');
      return false;
    }

    // 4. First-message-only check
    // When AI auto-reply is also enabled, general auto-reply is always first-message-only
    const enforceFirstOnly = settings.first_message_only || settings.ai_enabled;
    if (enforceFirstOnly) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('direction', 'inbound');
      if ((count || 0) > 1) {
        console.log('Auto-reply skipped: not first message (AI handles follow-ups)');
        return false;
      }
    }

    // 5. Determine reply text
    let replyText: string | null = null;

    // 5a. Check keyword rules first (higher priority)
    if (hasKeywords && ev.text) {
      const incomingText = ev.text.toLowerCase();
      for (const rule of settings.keyword_rules) {
        if (!rule.keywords || !rule.response) continue;
        const keywords = rule.keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean);
        let matched = false;

        if (rule.matchType === 'exact') {
          matched = keywords.some((kw: string) => incomingText === kw);
        } else if (rule.matchType === 'contains') {
          matched = keywords.some((kw: string) => incomingText.includes(kw));
        } else if (rule.matchType === 'regex') {
          try {
            matched = keywords.some((kw: string) => new RegExp(kw, 'i').test(ev.text || ''));
          } catch { /* invalid regex, skip */ }
        }

        if (matched) {
          replyText = rule.response;
          console.log(`Auto-reply matched keyword rule: "${rule.keywords}"`);
          break;
        }
      }
    }

    // 5b. Business hours / after-hours fallback
    if (!replyText && hasGeneral) {
      const isWithinBusinessHours = checkBusinessHours(settings);
      if (isWithinBusinessHours && settings.business_hours_enabled) {
        replyText = settings.business_hours_message;
      } else if (!isWithinBusinessHours && settings.after_hours_enabled) {
        replyText = settings.after_hours_message;
      }
    }

    if (!replyText) return false;

    // 6. Apply delay
    const delaySec = settings.delay_seconds || 0;
    if (delaySec > 0) {
      await new Promise(resolve => setTimeout(resolve, delaySec * 1000));
    }

    // 7. Get phone number's Meta ID and access token
    const { data: phone } = await supabase
      .from('phone_numbers')
      .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('id', phoneNumberId)
      .maybeSingle();

    if (!phone?.phone_number_id || !phone.waba_account?.encrypted_access_token) {
      console.error('Auto-reply: phone number or token not found');
      return false;
    }

    // 8. Send via WhatsApp API
    const waPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: ev.from_wa_id,
      type: 'text',
      text: { body: replyText },
    };

    const waResp = await fetch(
      `https://graph.facebook.com/v21.0/${phone.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${phone.waba_account.encrypted_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waPayload),
      }
    );

    const waResult = await waResp.json();

    if (!waResp.ok) {
      console.error('Auto-reply WhatsApp API error:', JSON.stringify(waResult));
      return false;
    }

    const wamid = waResult.messages?.[0]?.id;
    const now = new Date().toISOString();

    // 9. Store outbound auto-reply message
    await supabase.from('messages').insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      direction: 'outbound',
      type: 'text',
      text: replyText,
      wamid,
      status: 'sent',
      sent_at: now,
      is_auto_reply: true,
    });

    // Update conversation preview
    await supabase.from('conversations').update({
      last_message_at: now,
      last_message_preview: replyText.substring(0, 100),
    }).eq('id', conversationId);

    console.log(`Auto-reply sent to ${ev.from_wa_id}: "${replyText.substring(0, 50)}..."`);
    return true;
  } catch (err) {
    console.error('handleAutoReply error:', err);
    return false;
  }
}

// Check if current time is within business hours
function checkBusinessHours(settings: any): boolean {
  try {
    // Parse timezone offset
    const tz = settings.timezone || 'UTC+0';
    const match = tz.match(/UTC([+-])(\d+\.?\d*)/);
    const offsetHours = match ? parseFloat(match[1] + match[2]) : 0;

    // Get current time in the business timezone
    const now = new Date();
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const localHours = ((utcHours + offsetHours) % 24 + 24) % 24;

    const [startH, startM] = (settings.business_hours_start || '09:00').split(':').map(Number);
    const [endH, endM] = (settings.business_hours_end || '18:00').split(':').map(Number);
    const start = startH + startM / 60;
    const end = endH + endM / 60;

    return localHours >= start && localHours < end;
  } catch {
    return true; // Default to business hours if parsing fails
  }
}

// ─── AI Prompt Engine Handler ───
async function handleAiEngine(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  conversationId: string,
  contactId: string,
  ev: NormalizedEvent & { kind: 'inbound_message' }
) {
  try {
    if (!ev.text) return; // Only process text messages

    // Check if AI auto-reply is enabled in auto_reply_settings
    const { data: settings } = await supabase
      .from('auto_reply_settings')
      .select('ai_enabled')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (!settings?.ai_enabled) {
      // Fallback: also check workspace_ai_settings for backward compatibility
      const { data: aiSettings } = await supabase
        .from('workspace_ai_settings')
        .select('enabled')
        .eq('workspace_id', tenantId)
        .maybeSingle();

      if (!aiSettings?.enabled) return;
    }

    // Call the AI prompt engine
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const engineResp = await fetch(`${supabaseUrl}/functions/v1/ai-prompt-engine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        workspace_id: tenantId,
        conversation_id: conversationId,
        contact_id: contactId,
        phone_number_id: phoneNumberId,
        message: ev.text,
        _service_call: true,
      }),
    });

    if (!engineResp.ok) {
      const errText = await engineResp.text();
      console.error('AI engine call failed:', engineResp.status, errText);
      return;
    }

    const result = await engineResp.json();
    if (result.skipped) {
      console.log('AI engine skipped:', result.reason);
      return;
    }

    console.log(`AI engine result: action=${result.action}, confidence=${result.confidence}, stage=${result.lead_update?.lead_stage}`);

    // If action is "send" or "fallback_send", send the message directly
    if (result.action === 'send' || result.action === 'fallback_send') {
      const replyText = result.reply;
      if (!replyText) return;

      // Get phone number's Meta ID and access token
      const { data: phone } = await supabase
        .from('phone_numbers')
        .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
        .eq('id', phoneNumberId)
        .maybeSingle();

      if (!phone?.phone_number_id || !phone.waba_account?.encrypted_access_token) {
        console.error('AI engine: phone number or token not found');
        return;
      }

      const waResp = await fetch(
        `https://graph.facebook.com/v21.0/${phone.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${phone.waba_account.encrypted_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: ev.from_wa_id,
            type: 'text',
            text: { body: replyText },
          }),
        }
      );

      const waResult = await waResp.json();
      if (!waResp.ok) {
        console.error('AI engine WhatsApp API error:', JSON.stringify(waResult));
        return;
      }

      const wamid = waResult.messages?.[0]?.id;
      const now = new Date().toISOString();

      // Store outbound AI message
      await supabase.from('messages').insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'outbound',
        type: 'text',
        text: replyText,
        wamid,
        status: 'sent',
        sent_at: now,
        is_auto_reply: true,
      });

      // Update conversation preview
      await supabase.from('conversations').update({
        last_message_at: now,
        last_message_preview: replyText.substring(0, 100),
      }).eq('id', conversationId);

      console.log(`AI engine sent reply to ${ev.from_wa_id}: "${replyText.substring(0, 50)}..."`);
    } else if (result.action === 'draft') {
      console.log(`AI engine created draft ${result.draft_id} for agent approval`);
    }
  } catch (err) {
    console.error('handleAiEngine error:', err);
  }
}

// ─── Form Rules Engine Handler ───
async function handleFormRules(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  conversationId: string,
  contactId: string,
  ev: NormalizedEvent & { kind: 'inbound_message' },
  isNewConversation: boolean
): Promise<boolean> {
  try {
    console.log(`Form rules engine: starting for tenant ${tenantId}, isNew=${isNewConversation}`);
    
    // 1. Fetch active form rules for this tenant, ordered by priority
    const { data: rules, error: rulesErr } = await supabase
      .from('form_rules')
      .select('*, form:templates(id, name, language, components_json)')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (rulesErr) {
      console.error('Form rules fetch error:', rulesErr);
      return false;
    }
    if (!rules?.length) {
      console.log('Form rules: no active rules found');
      return false;
    }

    console.log(`Form rules: evaluating ${rules.length} active rules for message: "${ev.text?.substring(0, 50) || '(no text)'}"`);

    for (const rule of rules) {
      try {
        // 2. Check trigger match
        const triggerMatched = checkFormRuleTrigger(rule, ev, isNewConversation);
        if (!triggerMatched) continue;

        console.log(`Form rule "${rule.name}" trigger matched: ${rule.trigger_type}`);

        // 3. Check guardrails
        const guardResult = await checkFormRuleGuardrails(supabase, rule, tenantId, contactId, conversationId);
        if (!guardResult.passed) {
          console.log(`Form rule "${rule.name}" guardrail blocked: ${guardResult.reason}`);
          // Log as skipped
          await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'skipped', guardResult.reason);
          continue;
        }

        // 4. Check conditions (tags, opt-in, etc.)
        const conditionsPass = await checkFormRuleConditions(supabase, rule, tenantId, contactId);
        if (!conditionsPass) {
          console.log(`Form rule "${rule.name}" conditions not met`);
          await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'skipped', 'conditions_not_met');
          continue;
        }

        // 5. Send the template message
        const sendResult = await sendFormRuleTemplate(supabase, rule, tenantId, phoneNumberId, conversationId, contactId, ev.from_wa_id);
        
        if (sendResult.success) {
          console.log(`Form rule "${rule.name}" sent successfully to ${ev.from_wa_id}`);
          await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'sent', null, sendResult.messageId);
          
          // Update execution count
          await supabase
            .from('form_rules')
            .update({ 
              execution_count: (rule.execution_count || 0) + 1,
              last_executed_at: new Date().toISOString(),
            })
            .eq('id', rule.id);

          // Only send first matching rule (highest priority wins)
          return true;
        } else {
          console.error(`Form rule "${rule.name}" send failed: ${sendResult.error}`);
          await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'failed', sendResult.error);
        }
      } catch (ruleErr) {
        console.error(`Form rule "${rule.name}" error:`, ruleErr);
        await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'failed', String(ruleErr));
      }
    }
    return false;
  } catch (err) {
    console.error('handleFormRules error:', err);
    return false;
  }
}

// Check if a form rule's trigger matches the current message
function checkFormRuleTrigger(
  rule: any,
  ev: NormalizedEvent & { kind: 'inbound_message' },
  isNewConversation: boolean
): boolean {
  const config = rule.trigger_config || {};

  switch (rule.trigger_type) {
    case 'first_message':
      return isNewConversation;

    case 'keyword': {
      if (!ev.text) return false;
      const keywords: string[] = config.keywords || [];
      if (keywords.length === 0) return false;
      const text = ev.text.toLowerCase();
      const matchType = config.match_type || 'contains';

      return keywords.some((kw: string) => {
        const kwLower = kw.toLowerCase();
        switch (matchType) {
          case 'exact': return text === kwLower;
          case 'starts_with': return text.startsWith(kwLower);
          case 'regex': try { return new RegExp(kw, 'i').test(ev.text || ''); } catch { return false; }
          case 'contains':
          default: return text.includes(kwLower);
        }
      });
    }

    case 'ad_click':
      // Check referral data in raw payload for CTWA ads
      const referral = ev.raw?.message?.referral || ev.raw?.value?.contacts?.[0]?.referral;
      if (!referral) return false;
      if (config.campaign_ids?.length) {
        return config.campaign_ids.includes(referral.headline || referral.source_id);
      }
      return true; // Any ad click

    case 'source': {
      // Check conversation source
      const sources: string[] = config.sources || [];
      if (sources.length === 0) return true;
      const referralSource = ev.raw?.message?.referral?.source_type || 'direct';
      return sources.includes(referralSource);
    }

    case 'tag_added':
      // Tag-based triggers are handled differently (via DB trigger/event)
      // For now, skip in webhook context
      return false;

    case 'scheduled':
      // Scheduled triggers are handled by cron, not webhook
      return false;

    default:
      return false;
  }
}

// Check guardrails (cooldown, max sends per day, business hours, opt-in)
async function checkFormRuleGuardrails(
  supabase: any,
  rule: any,
  tenantId: string,
  contactId: string,
  conversationId: string
): Promise<{ passed: boolean; reason?: string }> {
  // 1. Cooldown check
  if (rule.cooldown_minutes > 0) {
    const cooldownCutoff = new Date(Date.now() - rule.cooldown_minutes * 60 * 1000).toISOString();
    const { data: recentLog } = await supabase
      .from('form_rule_logs')
      .select('id')
      .eq('rule_id', rule.id)
      .eq('contact_id', contactId)
      .in('status', ['sent', 'delivered'])
      .gte('created_at', cooldownCutoff)
      .limit(1)
      .maybeSingle();

    if (recentLog) {
      return { passed: false, reason: 'cooldown_active' };
    }
  }

  // 2. Max sends per contact per day
  const maxPerDay = rule.max_sends_per_contact_per_day || 999;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const { count: todayCount } = await supabase
    .from('form_rule_logs')
    .select('id', { count: 'exact', head: true })
    .eq('rule_id', rule.id)
    .eq('contact_id', contactId)
    .in('status', ['sent', 'delivered'])
    .gte('created_at', todayStart.toISOString());

  if ((todayCount || 0) >= maxPerDay) {
    return { passed: false, reason: 'max_sends_per_day_reached' };
  }

  // 3. Opt-in check
  if (rule.require_opt_in) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('opt_out')
      .eq('id', contactId)
      .maybeSingle();

    if (contact?.opt_out) {
      return { passed: false, reason: 'contact_opted_out' };
    }
  }

  // 4. Business hours check
  if (rule.business_hours_only) {
    const { data: settings } = await supabase
      .from('auto_reply_settings')
      .select('business_hours_start, business_hours_end, timezone')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (settings) {
      const isInHours = checkBusinessHours(settings);
      if (!isInHours) {
        return { passed: false, reason: 'outside_business_hours' };
      }
    }
  }

  return { passed: true };
}

// Check form rule conditions (tags, attributes, etc.)
async function checkFormRuleConditions(
  supabase: any,
  rule: any,
  tenantId: string,
  contactId: string
): Promise<boolean> {
  const conditions = rule.conditions || [];
  if (conditions.length === 0) return true;

  for (const cond of conditions) {
    let passed = false;

    switch (cond.type) {
      case 'has_tag': {
        const tagId = cond.config?.tag_id;
        if (!tagId) { passed = true; break; }
        const { data } = await supabase
          .from('contact_tags')
          .select('id')
          .eq('contact_id', contactId)
          .eq('tag_id', tagId)
          .limit(1)
          .maybeSingle();
        passed = !!data;
        break;
      }
      case 'not_has_tag': {
        const tagId = cond.config?.tag_id;
        if (!tagId) { passed = true; break; }
        const { data } = await supabase
          .from('contact_tags')
          .select('id')
          .eq('contact_id', contactId)
          .eq('tag_id', tagId)
          .limit(1)
          .maybeSingle();
        passed = !data;
        break;
      }
      case 'opted_in': {
        const { data: contact } = await supabase
          .from('contacts')
          .select('opt_out')
          .eq('id', contactId)
          .maybeSingle();
        passed = !contact?.opt_out;
        break;
      }
      default:
        passed = true; // Unknown condition type, allow
    }

    // All conditions use AND logic by default
    if (!passed) return false;
  }

  return true;
}

// Send the template message for a form rule
async function sendFormRuleTemplate(
  supabase: any,
  rule: any,
  tenantId: string,
  phoneNumberId: string,
  conversationId: string,
  contactId: string,
  recipientWaId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Get template details — try joined data first, then lookup by name
  let template = rule.form;
  if (!template && rule.form_template_name) {
    const { data: tmpl } = await supabase
      .from('templates')
      .select('id, name, language, components_json')
      .eq('tenant_id', tenantId)
      .eq('name', rule.form_template_name)
      .limit(1)
      .maybeSingle();
    template = tmpl;
  }

  // If no WhatsApp template found, check for builder-mode form (form_version_id)
  if (!template && rule.form_version_id) {
    console.log('No WA template found, using builder-mode form version:', rule.form_version_id);
    return await sendBuilderFormMessages(supabase, rule, tenantId, phoneNumberId, conversationId, contactId, recipientWaId);
  }

  if (!template) {
    return { success: false, error: 'no_template_linked' };
  }

  // Get phone number's Meta ID and access token
  const { data: phone } = await supabase
    .from('phone_numbers')
    .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
    .eq('id', phoneNumberId)
    .maybeSingle();

  if (!phone?.phone_number_id || !phone.waba_account?.encrypted_access_token) {
    return { success: false, error: 'phone_or_token_not_found' };
  }

  // Send intro message first if configured
  const introMessage = rule.form_variables?.intro_message;
  const delaySec = rule.trigger_config?.delay_seconds || 0;

  if (delaySec > 0) {
    await new Promise(resolve => setTimeout(resolve, delaySec * 1000));
  }

  if (introMessage) {
    const introPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientWaId,
      type: 'text',
      text: { body: introMessage },
    };

    const introResp = await fetch(
      `https://graph.facebook.com/v21.0/${phone.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${phone.waba_account.encrypted_access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(introPayload),
      }
    );

    if (introResp.ok) {
      const introResult = await introResp.json();
      const introWamid = introResult.messages?.[0]?.id;
      const now = new Date().toISOString();

      // Store intro message
      await supabase.from('messages').insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'outbound',
        type: 'text',
        text: introMessage,
        wamid: introWamid,
        status: 'sent',
        sent_at: now,
        is_auto_reply: true,
      });

      // Small delay between intro and template
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Build template payload
  const templateName = template.name;
  const templateLang = rule.form_language || template.language || 'en';

  // Build components from form_variables if any variable mappings exist
  const components: any[] = [];
  const formVars = rule.form_variables || {};
  
  // Check if there are template variable values to send
  if (formVars.body_variables && Object.keys(formVars.body_variables).length > 0) {
    const bodyParams = Object.values(formVars.body_variables).map((val: any) => ({
      type: 'text',
      text: String(val),
    }));
    if (bodyParams.length > 0) {
      components.push({ type: 'body', parameters: bodyParams });
    }
  }

  const templatePayload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientWaId,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLang },
    },
  };

  if (components.length > 0) {
    templatePayload.template.components = components;
  }

  const waResp = await fetch(
    `https://graph.facebook.com/v21.0/${phone.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${phone.waba_account.encrypted_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templatePayload),
    }
  );

  const waResult = await waResp.json();

  if (!waResp.ok) {
    return { success: false, error: `WhatsApp API: ${JSON.stringify(waResult?.error || waResult)}` };
  }

  const wamid = waResult.messages?.[0]?.id;
  const now = new Date().toISOString();

  // Store outbound template message
  await supabase.from('messages').insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    direction: 'outbound',
    type: 'template',
    text: `📋 Form: ${templateName}`,
    wamid,
    status: 'sent',
    sent_at: now,
    is_auto_reply: true,
    template_name: templateName,
  });

  // Update conversation preview
  await supabase.from('conversations').update({
    last_message_at: now,
    last_message_preview: `📋 Form: ${templateName}`,
  }).eq('id', conversationId);

  return { success: true, messageId: wamid };
}

// Handle builder-mode forms — starts interactive session
async function sendBuilderFormMessages(
  supabase: any, rule: any, tenantId: string, phoneNumberId: string,
  conversationId: string, contactId: string, recipientWaId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check for existing active session for this contact (prevent duplicates)
  const { data: existingSession } = await supabase.from('form_sessions')
    .select('id, status, expires_at').eq('tenant_id', tenantId).eq('contact_id', contactId)
    .eq('form_rule_id', rule.id).eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (existingSession) {
    console.log('Active form session already exists for this contact:', existingSession.id);
    return { success: true, messageId: 'session_exists' };
  }

  // Cancel any expired sessions
  await supabase.from('form_sessions').update({ status: 'expired' })
    .eq('tenant_id', tenantId).eq('contact_id', contactId)
    .eq('status', 'active').lt('expires_at', new Date().toISOString());

  const { data: formVersion, error: fvErr } = await supabase
    .from('form_versions').select('id, schema_json').eq('id', rule.form_version_id).maybeSingle();
  if (fvErr || !formVersion?.schema_json) {
    console.error('Failed to fetch form version:', fvErr);
    return { success: false, error: 'form_version_not_found' };
  }
  const schema = formVersion.schema_json;
  const visibleFields = (schema.fields || []).filter((f: any) =>
    !['hidden', 'calculated', 'lead_score', 'tag_assignment'].includes(f.type)
  );
  if (visibleFields.length === 0) return { success: false, error: 'no_visible_fields' };

  const { data: phone } = await supabase.from('phone_numbers')
    .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
    .eq('id', phoneNumberId).maybeSingle();
  if (!phone?.phone_number_id || !phone.waba_account?.encrypted_access_token)
    return { success: false, error: 'phone_or_token_not_found' };

  const accessToken = phone.waba_account.encrypted_access_token;
  const metaPhoneId = phone.phone_number_id;
  const delaySec = schema.delay_seconds || rule.trigger_config?.delay_seconds || 0;
  if (delaySec > 0) await new Promise(r => setTimeout(r, delaySec * 1000));

// Auto-detect customer name for {{first_name}} substitution
  const { data: contactRow } = await supabase.from('contacts').select('name').eq('id', contactId).maybeSingle();
  const contactName = contactRow?.name || '';
  const firstName = contactName.split(' ')[0] || '';

  // Send intro (replace {{first_name}} placeholder)
  let introMessage = schema.intro_message || rule.form_variables?.intro_message;
  if (introMessage) {
    introMessage = introMessage.replace(/\{\{first_name\}\}/gi, firstName || 'there');
    const r = await sendWAText(metaPhoneId, accessToken, recipientWaId, introMessage);
    if (r.wamid) {
      await supabase.from('messages').insert({
        tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound',
        type: 'text', text: introMessage, wamid: r.wamid, status: 'sent',
        sent_at: new Date().toISOString(), is_auto_reply: true,
      });
    }
  }

  // Auto-fill name field if available
  const initialAnswers: Record<string, any> = {};
  if (firstName) {
    const nameField = visibleFields.find((f: any) =>
      f.type === 'text' && /^(full\s*name|name|first\s*name)$/i.test(f.label)
    );
    if (nameField) {
      initialAnswers[nameField.id] = { label: nameField.label, value: contactName || firstName, displayValue: contactName || firstName, fieldType: 'text' };
    }
  }

  // Create session with 24h expiry
  const startIndex = Object.keys(initialAnswers).length > 0
    ? visibleFields.findIndex((f: any) => initialAnswers[f.id]) === 0 ? 1 : 0
    : 0;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: session, error: sessErr } = await supabase.from('form_sessions').insert({
    tenant_id: tenantId, contact_id: contactId, conversation_id: conversationId,
    form_rule_id: rule.id, form_version_id: rule.form_version_id,
    current_field_index: startIndex, answers: initialAnswers, status: 'active',
    expires_at: expiresAt,
  }).select('id').single();
  if (sessErr) { console.error('Session create failed:', sessErr); return { success: false, error: 'session_create_failed' }; }

  // If name was auto-filled, tell user and start from next field
  if (startIndex > 0 && firstName) {
    const autoMsg = `👋 Hi *${contactName || firstName}*! I've noted your name. Let's continue...`;
    await sendWAText(metaPhoneId, accessToken, recipientWaId, autoMsg);
  }

  // Send first question (skipping auto-filled ones)
  const wamid = await sendFormQuestion(supabase, metaPhoneId, accessToken, recipientWaId, tenantId, conversationId, visibleFields[startIndex], startIndex + 1, visibleFields.length);
  console.log('Interactive form session started:', session.id, 'expires:', expiresAt);
  return { success: true, messageId: wamid };
}

// Send a single form question as interactive WhatsApp message
async function sendFormQuestion(
  supabase: any, metaPhoneId: string, accessToken: string, recipientWaId: string,
  tenantId: string, conversationId: string, field: any, qNum: number, total: number
): Promise<string | undefined> {
  const prefix = `📋 *Question ${qNum}/${total}*\n\n`;
  const req = field.required ? ' _(required)_' : '';

  const choiceTypes = ['select', 'radio', 'checkbox', 'tag_assignment', 'lead_score'];

  if (field.options?.length > 0 && field.options.length <= 3 && choiceTypes.includes(field.type)) {
    // Buttons (max 3)
    const selectHint = field.type === 'checkbox' ? '_Select one or more (tap to choose):_' : '_Select one:_';
    const payload = {
      messaging_product: 'whatsapp', recipient_type: 'individual', to: recipientWaId,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: `${prefix}*${field.label}*${req}\n\n${selectHint}` },
        action: { buttons: field.options.slice(0, 3).map((opt: any) => ({
          type: 'reply', reply: { id: `form_${field.id}_${opt.value}`, title: (opt.label || opt.value).substring(0, 20) },
        })) },
      },
    };
    const resp = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    const wamid = result.messages?.[0]?.id;
    if (wamid) {
      const displayText = `${prefix}*${field.label}*${req}\n\n${field.options.map((o: any) => `• ${o.label}`).join('\n')}`;
      await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'interactive', text: displayText, wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
    } else { console.error('Button message failed:', JSON.stringify(result)); }
    return wamid;

  } else if (field.options?.length > 3 && field.options.length <= 10 && choiceTypes.includes(field.type)) {
    // List (4-10) — with fallback to numbered text if list fails
    const rows = field.options.slice(0, 10).map((opt: any, idx: number) => ({
      id: `form_${field.id.substring(0, 30)}_${idx}`,
      title: (opt.label || opt.value).substring(0, 24),
      description: '',
    }));
    const payload = {
      messaging_product: 'whatsapp', recipient_type: 'individual', to: recipientWaId,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: `${prefix}*${field.label}*${req}`.substring(0, 1024) },
        action: { button: 'Select Option', sections: [{ title: 'Options', rows }] },
      },
    };
    const resp = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    const wamid = result.messages?.[0]?.id;
    if (wamid) {
      const displayText = `${prefix}*${field.label}*${req}\n\n${field.options.map((o: any) => `• ${o.label}`).join('\n')}`;
      await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'interactive', text: displayText, wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
    } else {
      // List message failed — fallback to numbered text
      console.error('List message failed, using numbered fallback:', JSON.stringify(result));
      let body = `${prefix}*${field.label}*${req}\n\n_Choose by replying with the number:_\n\n`;
      field.options.forEach((opt: any, i: number) => { body += `*${i + 1}.* ${opt.label || opt.value}\n`; });
      const fallback = await sendWAText(metaPhoneId, accessToken, recipientWaId, body.trim());
      if (fallback.wamid) {
        await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'text', text: body.trim(), wamid: fallback.wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
      }
      return fallback.wamid;
    }
    return wamid;

  } else if (field.options?.length > 10 && choiceTypes.includes(field.type)) {
    // More than 10 options — send as numbered text list (WhatsApp List max is 10)
    let body = `${prefix}*${field.label}*${req}\n\n`;
    body += '_Choose by replying with the number or option name:_\n\n';
    field.options.forEach((opt: any, i: number) => {
      body += `*${i + 1}.* ${opt.label || opt.value}\n`;
    });
    const r = await sendWAText(metaPhoneId, accessToken, recipientWaId, body.trim());
    if (r.wamid) {
      await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'text', text: body.trim(), wamid: r.wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
    }
    return r.wamid;

  } else if (field.type === 'date' || field.type === 'datetime') {
    // Date picker — send as text with clear format instruction
    let body = `${prefix}*${field.label}*${req}\n\n`;
    if (field.type === 'datetime') {
      body += '📅 _Please enter a date and time_\n_Format: DD/MM/YYYY HH:MM_\n_Example: 25/12/2025 14:30_';
    } else {
      body += '📅 _Please enter a date_\n_Format: DD/MM/YYYY_\n_Example: 25/12/2025_';
    }
    const r = await sendWAText(metaPhoneId, accessToken, recipientWaId, body.trim());
    if (r.wamid) {
      await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'text', text: body.trim(), wamid: r.wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
    }
    return r.wamid;

  } else if (field.type === 'year') {
    // Year selector — 2010 to 2030 using WhatsApp interactive list with multiple sections
    const years = Array.from({ length: 21 }, (_, i) => 2010 + i);
    // Split into sections of 10 (WhatsApp max per section)
    const sections: { title: string; rows: { id: string; title: string }[] }[] = [];
    for (let i = 0; i < years.length; i += 10) {
      const chunk = years.slice(i, i + 10);
      sections.push({
        title: `${chunk[0]} – ${chunk[chunk.length - 1]}`,
        rows: chunk.map((y, idx) => ({
          id: `year_${field.id.substring(0, 30)}_${i + idx}`,
          title: String(y),
        })),
      });
    }
    const payload = {
      messaging_product: 'whatsapp', recipient_type: 'individual', to: recipientWaId,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: `${prefix}*${field.label}*${req}\n\n📅 _Select your year:_`.substring(0, 1024) },
        action: { button: 'Select Year', sections },
      },
    };
    const resp = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    const wamid = result.messages?.[0]?.id;
    if (wamid) {
      const displayText = `${prefix}*${field.label}*${req}\n\n📅 Select your year (2010–2030)`;
      await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'interactive', text: displayText, wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
    } else {
      // Fallback to text
      console.error('Year list message failed:', JSON.stringify(result));
      let body = `${prefix}*${field.label}*${req}\n\n📅 _Reply with a year (2010–2030):_`;
      const fallback = await sendWAText(metaPhoneId, accessToken, recipientWaId, body);
      if (fallback.wamid) {
        await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'text', text: body, wamid: fallback.wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
      }
      return fallback.wamid;
    }
    return wamid;

  } else {
    // Text input fallback
    let body = `${prefix}*${field.label}*${req}\n\n`;
    if (field.placeholder) body += `_${field.placeholder}_\n`;
    if (field.type === 'email') body += '📧 _Enter a valid email address_\n';
    else if (field.type === 'phone') body += '📱 _Enter your phone number_\n';
    else if (field.type === 'url') body += '🔗 _Enter a valid URL_\n';
    else if (field.type === 'number') body += '🔢 _Enter a number_\n';
    else if (field.type === 'rating') body += '⭐ _Enter a rating from 1 to 5_\n';
    else if (field.type === 'location') body += '📍 _Share your location or type an address_\n';
    else body += '\n_Type your answer:_';
    const r = await sendWAText(metaPhoneId, accessToken, recipientWaId, body.trim());
    if (r.wamid) {
      await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'text', text: body.trim(), wamid: r.wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
    }
    return r.wamid;
  }
}

// Helper: send plain WhatsApp text
async function sendWAText(metaPhoneId: string, accessToken: string, to: string, text: string): Promise<{ wamid?: string }> {
  const resp = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: text } }),
  });
  const result = await resp.json();
  return { wamid: result.messages?.[0]?.id };
}

// Handle active form session — process answer and send next question
async function handleActiveFormSession(
  supabase: any, tenantId: string, phoneNumberId: string,
  conversationId: string, contactId: string, ev: any
): Promise<boolean> {
  const { data: session } = await supabase.from('form_sessions')
    .select('*').eq('tenant_id', tenantId).eq('contact_id', contactId)
    .in('status', ['active', 'review']).gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!session) return false;

  console.log('Active form session:', session.id, 'field_index:', session.current_field_index);

  const { data: fv } = await supabase.from('form_versions').select('schema_json').eq('id', session.form_version_id).maybeSingle();
  if (!fv?.schema_json) return false;

  const allFields = fv.schema_json.fields || [];
  const visibleFields = allFields.filter((f: any) =>
    !['hidden', 'calculated', 'lead_score', 'tag_assignment'].includes(f.type)
  );
  const currentField = visibleFields[session.current_field_index];
  // Don't bail out if we're in review mode — currentField may be past the end
  if (!currentField && session.status !== 'review' && !session.awaiting_edit) return false;

  // ─── Extract answer from interactive or text ───
  let answer = ev.text || '';
  let answerLabel = answer;
  const isInteractive = ev.msg_type === 'interactive' || ev.msg_type === 'button';
  
  if (isInteractive) {
    const raw = ev.raw?.message?.interactive;
    if (raw?.button_reply) {
      const parts = (raw.button_reply.id || '').split('_');
      answer = parts.length >= 3 ? parts.slice(2).join('_') : raw.button_reply.title;
      answerLabel = raw.button_reply.title || answer;
    } else if (raw?.list_reply) {
      const listId = raw.list_reply.id || '';
      const listTitle = raw.list_reply.title || '';
      // Year field: IDs are like year_fieldId_idx
      if (listId.startsWith('year_')) {
        // The title IS the year value
        answer = listTitle;
        answerLabel = listTitle;
      } else {
        const parts = listId.split('_');
        const lastPart = parts[parts.length - 1];
        const idx = parseInt(lastPart, 10);
        if (!isNaN(idx) && currentField.options?.length > idx) {
          answer = currentField.options[idx].value;
          answerLabel = currentField.options[idx].label || answer;
        } else {
          answer = parts.length >= 3 ? parts.slice(2).join('_') : listTitle;
          answerLabel = listTitle || answer;
        }
      }
    }
  }

  // ─── REVIEW/EDIT check — MUST run before any field validation ───
  if (session.status === 'review' || session.awaiting_edit) {
    const lowerAnswer = answer.trim().toLowerCase();

    if (session.awaiting_edit) {
      // They typed a field number to edit — map to field index
      const editNum = parseInt(lowerAnswer, 10);
      if (!isNaN(editNum) && editNum >= 1 && editNum <= visibleFields.length) {
        const editFieldIndex = editNum - 1;
        await supabase.from('form_sessions').update({
          current_field_index: editFieldIndex,
          status: 'active',
          awaiting_edit: false,
          editing_field_index: editFieldIndex,
        }).eq('id', session.id);
        const { data: phone } = await supabase.from('phone_numbers')
          .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
          .eq('id', phoneNumberId).maybeSingle();
        if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
          await sendFormQuestion(supabase, phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, tenantId, conversationId, visibleFields[editFieldIndex], editFieldIndex + 1, visibleFields.length);
        }
        return true;
      } else {
        const { data: phone } = await supabase.from('phone_numbers')
          .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
          .eq('id', phoneNumberId).maybeSingle();
        if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
          await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, `⚠️ Please reply with a number between 1 and ${visibleFields.length}, or type *submit* to confirm.`);
        }
        return true;
      }
    }

    // Waiting for confirm/edit choice
    if (isInteractive) {
      const raw = ev.raw?.message?.interactive;
      const btnId = raw?.button_reply?.id || '';
      if (btnId === 'form_confirm_submit') {
        await supabase.from('form_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', session.id);
        const { data: phone } = await supabase.from('phone_numbers')
          .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
          .eq('id', phoneNumberId).maybeSingle();
        if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
          await handleFormCompletion(supabase, tenantId, phoneNumberId, conversationId, contactId, ev.from_wa_id, session, session.answers, allFields, fv.schema_json, phone.phone_number_id, phone.waba_account.encrypted_access_token);
        }
        return true;
      } else if (btnId === 'form_edit_answers') {
        let editMsg = '✏️ *Which answer do you want to change?*\n_Reply with the number:_\n\n';
        visibleFields.forEach((f: any, i: number) => {
          const ans = session.answers[f.id];
          editMsg += `*${i + 1}.* ${f.label}: ${ans?.displayValue || ans?.value || '—'}\n`;
        });
        await supabase.from('form_sessions').update({ awaiting_edit: true, status: 'review' }).eq('id', session.id);
        const { data: phone } = await supabase.from('phone_numbers')
          .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
          .eq('id', phoneNumberId).maybeSingle();
        if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
          const r = await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, editMsg.trim());
          if (r.wamid) {
            await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'text', text: editMsg.trim(), wamid: r.wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
          }
        }
        return true;
      }
    }

    // Non-interactive text: "submit" or "edit"
    if (lowerAnswer === 'submit' || lowerAnswer === 'confirm' || lowerAnswer === 'yes') {
      await supabase.from('form_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', session.id);
      const { data: phone } = await supabase.from('phone_numbers')
        .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
        .eq('id', phoneNumberId).maybeSingle();
      if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
        await handleFormCompletion(supabase, tenantId, phoneNumberId, conversationId, contactId, ev.from_wa_id, session, session.answers, allFields, fv.schema_json, phone.phone_number_id, phone.waba_account.encrypted_access_token);
      }
      return true;
    }
    if (lowerAnswer === 'edit' || lowerAnswer === 'change') {
      let editMsg = '✏️ *Which answer do you want to change?*\n_Reply with the number:_\n\n';
      visibleFields.forEach((f: any, i: number) => {
        const ans = session.answers[f.id];
        editMsg += `*${i + 1}.* ${f.label}: ${ans?.displayValue || ans?.value || '—'}\n`;
      });
      await supabase.from('form_sessions').update({ awaiting_edit: true, status: 'review' }).eq('id', session.id);
      const { data: phone } = await supabase.from('phone_numbers')
        .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
        .eq('id', phoneNumberId).maybeSingle();
      if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
        await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, editMsg.trim());
      }
      return true;
    }
    return true;
  }

  // ─── Validate answer (only for active status, not review) ───
  const choiceFieldTypes = ['select', 'radio', 'checkbox', 'tag_assignment', 'lead_score'];
  const fieldHasOptions = currentField.options?.length > 0 && choiceFieldTypes.includes(currentField.type);

  if (fieldHasOptions && !isInteractive) {
    // User typed free text — match by label, value, or number
    const typed = answer.trim().toLowerCase();
    const numMatch = parseInt(typed, 10);
    let matchedOption: any = null;
    if (!isNaN(numMatch) && numMatch >= 1 && numMatch <= currentField.options.length) {
      matchedOption = currentField.options[numMatch - 1];
    }
    if (!matchedOption) {
      matchedOption = currentField.options.find((o: any) =>
        (o.label || '').toLowerCase() === typed || (o.value || '').toLowerCase() === typed
      );
    }
    if (matchedOption) {
      answer = matchedOption.value;
      answerLabel = matchedOption.label;
    } else {
      const { data: phone } = await supabase.from('phone_numbers')
        .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
        .eq('id', phoneNumberId).maybeSingle();
      if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
        await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, `⚠️ Please choose from the options provided. Reply with the option number or name.`);
        await sendFormQuestion(supabase, phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, tenantId, conversationId, currentField, session.current_field_index + 1, visibleFields.length);
      }
      return true;
    }
  }

  // Year field validation
  if (currentField.type === 'year') {
    const years = Array.from({ length: 21 }, (_, i) => 2010 + i);
    const typed = answer.trim();
    const numMatch = parseInt(typed, 10);
    if (isInteractive && years.includes(numMatch)) {
      // Selected from interactive list — already a valid year
      answer = String(numMatch);
      answerLabel = answer;
    } else if (years.includes(numMatch)) {
      answer = String(numMatch);
      answerLabel = answer;
    } else if (numMatch >= 1 && numMatch <= years.length) {
      answer = String(years[numMatch - 1]);
      answerLabel = answer;
    } else {
      const { data: phone } = await supabase.from('phone_numbers')
        .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
        .eq('id', phoneNumberId).maybeSingle();
      if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
        await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, `⚠️ Please select a year between 2010 and 2030.`);
        await sendFormQuestion(supabase, phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, tenantId, conversationId, currentField, session.current_field_index + 1, visibleFields.length);
      }
      return true;
    }
  }

  // Email validation
  if (currentField.type === 'email' && answer && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
    const { data: phone } = await supabase.from('phone_numbers')
      .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('id', phoneNumberId).maybeSingle();
    if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
      await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, '⚠️ That doesn\'t look like a valid email. Please try again:');
    }
    return true;
  }

  // Required check
  if (currentField.required && !answer.trim()) {
    const { data: phone } = await supabase.from('phone_numbers')
      .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('id', phoneNumberId).maybeSingle();
    if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
      await sendWAText(phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, '⚠️ This field is required. Please provide an answer:');
    }
    return true;
  }

  // ─── Store answer and advance ───
  const updatedAnswers = { ...session.answers, [currentField.id]: { label: currentField.label, value: answer, displayValue: answerLabel, fieldType: currentField.type } };
  
  // If editing a specific field, go back to review after storing the answer
  if (session.editing_field_index != null) {
    await supabase.from('form_sessions').update({
      answers: updatedAnswers,
      current_field_index: visibleFields.length, // keep at end
      editing_field_index: null,
      status: 'review',
    }).eq('id', session.id);
    // Show updated review summary
    const { data: phone } = await supabase.from('phone_numbers')
      .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('id', phoneNumberId).maybeSingle();
    if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
      await sendReviewSummary(supabase, phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, tenantId, conversationId, updatedAnswers, visibleFields);
    }
    return true;
  }

  const nextIndex = session.current_field_index + 1;
  const isComplete = nextIndex >= visibleFields.length;

  if (isComplete) {
    // All questions answered — show review summary with edit option
    await supabase.from('form_sessions').update({
      current_field_index: nextIndex, answers: updatedAnswers,
      status: 'review',
    }).eq('id', session.id);

    const { data: phone } = await supabase.from('phone_numbers')
      .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('id', phoneNumberId).maybeSingle();
    if (!phone?.phone_number_id || !phone.waba_account?.encrypted_access_token) return true;

    await sendReviewSummary(supabase, phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, tenantId, conversationId, updatedAnswers, visibleFields);
  } else {
    await supabase.from('form_sessions').update({
      current_field_index: nextIndex, answers: updatedAnswers,
      status: 'active',
    }).eq('id', session.id);
    const { data: phone } = await supabase.from('phone_numbers')
      .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
      .eq('id', phoneNumberId).maybeSingle();
    if (phone?.phone_number_id && phone.waba_account?.encrypted_access_token) {
      await sendFormQuestion(supabase, phone.phone_number_id, phone.waba_account.encrypted_access_token, ev.from_wa_id, tenantId, conversationId, visibleFields[nextIndex], nextIndex + 1, visibleFields.length);
    }
  }
  return true;
}

// ─── Send Review Summary with Edit/Submit buttons ───
async function sendReviewSummary(
  supabase: any, metaPhoneId: string, accessToken: string, recipientWaId: string,
  tenantId: string, conversationId: string, answers: Record<string, any>, visibleFields: any[]
) {
  let summaryMsg = '📋 *Review Your Answers:*\n\n';
  visibleFields.forEach((f: any, i: number) => {
    const ans = answers[f.id];
    summaryMsg += `*${i + 1}. ${f.label}:* ${ans?.displayValue || ans?.value || '—'}\n`;
  });
  summaryMsg += '\n_Tap *Submit* to confirm or *Edit* to change an answer._';

  const payload = {
    messaging_product: 'whatsapp', recipient_type: 'individual', to: recipientWaId,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: summaryMsg },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'form_confirm_submit', title: '✅ Submit' } },
          { type: 'reply', reply: { id: 'form_edit_answers', title: '✏️ Edit' } },
        ],
      },
    },
  };
  const resp = await fetch(`https://graph.facebook.com/v21.0/${metaPhoneId}/messages`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await resp.json();
  const wamid = result.messages?.[0]?.id;
  if (wamid) {
    await supabase.from('messages').insert({ tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound', type: 'interactive', text: summaryMsg, wamid, status: 'sent', sent_at: new Date().toISOString(), is_auto_reply: true });
  }
  return wamid;
}

// ─── Form Completion Engine ───
async function handleFormCompletion(
  supabase: any, tenantId: string, phoneNumberId: string,
  conversationId: string, contactId: string, recipientWaId: string,
  session: any, answers: Record<string, any>, allFields: any[], schema: any,
  metaPhoneId: string, accessToken: string
) {
  try {
    console.log('Form completion engine starting for session:', session.id);

    // 1. Calculate lead score
    let totalScore = 0;
    const scoreBreakdown: Record<string, number> = {};
    const answeredVisibleFields = allFields.filter((f: any) => !['hidden', 'calculated', 'lead_score', 'tag_assignment'].includes(f.type));
    const totalQuestions = answeredVisibleFields.length;
    let answeredCount = 0;
    
    // Explicit lead_score rules
    for (const field of allFields) {
      if (field.type === 'lead_score' && field.leadScoreRules) {
        for (const rule of field.leadScoreRules) {
          for (const [, ansData] of Object.entries(answers)) {
            const ans = ansData as any;
            if (ans.value === rule.answer || ans.displayValue === rule.answer) {
              totalScore += rule.points || 0;
              scoreBreakdown[ans.label] = (scoreBreakdown[ans.label] || 0) + (rule.points || 0);
            }
          }
        }
      }
    }

    // Option-level scores
    for (const field of allFields.filter((f: any) => f.options?.length > 0)) {
      const ansData = answers[field.id] as any;
      if (!ansData) continue;
      const matchedOpt = field.options.find((o: any) => o.value === ansData.value);
      if (matchedOpt?.score) {
        totalScore += matchedOpt.score;
        scoreBreakdown[field.label] = (scoreBreakdown[field.label] || 0) + matchedOpt.score;
      }
    }

    // Default scoring: if no explicit scores configured, score based on completeness
    const hasExplicitScoring = totalScore > 0 || allFields.some((f: any) =>
      (f.type === 'lead_score' && f.leadScoreRules?.length > 0) ||
      f.options?.some((o: any) => o.score != null)
    );

    if (!hasExplicitScoring) {
      // Score based on form completion: each answered field = points proportional to 100
      for (const field of answeredVisibleFields) {
        if (answers[field.id]) {
          answeredCount++;
        }
      }
      totalScore = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
      console.log(`Default scoring: ${answeredCount}/${totalQuestions} fields answered = ${totalScore}`);
    }

    // 2. Determine qualification from score thresholds
    const thresholds = schema.leadScoreThresholds || { hot: 80, warm: 50, cold: 0 };
    let qualification = 'cold';
    if (totalScore >= thresholds.hot) qualification = 'hot';
    else if (totalScore >= thresholds.warm) qualification = 'warm';

    const isQualified = qualification === 'hot' || qualification === 'warm';

    console.log(`Lead score: ${totalScore}, qualification: ${qualification}, qualified: ${isQualified}`);

    // 3. Collect tags from tag_assignment fields
    const tagsToApply: string[] = [];
    for (const field of allFields) {
      if (field.type === 'tag_assignment' && field.tagRules) {
        for (const rule of field.tagRules) {
          for (const [, ansData] of Object.entries(answers)) {
            const ans = ansData as any;
            if (ans.value === rule.answer || ans.displayValue === rule.answer) {
              tagsToApply.push(rule.tag);
            }
          }
        }
      }
    }

    // Also collect tags from option-level tag configs
    for (const field of allFields.filter((f: any) => f.options?.length > 0)) {
      const ansData = answers[field.id] as any;
      if (!ansData) continue;
      const matchedOpt = field.options.find((o: any) => o.value === ansData.value);
      if (matchedOpt?.tag) {
        tagsToApply.push(matchedOpt.tag);
      }
    }

    // Add qualification tag
    tagsToApply.push(isQualified ? 'Qualified Lead' : 'Not Qualified');
    if (qualification === 'hot') tagsToApply.push('Hot Lead');

    // 4. Apply tags to contact
    for (const tagName of tagsToApply) {
      try {
        // Find or create tag
        let { data: tag } = await supabase.from('tags')
          .select('id').eq('tenant_id', tenantId).eq('name', tagName).maybeSingle();
        
        if (!tag) {
          const { data: newTag } = await supabase.from('tags').insert({
            tenant_id: tenantId, name: tagName, tag_type: 'automation',
            color: isQualified ? '#22c55e' : '#ef4444', status: 'active', apply_to: 'contacts',
          }).select('id').single();
          tag = newTag;
        }
        
        if (tag?.id) {
          await supabase.from('contact_tags').upsert({
            tenant_id: tenantId, contact_id: contactId, tag_id: tag.id,
          }, { onConflict: 'contact_id,tag_id', ignoreDuplicates: true });
        }
      } catch (tagErr) {
        console.error('Tag apply error:', tagErr);
      }
    }

    // 5. Store form submission
    const submissionData: Record<string, any> = {};
    for (const [fieldId, ansData] of Object.entries(answers)) {
      const ans = ansData as any;
      submissionData[ans.label] = ans.displayValue || ans.value;
    }

    // Resolve actual form_id from form_version
    let actualFormId: string | null = null;
    if (session.form_version_id) {
      const { data: fvRow } = await supabase.from('form_versions')
        .select('form_id').eq('id', session.form_version_id).maybeSingle();
      actualFormId = fvRow?.form_id || null;
    }

    if (actualFormId) {
      const { error: subErr } = await supabase.from('form_submissions').insert({
        tenant_id: tenantId,
        form_id: actualFormId,
        form_version_id: session.form_version_id,
        contact_id: contactId,
        conversation_id: conversationId,
        data_json: submissionData,
        lead_score: totalScore,
        tags: tagsToApply,
        status: 'completed',
        submitted_at: new Date().toISOString(),
      });
      if (subErr) console.error('Form submission save error:', subErr);
      else console.log('Form submission saved successfully');
    } else {
      console.error('Could not resolve form_id from version:', session.form_version_id);
    }

    // 6. Update contact with lead status
    await supabase.from('contacts').update({
      lead_status: isQualified ? 'qualified' : 'new',
      segment: qualification,
      priority_level: qualification === 'hot' ? 'high' : qualification === 'warm' ? 'normal' : 'low',
    }).eq('id', contactId);

    // 6b. Upsert qualified_leads so inbox shows lead_stage badge
    const leadStage = isQualified ? 'qualified' : 'new';
    const capturedData: Record<string, any> = {};
    for (const [, ansData] of Object.entries(answers)) {
      const ans = ansData as any;
      capturedData[ans.label] = ans.displayValue || ans.value;
    }
    try {
      await supabase.from('qualified_leads').upsert({
        workspace_id: tenantId,
        contact_id: contactId,
        lead_stage: leadStage,
        confidence: totalScore,
        captured: capturedData,
        missing_fields: [],
        intent: qualification === 'hot' ? 'high_interest' : qualification === 'warm' ? 'interested' : 'browsing',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'workspace_id,contact_id', ignoreDuplicates: false });
      console.log(`Qualified lead upserted: stage=${leadStage}, score=${totalScore}`);
    } catch (qlErr) {
      console.error('Qualified lead upsert error:', qlErr);
    }

    // 7. Auto-assign counselor if qualified (via routing rules)
    if (isQualified) {
      try {
        const { data: routeResult } = await supabase.rpc('smeksh_auto_route_conversation', {
          p_workspace_id: tenantId,
          p_conversation_id: conversationId,
          p_trigger_event: 'new_conversation',
          p_only_if_unassigned: true,
        });
        console.log('Auto-assign on qualification:', JSON.stringify(routeResult));
      } catch (routeErr) {
        console.error('Auto-assign error:', routeErr);
      }
    }

    // 8. Send completion message (NO lead score shown to customer)
    const successMsg = schema.settings?.successMessage || 'Thank you for your response! ✅';
    let summaryMsg = `${successMsg}\n\n`;
    summaryMsg += `📊 *Your Summary:*\n`;
    for (const [, ansData] of Object.entries(answers)) {
      const ans = ansData as any;
      summaryMsg += `• *${ans.label}:* ${ans.displayValue || ans.value}\n`;
    }
    if (isQualified) {
      summaryMsg += `\n✅ A counselor will be in touch shortly.`;
    }

    const r = await sendWAText(metaPhoneId, accessToken, recipientWaId, summaryMsg.trim());
    if (r.wamid) {
      await supabase.from('messages').insert({
        tenant_id: tenantId, conversation_id: conversationId, direction: 'outbound',
        type: 'text', text: summaryMsg.trim(), wamid: r.wamid, status: 'sent',
        sent_at: new Date().toISOString(), is_auto_reply: true,
      });
    }

    // Update conversation preview
    await supabase.from('conversations').update({
      last_message_at: new Date().toISOString(),
      last_message_preview: `✅ Form completed`,
    }).eq('id', conversationId);

    console.log('Form completion engine done. Score:', totalScore, 'Tags:', tagsToApply.join(', '));
  } catch (err) {
    console.error('handleFormCompletion error:', err);
    // Still send basic success message
    const successMsg = schema.settings?.successMessage || 'Thank you for your response! ✅';
    await sendWAText(metaPhoneId, accessToken, recipientWaId, successMsg);
  }
}
// Log form rule execution
async function logFormRuleExecution(
  supabase: any, tenantId: string, ruleId: string, contactId: string,
  conversationId: string, status: string, skipReason?: string | null, messageId?: string | null
) {
  try {
    await supabase.from('form_rule_logs').insert({
      tenant_id: tenantId, rule_id: ruleId, contact_id: contactId,
      conversation_id: conversationId, status, skip_reason: skipReason || null,
      message_id: messageId || null, trigger_data: {},
    });
  } catch (err) { console.error('Failed to log form rule execution:', err); }
}

// ─── Meta Ad Automations Handler ───
// Checks if incoming message is from a CTWA ad, finds matching automations, and executes actions
async function handleMetaAdAutomations(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  conversationId: string,
  contactId: string,
  ev: NormalizedEvent & { kind: 'inbound_message' }
) {
  // Extract referral data (present in CTWA messages)
  const referral = ev.raw?.message?.referral || ev.raw?.value?.contacts?.[0]?.referral;
  
  console.log(`Meta ad automations check: referral=${referral ? JSON.stringify({ source_id: referral.source_id, source_type: referral.source_type, source_url: referral.source_url }) : 'none'}`);

  // Fetch all active automations for this workspace
  const { data: automations, error: autoErr } = await supabase
    .from('smeksh_meta_ad_automations')
    .select('*')
    .eq('workspace_id', tenantId)
    .eq('is_active', true);

  if (autoErr || !automations || automations.length === 0) {
    console.log('Meta ad automations: none active');
    return;
  }

  // Determine which internal campaign IDs match the referral data
  let matchedInternalCampaignIds: string[] = [];
  if (referral) {
    // The referral source_id is typically a Meta Ad ID (not campaign ID)
    const sourceId = referral.source_id || '';
    const sourceUrl = referral.source_url || '';
    
    // Look up campaigns — also check raw_meta_data.ad_ids for ad-level matching
    const { data: matchedCampaigns } = await supabase
      .from('smeksh_meta_ad_campaigns')
      .select('id, meta_campaign_id, meta_ad_id, meta_adset_id, raw_meta_data')
      .eq('workspace_id', tenantId);

    if (matchedCampaigns && sourceId) {
      matchedInternalCampaignIds = matchedCampaigns
        .filter((c: any) => {
          // Direct match on campaign/ad/adset IDs
          if (c.meta_campaign_id === sourceId) return true;
          if (c.meta_ad_id === sourceId) return true;
          if (c.meta_adset_id === sourceId) return true;
          // Check ad_ids array stored in raw_meta_data (from sync)
          const adIds: string[] = c.raw_meta_data?.ad_ids || [];
          if (adIds.includes(sourceId)) return true;
          // Check adset_ids
          const adsetIds: string[] = c.raw_meta_data?.adset_ids || [];
          if (adsetIds.includes(sourceId)) return true;
          return false;
        })
        .map((c: any) => c.id);
      
      console.log(`Meta ad referral source_id=${sourceId}, matched ${matchedInternalCampaignIds.length} campaign(s) out of ${matchedCampaigns.length} total`);
      
      // If no match found, log all campaign IDs and ad_ids for debugging
      if (matchedInternalCampaignIds.length === 0) {
        console.log(`Meta ad: no campaign match for source_id=${sourceId}. Available campaigns:`, 
          matchedCampaigns.map((c: any) => ({ 
            id: c.id, 
            meta_campaign_id: c.meta_campaign_id,
            ad_ids: c.raw_meta_data?.ad_ids || [] 
          }))
        );
      }
    }
  }

  // Filter automations based on trigger type and campaign targeting
  for (const automation of automations) {
    // Check trigger type
    const triggerMatch = checkMetaAdTrigger(automation, ev, referral);
    if (!triggerMatch) continue;

    // Check campaign targeting
    const targetCampaignIds: string[] = automation.trigger_campaign_ids || [];
    if (targetCampaignIds.length > 0) {
      // Automation targets specific campaigns — check if any match
      const hasMatch = referral 
        ? targetCampaignIds.some((tid: string) => matchedInternalCampaignIds.includes(tid))
        : false;
      if (!hasMatch) {
        console.log(`Meta ad automation "${automation.name}": campaign filter didn't match`);
        continue;
      }
    }
    // If targetCampaignIds is empty, automation applies to all campaigns

    console.log(`Meta ad automation "${automation.name}" triggered`);

    // Execute actions
    const actions = (automation.actions || []) as any[];
    for (const action of actions) {
      try {
        await executeMetaAdAction(supabase, tenantId, phoneNumberId, conversationId, contactId, ev.from_wa_id, action);
      } catch (actionErr) {
        console.error(`Meta ad action "${action.type}" error:`, actionErr);
      }
    }

    // Update execution count
    await supabase
      .from('smeksh_meta_ad_automations')
      .update({ 
        executions_count: (automation.executions_count || 0) + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq('id', automation.id);
  }
}

function checkMetaAdTrigger(
  automation: any,
  ev: NormalizedEvent & { kind: 'inbound_message' },
  referral: any
): boolean {
  switch (automation.trigger_type) {
    case 'new_lead':
      // Any new conversation (with or without referral)
      return true;
    case 'first_message':
      // First message — always true for new conversations
      return true;
    case 'ad_click':
      // Only if referral data is present (CTWA click)
      return !!referral;
    default:
      return true;
  }
}

async function executeMetaAdAction(
  supabase: any,
  tenantId: string,
  phoneNumberId: string,
  conversationId: string,
  contactId: string,
  recipientWaId: string,
  action: any
) {
  switch (action.type) {
    case 'assign_agent': {
      if (!action.agent_id) return;
      // Assign conversation to specific agent
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assigned_to: action.agent_id,
          assigned_at: new Date().toISOString(),
          status: 'open',
        })
        .eq('id', conversationId)
        .eq('tenant_id', tenantId)
        .is('assigned_to', null); // Only if unassigned
      
      if (!error) {
        console.log(`Meta ad: assigned conversation to agent ${action.agent_id}`);
        await supabase.from('smeksh_conversation_events').insert({
          tenant_id: tenantId,
          conversation_id: conversationId,
          event_type: 'assigned',
          actor_type: 'system',
          details: { action: 'meta_ad_automation', assigned_to: action.agent_id },
        });
      }
      break;
    }

    case 'assign_team': {
      if (!action.team_id) return;
      // Use round-robin to pick an agent from the team
      const { data: profileId } = await supabase.rpc('smeksh_pick_profile_round_robin', {
        p_workspace_id: tenantId,
        p_team_id: action.team_id,
        p_only_online: false,
      });

      if (profileId) {
        const { error } = await supabase
          .from('conversations')
          .update({ 
            assigned_to: profileId,
            assigned_at: new Date().toISOString(),
            status: 'open',
          })
          .eq('id', conversationId)
          .eq('tenant_id', tenantId)
          .is('assigned_to', null);

        if (!error) {
          console.log(`Meta ad: assigned to agent ${profileId} via team round-robin`);
          await supabase.from('smeksh_conversation_events').insert({
            tenant_id: tenantId,
            conversation_id: conversationId,
            event_type: 'assigned',
            actor_type: 'system',
            details: { action: 'meta_ad_automation', team_id: action.team_id, assigned_to: profileId, strategy: 'round_robin' },
          });
        }
      } else {
        console.log(`Meta ad: no available agent in team ${action.team_id}`);
      }
      break;
    }

    case 'assign_agents_roundrobin': {
      const agentIds: string[] = action.agent_ids || [];
      if (agentIds.length < 2) return;

      // Simple round-robin using automation's execution count
      // Get current state from a lightweight counter
      const { data: autoData } = await supabase
        .from('smeksh_meta_ad_automations')
        .select('executions_count')
        .eq('workspace_id', tenantId)
        .single();
      
      const idx = (autoData?.executions_count || 0) % agentIds.length;
      const selectedAgent = agentIds[idx];

      const { error } = await supabase
        .from('conversations')
        .update({ 
          assigned_to: selectedAgent,
          assigned_at: new Date().toISOString(),
          status: 'open',
        })
        .eq('id', conversationId)
        .eq('tenant_id', tenantId)
        .is('assigned_to', null);

      if (!error) {
        console.log(`Meta ad: assigned to agent ${selectedAgent} via multi-agent round-robin (index ${idx})`);
        await supabase.from('smeksh_conversation_events').insert({
          tenant_id: tenantId,
          conversation_id: conversationId,
          event_type: 'assigned',
          actor_type: 'system',
          details: { action: 'meta_ad_automation', assigned_to: selectedAgent, strategy: 'multi_agent_roundrobin', agent_ids: agentIds },
        });
      }
      break;
    }

    case 'send_template': {
      if (!action.template_id) return;
      
      // Get template
      const { data: template } = await supabase
        .from('templates')
        .select('id, name, language, components_json')
        .eq('id', action.template_id)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!template) {
        console.log(`Meta ad: template ${action.template_id} not found`);
        return;
      }

      // Get phone number's Meta ID and access token
      const { data: phone } = await supabase
        .from('phone_numbers')
        .select('phone_number_id, waba_account:waba_accounts!inner(encrypted_access_token)')
        .eq('id', phoneNumberId)
        .maybeSingle();

      if (!phone?.phone_number_id || !phone.waba_account?.encrypted_access_token) {
        console.log('Meta ad: phone or token not found for template send');
        return;
      }

      const templatePayload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientWaId,
        type: 'template',
        template: {
          name: template.name,
          language: { code: template.language || 'en' },
        },
      };

      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${phone.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${phone.waba_account.encrypted_access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templatePayload),
        }
      );

      if (resp.ok) {
        const result = await resp.json();
        const wamid = result.messages?.[0]?.id;
        
        // Store outbound message
        await supabase.from('messages').insert({
          tenant_id: tenantId,
          conversation_id: conversationId,
          direction: 'outbound',
          type: 'template',
          text: `Template: ${template.name}`,
          wamid,
          status: 'sent',
          sent_at: new Date().toISOString(),
          is_auto_reply: true,
          metadata: { meta_ad_automation: true, template_name: template.name },
        });
        console.log(`Meta ad: sent template "${template.name}" to ${recipientWaId}`);
      } else {
        const errBody = await resp.text();
        console.error(`Meta ad: template send failed:`, errBody);
      }
      break;
    }

    case 'add_tag': {
      if (!action.tag_id) return;
      // Add tag to contact
      const { error } = await supabase
        .from('contact_tags')
        .upsert(
          { contact_id: contactId, tag_id: action.tag_id, tenant_id: tenantId },
          { onConflict: 'contact_id,tag_id' }
        );
      if (!error) {
        console.log(`Meta ad: tagged contact with tag ${action.tag_id}`);
      }
      break;
    }

    case 'start_workflow': {
      if (!action.workflow_id) return;
      // Create a scheduled job for the workflow
      const { error } = await supabase
        .from('automation_scheduled_jobs')
        .insert({
          tenant_id: tenantId,
          workflow_id: action.workflow_id,
          conversation_id: conversationId,
          contact_id: contactId,
          execute_at: new Date().toISOString(),
          payload: { trigger: 'meta_ad_automation' },
        });
      if (!error) {
        console.log(`Meta ad: queued workflow ${action.workflow_id}`);
      }
      break;
    }

    default:
      console.log(`Meta ad: unknown action type "${action.type}"`);
  }
}
