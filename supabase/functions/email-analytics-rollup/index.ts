// email-analytics-rollup — aggregates email metrics into email_analytics_daily.
// Run by cron (daily) or manually to backfill. Rolls up the last N days (default 7).
// Body (optional): { days?: number, tenant_id?: string }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  let body: { days?: number; tenant_id?: string } = {};
  try { body = req.method === "POST" ? await req.json() : {}; } catch { /* ignore */ }
  const days = Math.min(Math.max(body.days ?? 7, 1), 90);

  const sinceISO = new Date(Date.now() - days * 86400_000).toISOString();

  // Fetch messages in window
  let mq = supabase.from("email_messages")
    .select("tenant_id, account_id, conversation_id, direction, created_at, sent_by")
    .gte("created_at", sinceISO);
  if (body.tenant_id) mq = mq.eq("tenant_id", body.tenant_id);
  const { data: msgs, error: mErr } = await mq;
  if (mErr) return json({ error: mErr.message }, 500);

  let cq = supabase.from("email_conversations")
    .select("tenant_id, account_id, created_at, resolved_at, assigned_to")
    .gte("created_at", sinceISO);
  if (body.tenant_id) cq = cq.eq("tenant_id", body.tenant_id);
  const { data: convs } = await cq;

  type Bucket = {
    tenant_id: string;
    account_id: string | null;
    day: string;
    volume_in: number;
    volume_out: number;
    conversations_new: number;
    conversations_resolved: number;
    by_agent: Record<string, { sent: number; resolved: number }>;
  };
  const buckets = new Map<string, Bucket>();

  const dayOf = (iso: string) => iso.slice(0, 10);
  const keyOf = (t: string, a: string | null, d: string) => `${t}|${a ?? ""}|${d}`;
  const getB = (t: string, a: string | null, d: string): Bucket => {
    const k = keyOf(t, a, d);
    let b = buckets.get(k);
    if (!b) {
      b = { tenant_id: t, account_id: a, day: d, volume_in: 0, volume_out: 0, conversations_new: 0, conversations_resolved: 0, by_agent: {} };
      buckets.set(k, b);
    }
    return b;
  };

  for (const m of msgs || []) {
    const b = getB(m.tenant_id, m.account_id, dayOf(m.created_at));
    if (m.direction === "inbound") b.volume_in++;
    else {
      b.volume_out++;
      if (m.sent_by) {
        b.by_agent[m.sent_by] ||= { sent: 0, resolved: 0 };
        b.by_agent[m.sent_by].sent++;
      }
    }
  }
  for (const c of convs || []) {
    const b = getB(c.tenant_id, c.account_id, dayOf(c.created_at));
    b.conversations_new++;
    if (c.resolved_at) {
      const rb = getB(c.tenant_id, c.account_id, dayOf(c.resolved_at));
      rb.conversations_resolved++;
      if (c.assigned_to) {
        rb.by_agent[c.assigned_to] ||= { sent: 0, resolved: 0 };
        rb.by_agent[c.assigned_to].resolved++;
      }
    }
  }

  const rows = Array.from(buckets.values()).map((b) => ({
    tenant_id: b.tenant_id,
    account_id: b.account_id,
    day: b.day,
    volume_in: b.volume_in,
    volume_out: b.volume_out,
    conversations_new: b.conversations_new,
    conversations_resolved: b.conversations_resolved,
    by_agent: b.by_agent,
  }));

  if (rows.length === 0) return json({ ok: true, upserted: 0 });

  const { error: upErr } = await supabase
    .from("email_analytics_daily")
    .upsert(rows, { onConflict: "tenant_id,account_id,day" });

  if (upErr) return json({ error: upErr.message }, 500);

  return json({ ok: true, upserted: rows.length });
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
