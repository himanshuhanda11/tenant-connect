import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH = 'https://graph.facebook.com/v21.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);

  // GET = webhook verification challenge
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'smeksh_verify';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[leadgen-webhook] Verification successful');
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // POST = incoming leadgen events
  if (req.method === 'POST') {
    const rawBody = await req.text();
    const startTime = Date.now();

    // Verify signature
    const signatureHeader = req.headers.get('x-hub-signature-256');
    const signatureValid = await verifySignature(rawBody, signatureHeader);
    if (!signatureValid) {
      console.warn('[leadgen-webhook] Signature verification failed');
      // Continue processing (temporary bypass like whatsapp-webhook)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const entries = body?.entry || [];
    const results: any[] = [];

    for (const entry of entries) {
      const pageId = entry.id;
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'leadgen') continue;

        const leadgenData = change.value;
        const leadId = leadgenData?.leadgen_id?.toString();
        const formId = leadgenData?.form_id?.toString();
        const adId = leadgenData?.ad_id?.toString();
        const createdTime = leadgenData?.created_time;

        console.log(`[leadgen-webhook] Lead received: page=${pageId} form=${formId} lead=${leadId}`);

        // Log the raw event
        const eventRecord: any = {
          form_id: formId,
          lead_id: leadId,
          page_id: pageId,
          ad_id: adId,
          raw_payload: leadgenData,
          status: 'received',
        };

        // Find workspace by facebook_page_id
        const { data: metaAccounts } = await supabase
          .from('smeksh_meta_ad_accounts')
          .select('workspace_id, meta_access_token, facebook_page_id')
          .eq('facebook_page_id', pageId);

        let tenantId: string | null = null;
        let accessToken: string | null = null;

        if (metaAccounts && metaAccounts.length > 0) {
          tenantId = metaAccounts[0].workspace_id;
          accessToken = metaAccounts[0].meta_access_token;
        }

        // Also check phone_numbers for page mapping
        if (!tenantId) {
          const { data: phoneNums } = await supabase
            .from('phone_numbers')
            .select('tenant_id')
            .limit(1);
          // Fallback: we'll use the lead_form_rules to find tenant
        }

        // Try to find matching lead form rule
        const { data: rules } = await supabase
          .from('lead_form_rules')
          .select('*')
          .eq('form_id', formId)
          .eq('enabled', true);

        if (rules && rules.length > 0) {
          tenantId = tenantId || rules[0].tenant_id;
        }

        eventRecord.tenant_id = tenantId;

        // Insert event log
        const { data: eventRow } = await supabase
          .from('lead_events')
          .insert(eventRecord)
          .select('id')
          .single();

        if (!tenantId) {
          console.warn(`[leadgen-webhook] No workspace found for page_id=${pageId}`);
          if (eventRow) {
            await supabase.from('lead_events').update({ status: 'failed', error_text: 'No workspace found for page' }).eq('id', eventRow.id);
          }
          continue;
        }

        // Update webhook subscription health
        await supabase.from('meta_webhook_subscriptions').upsert({
          tenant_id: tenantId,
          page_id: pageId,
          is_subscribed: true,
          last_event_at: new Date().toISOString(),
          event_count_24h: 1, // Will be incremented properly later
        }, { onConflict: 'tenant_id,page_id' });

        // Fetch lead details from Meta
        if (!accessToken) {
          // Try to get from WABA accounts
          const { data: waba } = await supabase
            .from('waba_accounts')
            .select('access_token')
            .eq('tenant_id', tenantId)
            .limit(1)
            .maybeSingle();
          
          if (waba?.access_token) accessToken = waba.access_token;
        }

        // Also try system user token
        if (!accessToken) {
          accessToken = Deno.env.get('META_SYSTEM_USER_TOKEN') || null;
        }

        if (!accessToken || !leadId) {
          console.warn(`[leadgen-webhook] No access token or lead ID`);
          if (eventRow) {
            await supabase.from('lead_events').update({ status: 'failed', error_text: 'No access token available' }).eq('id', eventRow.id);
          }
          continue;
        }

        // Fetch lead details from Meta Graph API
        let leadData: any = null;
        try {
          const leadRes = await fetch(
            `${GRAPH}/${leadId}?fields=field_data,created_time,ad_id,form_id,campaign_id&access_token=${accessToken}`
          );
          leadData = await leadRes.json();
          console.log(`[leadgen-webhook] Lead data fetched:`, JSON.stringify(leadData));
        } catch (err) {
          console.error(`[leadgen-webhook] Failed to fetch lead data:`, err);
          if (eventRow) {
            await supabase.from('lead_events').update({ status: 'failed', error_text: `Fetch failed: ${err}` }).eq('id', eventRow.id);
          }
          continue;
        }

        if (leadData?.error) {
          console.error(`[leadgen-webhook] Meta API error:`, leadData.error);
          if (eventRow) {
            await supabase.from('lead_events').update({ status: 'failed', error_text: `Meta API: ${leadData.error.message}` }).eq('id', eventRow.id);
          }
          continue;
        }

        // Normalize lead fields
        const normalized = normalizeLeadFields(leadData?.field_data || []);
        console.log(`[leadgen-webhook] Normalized:`, JSON.stringify(normalized));

        // Update event with normalized data
        if (eventRow) {
          await supabase.from('lead_events').update({ 
            normalized_data: normalized, 
            status: 'processing' 
          }).eq('id', eventRow.id);
        }

        // Junk filter
        const matchingRule = rules?.[0];
        if (matchingRule?.junk_filter_enabled && (!normalized.phone || !isValidPhone(normalized.phone))) {
          console.log(`[leadgen-webhook] Junk lead detected - invalid phone: ${normalized.phone}`);
          
          // Still create contact but mark as junk
          const contactResult = await upsertContact(supabase, tenantId, normalized, 'meta_lead_form', true);
          const convResult = await createConversation(supabase, tenantId, contactResult.contactId, normalized, formId, pageId, 'junk');

          if (eventRow) {
            await supabase.from('lead_events').update({ 
              status: 'skipped', 
              error_text: 'Junk: invalid phone',
              contact_id: contactResult.contactId,
              conversation_id: convResult.conversationId,
            }).eq('id', eventRow.id);
          }
          continue;
        }

        // Create/Update Contact
        const contactResult = await upsertContact(supabase, tenantId, normalized, 'meta_lead_form', false);
        console.log(`[leadgen-webhook] Contact upserted: ${contactResult.contactId}`);

        // Create Inbox Conversation
        const convResult = await createConversation(supabase, tenantId, contactResult.contactId, normalized, formId, pageId, 'new');
        console.log(`[leadgen-webhook] Conversation created: ${convResult.conversationId}`);

        // Insert activity message
        if (convResult.conversationId) {
          await supabase.from('messages').insert({
            tenant_id: tenantId,
            conversation_id: convResult.conversationId,
            contact_id: contactResult.contactId,
            direction: 'system',
            message_type: 'notification',
            text: `📋 Lead captured from Meta Lead Form\n\n${Object.entries(normalized).filter(([_, v]) => v).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`,
            is_auto_reply: true,
          });
        }

        // Run automation rule
        let messageId: string | null = null;
        if (matchingRule && convResult.conversationId) {
          try {
            messageId = await runAutomationRule(supabase, matchingRule, tenantId, contactResult.contactId, convResult.conversationId, normalized);
            
            // Update rule execution count
            await supabase.from('lead_form_rules').update({
              execution_count: (matchingRule.execution_count || 0) + 1,
              last_executed_at: new Date().toISOString(),
            }).eq('id', matchingRule.id);
          } catch (err) {
            console.error(`[leadgen-webhook] Automation rule failed:`, err);
          }
        }

        // Handle assignment
        if (matchingRule && convResult.conversationId) {
          await handleAssignment(supabase, matchingRule, tenantId, convResult.conversationId, normalized);
        }

        // Update lead form stats
        await supabase.from('meta_lead_forms').update({
          last_lead_at: new Date().toISOString(),
          lead_count: (await supabase.from('lead_events').select('id', { count: 'exact', head: true }).eq('form_id', formId).eq('tenant_id', tenantId).eq('status', 'success')).count || 0 + 1,
        }).eq('tenant_id', tenantId).eq('form_id', formId);

        const duration = Date.now() - startTime;
        if (eventRow) {
          await supabase.from('lead_events').update({
            status: 'success',
            contact_id: contactResult.contactId,
            conversation_id: convResult.conversationId,
            message_id: messageId,
            rule_id: matchingRule?.id,
            processing_duration_ms: duration,
          }).eq('id', eventRow.id);
        }

        results.push({ leadId, status: 'success', contactId: contactResult.contactId, conversationId: convResult.conversationId });
      }
    }

    return new Response(JSON.stringify({ received: true, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
});

// ===== Helper functions =====

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const appSecret = Deno.env.get('META_APP_SECRET');
  if (!appSecret) return true;
  if (!signatureHeader) return false;

  const parts = signatureHeader.split('=');
  if (parts[0] !== 'sha256') return false;
  const theirSig = parts.slice(1).join('=');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(appSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const ourSig = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (ourSig !== theirSig) {
    console.warn('[leadgen-webhook] Signature mismatch - continuing anyway');
    return true; // Temporary bypass
  }
  return true;
}

function normalizeLeadFields(fieldData: any[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const field of fieldData) {
    const name = field.name?.toLowerCase().replace(/\s+/g, '_') || '';
    const values = field.values || [];
    const value = values[0] || '';

    // Map common Meta field names
    if (name.includes('full_name') || name === 'name' || name.includes('first_name')) {
      result.name = result.name ? `${result.name} ${value}` : value;
    } else if (name.includes('last_name')) {
      result.name = result.name ? `${result.name} ${value}` : value;
    } else if (name.includes('email') || name === 'email') {
      result.email = value;
    } else if (name.includes('phone') || name.includes('mobile') || name === 'phone_number') {
      result.phone = normalizePhone(value);
    } else if (name.includes('city') || name.includes('location')) {
      result.city = value;
    } else if (name.includes('country')) {
      result.country_interest = value;
    } else {
      // Custom field - preserve with normalized key
      result[name] = value;
    }
  }

  return result;
}

function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Remove spaces, dashes, parens
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Ensure starts with +
  if (cleaned && !cleaned.startsWith('+')) {
    // Assume it needs a + prefix
    if (cleaned.startsWith('91') && cleaned.length >= 12) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 10) {
      cleaned = '+91' + cleaned; // Default to India
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\.+]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}

