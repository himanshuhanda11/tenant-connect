import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) throw new Error("Unauthorized");

    const { tenant_id, message } = await req.json();
    if (!tenant_id || !message) throw new Error("tenant_id and message are required");

    // Fetch settings
    const { data: settings, error: settingsErr } = await admin
      .from("auto_reply_settings")
      .select("*")
      .eq("tenant_id", tenant_id)
      .maybeSingle();

    if (settingsErr) throw settingsErr;
    if (!settings) throw new Error("No auto-reply settings found for this workspace");

    const knowledgeBase = settings.ai_knowledge_base || "";
    const tone = settings.ai_tone || "professional";
    const length = settings.ai_response_length || "medium";
    const objective = settings.lead_objective || "lead_qualification";
    const qualMode = settings.qualification_mode || false;
    const requiredFieldsRaw = settings.required_fields_schema || "";
    const threshold = Number(settings.ai_confidence_threshold || 0.70);

    // Build system prompt
    const lengthGuide = { short: "1-2 sentences", medium: "2-4 sentences", long: "4-7 sentences" }[length] || "2-4 sentences";

    let systemPrompt = `You are a ${tone} AI assistant for a business.
Your objective: ${objective.replace(/_/g, " ")}.
Keep responses ${lengthGuide}.
${knowledgeBase ? `\n--- KNOWLEDGE BASE ---\n${knowledgeBase}\n--- END ---` : ""}`;

    if (qualMode && requiredFieldsRaw) {
      systemPrompt += `\n\nQUALIFICATION MODE: You must collect the following fields from the customer through natural conversation:\n${requiredFieldsRaw}\n\nAsk for missing fields one at a time. Be conversational, not robotic.`;
    }

    systemPrompt += `\n\nIMPORTANT: After your reply, output a JSON block on a NEW LINE starting with "LEAD_JSON:" containing any extracted lead data. Example:
LEAD_JSON:{"name":"John","email":"john@example.com"}
If no data extracted, output: LEAD_JSON:{}
Also output confidence as: CONFIDENCE:0.85`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      throw new Error(`AI gateway returned ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const fullContent = aiData.choices?.[0]?.message?.content || "";

    // Parse response
    let reply = fullContent;
    let extractedLead: Record<string, any> = {};
    let confidence = 0.75;

    // Extract LEAD_JSON
    const leadMatch = fullContent.match(/LEAD_JSON:\s*(\{.*\})/s);
    if (leadMatch) {
      try {
        extractedLead = JSON.parse(leadMatch[1]);
      } catch { /* ignore parse errors */ }
      reply = fullContent.replace(/LEAD_JSON:\s*\{.*\}/s, "").trim();
    }

    // Extract CONFIDENCE
    const confMatch = fullContent.match(/CONFIDENCE:\s*([\d.]+)/);
    if (confMatch) {
      confidence = parseFloat(confMatch[1]);
      reply = reply.replace(/CONFIDENCE:\s*[\d.]+/, "").trim();
    }

    return new Response(JSON.stringify({ reply, extractedLead, confidence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("test-ai-reply error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
