// email-ai-compose — rewrites/improves an email draft.
// Body: { text: string, action: "improve"|"shorten"|"friendlier"|"professional"|"translate", language?: string }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { callAI, extractText } from "../_shared/email-ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPTS: Record<string, string> = {
  improve: "Rewrite this email reply to be clearer, more polished, and more effective. Keep the same intent.",
  shorten: "Shorten this email reply to the essentials. Keep tone. Max 60 words.",
  friendlier: "Rewrite to sound warmer and more friendly while staying professional.",
  professional: "Rewrite to sound more formal and professional.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  if (!req.headers.get("Authorization")) return json({ error: "unauthorized" }, 401);

  try {
    const { text, action, language } = await req.json();
    if (!text || typeof text !== "string") return json({ error: "text required" }, 400);
    if (text.length > 8000) return json({ error: "text_too_long" }, 400);

    let systemPrompt: string;
    if (action === "translate") {
      systemPrompt = `Translate this email reply into ${language || "English"}. Return only the translation, no commentary.`;
    } else {
      systemPrompt = PROMPTS[action] || PROMPTS.improve;
      systemPrompt += " Return only the rewritten body, no preamble, no quotes.";
    }

    const ai = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.4,
    });

    return json({ ok: true, text: extractText(ai).trim() });
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
