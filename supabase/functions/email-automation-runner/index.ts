// email-automation-runner — evaluates active automations against an inbound event.
// Called server-to-server from resend-inbound after a message lands.
// Body: { tenant_id, conversation_id, message_id, trigger_type }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Automation {
  id: string;
  tenant_id: string;
  name: string;
  trigger: { type?: string };
  conditions: Condition[];
  actions: Action[];
  is_active: boolean;
  run_count: number;
}
interface Condition {
  field: "from_email" | "from_domain" | "subject" | "body" | "has_attachment" | "tag";
  op: "contains" | "equals" | "matches" | "is_true";
  value?: string;
}
interface Action {
  type: "assign" | "set_status" | "set_priority" | "add_tag" | "send_reply" | "send_template" | "mark_spam";
  // deno-lint-ignore no-explicit-any
  params?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    const { tenant_id, conversation_id, message_id, trigger_type } = await req.json();
    if (!tenant_id || !conversation_id) return json({ error: "missing_fields" }, 400);

    const { data: convArr } = await supabase
      .from("email_conversations")
      .select("*")
      .eq("id", conversation_id)
      .limit(1);
    const conv = convArr?.[0];
    if (!conv) return json({ error: "conv_not_found" }, 404);

    const { data: msg } = message_id
      ? await supabase.from("email_messages").select("*").eq("id", message_id).single()
      : { data: null };

    const { data: automations } = await supabase
      .from("email_automations")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("is_active", true);

    const matched: { automation: Automation; actions: Action[] }[] = [];
    for (const a of (automations || []) as Automation[]) {
      if (a.trigger?.type && a.trigger.type !== trigger_type) continue;
      const ok = (a.conditions || []).every((c) => evalCondition(c, conv, msg));
      if (!ok) continue;
      matched.push({ automation: a, actions: a.actions || [] });
    }

    const results: { id: string; actions_taken: Action[]; error?: string }[] = [];
    for (const m of matched) {
      try {
        for (const act of m.actions) {
          await runAction(act, conv, supabase);
        }
        results.push({ id: m.automation.id, actions_taken: m.actions });
        await supabase.from("email_automations")
          .update({ run_count: (m.automation.run_count || 0) + 1, last_run_at: new Date().toISOString() })
          .eq("id", m.automation.id);
        await supabase.from("email_automation_runs").insert({
          tenant_id,
          automation_id: m.automation.id,
          conversation_id,
          message_id: message_id ?? null,
          trigger_type,
          matched: true,
          actions_taken: m.actions,
        });
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        results.push({ id: m.automation.id, actions_taken: [], error: err });
        await supabase.from("email_automation_runs").insert({
          tenant_id,
          automation_id: m.automation.id,
          conversation_id,
          message_id: message_id ?? null,
          trigger_type,
          matched: true,
          actions_taken: [],
          error: err,
        });
      }
    }

    return json({ ok: true, matched: matched.length, results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

// deno-lint-ignore no-explicit-any
function evalCondition(c: Condition, conv: any, msg: any): boolean {
  const haystack = (() => {
    switch (c.field) {
      case "from_email": return (msg?.from_email ?? conv.from_email ?? "").toLowerCase();
      case "from_domain": return ((msg?.from_email ?? conv.from_email ?? "").split("@")[1] || "").toLowerCase();
      case "subject": return (msg?.subject ?? conv.subject ?? "").toLowerCase();
      case "body": return (msg?.body_text ?? "").toLowerCase();
      case "has_attachment": return msg?.has_attachments ? "true" : "false";
      case "tag": return (conv.tags || []).join(",").toLowerCase();
    }
  })();
  const needle = (c.value || "").toLowerCase();
  switch (c.op) {
    case "contains": return haystack.includes(needle);
    case "equals": return haystack === needle;
    case "matches": try { return new RegExp(c.value || "", "i").test(haystack); } catch { return false; }
    case "is_true": return haystack === "true";
  }
}

// deno-lint-ignore no-explicit-any
async function runAction(act: Action, conv: any, supabase: any) {
  switch (act.type) {
    case "assign":
      await supabase.from("email_conversations")
        .update({ assigned_to: act.params?.user_id, assigned_at: new Date().toISOString() })
        .eq("id", conv.id);
      break;
    case "set_status":
      await supabase.from("email_conversations").update({ status: act.params?.status }).eq("id", conv.id);
      break;
    case "set_priority":
      await supabase.from("email_conversations").update({ priority: act.params?.priority }).eq("id", conv.id);
      break;
    case "add_tag": {
      const newTags = Array.from(new Set([...(conv.tags || []), act.params?.tag].filter(Boolean)));
      await supabase.from("email_conversations").update({ tags: newTags }).eq("id", conv.id);
      break;
    }
    case "mark_spam":
      await supabase.from("email_conversations").update({ is_spam: true, status: "spam" }).eq("id", conv.id);
      break;
    case "send_reply":
    case "send_template":
      // Defer auto-reply: call resend-send via a service-role fetch
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/resend-send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "x-internal-call": "automation",
          "x-tenant-id": conv.tenant_id,
        },
        body: JSON.stringify({
          conversation_id: conv.id,
          to: [conv.from_email],
          subject: conv.subject ? (conv.subject.startsWith("Re:") ? conv.subject : `Re: ${conv.subject}`) : "Re:",
          html: act.params?.html || `<p>${(act.params?.text || "Thanks for reaching out — we'll get back to you shortly.").replace(/</g, "&lt;")}</p>`,
          text: act.params?.text || "Thanks for reaching out — we'll get back to you shortly.",
        }),
      });
      break;
  }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
