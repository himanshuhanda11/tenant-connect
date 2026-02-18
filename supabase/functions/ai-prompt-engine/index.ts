import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-platform-secret",
};

/* ────────── Types ────────── */

interface AiSettings {
  workspace_id: string;
  enabled: boolean;
  tone: string;
  response_length: string;
  require_agent_approval: boolean;
  fallback_to_template: boolean;
  fallback_message: string | null;
  qualification_mode: boolean;
  retry_missing_questions: boolean;
  max_retries: number;
  confidence_threshold: number;
  lead_objective: string;
  required_fields_schema: any;
  knowledge_base: string | null;
  auto_tag: boolean;
  auto_create_lead: boolean;
}

interface ExistingLead {
  id: string;
  lead_stage: string;
  captured: Record<string, any>;
  missing_fields: string[];
  retry_field: string | null;
  retry_attempt: number;
  intent: string | null;
  confidence: number | null;
}

interface LeadUpdate {
  intent: string;
  lead_stage: string;
  confidence: number;
  captured: Record<string, any>;
  missing_fields: string[];
  next_question: string;
  retry: { field: string | null; attempt: number };
  handoff_reason: string | null;
  tags: string[];
}

interface AiOutput {
  customer_message: string;
  lead_update: LeadUpdate;
}

/* ────────── Prompt Builder ────────── */

function buildSystemPrompt(
  settings: AiSettings,
  existingLead: ExistingLead | null,
  conversationHistory: { role: string; content: string }[]
): string {
  const lengthGuide: Record<string, string> = {
    short: "1-2 sentences",
    medium: "2-4 sentences",
    long: "4-7 sentences",
  };

  const objectiveLabel = settings.lead_objective.replace(/_/g, " ");
  const tone = settings.tone || "professional";
  const responseLen = lengthGuide[settings.response_length] || "2-4 sentences";

  // Parse required_fields_schema
  let fieldsSchema: Record<string, any> = {};
  if (settings.required_fields_schema) {
    if (typeof settings.required_fields_schema === "string") {
      try { fieldsSchema = JSON.parse(settings.required_fields_schema); } catch { /* noop */ }
    } else {
      fieldsSchema = settings.required_fields_schema;
    }
  }
  const fieldKeys = Object.keys(fieldsSchema);

  let prompt = `You are a ${tone} AI assistant for a business workspace.
Your primary objective is: ${objectiveLabel}.
Keep your customer-facing response to ${responseLen}.
Always respond in the SAME LANGUAGE the customer uses. If they write in Hindi, reply in Hindi. If English, reply in English.

You MUST output ONLY valid JSON (no markdown, no backticks, no explanation outside the JSON).
The JSON must follow this EXACT schema:

{
  "customer_message": "your conversational reply to the customer",
  "lead_update": {
    "intent": "detected intent string or 'unknown'",
    "lead_stage": "new|qualifying|qualified|needs_agent|unqualified",
    "confidence": 0.0 to 1.0,
    "captured": {},
    "missing_fields": [],
    "next_question": "next question to ask or empty string",
    "retry": {"field": null, "attempt": 0},
    "handoff_reason": null,
    "tags": []
  }
}`;

  // Knowledge base
  if (settings.knowledge_base) {
    prompt += `\n\n─── KNOWLEDGE BASE (use this to answer questions accurately) ───\n${settings.knowledge_base}\n─── END KNOWLEDGE BASE ───`;
  }

  // Qualification mode
  if (settings.qualification_mode && fieldKeys.length > 0) {
    prompt += `\n\n─── QUALIFICATION MODE ───\nYou must collect the following fields from the customer through natural conversation.\nAsk ONE field at a time. Do NOT ask multiple questions in one message.\n\nRequired fields schema:\n${JSON.stringify(fieldsSchema, null, 2)}\n\nRules:\n- For each message, extract any field values the customer provides into "captured".\n- List remaining uncollected fields in "missing_fields".\n- Set "next_question" to a natural conversational question for the NEXT missing field.\n- When ALL required fields are collected, set lead_stage to "qualified".\n- While collecting, set lead_stage to "qualifying".`;

    if (settings.retry_missing_questions) {
      prompt += `\n- If a customer does not answer a question, retry that field with different phrasing.\n- Track retries in "retry": {"field": "field_name", "attempt": N}.\n- Maximum retries per field: ${settings.max_retries}. After max retries for a field, skip it and move to the next.`;
    }

    prompt += `\n─── END QUALIFICATION MODE ───`;
  }

  // Existing lead context
  if (existingLead) {
    prompt += `\n\n─── CURRENT LEAD STATE ───\nStage: ${existingLead.lead_stage}\nPreviously captured data: ${JSON.stringify(existingLead.captured)}\nMissing fields: ${JSON.stringify(existingLead.missing_fields)}\n${existingLead.retry_field ? `Currently retrying field: "${existingLead.retry_field}" (attempt ${existingLead.retry_attempt})` : ""}\n─── END LEAD STATE ───\n\nIMPORTANT: Merge any new data from this message into the existing "captured" object. Do NOT discard previously captured data.`;
  }

  // Tagging
  if (settings.auto_tag) {
    prompt += `\n\n─── AUTO-TAGGING ───\nBased on the customer's intent and conversation, include relevant tags in the "tags" array.\nExamples: "interested", "pricing_inquiry", "support_needed", "high_intent", "cold_lead", "returning_customer"\nOnly include tags that are clearly supported by the conversation.\n─── END AUTO-TAGGING ───`;
  }

  // Confidence guidance
  prompt += `\n\n─── CONFIDENCE SCORING ───\nSet "confidence" between 0.0 and 1.0:\n- 0.9+: Very clear intent, all data captured, straightforward request\n- 0.7-0.9: Clear intent, some data captured, normal conversation\n- 0.5-0.7: Ambiguous intent, limited data, unclear request\n- Below 0.5: Cannot understand, off-topic, or potentially spam\n─── END CONFIDENCE SCORING ───`;

  // Handoff rules
  prompt += `\n\n─── HANDOFF RULES ───\nSet lead_stage to "needs_agent" and provide "handoff_reason" if:\n- Customer explicitly asks to speak to a human/agent\n- The question is outside your knowledge base and you cannot answer confidently\n- Sensitive topics (legal, medical, financial advice)\n- Customer is frustrated or angry\n- You've exhausted retry attempts on critical fields\n─── END HANDOFF RULES ───`;

  return prompt;
}