async function upsertContact(supabase: any, tenantId: string, normalized: Record<string, string>, source: string, isJunk: boolean) {
  const phone = normalized.phone;
  const waId = phone?.replace('+', '') || '';

  // Check if contact exists by phone
  let contactId: string | null = null;
  if (waId) {
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('wa_id', waId)
      .maybeSingle();

    if (existing) {
      contactId = existing.id;
      // Update with new data
      await supabase.from('contacts').update({
        name: normalized.name || undefined,
        email: normalized.email || undefined,
        updated_at: new Date().toISOString(),
      }).eq('id', contactId);
    }
  }

  if (!contactId) {
    const { data: newContact } = await supabase.from('contacts').insert({
      tenant_id: tenantId,
      name: normalized.name || 'Unknown Lead',
      phone: normalized.phone || null,
      wa_id: waId || null,
      email: normalized.email || null,
      source: source,
      opt_in: false,
      tags: [],
    }).select('id').single();

    contactId = newContact?.id;
  }

  return { contactId: contactId! };
}

async function createConversation(supabase: any, tenantId: string, contactId: string, normalized: Record<string, string>, formId: string | null, pageId: string | null, status: string) {
  // Check if conversation already exists for this contact
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Update existing conversation
    await supabase.from('conversations').update({
      crm_status: status === 'junk' ? 'junk' : 'new',
      last_message_at: new Date().toISOString(),
      last_message_preview: `📋 Lead from Meta form`,
      unread_count: 1,
      updated_at: new Date().toISOString(),
      source: 'meta_lead_form',
    }).eq('id', existing.id);

    return { conversationId: existing.id, isNew: false };
  }

  // Create new conversation
  const waId = normalized.phone?.replace('+', '') || '';
  const { data: conv } = await supabase.from('conversations').insert({
    tenant_id: tenantId,
    contact_id: contactId,
    contact_wa_id: waId,
    contact_name: normalized.name || 'Unknown Lead',
    source: 'meta_lead_form',
    status: 'new',
    crm_status: status === 'junk' ? 'junk' : 'new',
    last_message_at: new Date().toISOString(),
    last_message_preview: `📋 Lead from Meta form`,
    unread_count: 1,
  }).select('id').single();

  return { conversationId: conv?.id, isNew: true };
}

