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
    const { metrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI analyst for a WhatsApp Business messaging platform. Analyze the metrics and provide 3-5 actionable insights.

Rules:
- Be specific and actionable
- Reference specific flows, campaigns, or metrics by name when available
- Prioritize insights that impact revenue or customer experience
- Use percentages and comparisons when possible
- Keep each insight under 100 characters
- Format as JSON array of objects with: type (warning|success|info), message, priority (high|medium|low), actionHref (optional)

Example output:
[
  {"type": "warning", "message": "Replies dropped 14% today – check Flow: Lead Qualification", "priority": "high", "actionHref": "/flows"},
  {"type": "info", "message": "Meta Ads converting 34% better than last week", "priority": "medium"},
  {"type": "success", "message": "Response time improved to 2.5m avg", "priority": "low"}
]`;

    const userPrompt = `Analyze these dashboard metrics and generate insights:

${JSON.stringify(metrics, null, 2)}

Generate actionable insights based on patterns, anomalies, or opportunities.`;

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
              name: "generate_insights",
              description: "Return AI-generated insights for the dashboard",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["warning", "success", "info"] },
                        message: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        actionHref: { type: "string" },
                      },
                      required: ["type", "message", "priority"],
                    },
                  },
                },
                required: ["insights"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded", 
          insights: getDefaultInsights(metrics) 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Credits exhausted", 
          insights: getDefaultInsights(metrics) 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ 
        error: "AI unavailable", 
        insights: getDefaultInsights(metrics) 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract from tool call response
    let insights = [];
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        insights = parsed.insights || [];
      } catch (e) {
        console.error("Failed to parse tool response:", e);
        insights = getDefaultInsights(metrics);
      }
    } else {
      insights = getDefaultInsights(metrics);
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in dashboard-ai-insights:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      insights: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultInsights(metrics: any) {
  const insights = [];
  
  if (metrics?.unassigned > 5) {
    insights.push({
      type: "warning",
      message: `${metrics.unassigned} unassigned chats waiting – assign agents now`,
      priority: "high",
      actionHref: "/inbox?assigned=none",
    });
  }
  
  if (metrics?.slaBreaches > 0) {
    insights.push({
      type: "warning",
      message: `${metrics.slaBreaches} SLA breaches today – review response times`,
      priority: "high",
      actionHref: "/team/sla",
    });
  }
  
  if (metrics?.conversionRate > 30) {
    insights.push({
      type: "success",
      message: `Conversion rate at ${metrics.conversionRate.toFixed(1)}% – above industry avg`,
      priority: "medium",
    });
  }
  
  insights.push({
    type: "info",
    message: "Schedule campaigns during peak hours (2-4 PM) for best engagement",
    priority: "low",
    actionHref: "/campaigns/create",
  });
  
  return insights;
}
