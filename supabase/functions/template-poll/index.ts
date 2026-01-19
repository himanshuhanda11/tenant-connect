import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PollRequest {
  submissionId: string;
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
    const payload = await req.json() as PollRequest;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get submission with version and template
    const { data: sub, error: sErr } = await adminClient
      .from("wa_template_submissions")
      .select(`
        *,
        wa_template_versions!inner (
          template_id,
          wa_templates!inner (
            id,
            name,
            meta_template_name,
            workspace_id
          )
        )
      `)
      .eq("id", payload.submissionId)
      .single();

    if (sErr || !sub) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const templateId = sub.wa_template_versions?.template_id;
    const template = sub.wa_template_versions?.wa_templates;
    
    if (!templateId || !template) {
      return new Response(JSON.stringify({ error: "Missing template reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get access token from phone_numbers
    const { data: phoneNumber, error: phoneErr } = await adminClient
      .from("phone_numbers")
      .select("access_token")
      .eq("waba_id", sub.meta_waba_id)
      .limit(1)
      .single();

    if (phoneErr || !phoneNumber?.access_token) {
      return new Response(JSON.stringify({ 
        error: "No access token found for WABA" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = phoneNumber.access_token;
    const templateName = template.meta_template_name || template.name;

    // Poll Meta for template status
    const graphVersion = "v20.0";
    const pollUrl = `https://graph.facebook.com/${graphVersion}/${sub.meta_waba_id}/message_templates?name=${encodeURIComponent(templateName.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}`;

    const metaRes = await fetch(pollUrl, {
      headers: { 
        "Authorization": `Bearer ${accessToken}` 
      },
    });

    const metaJson = await metaRes.json();
    console.log("Poll response:", JSON.stringify(metaJson, null, 2));

    // Parse status from response
    let newStatus: "UNDER_REVIEW" | "APPROVED" | "REJECTED" = "UNDER_REVIEW";
    let rejectionReason: string | null = null;

    const templates = metaJson?.data || [];
    const matchingTemplate = templates.find((t: any) => 
      t.name === templateName.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    );

    if (matchingTemplate) {
      const metaStatus = matchingTemplate.status?.toUpperCase();
      
      if (metaStatus === "APPROVED") {
        newStatus = "APPROVED";
      } else if (metaStatus === "REJECTED") {
        newStatus = "REJECTED";
        rejectionReason = matchingTemplate.rejected_reason || "Template rejected by Meta";
      } else if (metaStatus === "PENDING" || metaStatus === "IN_APPEAL") {
        newStatus = "UNDER_REVIEW";
      }
    }

    // Determine next poll time
    const shouldContinuePolling = newStatus === "UNDER_REVIEW" && sub.poll_attempts < 48; // Max 48 polls (4 hours at 5min intervals)
    const nextPollAt = shouldContinuePolling
      ? new Date(Date.now() + 5 * 60_000).toISOString() // 5 minutes
      : null;

    // Update submission
    await adminClient
      .from("wa_template_submissions")
      .update({
        meta_status: newStatus,
        meta_response: metaJson,
        meta_rejection_reason: rejectionReason,
        last_polled_at: new Date().toISOString(),
        next_poll_at: nextPollAt,
        poll_attempts: (sub.poll_attempts || 0) + 1,
      })
      .eq("id", payload.submissionId);

    // Update template status
    await adminClient
      .from("wa_templates")
      .update({
        status: newStatus,
        meta_last_status_at: new Date().toISOString(),
      })
      .eq("id", templateId);

    // Log status change event
    await adminClient.from("wa_template_events").insert({
      template_id: templateId,
      kind: "STATUS_CHANGE",
      status: newStatus,
      message: newStatus === "APPROVED" 
        ? "Template approved by Meta! Ready to use."
        : newStatus === "REJECTED"
        ? `Template rejected: ${rejectionReason}`
        : "Template still under review by Meta",
      payload: { meta: metaJson, poll_attempt: (sub.poll_attempts || 0) + 1 },
    });

    return new Response(JSON.stringify({ 
      ok: true, 
      status: newStatus,
      rejectionReason,
      pollAttempts: (sub.poll_attempts || 0) + 1,
      nextPollAt,
      meta: metaJson,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Poll error:", e);
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      message: String(e) 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});