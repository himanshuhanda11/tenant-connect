// Aireatro Widget Builder — AI greeting generator (Phase 2)
// Authenticated edge function — uses Lovable AI gateway via LOVABLE_API_KEY.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body {
  industry?: string;
  brandName?: string;
  audience?: string;
  goal?: string;
  tone?: 'friendly' | 'professional' | 'playful' | 'urgent' | 'luxury';
  language?: string;
  variants?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = (await req.json()) as Body;
    const tone = body.tone ?? 'friendly';
    const lang = body.language ?? 'English';
    const variants = Math.min(Math.max(body.variants ?? 4, 1), 6);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) return json({ error: 'AI not configured' }, 500);

    const system = `You generate high-converting WhatsApp chat widget copy for marketing websites. Be specific, concise (max 110 chars greeting, 22 chars CTA), use one tasteful emoji max. Output strict JSON only.`;
    const userPrompt = `Brand: ${body.brandName || 'a business'}
Industry: ${body.industry || 'general'}
Audience: ${body.audience || 'website visitors'}
Goal: ${body.goal || 'capture qualified leads'}
Tone: ${tone}
Language: ${lang}
Generate ${variants} unique high-converting greeting variants.`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'emit_greetings',
            description: 'Emit greeting/CTA/prefilled message variants',
            parameters: {
              type: 'object',
              properties: {
                variants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      greeting: { type: 'string' },
                      ctaText: { type: 'string' },
                      prefilledMessage: { type: 'string' },
                      angle: { type: 'string', description: 'one-word strategy label e.g. urgency, trust, curiosity' },
                    },
                    required: ['greeting', 'ctaText', 'prefilledMessage', 'angle'],
                  },
                },
              },
              required: ['variants'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'emit_greetings' } },
      }),
    });

    if (aiResp.status === 429) return json({ error: 'Rate limited, try again shortly' }, 429);
    if (aiResp.status === 402) return json({ error: 'AI credits exhausted — top up in Settings' }, 402);
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error('AI gateway error', aiResp.status, t);
      return json({ error: 'AI gateway error' }, 500);
    }
    const j = await aiResp.json();
    const args = j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = typeof args === 'string' ? JSON.parse(args) : args;
    return json({ variants: parsed?.variants ?? [] });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
