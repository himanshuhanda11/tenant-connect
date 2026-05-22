// Shared helpers for Mail AI features.
// Calls the Lovable AI Gateway with a sensible default model.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callAI(opts: {
  messages: ChatMsg[];
  model?: string;
  temperature?: number;
  tools?: unknown[];
  tool_choice?: unknown;
}): Promise<unknown> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || DEFAULT_MODEL,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      tools: opts.tools,
      tool_choice: opts.tool_choice,
    }),
  });

  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 402) throw new Error("payment_required");
  if (!res.ok) throw new Error(`ai_${res.status}: ${await res.text()}`);
  return await res.json();
}

export function extractText(json: unknown): string {
  // OpenAI-shape response
  // deno-lint-ignore no-explicit-any
  const j = json as any;
  return j?.choices?.[0]?.message?.content ?? "";
}

export function extractToolArgs(json: unknown): unknown {
  // deno-lint-ignore no-explicit-any
  const j = json as any;
  const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return null;
  try {
    return JSON.parse(args);
  } catch {
    return null;
  }
}

export function stripHtml(html: string | null | undefined, max = 4000): string {
  if (!html) return "";
  const text = html.replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "…" : text;
}