/* ────────── Main Handler ────────── */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      workspace_id,
      conversation_id,
      contact_id,
      phone_number_id,
      message,
      // Optional: called from webhook with service-level trust
      _service_call,
    } = await req.json();

    if (!workspace_id || !message) {
      return respond({ error: "workspace_id and message required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // If not a service call, verify the user
    if (!_service_call) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return respond({ error: "Unauthorized" }, 401);
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data, error } = await anonClient.auth.getClaims(authHeader.replace("Bearer ", ""));
      if (error || !data?.claims) return respond({ error: "Unauthorized" }, 401);
    }

    // 1. Fetch workspace AI settings
    const { data: settings, error: sErr } = await admin
      .from("workspace_ai_settings")
      .select("*")
      .eq("workspace_id", workspace_id)
      .maybeSingle();

    if (sErr || !settings || !settings.enabled) {
      return respond({ skipped: true, reason: "AI not enabled" });
    }

    // 2. Parallel fetches: conversation history + existing lead
    const [historyResult, leadResult] = await Promise.all([
      conversation_id
        ? admin
            .from("messages")
            .select("direction, text, type")
            .eq("conversation_id", conversation_id)
            .order("created_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] }),
      contact_id
        ? admin
            .from("qualified_leads")
            .select("*")
            .eq("workspace_id", workspace_id)
            .eq("contact_id", contact_id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const history = (historyResult.data || [])
      .reverse()
      .map((m: any) => ({
        role: m.direction === "inbound" ? "user" : "assistant",
        content: m.text || `[${m.type}]`,
      }));

    const existingLead: ExistingLead | null = leadResult.data || null;

    // 3. Build prompt
    const systemPrompt = buildSystemPrompt(settings as AiSettings, existingLead, history);

    // 4. Call AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return respond({ error: "LOVABLE_API_KEY not configured" }, 500);

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        temperature: 0.3,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      if (aiResp.status === 429) return respond({ error: "Rate limited, try again later" }, 429);
      if (aiResp.status === 402) return respond({ error: "AI credits exhausted" }, 402);
      return respond({ error: "AI gateway error" }, 500);
    }

    const aiData = await aiResp.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";

    // 5. Parse AI output
    // Strip markdown fences if present
    rawContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed: AiOutput;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI JSON output:", rawContent.substring(0, 500));
      // Fallback: treat entire response as customer message
      parsed = {
        customer_message: rawContent,
        lead_update: {
          intent: "unknown",
          lead_stage: "new",
          confidence: 0.5,
          captured: existingLead?.captured || {},
          missing_fields: [],
          next_question: "",
          retry: { field: null, attempt: 0 },
          handoff_reason: null,
          tags: [],
        },
      };
    }

    const lu = parsed.lead_update;
    const confidence = Math.min(1, Math.max(0, lu.confidence || 0));
    const threshold = Number(settings.confidence_threshold) || 0.7;

    // 6. Determine final reply text
    let replyText = parsed.customer_message || "";
    let usedFallback = false;

    if (confidence < threshold) {
      if (settings.fallback_to_template && settings.fallback_message) {
        replyText = settings.fallback_message;
        usedFallback = true;
      } else {
        // Mark as needs_agent
        lu.lead_stage = "needs_agent";
        lu.handoff_reason = lu.handoff_reason || "AI confidence below threshold";
      }
    }

    // 7. Upsert qualified_leads if auto_create_lead is ON
    let leadId: string | null = existingLead?.id || null;
    if (settings.auto_create_lead && contact_id) {
      const leadPayload = {
        workspace_id,
        contact_id,
        phone_number_id: phone_number_id || null,
        intent: lu.intent || "unknown",
        lead_stage: lu.lead_stage || "new",
        confidence,
        captured: {
          ...(existingLead?.captured || {}),
          ...(lu.captured || {}),
        },
        missing_fields: lu.missing_fields || [],
        next_question: lu.next_question || null,
        retry_field: lu.retry?.field || null,
        retry_attempt: lu.retry?.attempt || 0,
        handoff_reason: lu.handoff_reason || null,
        last_ai_message: replyText,
        updated_at: new Date().toISOString(),
      };

      if (existingLead?.id) {
        await admin
          .from("qualified_leads")
          .update(leadPayload)
          .eq("id", existingLead.id);
      } else {
        const { data: newLead } = await admin
          .from("qualified_leads")
          .insert(leadPayload)
          .select("id")
          .single();
        if (newLead) leadId = newLead.id;
      }
    }

    // 8. Handle agent approval vs direct send
    let draftId: string | null = null;
    let action: "send" | "draft" | "fallback_send" = "send";

    if (settings.require_agent_approval && !usedFallback) {
      // Create draft for approval
      action = "draft";
      const { data: draft } = await admin
        .from("ai_drafts")
        .insert({
          workspace_id,
          conversation_id: conversation_id || null,
          contact_id: contact_id || null,
          message_text: replyText,
          lead_update: lu,
          status: "pending",
        })
        .select("id")
        .single();
      if (draft) draftId = draft.id;
    } else if (usedFallback) {
      action = "fallback_send";
    }

    // 9. Auto-tag contacts
    if (settings.auto_tag && lu.tags?.length > 0 && contact_id) {
      // Fire-and-forget: add tags to contact
      tagContact(admin, workspace_id, contact_id, lu.tags).catch((e) =>
        console.error("Auto-tag error:", e)
      );
    }

    return respond({
      action,
      reply: replyText,
      confidence,
      lead_update: lu,
      lead_id: leadId,
      draft_id: draftId,
      used_fallback: usedFallback,
    });
  } catch (e) {
    console.error("ai-prompt-engine error:", e);
    return respond(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500
    );
  }
});

/* ────────── Helpers ────────── */

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function tagContact(
  admin: any,
  workspaceId: string,
  contactId: string,
  tags: string[]
) {
  for (const tagName of tags) {
    // Find or create tag
    const { data: existingTag } = await admin
      .from("tags")
      .select("id")
      .eq("tenant_id", workspaceId)
      .eq("name", tagName)
      .maybeSingle();

    let tagId: string;
    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag } = await admin
        .from("tags")
        .insert({ tenant_id: workspaceId, name: tagName, color: "#6366f1" })
        .select("id")
        .single();
      if (!newTag) continue;
      tagId = newTag.id;
    }

    // Link tag to contact (ignore duplicates)
    await admin
      .from("contact_tags")
      .upsert(
        { contact_id: contactId, tag_id: tagId, tenant_id: workspaceId },
        { onConflict: "contact_id,tag_id" }
      );
  }
}
