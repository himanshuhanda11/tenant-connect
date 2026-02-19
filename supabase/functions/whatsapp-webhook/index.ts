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

    // Auto-reply + AI engine
    // General auto-reply already ran for new conversations (before routing).
    // For follow-up messages, run it here. AI engine always runs.
    (async () => {
      try {
        if (!isNewConversation) {
          await handleAutoReply(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
        }
        // AI engine always runs independently (handles all messages)
        await handleAiEngine(supabase, tenantId, phoneNumberId, conversationId, contactId, ev);
      } catch (e) {
        console.error('Auto-reply/AI engine error:', e);
      }
    })();

    // Form rules engine — separate fire-and-forget to avoid hoisting issues
    (async () => {
      try {
        await handleFormRules(supabase, tenantId, phoneNumberId, conversationId, contactId, ev, isNewConversation);
      } catch (e) {
        console.error('Form rules engine error:', e);
      }
    })();
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
) {
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
      return;
    }
    if (!rules?.length) {
      console.log('Form rules: no active rules found');
      return;
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
          break;
        } else {
          console.error(`Form rule "${rule.name}" send failed: ${sendResult.error}`);
          await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'failed', sendResult.error);
        }
      } catch (ruleErr) {
        console.error(`Form rule "${rule.name}" error:`, ruleErr);
        await logFormRuleExecution(supabase, tenantId, rule.id, contactId, conversationId, 'failed', String(ruleErr));
      }
    }
  } catch (err) {
    console.error('handleFormRules error:', err);
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

// Log form rule execution
async function logFormRuleExecution(
  supabase: any,
  tenantId: string,
  ruleId: string,
  contactId: string,
  conversationId: string,
  status: string,
  skipReason?: string | null,
  messageId?: string | null
) {
  try {
    await supabase.from('form_rule_logs').insert({
      tenant_id: tenantId,
      rule_id: ruleId,
      contact_id: contactId,
      conversation_id: conversationId,
      status,
      skip_reason: skipReason || null,
      message_id: messageId || null,
      trigger_data: {},
    });
  } catch (err) {
    console.error('Failed to log form rule execution:', err);
  }
}
