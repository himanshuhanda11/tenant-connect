// email-ai-summarize — TL;DR of a thread.
// Body: { conversation_id: string }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callAI, extractText, stripHtml } from "../_shared/email-ai.ts";

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
    const { conversation_id } = await req.json();
    if (!conversation_id) return json({ error: "conversation_id required" }, 400);

    const { data: conv } = await supabase
      .from("email_conversations")
      .select("id, subject, tenant_id")
      .eq("id", conversation_id)
      .single();
    if (!conv) return json({ error: "not_found" }, 404);

    const { data: msgs } = await supabase
      .from("email_messages")
      .select("direction, from_email, body_text, body_html, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(40);

    const thread = (msgs || []).map((m) =>
      `[${m.direction.toUpperCase()} ${new Date(m.created_at).toISOString().slice(0,10)}] ${m.body_text || stripHtml(m.body_html)}`
    ).join("\n\n");

    const ai = await callAI({
      messages: [
        { role: "system", content: "Summarize this customer email thread in 3-5 short bullet points covering: what the customer wants, what's been promised, what's blocking, the next action. Be terse." },
        { role: "user", content: `Subject: ${conv.subject ?? ""}\n\n${thread}` },
      ],
      temperature: 0.2,
    });

    const summary = extractText(ai);
    await supabase.from("email_ai_suggestions").insert({
      tenant_id: conv.tenant_id,
      conversation_id,
      kind: "summary",
      content: { summary },
      model: "google/gemini-3-flash-preview",
    });

    return json({ ok: true, summary });
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
