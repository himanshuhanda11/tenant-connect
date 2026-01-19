import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmitRequest {
  workspaceId: string;
  templateId: string;
  templateVersionId: string;
  metaWabaId: string;
}

interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  example?: { header_text?: string[]; body_text?: string[][] };
  buttons?: Array<{
    type: "URL" | "PHONE_NUMBER" | "QUICK_REPLY";
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json() as SubmitRequest;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);
    
    // Get Meta access token from phone_numbers table
    const { data: phoneNumbers, error: phoneErr } = await adminClient
      .from("phone_numbers")
      .select("access_token")
      .eq("waba_id", payload.metaWabaId)
      .limit(1)
      .single();
    
    if (phoneErr || !phoneNumbers?.access_token) {
      return new Response(JSON.stringify({ 
        error: "No access token found for WABA. Please reconnect your WhatsApp Business Account." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const accessToken = phoneNumbers.access_token;
    
    // Load template version
    const { data: version, error: vErr } = await adminClient
      .from("wa_template_versions")
      .select("*")
      .eq("id", payload.templateVersionId)
      .single();

    if (vErr || !version) {
      return new Response(JSON.stringify({ error: "Template version not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load template
    const { data: tpl, error: tErr } = await adminClient
      .from("wa_templates")
      .select("*")
      .eq("id", payload.templateId)
      .single();

    if (tErr || !tpl) {
      return new Response(JSON.stringify({ error: "Template not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build Meta API components
    const components: TemplateComponent[] = [];
    
    // Header component
    const header = version.header as { type?: string; text?: string; example?: string } | null;
    if (header && header.type && header.type !== "none") {
      const headerComponent: TemplateComponent = {
        type: "HEADER",
        format: header.type.toUpperCase() as "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT",
      };
      
      if (header.type === "text" && header.text) {
        headerComponent.text = header.text;
        if (header.example) {
          headerComponent.example = { header_text: [header.example] };
        }
      }
      
      components.push(headerComponent);
    }
    
    // Body component
    const exampleValues = version.example_values as Record<string, string> || {};
    const bodyExamples = Object.values(exampleValues);
    
    components.push({
      type: "BODY",
      text: version.body,
      example: bodyExamples.length > 0 ? { body_text: [bodyExamples] } : undefined,
    });
    
    // Footer component
    if (version.footer) {
      components.push({
        type: "FOOTER",
        text: version.footer,
      });
    }
    
    // Buttons component
    const buttons = version.buttons as Array<{ type: string; text: string; url?: string; phone_number?: string }> || [];
    if (buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttons.map(btn => ({
          type: btn.type as "URL" | "PHONE_NUMBER" | "QUICK_REPLY",
          text: btn.text,
          url: btn.url,
          phone_number: btn.phone_number,
        })),
      });
    }

    // Build Meta request payload
    const templateName = (tpl.meta_template_name || tpl.name)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .substring(0, 512);
    
    const metaPayload = {
      name: templateName,
      language: tpl.language,
      category: tpl.category,
      components,
    };

    // Submit to Meta Graph API
    const graphVersion = "v20.0";
    const submitUrl = `https://graph.facebook.com/${graphVersion}/${payload.metaWabaId}/message_templates`;

    console.log("Submitting to Meta:", submitUrl, JSON.stringify(metaPayload, null, 2));

    const metaRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(metaPayload),
    });

    const metaJson = await metaRes.json();
    console.log("Meta response:", metaRes.status, JSON.stringify(metaJson, null, 2));

    const isSuccess = metaRes.ok;
    const newStatus = isSuccess ? "SUBMITTED" : "REJECTED";
    const rejectionReason = isSuccess ? null : (metaJson?.error?.message ?? "Meta submission failed");

    // Store submission record
    const { data: submission, error: subErr } = await adminClient
      .from("wa_template_submissions")
      .insert({
        template_version_id: payload.templateVersionId,
        workspace_id: payload.workspaceId,
        meta_waba_id: payload.metaWabaId,
        meta_response: metaJson,
        meta_status: newStatus,
        meta_rejection_reason: rejectionReason,
        next_poll_at: isSuccess ? new Date(Date.now() + 60_000).toISOString() : null,
      })
      .select("*")
      .single();

    if (subErr) {
      console.error("Failed to store submission:", subErr);
    }

    // Update template status
    await adminClient
      .from("wa_templates")
      .update({
        status: newStatus,
        meta_waba_id: payload.metaWabaId,
        meta_template_name: templateName,
        meta_template_id: metaJson?.id || null,
        meta_last_status_at: new Date().toISOString(),
      })
      .eq("id", payload.templateId);

    // Log event
    await adminClient.from("wa_template_events").insert({
      template_id: payload.templateId,
      kind: isSuccess ? "SUBMITTED" : "ERROR",
      status: newStatus,
      message: isSuccess ? "Submitted to Meta for review" : `Submission failed: ${rejectionReason}`,
      payload: { meta: metaJson, request: metaPayload },
    });

    return new Response(JSON.stringify({ 
      ok: isSuccess, 
      submission, 
      meta: metaJson,
      status: newStatus,
      rejectionReason,
    }), {
      status: isSuccess ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Submit error:", e);
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      message: String(e) 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});