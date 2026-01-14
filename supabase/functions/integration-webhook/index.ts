import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain, x-razorpay-signature, x-razorpay-event-id',
};

// Provider-specific signature verification
async function verifyShopifySignature(rawBody: string, secret: string, hmacHeader: string): Promise<boolean> {
  if (!secret || !hmacHeader) return false;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return computedHmac === hmacHeader;
}

async function verifyRazorpaySignature(rawBody: string, secret: string, signatureHeader: string): Promise<boolean> {
  if (!secret || !signatureHeader) return false;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return computedHex === signatureHeader;
}

function verifyLeadSquaredSignature(authHeader: string | null, secret: string): boolean {
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

// Normalize events from different providers
interface NormalizedEvent {
  eventType: string;
  providerEventId: string | null;
  payload: Record<string, any>;
}

function normalizeShopifyEvent(payload: any, headers: Headers): NormalizedEvent {
  const topic = headers.get("x-shopify-topic") || "unknown";
  const id = payload?.id ? String(payload.id) : null;
  
  return {
    eventType: `shopify.${topic.replace(/\//g, ".")}`,
    providerEventId: id,
    payload: payload || {},
  };
}

function normalizeRazorpayEvent(payload: any): NormalizedEvent {
  const eventType = payload?.event || "unknown";
  const id = payload?.payload?.payment?.entity?.id || 
             payload?.payload?.invoice?.entity?.id || null;
  
  return {
    eventType: `razorpay.${eventType}`,
    providerEventId: id ? String(id) : null,
    payload: payload || {},
  };
}

function normalizeLeadSquaredEvent(payload: any): NormalizedEvent {
  const eventType = payload?.eventType || payload?.EventType || "unknown";
  const leadId = payload?.leadId || payload?.LeadId || payload?.ProspectID;
  
  return {
    eventType: `leadsquared.${eventType}`,
    providerEventId: leadId ? String(leadId) : null,
    payload: payload || {},
  };
}

function normalizeZapierEvent(payload: any): NormalizedEvent {
  const eventType = payload?.event_type || payload?.eventType || "trigger";
  const id = payload?.id ? String(payload.id) : null;
  
  return {
    eventType: `zapier.${eventType}`,
    providerEventId: id,
    payload: payload || {},
  };
}

function normalizePabblyEvent(payload: any): NormalizedEvent {
  const eventType = payload?.event_type || "trigger";
  
  return {
    eventType: `pabbly.${eventType}`,
    providerEventId: null,
    payload: payload || {},
  };
}

function normalizeWooCommerceEvent(payload: any, headers: Headers): NormalizedEvent {
  const topic = headers.get("x-wc-webhook-topic") || "unknown";
  const id = payload?.id ? String(payload.id) : null;
  
  return {
    eventType: `woocommerce.${topic.replace(/\./g, "_")}`,
    providerEventId: id,
    payload: payload || {},
  };
}

function normalizePayUEvent(payload: any): NormalizedEvent {
  const status = payload?.status || "unknown";
  const txnId = payload?.txnid || payload?.mihpayid;
  
  return {
    eventType: `payu.payment_${status.toLowerCase()}`,
    providerEventId: txnId ? String(txnId) : null,
    payload: payload || {},
  };
}

// Variable extraction from payload using dot notation
function extractVariable(payload: Record<string, any>, path: string): any {
  const parts = path.split(".");
  let current: any = payload;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    
    // Handle array notation like items[0]
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current[key];
      if (Array.isArray(current)) {
        current = current[parseInt(index, 10)];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }
  
  return current;
}

// Process event mappings and execute actions
async function processEventMappings(
  supabase: any,
  tenantIntegrationId: string,
  tenantId: string,
  event: NormalizedEvent
): Promise<{ success: boolean; actionsExecuted: number; errors: string[] }> {
  const errors: string[] = [];
  let actionsExecuted = 0;
  
  // Fetch active mappings for this event type
  const { data: mappings, error: mappingsError } = await supabase
    .from("event_action_mappings")
    .select("*")
    .eq("tenant_integration_id", tenantIntegrationId)
    .eq("event_type", event.eventType)
    .eq("is_active", true)
    .order("priority", { ascending: true });
  
  if (mappingsError) {
    console.error("Error fetching mappings:", mappingsError);
    errors.push(`Failed to fetch mappings: ${mappingsError.message}`);
    return { success: false, actionsExecuted: 0, errors };
  }
  
  if (!mappings || mappings.length === 0) {
    console.log(`No active mappings found for event type: ${event.eventType}`);
    return { success: true, actionsExecuted: 0, errors };
  }
  
  for (const mapping of mappings) {
    try {
      // Evaluate conditions if any
      if (mapping.conditions && Array.isArray(mapping.conditions)) {
        const conditionsMet = evaluateConditions(mapping.conditions, event.payload);
        if (!conditionsMet) {
          console.log(`Conditions not met for mapping ${mapping.id}`);
          continue;
        }
      }
      
      // Execute action
      const result = await executeAction(supabase, tenantId, mapping, event.payload);
      if (result.success) {
        actionsExecuted++;
      } else {
        errors.push(`Action ${mapping.id} failed: ${result.error}`);
      }
    } catch (e: any) {
      const errorMsg = e?.message || "Unknown error";
      errors.push(`Mapping ${mapping.id} error: ${errorMsg}`);
    }
  }
  
  return {
    success: errors.length === 0,
    actionsExecuted,
    errors,
  };
}

function evaluateConditions(conditions: any[], payload: Record<string, any>): boolean {
  for (const condition of conditions) {
    const { field, operator, value } = condition;
    const fieldValue = extractVariable(payload, field);
    
    switch (operator) {
      case "equals":
        if (fieldValue !== value) return false;
        break;
      case "not_equals":
        if (fieldValue === value) return false;
        break;
      case "greater_than":
        if (typeof fieldValue !== "number" || fieldValue <= value) return false;
        break;
      case "less_than":
        if (typeof fieldValue !== "number" || fieldValue >= value) return false;
        break;
      case "contains":
        if (typeof fieldValue !== "string" || !fieldValue.includes(value)) return false;
        break;
      default:
        console.warn(`Unknown operator: ${operator}`);
    }
  }
  
  return true;
}

async function executeAction(
  supabase: any,
  tenantId: string,
  mapping: any,
  payload: Record<string, any>
): Promise<{ success: boolean; error?: string; result?: any }> {
  const actionType = mapping.action_type;
  const actionConfig = mapping.action_config || {};
  
  // Resolve variables from payload
  const resolvedVariables: Record<string, string> = {};
  const variableMappings = actionConfig?.variable_mappings;
  
  if (variableMappings) {
    for (const [templateVar, payloadPath] of Object.entries(variableMappings)) {
      const value = extractVariable(payload, payloadPath as string);
      resolvedVariables[templateVar] = value !== undefined ? String(value) : "";
    }
  }
  
  console.log(`Executing action: ${actionType}`, { actionConfig, resolvedVariables });
  
  switch (actionType) {
    case "send_template": {
      const templateId = actionConfig.template_id;
      const phoneField = actionConfig.phone_field || "phone";
      const recipientPhone = extractVariable(payload, phoneField);
      
      if (!recipientPhone) {
        return { success: false, error: "No recipient phone found in payload" };
      }
      
      // Get template details
      const { data: template, error: templateError } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();
      
      if (templateError || !template) {
        return { success: false, error: `Template not found: ${templateId}` };
      }
      
      console.log("Would send template:", {
        template: template.name,
        to: recipientPhone,
        variables: resolvedVariables,
      });
      
      // TODO: Integrate with send-template-message function
      return { success: true, result: { template: template.name, to: recipientPhone } };
    }
    
    case "trigger_flow": {
      const flowId = actionConfig.flow_id;
      const phoneField = actionConfig.phone_field || "phone";
      const recipientPhone = extractVariable(payload, phoneField);
      
      console.log("Would trigger flow:", { flowId, to: recipientPhone, variables: resolvedVariables });
      
      // TODO: Integrate with automation-event function
      return { success: true, result: { flowId, to: recipientPhone } };
    }
    
    case "add_tag": {
      const tagId = actionConfig.tag_id;
      const phoneField = actionConfig.phone_field || "phone";
      const phone = extractVariable(payload, phoneField);
      
      if (!phone) {
        return { success: false, error: "No phone found for tagging" };
      }
      
      // Find contact
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("wa_id", String(phone).replace(/\D/g, ""))
        .single();
      
      if (contact) {
        await supabase.from("contact_tags").upsert({
          contact_id: contact.id,
          tag_id: tagId,
        } as any, { onConflict: "contact_id,tag_id" });
      }
      
      return { success: true, result: { tagId, contactId: contact?.id } };
    }
    
    case "assign_agent": {
      const agentId = actionConfig.agent_id;
      const phoneField = actionConfig.phone_field || "phone";
      const phone = extractVariable(payload, phoneField);
      
      const { data: contact } = await supabase
        .from("contacts")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("wa_id", String(phone || "").replace(/\D/g, ""))
        .single();
      
      if (contact) {
        await supabase
          .from("contacts")
          .update({ assigned_agent_id: agentId } as any)
          .eq("id", contact.id);
      }
      
      return { success: true, result: { agentId, contactId: contact?.id } };
    }
    
    case "set_attribute": {
      const attributeKey = actionConfig.attribute_key;
      const attributeValue = actionConfig.attribute_value;
      const phoneField = actionConfig.phone_field || "phone";
      const phone = extractVariable(payload, phoneField);
      
      console.log("Would set attribute:", { attributeKey, attributeValue, phone });
      
      // TODO: Implement contact attributes
      return { success: true, result: { attributeKey, attributeValue } };
    }
    
    default:
      return { success: false, error: `Unknown action type: ${actionType}` };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Expected path: /integration-webhook/{tenantId}/{provider}
    if (pathParts.length < 2) {
      console.error("Invalid path:", url.pathname);
      return new Response(JSON.stringify({ error: "Invalid webhook path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Parse path: last two segments are tenantId and provider
    const provider = pathParts[pathParts.length - 1];
    const tenantId = pathParts[pathParts.length - 2];
    
    console.log(`Received webhook: provider=${provider}, tenantId=${tenantId}`);
    
    // Read raw body for signature verification
    const rawBody = await req.text();
    let payload: any;
    
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }
    
    // Find the tenant integration
    const { data: integration, error: integrationError } = await supabase
      .from("tenant_integrations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("integration_key", provider)
      .single();
    
    if (integrationError || !integration) {
      console.error("Integration not found:", integrationError);
      return new Response(JSON.stringify({ error: "Integration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (integration.status !== "connected") {
      console.warn("Integration not connected:", integration.status);
      return new Response(JSON.stringify({ error: "Integration not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Verify signature based on provider
    const credentials = integration.credentials as Record<string, any> || {};
    const webhookSecret = integration.webhook_secret || credentials?.webhook_secret || "";
    
    let signatureValid = false;
    
    switch (provider) {
      case "shopify":
        signatureValid = await verifyShopifySignature(
          rawBody,
          webhookSecret,
          req.headers.get("x-shopify-hmac-sha256") || ""
        );
        break;
        
      case "razorpay":
        signatureValid = await verifyRazorpaySignature(
          rawBody,
          webhookSecret,
          req.headers.get("x-razorpay-signature") || ""
        );
        break;
        
      case "leadsquared":
        signatureValid = verifyLeadSquaredSignature(
          req.headers.get("authorization"),
          webhookSecret
        );
        break;
        
      case "zapier":
      case "pabbly":
      case "integrately":
        // These typically use simple auth or none - URL is secret enough
        signatureValid = true;
        break;
        
      case "woocommerce":
        const wcSecret = req.headers.get("x-wc-webhook-signature") || "";
        if (wcSecret && webhookSecret) {
          signatureValid = await verifyShopifySignature(rawBody, webhookSecret, wcSecret);
        } else {
          signatureValid = true;
        }
        break;
        
      case "payu":
        // PayU typically uses IP allowlist + merchant key verification
        signatureValid = true;
        break;
        
      default:
        console.warn("Unknown provider, skipping signature check:", provider);
        signatureValid = true;
    }
    
    if (!signatureValid) {
      console.error("Invalid webhook signature for provider:", provider);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Normalize the event
    let normalizedEvent: NormalizedEvent;
    
    switch (provider) {
      case "shopify":
        normalizedEvent = normalizeShopifyEvent(payload, req.headers);
        break;
      case "razorpay":
        normalizedEvent = normalizeRazorpayEvent(payload);
        break;
      case "leadsquared":
        normalizedEvent = normalizeLeadSquaredEvent(payload);
        break;
      case "zapier":
        normalizedEvent = normalizeZapierEvent(payload);
        break;
      case "pabbly":
        normalizedEvent = normalizePabblyEvent(payload);
        break;
      case "woocommerce":
        normalizedEvent = normalizeWooCommerceEvent(payload, req.headers);
        break;
      case "payu":
        normalizedEvent = normalizePayUEvent(payload);
        break;
      default:
        normalizedEvent = {
          eventType: `${provider}.unknown`,
          providerEventId: null,
          payload: payload || {},
        };
    }
    
    console.log("Normalized event:", normalizedEvent.eventType, normalizedEvent.providerEventId);
    
    // Check for idempotency
    if (normalizedEvent.providerEventId) {
      const { data: existingEvent } = await supabase
        .from("integration_events")
        .select("id")
        .eq("tenant_integration_id", integration.id)
        .eq("event_id", normalizedEvent.providerEventId)
        .single();
      
      if (existingEvent) {
        console.log("Duplicate event, already processed:", normalizedEvent.providerEventId);
        return new Response(JSON.stringify({ ok: true, duplicate: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    // Store the event
    const { data: storedEvent, error: storeError } = await supabase
      .from("integration_events")
      .insert({
        tenant_id: tenantId,
        tenant_integration_id: integration.id,
        event_type: normalizedEvent.eventType,
        event_id: normalizedEvent.providerEventId,
        payload: normalizedEvent.payload,
        status: "received",
      } as any)
      .select()
      .single();
    
    if (storeError) {
      console.error("Failed to store event:", storeError);
      return new Response(JSON.stringify({ error: "Failed to store event" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Update integration last_event_at
    await supabase
      .from("tenant_integrations")
      .update({ 
        last_event_at: new Date().toISOString(),
        health_status: "healthy",
        error_count: 0,
        last_error: null,
      } as any)
      .eq("id", integration.id);
    
    // Process event (inline since Deno Deploy doesn't have waitUntil easily)
    try {
      await supabase
        .from("integration_events")
        .update({ 
          status: "processing",
          processing_started_at: new Date().toISOString(),
        } as any)
        .eq("id", storedEvent.id);
      
      const result = await processEventMappings(
        supabase,
        integration.id,
        tenantId,
        normalizedEvent
      );
      
      await supabase
        .from("integration_events")
        .update({
          status: result.success ? "processed" : "failed",
          processed_at: new Date().toISOString(),
          error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
        } as any)
        .eq("id", storedEvent.id);
      
      console.log("Event processed:", {
        eventId: storedEvent.id,
        actionsExecuted: result.actionsExecuted,
        errors: result.errors,
      });
    } catch (e: any) {
      const errorMsg = e?.message || "Unknown error";
      console.error("Event processing failed:", errorMsg);
      
      await supabase
        .from("integration_events")
        .update({
          status: "failed",
          error_message: errorMsg,
          retry_count: (storedEvent.retry_count || 0) + 1,
          next_retry_at: new Date(Date.now() + 60000).toISOString(),
        } as any)
        .eq("id", storedEvent.id);
      
      await supabase
        .from("tenant_integrations")
        .update({
          health_status: "degraded",
          error_count: (integration.error_count || 0) + 1,
          last_error: errorMsg,
        } as any)
        .eq("id", integration.id);
    }
    
    return new Response(JSON.stringify({ ok: true, eventId: storedEvent.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
