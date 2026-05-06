// Shared Instagram automation engine
// Evaluates rules + executes actions (text reply, AI intent, lead qualification, follow-ups, handoff)
// deno-lint-ignore-file no-explicit-any

const GRAPH = "https://graph.facebook.com/v21.0";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

type SB = any;

async function sendIgMessage(sb: SB, account: any, recipientIgId: string, text: string) {
  const { data: tok } = await sb
    .from("instagram_tokens")
    .select("page_access_token, access_token")
    .eq("instagram_account_id", account.id)
    .maybeSingle();
  const token = tok?.page_access_token || tok?.access_token;
  if (!token) throw new Error("No IG access token");

  const r = await fetch(
    `${GRAPH}/${account.facebook_page_id}/messages?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientIgId },
        message: { text },
        messaging_type: "RESPONSE",
      }),
    }
  );
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "send failed");
  return j.message_id as string;
}

async function logOutbound(sb: SB, account: any, conv: any, text: string, mid?: string) {
  const sentAt = new Date().toISOString();
  await sb.from("instagram_messages").insert({
    tenant_id: account.tenant_id,
    conversation_id: conv.id,
    mid: mid || null,
    direction: "outbound",
    message_type: "text",
    text,
    sent_at: sentAt,
  });
  await sb.from("instagram_conversations").update({
    last_message_text: text,
    last_message_at: sentAt,
    last_outbound_at: sentAt,
  }).eq("id", conv.id);
}

function isWithinBusinessHours(bh: any): boolean {
  if (!bh?.enabled) return true;
  const tz = bh.timezone || "UTC";
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  const parts = fmt.formatToParts(now);
  const day = parts.find(p => p.type === "weekday")?.value.toLowerCase().slice(0, 3) || "mon";
  const hour = parts.find(p => p.type === "hour")?.value || "00";
  const min = parts.find(p => p.type === "minute")?.value || "00";
  const cur = `${hour}:${min}`;
  const cfg = bh.weekly?.[day];
  if (!cfg?.enabled) return false;
  return cur >= (cfg.open || "00:00") && cur <= (cfg.close || "23:59");
}

function matchesKeywords(text: string, cfg: any): boolean {
  const kws: string[] = (cfg?.keywords || []).map((k: string) => k.toLowerCase().trim()).filter(Boolean);
  if (kws.length === 0) return false;
  const t = (text || "").toLowerCase();
  const match = cfg?.match || "any";
  if (match === "all") return kws.every(k => t.includes(k));
  return kws.some(k => t.includes(k));
}

async function detectIntent(text: string): Promise<{ intent: string; confidence: number }> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return { intent: "other", confidence: 0 };
  try {
    const r = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Classify the customer message. Output ONLY JSON: {\"intent\":\"sales|support|complaint|high_intent|other\",\"confidence\":0..1}" },
          { role: "user", content: text.slice(0, 500) },
        ],
      }),
    });
    if (!r.ok) return { intent: "other", confidence: 0 };
    const j = await r.json();
    const raw = j.choices?.[0]?.message?.content || "{}";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { intent: "other", confidence: 0 };
    const parsed = JSON.parse(m[0]);
    return { intent: parsed.intent || "other", confidence: Number(parsed.confidence) || 0 };
  } catch {
    return { intent: "other", confidence: 0 };
  }
}

const QUAL_PROMPTS: Record<string, string> = {
  name: "May I know your name?",
  phone: "What's the best phone number to reach you?",
  email: "Could you share your email address?",
  business_type: "What type of business are you in?",
};

async function continueQualification(sb: SB, account: any, conv: any, contact: any, text: string, fields: string[]): Promise<boolean> {
  const { data: existing } = await sb
    .from("instagram_lead_qualifications")
    .select("*")
    .eq("conversation_id", conv.id)
    .maybeSingle();

  let qual = existing;
  if (!qual) {
    const { data } = await sb.from("instagram_lead_qualifications").insert({
      tenant_id: account.tenant_id,
      conversation_id: conv.id,
      contact_id: contact.id,
      current_step: fields[0],
    }).select().single();
    qual = data;
    await sendIgMessage(sb, account, contact.ig_user_id, QUAL_PROMPTS[fields[0]]).then(mid => logOutbound(sb, account, conv, QUAL_PROMPTS[fields[0]], mid)).catch(() => {});
    return true;
  }

  if (!qual.current_step) return false;
  // save current answer
  const update: any = {};
  update[qual.current_step] = text.trim();
  // next step
  const idx = fields.indexOf(qual.current_step);
  const next = fields[idx + 1];
  if (next) {
    update.current_step = next;
    update.status = "in_progress";
  } else {
    update.current_step = null;
    update.status = "complete";
  }
  await sb.from("instagram_lead_qualifications").update(update).eq("id", qual.id);

  if (next) {
    await sendIgMessage(sb, account, contact.ig_user_id, QUAL_PROMPTS[next]).then(mid => logOutbound(sb, account, conv, QUAL_PROMPTS[next], mid)).catch(() => {});
  } else {
    await sendIgMessage(sb, account, contact.ig_user_id, "Thanks! Our team will reach out shortly.").then(mid => logOutbound(sb, account, conv, "Thanks! Our team will reach out shortly.", mid)).catch(() => {});
  }
  return true;
}

export async function runIgAutomation(sb: SB, account: any, conv: any, contact: any, message: any) {
  const start = Date.now();
  const text: string = message?.text || "";
  const isStoryReply = !!message?.raw?.message?.reply_to?.story;

  // 0. Continue active qualification flow
  const { data: activeQual } = await sb
    .from("instagram_lead_qualifications")
    .select("*")
    .eq("conversation_id", conv.id)
    .eq("status", "in_progress")
    .maybeSingle();
  if (activeQual?.current_step && text) {
    const fields = ["name", "phone", "email", "business_type"];
    const handled = await continueQualification(sb, account, conv, contact, text, fields);
    if (handled) return;
  }

  // Load rules
  const { data: rules } = await sb
    .from("instagram_automation_rules")
    .select("*")
    .eq("tenant_id", account.tenant_id)
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (!rules?.length) return;

  // Load business hours once
  const { data: bh } = await sb
    .from("instagram_business_hours")
    .select("*")
    .eq("tenant_id", account.tenant_id)
    .maybeSingle();
  const inHours = isWithinBusinessHours(bh);

  // Determine context flags
  const { count: msgCount } = await sb
    .from("instagram_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conv.id)
    .eq("direction", "inbound");
  const isFirstMessage = (msgCount || 0) <= 1;

  for (const rule of rules) {
    let matched = false;
    switch (rule.trigger_type) {
      case "new_message":
        matched = true; break;
      case "first_message":
        matched = isFirstMessage; break;
      case "keyword":
        matched = matchesKeywords(text, rule.trigger_config); break;
      case "story_reply":
        matched = isStoryReply; break;
      case "outside_business_hours":
        matched = !inHours; break;
      case "returning_customer":
        matched = !isFirstMessage; break;
      case "no_reply":
        matched = false; break; // handled by cron, not realtime
    }
    if (!matched) continue;

    try {
      for (const action of (rule.actions || [])) {
        await executeAction(sb, account, conv, contact, message, rule, action);
      }
      await sb.from("instagram_automation_rules").update({
        run_count: (rule.run_count || 0) + 1,
        last_run_at: new Date().toISOString(),
      }).eq("id", rule.id);
      await sb.from("instagram_automation_logs").insert({
        tenant_id: account.tenant_id, rule_id: rule.id, conversation_id: conv.id,
        trigger_type: rule.trigger_type, status: "executed",
        detail: { actions: rule.actions?.length || 0 },
        duration_ms: Date.now() - start,
      });
      // stop_after_match
      if (rule.trigger_config?.stop_after_match !== false) break;
    } catch (e) {
      await sb.from("instagram_automation_logs").insert({
        tenant_id: account.tenant_id, rule_id: rule.id, conversation_id: conv.id,
        trigger_type: rule.trigger_type, status: "failed",
        detail: { error: String(e) },
        duration_ms: Date.now() - start,
      });
    }
  }
}

async function executeAction(sb: SB, account: any, conv: any, contact: any, message: any, rule: any, action: any) {
  switch (action.type) {
    case "send_text": {
      const text = String(action.text || "").trim();
      if (!text) return;
      const mid = await sendIgMessage(sb, account, contact.ig_user_id, text);
      await logOutbound(sb, account, conv, text, mid);
      return;
    }
    case "send_canned": {
      const { data: c } = await sb.from("instagram_canned_replies")
        .select("body").eq("tenant_id", account.tenant_id)
        .eq("shortcut", action.shortcut).maybeSingle();
      if (c?.body) {
        const mid = await sendIgMessage(sb, account, contact.ig_user_id, c.body);
        await logOutbound(sb, account, conv, c.body, mid);
      }
      return;
    }
    case "tag": {
      const tags = Array.from(new Set([...(conv.tags || []), ...(action.tags || [])]));
      await sb.from("instagram_conversations").update({ tags }).eq("id", conv.id);
      return;
    }
    case "set_status": {
      await sb.from("instagram_conversations").update({ status: action.status }).eq("id", conv.id);
      return;
    }
    case "assign_team":
    case "assign_agent": {
      const agentId = action.agent_id || null;
      if (agentId) {
        await sb.from("instagram_conversations").update({ assigned_agent_id: agentId }).eq("id", conv.id);
        await sb.from("instagram_assignments").insert({
          tenant_id: account.tenant_id, conversation_id: conv.id,
          agent_id: agentId, method: action.type === "assign_team" ? "team" : "manual",
        });
      }
      return;
    }
    case "ai_intent": {
      const { intent, confidence } = await detectIntent(message.text || "");
      await sb.from("instagram_lead_qualifications").upsert({
        tenant_id: account.tenant_id, conversation_id: conv.id, contact_id: contact.id,
        intent, confidence,
      }, { onConflict: "conversation_id" });
      // route by intent if mapping provided
      const map = action.route_map || {};
      const target = map[intent];
      if (target?.agent_id) {
        await sb.from("instagram_conversations").update({ assigned_agent_id: target.agent_id }).eq("id", conv.id);
      }
      // low confidence handoff
      if (confidence < (action.handoff_threshold || 0.5)) {
        await sb.from("instagram_conversations").update({ status: "pending" }).eq("id", conv.id);
      }
      return;
    }
    case "qualify_lead": {
      const fields = action.fields || ["name", "phone", "email"];
      await continueQualification(sb, account, conv, contact, "", fields);
      return;
    }
    case "handoff": {
      await sb.from("instagram_conversations").update({ status: "pending" }).eq("id", conv.id);
      return;
    }
    case "schedule_followup": {
      const minutes = Number(action.minutes || 5);
      await sb.from("instagram_followups").insert({
        tenant_id: account.tenant_id, conversation_id: conv.id, rule_id: rule.id,
        text: action.text || "Just checking in — are you still there?",
        send_at: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
        cancel_on_reply: action.cancel_on_reply !== false,
      });
      return;
    }
  }
}

// Cancel queued follow-ups when contact replies
export async function cancelPendingFollowups(sb: SB, conversationId: string) {
  await sb.from("instagram_followups")
    .update({ status: "cancelled" })
    .eq("conversation_id", conversationId)
    .eq("status", "queued")
    .eq("cancel_on_reply", true);
}
