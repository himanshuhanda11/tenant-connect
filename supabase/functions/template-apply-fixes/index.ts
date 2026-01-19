import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApplyFixesRequest {
  workspaceId: string;
  templateId: string;
  templateVersionId: string;
  validationLogId?: string;
  action: "apply_all" | "apply_examples" | "apply_rewrite" | "change_category";
  newCategory?: "UTILITY" | "MARKETING" | "AUTHENTICATION";
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
    const payload = await req.json() as ApplyFixesRequest;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get current version
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

    // Get validation log if provided
    let validationLog: any = null;
    if (payload.validationLogId) {
      const { data, error } = await adminClient
        .from("wa_template_validation_logs")
        .select("*")
        .eq("id", payload.validationLogId)
        .single();
      
      if (!error && data) {
        validationLog = data;
      }
    } else {
      // Get latest validation log for this version
      const { data, error } = await adminClient
        .from("wa_template_validation_logs")
        .select("*")
        .eq("template_version_id", payload.templateVersionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data) {
        validationLog = data;
      }
    }

    const suggestions = validationLog?.suggestions || {};
    const updates: any = {};
    let templateUpdates: any = {};

    switch (payload.action) {
      case "apply_examples":
        if (suggestions.suggestedExamples) {
          const currentExamples = version.example_values || {};
          updates.example_values = {
            ...currentExamples,
            ...suggestions.suggestedExamples,
          };
        }
        break;

      case "apply_rewrite":
        if (suggestions.suggestedRewrite) {
          updates.body = suggestions.suggestedRewrite;
        }
        break;

      case "change_category":
        if (payload.newCategory) {
          templateUpdates.category = payload.newCategory;
        } else if (validationLog?.predicted_category) {
          templateUpdates.category = validationLog.predicted_category;
        }
        break;

      case "apply_all":
        if (suggestions.suggestedExamples) {
          const currentExamples = version.example_values || {};
          updates.example_values = {
            ...currentExamples,
            ...suggestions.suggestedExamples,
          };
        }
        if (suggestions.suggestedRewrite) {
          updates.body = suggestions.suggestedRewrite;
        }
        if (validationLog?.predicted_category && 
            validationLog.predicted_category !== validationLog.selected_category) {
          templateUpdates.category = validationLog.predicted_category;
        }
        break;
    }

    // Create new version with fixes
    if (Object.keys(updates).length > 0) {
      const { data: maxVersion } = await adminClient
        .from("wa_template_versions")
        .select("version")
        .eq("template_id", payload.templateId)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      const newVersionNum = (maxVersion?.version || 0) + 1;
      
      // Generate content hash
      const contentToHash = JSON.stringify({
        body: updates.body || version.body,
        header: version.header,
        footer: version.footer,
        buttons: version.buttons,
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(contentToHash);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const { data: newVersion, error: insertErr } = await adminClient
        .from("wa_template_versions")
        .insert({
          template_id: payload.templateId,
          version: newVersionNum,
          body: updates.body || version.body,
          header: version.header,
          footer: version.footer,
          buttons: version.buttons,
          variables: version.variables,
          example_values: updates.example_values || version.example_values,
          content_hash: contentHash,
        })
        .select()
        .single();

      if (insertErr) {
        return new Response(JSON.stringify({ error: "Failed to create new version", details: insertErr }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update template to point to new version
      templateUpdates.status = "DRAFT";
    }

    // Update template if needed
    if (Object.keys(templateUpdates).length > 0) {
      await adminClient
        .from("wa_templates")
        .update(templateUpdates)
        .eq("id", payload.templateId);
    }

    // Log the fix action
    await adminClient.from("wa_template_events").insert({
      template_id: payload.templateId,
      kind: "NOTE",
      message: `Applied fix: ${payload.action}`,
      payload: { 
        action: payload.action,
        updates,
        templateUpdates,
      },
    });

    return new Response(JSON.stringify({ 
      ok: true, 
      message: "Fixes applied successfully",
      updates,
      templateUpdates,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Apply fixes error:", e);
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      message: String(e) 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});