async function runAutomationRule(supabase: any, rule: any, tenantId: string, contactId: string, conversationId: string, normalized: Record<string, string>): Promise<string | null> {
  if (rule.reply_mode === 'template' && rule.template_id && rule.phone_number_id) {
    // Get template details
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', rule.template_id)
      .single();

    if (!template) {
      console.warn('[leadgen-webhook] Template not found:', rule.template_id);
      return null;
    }

    // Get phone number details  
    const { data: phoneNum } = await supabase
      .from('phone_numbers')
      .select('meta_phone_number_id')
      .eq('id', rule.phone_number_id)
      .single();

    if (!phoneNum?.meta_phone_number_id) {
      console.warn('[leadgen-webhook] Phone number not found:', rule.phone_number_id);
      return null;
    }

    // Get WABA access token
    const { data: waba } = await supabase
      .from('waba_accounts')
      .select('access_token')
      .eq('tenant_id', tenantId)
      .limit(1)
      .maybeSingle();

    let token = waba?.access_token || Deno.env.get('META_SYSTEM_USER_TOKEN');
    if (!token) {
      console.warn('[leadgen-webhook] No WABA token available');
      return null;
    }

    // Build template components with field mapping
    const fieldMapping = rule.field_mapping || {};
    const components = buildTemplateComponents(template, normalized, fieldMapping);

    const toWaId = normalized.phone?.replace('+', '') || '';
    if (!toWaId) {
      console.warn('[leadgen-webhook] No phone number to send to');
      return null;
    }

    // Send template message via Meta API
    const sendPayload = {
      messaging_product: 'whatsapp',
      to: toWaId,
      type: 'template',
      template: {
        name: template.template_name || template.name,
        language: { code: template.language || 'en' },
        components: components.length > 0 ? components : undefined,
      },
    };

    console.log(`[leadgen-webhook] Sending template to ${toWaId}:`, JSON.stringify(sendPayload));

    const sendRes = await fetch(
      `${GRAPH}/${phoneNum.meta_phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendPayload),
      }
    );

    const sendData = await sendRes.json();
    console.log(`[leadgen-webhook] Send result:`, JSON.stringify(sendData));

    if (sendData?.error) {
      console.error(`[leadgen-webhook] Send failed:`, sendData.error);
      return null;
    }

    const wamid = sendData?.messages?.[0]?.id;

    // Store outgoing message in inbox
    const { data: msgRow } = await supabase.from('messages').insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      contact_id: contactId,
      direction: 'outbound',
      message_type: 'template',
      text: `Template: ${template.template_name || template.name}`,
      wamid: wamid,
      status: 'sent',
      is_auto_reply: true,
    }).select('id').single();

    // Update conversation
    await supabase.from('conversations').update({
      last_message_at: new Date().toISOString(),
      last_message_preview: `📤 Auto-reply sent`,
      status: 'open',
      crm_status: 'contacted',
      updated_at: new Date().toISOString(),
    }).eq('id', conversationId);

    return msgRow?.id || null;
  }

  return null;
}

function buildTemplateComponents(template: any, normalized: Record<string, string>, fieldMapping: Record<string, string>): any[] {
  const components: any[] = [];

  // Parse template components to find variables
  const templateComponents = template.components_json || [];
  
  for (const comp of templateComponents) {
    if (comp.type === 'BODY' && comp.text) {
      // Find {{1}}, {{2}}, etc. patterns
      const varMatches = comp.text.match(/\{\{(\d+)\}\}/g);
      if (varMatches) {
        const parameters = varMatches.map((match: string) => {
          const varNum = match.replace(/[{}]/g, '');
          const mappedField = fieldMapping[`body_${varNum}`] || fieldMapping[varNum] || '';
          const value = normalized[mappedField] || mappedField || normalized.name || 'there';
          return { type: 'text', text: value };
        });
        components.push({ type: 'body', parameters });
      }
    }
    
    if (comp.type === 'HEADER' && comp.format === 'TEXT' && comp.text?.includes('{{')) {
      const varMatches = comp.text.match(/\{\{(\d+)\}\}/g);
      if (varMatches) {
        const parameters = varMatches.map((match: string) => {
          const varNum = match.replace(/[{}]/g, '');
          const mappedField = fieldMapping[`header_${varNum}`] || '';
          return { type: 'text', text: normalized[mappedField] || normalized.name || 'there' };
        });
        components.push({ type: 'header', parameters });
      }
    }
  }

  return components;
}

async function handleAssignment(supabase: any, rule: any, tenantId: string, conversationId: string, normalized: Record<string, string>) {
  if (rule.assignment_mode === 'specific_agent' && rule.assign_to_user_id) {
    await supabase.from('conversations').update({
      assigned_to: rule.assign_to_user_id,
      assigned_at: new Date().toISOString(),
    }).eq('id', conversationId);
  } else if (rule.assignment_mode === 'round_robin' && rule.assign_to_team_id) {
    // Use existing round robin function
    await supabase.rpc('smeksh_auto_route_conversation', {
      p_workspace_id: tenantId,
      p_conversation_id: conversationId,
      p_trigger_event: 'new_conversation',
      p_only_if_unassigned: true,
    });
  } else if (rule.assignment_mode === 'by_country') {
    // Could be extended with country-based routing
    // For now, fall back to round robin
    await supabase.rpc('smeksh_auto_route_conversation', {
      p_workspace_id: tenantId,
      p_conversation_id: conversationId,
      p_trigger_event: 'new_conversation',
      p_only_if_unassigned: true,
    });
  }
}
