// email-ai-classify — sentiment + priority + tags + language for an inbound message.
// Body: { conversation_id: string, message_id?: string }
// Called from resend-inbound automation runner OR manually from UI.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callAI, extractToolArgs, stripHtml } from "../_shared/email-ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  // Use service role since this is called server-to-server from the inbound webhook.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    const { conversation_id, message_id } = await req.json();
    if (!conversation_id) return json({ error: "conversation_id required" }, 400);

    const { data: conv } = await supabase
      .from("email_conversations")
      .select("id, subject, tenant_id, tags, priority")
      .eq("id", conversation_id)
      .single();
    if (!conv) return json({ error: "not_found" }, 404);

    let msgQuery = supabase
      .from("email_messages")
      .select("body_text, body_html, subject, from_email")
      .eq("conversation_id", conversation_id)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1);
    if (message_id) msgQuery = supabase
      .from("email_messages")
      .select("body_text, body_html, subject, from_email")
      .eq("id", message_id);
    const { data: msgRows } = await msgQuery;
    const msg = msgRows?.[0];
    if (!msg) return json({ error: "no_inbound_message" }, 404);

    const text = msg.body_text || stripHtml(msg.body_html);
    const ai = await callAI({
      messages: [
        { role: "system", content: "Classify a customer email. Be concise." },
        {
          role: "user",
          content: `Subject: ${msg.subject ?? conv.subject ?? ""}\nFrom: ${msg.from_email ?? ""}\n\nBody:\n${text}`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "classify",
          description: "Email classification",
          parameters: {
            type: "object",
            properties: {
              sentiment: { type: "string", enum: ["positive", "neutral", "negative", "frustrated", "urgent"] },
              priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
              category: { type: "string", description: "One short label e.g. 'billing', 'bug', 'feature-request', 'sales', 'spam'" },
              tags: { type: "array", items: { type: "string" }, description: "0-4 lowercase tags" },
              language: { type: "string", description: "ISO 639-1 code, e.g. 'en', 'es', 'fr'" },
              is_question: { type: "boolean" },
            },
            required: ["sentiment", "priority", "category", "tags", "language", "is_question"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "classify" } },
      temperature: 0.1,
    });

    const result = extractToolArgs(ai) as null | {
      sentiment: string; priority: string; category: string;
      tags: string[]; language: string; is_question: boolean;
    };
    if (!result) return json({ error: "ai_no_output" }, 502);

    // Persist suggestion
    await supabase.from("email_ai_suggestions").insert({
      tenant_id: conv.tenant_id,
      conversation_id,
      kind: "classification",
      content: result,
      model: "google/gemini-3-flash-preview",
    });

    // Apply tags + priority to conversation (additive)
    const newTags = Array.from(new Set([...(conv.tags || []), result.category, ...result.tags].filter(Boolean)));
    const priorityRank: Record<string, number> = { low: 1, normal: 2, high: 3, urgent: 4 };
    const newPriority = (priorityRank[result.priority] ?? 2) > (priorityRank[conv.priority as string] ?? 2)
      ? result.priority
      : conv.priority;

    await supabase.from("email_conversations").update({
      tags: newTags,
      priority: newPriority,
    }).eq("id", conversation_id);

    return json({ ok: true, classification: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "rate_limited") return json({ error: "rate_limited" }, 429);
    if (msg === "payment_required") return json({ error: "payment_required" }, 402);
    return json({ error: msg }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
