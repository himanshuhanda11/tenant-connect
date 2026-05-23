import { corsHeaders, json, getUserClient, getAdminClient } from "../_shared/supabase.ts";

interface InsightsBody {
  deal_id: string;
}

interface AiInsights {
  lead_quality: number;       // 0-100
  conversion_probability: number; // 0-100
  risk_score: number;         // 0-100
  next_best_action: string;
  summary: string;
  tags: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const userClient = getUserClient(req);
    const { data: auth } = await userClient.auth.getUser();
    if (!auth?.user) return json({ error: "unauthorized" }, 401);

    const body = (await req.json()) as InsightsBody;
    if (!body.deal_id) return json({ error: "deal_id required" }, 400);

    const admin = getAdminClient();
    const { data: deal, error: dErr } = await admin
      .from("deals")
      .select("*")
      .eq("id", body.deal_id)
      .maybeSingle();
    if (dErr || !deal) return json({ error: "deal_not_found" }, 404);

    // Tenant membership check
    const { data: mem } = await admin
      .from("tenant_members")
      .select("user_id")
      .eq("tenant_id", deal.tenant_id)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!mem) return json({ error: "forbidden" }, 403);

    // Optional context
    const { data: stage } = await admin.from("pipeline_stages").select("name, probability, is_won, is_lost").eq("id", deal.stage_id).maybeSingle();
    const { data: notes } = await admin.from("deal_notes").select("content").eq("deal_id", deal.id).order("created_at", { ascending: false }).limit(5);
    const { data: activities } = await admin.from("deal_activities").select("activity_type, content, created_at").eq("deal_id", deal.id).order("created_at", { ascending: false }).limit(15);

    let contactSummary = "No linked contact.";
    if (deal.contact_id) {
      const { data: contact } = await admin.from("contacts").select("name, wa_id, email, tags, lead_status, lead_score").eq("id", deal.contact_id).maybeSingle();
      if (contact) contactSummary = JSON.stringify(contact);
    }

    const prompt = `You are an expert sales coach for WhatsApp-first B2B/B2C deals.
Analyze this deal and return a strict JSON object with keys:
lead_quality (0-100), conversion_probability (0-100), risk_score (0-100),
next_best_action (concise 1-sentence imperative), summary (1-2 sentences),
tags (array of <=4 short lowercase labels e.g. "hot", "stalled", "high-value").

DEAL:
${JSON.stringify({ title: deal.title, value: deal.value, currency: deal.currency, priority: deal.priority, status: deal.status, source: deal.lead_source, expected_close: deal.expected_close_date, last_activity_at: deal.last_activity_at, created_at: deal.created_at, company: deal.company_name, tags: deal.tags })}
STAGE: ${stage?.name ?? "unknown"} (probability ${stage?.probability ?? 0}, won=${stage?.is_won}, lost=${stage?.is_lost})
CONTACT: ${contactSummary}
RECENT NOTES: ${(notes ?? []).map((n: any) => "- " + n.content).join("\n") || "none"}
RECENT ACTIVITY: ${(activities ?? []).map((a: any) => `- ${a.activity_type}: ${a.content ?? ""}`).join("\n") || "none"}

Respond with JSON only, no markdown fences.`;

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise sales analytics engine. Always return valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (aiRes.status === 402) return json({ error: "payment_required" }, 402);
    if (!aiRes.ok) return json({ error: `ai_${aiRes.status}`, detail: await aiRes.text() }, 500);

    const aiJson = await aiRes.json();
    const content: string = aiJson?.choices?.[0]?.message?.content ?? "";
    const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: AiInsights;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return json({ error: "parse_failed", raw: content }, 500);
    }

    // Persist on deal.metadata.ai
    const newMetadata = { ...(deal.metadata ?? {}), ai: { ...parsed, generated_at: new Date().toISOString() } };
    await admin.from("deals").update({ metadata: newMetadata }).eq("id", deal.id);

    return json({ insights: parsed });
  } catch (e) {
    return json({ error: "internal", message: (e as Error).message }, 500);
  }
});
