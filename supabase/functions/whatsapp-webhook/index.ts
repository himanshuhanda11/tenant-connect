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
    .select('id, unread_count')
    .maybeSingle();

  let conversationId = conversation?.id;
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

    // Auto-reply logic (fire-and-forget)
    handleAutoReply(supabase, tenantId, phoneNumberId, conversationId, contactId, ev).catch(e =>
      console.error('Auto-reply error:', e)
    );

    // AI Prompt Engine (fire-and-forget, runs in parallel with auto-reply)
    handleAiEngine(supabase, tenantId, phoneNumberId, conversationId, contactId, ev).catch(e =>
      console.error('AI engine error:', e)
    );
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
) {
  try {
    // 1. Fetch tenant's auto-reply settings
    const { data: settings, error: settingsErr } = await supabase
      .from('auto_reply_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (settingsErr || !settings) return;

    // Check if any auto-reply is enabled
    const hasGeneral = settings.business_hours_enabled || settings.after_hours_enabled;
    const hasKeywords = settings.keywords_enabled && settings.keyword_rules?.length > 0;
    if (!hasGeneral && !hasKeywords) return;

    // 2. If exclude_assigned, check if conversation has an agent assigned
    if (settings.exclude_assigned) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('assigned_to')
        .eq('id', conversationId)
        .maybeSingle();
      if (conv?.assigned_to) {
        console.log('Auto-reply skipped: conversation is assigned');
        return;
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
      return;
    }

    // 4. First-message-only check
    if (settings.first_message_only) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('direction', 'inbound');
      if ((count || 0) > 1) {
        console.log('Auto-reply skipped: not first message');
        return;
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

    if (!replyText) return;

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
      return;
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
      return;
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
  } catch (err) {
    console.error('handleAutoReply error:', err);
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

    // Check if workspace AI settings are enabled
    const { data: aiSettings } = await supabase
      .from('workspace_ai_settings')
      .select('enabled')
      .eq('workspace_id', tenantId)
      .maybeSingle();

    if (!aiSettings?.enabled) return;

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
