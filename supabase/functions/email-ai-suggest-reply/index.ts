// email-ai-suggest-reply — drafts 3 reply options for a conversation.
// Body: { conversation_id: string, tone?: "friendly"|"professional"|"short" }

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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  try {
    const { conversation_id, tone = "professional" } = await req.json();
    if (!conversation_id) return json({ error: "conversation_id required" }, 400);

    const { data: conv } = await supabase
      .from("email_conversations")
      .select("id, subject, from_email, from_name, tenant_id")
      .eq("id", conversation_id)
      .single();
    if (!conv) return json({ error: "not_found" }, 404);

    const { data: msgs } = await supabase
      .from("email_messages")
      .select("direction, from_email, body_text, body_html, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const thread = (msgs || []).map((m) => {
      const body = m.body_text || stripHtml(m.body_html);
      return `${m.direction === "inbound" ? "CUSTOMER" : "AGENT"}: ${body}`;
    }).join("\n\n---\n\n");

    const ai = await callAI({
      messages: [
        {
          role: "system",
          content:
            `You are an expert email customer-support agent. Read the thread and propose three short reply drafts. Tone: ${tone}. Each draft must be ready to send (no placeholders). Do not greet again if a greeting was already exchanged. Keep under 120 words.`,
        },
        {
          role: "user",
          content: `Subject: ${conv.subject ?? "(none)"}\nFrom: ${conv.from_name ?? ""} <${conv.from_email ?? ""}>\n\nThread:\n${thread}`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "propose_replies",
          description: "Return 3 reply drafts",
          parameters: {
            type: "object",
            properties: {
              replies: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string", description: "Short title like 'Helpful', 'Brief', 'Follow up'" },
                    body: { type: "string", description: "Plain text reply body" },
                  },
                  required: ["label", "body"],
                  additionalProperties: false,
                },
              },
            },
            required: ["replies"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "propose_replies" } },
    });

    const args = extractToolArgs(ai) as { replies: { label: string; body: string }[] } | null;
    if (!args?.replies) return json({ error: "ai_no_output" }, 502);

    // Persist
    await supabase.from("email_ai_suggestions").insert({
      tenant_id: conv.tenant_id,
      conversation_id,
      kind: "reply",
      content: args,
      model: "google/gemini-3-flash-preview",
    });

    return json({ ok: true, replies: args.replies });
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
