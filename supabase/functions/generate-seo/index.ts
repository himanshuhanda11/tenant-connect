import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pageName, routePath, pageType, currentTitle, currentDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert SEO specialist for AiReatro Communications, a WhatsApp Business API platform. Generate optimized SEO metadata for web pages.

Rules:
- Title: max 60 characters, include brand "AiReatro" naturally
- Description: max 160 characters, compelling and action-oriented
- Keywords: 5-8 relevant keywords, comma-separated
- OG Title: slightly different from meta title, max 60 chars
- OG Description: optimized for social sharing, max 160 chars
- Always relevant to WhatsApp Business API, CRM, automation context`;

    const userPrompt = `Generate SEO metadata for this page:
- Page Name: ${pageName}
- Route: ${routePath}
- Type: ${pageType}
${currentTitle ? `- Current Title: ${currentTitle}` : ""}
${currentDescription ? `- Current Description: ${currentDescription}` : ""}

Return the result as a JSON object with these exact keys: title, description, keywords, og_title, og_description`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_seo",
              description: "Generate SEO metadata for a web page",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Meta title, max 60 chars" },
                  description: { type: "string", description: "Meta description, max 160 chars" },
                  keywords: { type: "string", description: "Comma-separated keywords" },
                  og_title: { type: "string", description: "Open Graph title" },
                  og_description: { type: "string", description: "Open Graph description" },
                },
                required: ["title", "description", "keywords", "og_title", "og_description"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_seo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const seoData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-seo error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
