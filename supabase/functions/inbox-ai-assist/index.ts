import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tone = "professional" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get last few messages for context
    const recentMessages = messages.slice(-5);
    const conversationContext = recentMessages
      .map((m: any) => `${m.direction === 'inbound' ? 'Customer' : 'Agent'}: ${m.body_text || '[media]'}`)
      .join("\n");

    const toneInstructions: Record<string, string> = {
      professional: "Maintain a professional, courteous tone. Be clear and concise.",
      friendly: "Be warm, approachable, and use a conversational style. Include appropriate emojis.",
      sales: "Be enthusiastic and persuasive. Highlight benefits and create urgency. Include CTAs.",
    };

    const systemPrompt = `You are an AI assistant helping customer support agents respond to WhatsApp messages. ${toneInstructions[tone] || toneInstructions.professional}

Analyze the conversation and provide:
1. intent: The customer's primary intent (sales, support, complaint, inquiry, urgent, spam)
2. sentiment: Overall sentiment (positive, neutral, negative)
3. suggestions: 3 short reply suggestions (max 150 chars each)
4. health: Conversation health score (good, warning, critical)
5. health_reason: Brief reason for health score

Format as JSON with structure: { intent, sentiment, suggestions: string[], health, health_reason }`;

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
          { role: "user", content: `Analyze this WhatsApp conversation and suggest replies:\n\n${conversationContext}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_conversation",
              description: "Analyze conversation and provide suggestions",
              parameters: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    enum: ["sales", "support", "complaint", "inquiry", "urgent", "spam"],
                  },
                  sentiment: {
                    type: "string",
                    enum: ["positive", "neutral", "negative"],
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    maxItems: 3,
                  },
                  health: {
                    type: "string",
                    enum: ["good", "warning", "critical"],
                  },
                  health_reason: { type: "string" },
                },
                required: ["intent", "sentiment", "suggestions", "health", "health_reason"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_conversation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: "Rate limit exceeded",
          ...getDefaultAnalysis(),
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          error: "Credits exhausted",
          ...getDefaultAnalysis(),
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({
        error: "AI unavailable",
        ...getDefaultAnalysis(),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    return new Response(JSON.stringify(getDefaultAnalysis()), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in inbox-ai-assist:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      ...getDefaultAnalysis(),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultAnalysis() {
  return {
    intent: "inquiry",
    sentiment: "neutral",
    suggestions: [
      "Thank you for reaching out! How can I assist you today?",
      "I'd be happy to help. Could you provide more details?",
      "Let me look into this for you right away.",
    ],
    health: "good",
    health_reason: "Conversation is proceeding normally",
  };
}
