// Flow Execution Engine — unified entrypoint
// Actions: dispatch | resume | start | tick | test
// All execution is gated per-tenant by tenants.flow_engine_enabled.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = () => createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const MAX_HOPS = 50;

// ---------- helpers ----------
async function loadPublishedFlow(supabase: any, flowId: string) {
  const { data: version } = await supabase
    .from("flow_versions").select("*").eq("flow_id", flowId).eq("status", "published")
    .order("version_number", { ascending: false }).limit(1).maybeSingle();
  if (!version) return null;
  const nodes: any[] = version.nodes_json ?? [];
  const edges: any[] = version.edges_json ?? [];
  return { version, nodes, edges, byKey: Object.fromEntries(nodes.map(n => [n.node_key ?? n.id, n])) };
}

function findStartNode(nodes: any[]) {
  return nodes.find(n => (n.node_type ?? n.type) === "start" || (n.node_type ?? n.type) === "trigger") ?? nodes[0];
}

function nextNodes(edges: any[], fromKey: string, handle?: string) {
  return edges
    .filter(e => (e.source_node_key ?? e.source) === fromKey && (handle ? (e.source_handle ?? e.sourceHandle) === handle : true))
    .map(e => e.target_node_key ?? e.target);
}

function fillVars(text: string, vars: Record<string, any>): string {
  if (!text) return text;
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
    const parts = k.split(".");
    let v: any = vars;
    for (const p of parts) v = v?.[p];
    return v == null ? "" : String(v);
  });
}

async function logError(supabase: any, tenantId: string, flowId: string | null, runId: string | null, nodeKey: string | null, message: string, details: any = {}, severity = "error") {
  await supabase.from("flow_errors").insert({ tenant_id: tenantId, flow_id: flowId, run_id: runId, node_key: nodeKey, severity, message, details });
}

async function bumpAnalytics(supabase: any, tenantId: string, flowId: string, field: string, by = 1) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: row } = await supabase.from("flow_analytics_daily").select("*").eq("tenant_id", tenantId).eq("flow_id", flowId).eq("date", today).maybeSingle();
  if (row) {
    await supabase.from("flow_analytics_daily").update({ [field]: (row[field] ?? 0) + by }).eq("id", row.id);
  } else {
    await supabase.from("flow_analytics_daily").insert({ tenant_id: tenantId, flow_id: flowId, date: today, [field]: by });
  }
}

async function sendWhatsAppText(tenantId: string, phoneNumberId: string, toWaId: string, text: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-text-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ tenant_id: tenantId, phone_number_id: phoneNumberId, to_wa_id: toWaId, type: "text", text: { body: text } }),
  });
  return res.ok;
}

async function sendWhatsAppTemplate(tenantId: string, phoneNumberId: string, toWaId: string, templateName: string, languageCode: string, components: any[]) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-template-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ tenant_id: tenantId, phone_number_id: phoneNumberId, to_wa_id: toWaId, template_name: templateName, language_code: languageCode, components }),
  });
  return res.ok;
}

// 24-hour window check
async function within24h(supabase: any, tenantId: string, contactId: string): Promise<boolean> {
  const { data } = await supabase
    .from("messages").select("created_at")
    .eq("tenant_id", tenantId).eq("contact_id", contactId).eq("direction", "inbound")
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return false;
  return Date.now() - new Date(data.created_at).getTime() < 24 * 3600 * 1000;
}

// ---------- node executors ----------
async function executeNode(supabase: any, ctx: any, node: any): Promise<{ next?: string; suspend?: boolean; end?: boolean }> {
  const type = (node.node_type ?? node.type ?? "").toLowerCase();
  const cfg = node.config ?? node.data ?? {};
  const stepStart = Date.now();
  const stepRow = await supabase.from("flow_run_steps").insert({
    tenant_id: ctx.tenantId, run_id: ctx.runId, node_key: node.node_key ?? node.id, node_type: type, status: "running", input: { config: cfg, vars: ctx.vars },
  }).select().single();
  const stepId = stepRow.data?.id;

  const finishStep = async (status: string, output: any = {}, error: string | null = null) => {
    if (!stepId) return;
    await supabase.from("flow_run_steps").update({
      status, output, error, ended_at: new Date().toISOString(), duration_ms: Date.now() - stepStart,
    }).eq("id", stepId);
  };

  try {
    switch (type) {
      case "start":
      case "trigger": {
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("done", { next: targets[0] });
        return { next: targets[0] };
      }

      case "send_message":
      case "message":
      case "text": {
        const text = fillVars(cfg.text ?? cfg.message ?? cfg.body ?? "", ctx.vars);
        if (ctx.contactWaId && ctx.phoneNumberId && text) {
          if (await within24h(supabase, ctx.tenantId, ctx.contactId)) {
            const ok = await sendWhatsAppText(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, text);
            if (!ok) throw new Error("send_text_failed");
            await bumpAnalytics(supabase, ctx.tenantId, ctx.flowId, "messages_sent");
          } else if (cfg.fallback_template) {
            await sendWhatsAppTemplate(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, cfg.fallback_template.name, cfg.fallback_template.language ?? "en_US", cfg.fallback_template.components ?? []);
            await bumpAnalytics(supabase, ctx.tenantId, ctx.flowId, "messages_sent");
          } else {
            await logError(supabase, ctx.tenantId, ctx.flowId, ctx.runId, node.node_key, "Outside 24h window and no fallback_template", {}, "warning");
            await bumpAnalytics(supabase, ctx.tenantId, ctx.flowId, "messages_failed");
          }
        }
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("done", { sent: !!text });
        return { next: targets[0] };
      }

      case "template": {
        if (ctx.contactWaId && ctx.phoneNumberId && cfg.template_name) {
          const ok = await sendWhatsAppTemplate(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, cfg.template_name, cfg.language_code ?? "en_US", cfg.components ?? []);
          if (!ok) throw new Error("send_template_failed");
          await bumpAnalytics(supabase, ctx.tenantId, ctx.flowId, "messages_sent");
        }
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("done");
        return { next: targets[0] };
      }

      case "question":
      case "ask": {
        const prompt = fillVars(cfg.prompt ?? cfg.text ?? "", ctx.vars);
        if (prompt && ctx.contactWaId && ctx.phoneNumberId) {
          if (await within24h(supabase, ctx.tenantId, ctx.contactId)) {
            await sendWhatsAppText(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, prompt);
          }
        }
        const waitingFor = {
          node_key: node.node_key ?? node.id,
          expected_type: cfg.answer_type ?? "text",
          field_key: cfg.field_key ?? null,
          options: cfg.options ?? null,
          validation: cfg.validation ?? null,
        };
        // suspend
        await supabase.from("contact_flow_state").upsert({
          tenant_id: ctx.tenantId, contact_id: ctx.contactId, flow_id: ctx.flowId, run_id: ctx.runId,
          current_node_key: node.node_key ?? node.id, waiting_for: waitingFor, variables: ctx.vars,
          expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        }, { onConflict: "tenant_id,contact_id,flow_id" });
        await supabase.from("flow_runs").update({ status: "waiting", current_node_key: node.node_key ?? node.id, variables: ctx.vars }).eq("id", ctx.runId);
        await finishStep("waiting", { waiting_for: waitingFor });
        return { suspend: true };
      }

      case "collect_form":
      case "collect-form": {
        const fields: any[] = Array.isArray(cfg.fields) ? cfg.fields : [];
        const nodeKey = node.node_key ?? node.id;
        ctx.vars.__forms = ctx.vars.__forms || {};
        const progress = ctx.vars.__forms[nodeKey] || { index: 0, answers: {} };
        // First entry — send intro message if configured
        if (progress.index === 0 && cfg.intro && ctx.contactWaId && ctx.phoneNumberId) {
          if (await within24h(supabase, ctx.tenantId, ctx.contactId)) {
            await sendWhatsAppText(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, fillVars(String(cfg.intro), ctx.vars));
          }
        }
        if (progress.index >= fields.length) {
          // Form complete — send completion message and advance
          if (cfg.completion_message && ctx.contactWaId && ctx.phoneNumberId) {
            if (await within24h(supabase, ctx.tenantId, ctx.contactId)) {
              await sendWhatsAppText(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, fillVars(String(cfg.completion_message), ctx.vars));
            }
          }
          // expose collected answers under nodeKey for downstream nodes
          ctx.vars[nodeKey] = progress.answers;
          delete ctx.vars.__forms[nodeKey];
          const targets = nextNodes(ctx.edges, nodeKey);
          await finishStep("done", { collected: progress.answers, next: targets[0] });
          return { next: targets[0] };
        }
        const field = fields[progress.index];
        const prompt = fillVars(String(field.label ?? field.prompt ?? ""), ctx.vars);
        if (prompt && ctx.contactWaId && ctx.phoneNumberId) {
          if (await within24h(supabase, ctx.tenantId, ctx.contactId)) {
            await sendWhatsAppText(ctx.tenantId, ctx.phoneNumberId, ctx.contactWaId, prompt);
          }
        }
        ctx.vars.__forms[nodeKey] = progress;
        const waitingFor = {
          node_key: nodeKey,
          expected_type: field.type ?? "text",
          field_key: field.key ?? null,
          __form_node: nodeKey,
          __form_index: progress.index,
          required: field.required ?? true,
        };
        await supabase.from("contact_flow_state").upsert({
          tenant_id: ctx.tenantId, contact_id: ctx.contactId, flow_id: ctx.flowId, run_id: ctx.runId,
          current_node_key: nodeKey, waiting_for: waitingFor, variables: ctx.vars,
          expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        }, { onConflict: "tenant_id,contact_id,flow_id" });
        await supabase.from("flow_runs").update({ status: "waiting", current_node_key: nodeKey, variables: ctx.vars }).eq("id", ctx.runId);
        await finishStep("waiting", { waiting_for: waitingFor, form_progress: progress.index + 1, total: fields.length });
        return { suspend: true };
      }

      case "condition":
      case "if": {
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        let branch: string | undefined;
        const rules: any[] = cfg.rules ?? cfg.branches ?? [];
        for (const r of rules) {
          const left = fillVars(String(r.field ?? r.left ?? ""), ctx.vars).toLowerCase();
          const right = String(r.value ?? r.right ?? "").toLowerCase();
          const op = (r.op ?? r.operator ?? "equals").toLowerCase();
          let match = false;
          if (op === "equals") match = left === right;
          else if (op === "contains") match = left.includes(right);
          else if (op === "not_equals") match = left !== right;
          else if (op === "gt") match = parseFloat(left) > parseFloat(right);
          else if (op === "lt") match = parseFloat(left) < parseFloat(right);
          else if (op === "in") match = right.split(",").map(s => s.trim()).includes(left);
          if (match) { branch = r.target ?? r.handle; break; }
        }
        const next = branch ? nextNodes(ctx.edges, node.node_key ?? node.id, branch)[0] ?? targets[0] : nextNodes(ctx.edges, node.node_key ?? node.id, "else")[0] ?? targets[targets.length - 1];
        await finishStep("done", { branch: branch ?? "else", next });
        return { next };
      }

      case "delay":
      case "wait": {
        const ms = (cfg.minutes ?? 0) * 60000 + (cfg.hours ?? 0) * 3600000 + (cfg.seconds ?? 0) * 1000 + (cfg.delay_ms ?? 0);
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        const resumeKey = targets[0];
        if (!resumeKey) { await finishStep("done", { end: true }); return { end: true }; }
        await supabase.from("flow_scheduled_jobs").insert({
          tenant_id: ctx.tenantId, run_id: ctx.runId, flow_id: ctx.flowId, contact_id: ctx.contactId,
          resume_node_key: resumeKey, payload: { vars: ctx.vars }, stop_on_reply: cfg.stop_on_reply ?? true,
          run_at: new Date(Date.now() + Math.max(ms, 1000)).toISOString(),
        });
        await supabase.from("flow_runs").update({ status: "waiting", current_node_key: resumeKey, variables: ctx.vars }).eq("id", ctx.runId);
        await finishStep("scheduled", { resume_at_ms: ms });
        return { suspend: true };
      }

      case "assign":
      case "assign_agent": {
        if (cfg.agent_id) {
          if (ctx.conversationId) {
            await supabase.from("conversations").update({ assigned_to: cfg.agent_id, assigned_at: new Date().toISOString() }).eq("id", ctx.conversationId);
          }
        } else if (cfg.round_robin) {
          // delegate to existing round-robin function if present
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/round-robin-assign`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
              body: JSON.stringify({ tenant_id: ctx.tenantId, conversation_id: ctx.conversationId, team_id: cfg.team_id ?? null }),
            });
          } catch (_) {}
        }
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("done");
        return { next: targets[0] };
      }

      case "set_field":
      case "set_variable": {
        const key = cfg.key ?? cfg.field_key;
        const value = fillVars(String(cfg.value ?? ""), ctx.vars);
        if (key) ctx.vars[key] = value;
        if (cfg.save_to_contact && ctx.contactId && key) {
          const { data: c } = await supabase.from("contacts").select("custom_data").eq("id", ctx.contactId).maybeSingle();
          const cd = { ...(c?.custom_data ?? {}), [key]: value };
          await supabase.from("contacts").update({ custom_data: cd }).eq("id", ctx.contactId);
        }
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("done", { key, value });
        return { next: targets[0] };
      }

      case "add_tag": {
        if (cfg.tag && ctx.contactId) {
          const { data: c } = await supabase.from("contacts").select("tags").eq("id", ctx.contactId).maybeSingle();
          const tags = Array.from(new Set([...(c?.tags ?? []), cfg.tag]));
          await supabase.from("contacts").update({ tags }).eq("id", ctx.contactId);
        }
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("done");
        return { next: targets[0] };
      }

      case "webhook_call":
      case "http": {
        try {
          const res = await fetch(cfg.url, {
            method: cfg.method ?? "POST",
            headers: { "Content-Type": "application/json", ...(cfg.headers ?? {}) },
            body: JSON.stringify({ ...(cfg.body ?? {}), vars: ctx.vars }),
          });
          const text = await res.text();
          await finishStep("done", { status: res.status, body: text.slice(0, 500) });
        } catch (e: any) {
          await finishStep("failed", {}, String(e?.message ?? e));
        }
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        return { next: targets[0] };
      }

      case "end":
      case "stop": {
        await finishStep("done", { end: true });
        return { end: true };
      }

      default: {
        const targets = nextNodes(ctx.edges, node.node_key ?? node.id);
        await finishStep("skipped", { unknown_type: type });
        return { next: targets[0] };
      }
    }
  } catch (e: any) {
    await finishStep("failed", {}, String(e?.message ?? e));
    await logError(supabase, ctx.tenantId, ctx.flowId, ctx.runId, node.node_key ?? node.id, String(e?.message ?? e));
    return { end: true };
  }
}

async function runFromNode(supabase: any, ctx: any, startKey: string) {
  let cursor: string | undefined = startKey;
  let hops = 0;
  while (cursor && hops < MAX_HOPS) {
    hops++;
    const node = ctx.byKey[cursor];
    if (!node) { await logError(supabase, ctx.tenantId, ctx.flowId, ctx.runId, cursor, "Node not found"); break; }
    const res = await executeNode(supabase, ctx, node);
    await supabase.from("flow_runs").update({ hop_count: (ctx.hopCount ?? 0) + hops, variables: ctx.vars, current_node_key: cursor }).eq("id", ctx.runId);
    if (res.suspend) return { suspended: true };
    if (res.end || !res.next) {
      await supabase.from("flow_runs").update({ status: "completed", ended_at: new Date().toISOString(), duration_ms: Date.now() - new Date(ctx.startedAt).getTime() }).eq("id", ctx.runId);
      await bumpAnalytics(supabase, ctx.tenantId, ctx.flowId, "runs_completed");
      await supabase.from("contact_flow_state").delete().eq("run_id", ctx.runId);
      return { completed: true };
    }
    cursor = res.next;
  }
  if (hops >= MAX_HOPS) {
    await logError(supabase, ctx.tenantId, ctx.flowId, ctx.runId, cursor ?? null, "Max hops reached (loop guard)", {}, "critical");
    await supabase.from("flow_runs").update({ status: "failed", error: "max_hops", ended_at: new Date().toISOString() }).eq("id", ctx.runId);
    await bumpAnalytics(supabase, ctx.tenantId, ctx.flowId, "runs_failed");
  }
  return {};
}

// ---------- actions ----------
async function actionDispatch(supabase: any, params: any) {
  const { tenant_id, phone_number_id, trigger_type, contact_id, conversation_id, contact_wa_id, message_text, source, idempotency_key, payload } = params;
  // tenant flag
  const { data: tenant } = await supabase.from("tenants").select("flow_engine_enabled").eq("id", tenant_id).maybeSingle();
  if (!tenant?.flow_engine_enabled) return { skipped: "engine_disabled" };

  // find matching trigger
  const { data: triggers } = await supabase
    .from("flow_triggers").select("*, flows!inner(id,status)")
    .eq("tenant_id", tenant_id).eq("is_enabled", true).eq("trigger_type", trigger_type)
    .order("priority", { ascending: true });
  if (!triggers?.length) return { skipped: "no_triggers" };

  for (const t of triggers) {
    if (t.flows?.status !== "published") continue;
    if (phone_number_id && t.phone_number_id && t.phone_number_id !== phone_number_id) continue;
    // keyword match for whatsapp_message
    if (trigger_type === "whatsapp_message" && Array.isArray(t.config?.keywords) && t.config.keywords.length) {
      const txt = (message_text ?? "").toLowerCase();
      const hit = t.config.keywords.some((k: string) => txt.includes(String(k).toLowerCase()));
      if (!hit) continue;
    }
    // start run
    return await actionStart(supabase, { tenant_id, flow_id: t.flow_id, phone_number_id, contact_id, conversation_id, contact_wa_id, trigger_type, idempotency_key, trigger_payload: payload ?? {} });
  }
  return { skipped: "no_match" };
}

async function actionStart(supabase: any, params: any) {
  const { tenant_id, flow_id, phone_number_id, contact_id, conversation_id, contact_wa_id, trigger_type, idempotency_key, trigger_payload } = params;
  const flow = await loadPublishedFlow(supabase, flow_id);
  if (!flow) return { error: "no_published_version" };

  // duplicate guard
  if (idempotency_key) {
    const { data: existing } = await supabase.from("flow_runs").select("id").eq("tenant_id", tenant_id).eq("flow_id", flow_id).eq("idempotency_key", idempotency_key).maybeSingle();
    if (existing) return { skipped: "duplicate", run_id: existing.id };
  }

  const startNode = findStartNode(flow.nodes);
  if (!startNode) return { error: "no_start_node" };

  const { data: run } = await supabase.from("flow_runs").insert({
    tenant_id, flow_id, version_id: flow.version.id, contact_id, conversation_id,
    trigger_type, trigger_payload: trigger_payload ?? {}, idempotency_key,
    status: "running", current_node_key: startNode.node_key ?? startNode.id, variables: {},
  }).select().single();
  await bumpAnalytics(supabase, tenant_id, flow_id, "runs_started");

  const ctx = {
    tenantId: tenant_id, flowId: flow_id, runId: run.id,
    contactId: contact_id, conversationId: conversation_id, contactWaId: contact_wa_id,
    phoneNumberId: phone_number_id,
    edges: flow.edges, byKey: flow.byKey, vars: {}, startedAt: run.started_at, hopCount: 0,
  };
  await runFromNode(supabase, ctx, startNode.node_key ?? startNode.id);
  return { run_id: run.id };
}

async function actionResume(supabase: any, params: any) {
  const { tenant_id, contact_id, message_text } = params;
  const { data: states } = await supabase.from("contact_flow_state").select("*, flows!inner(id,status), flow_runs!inner(*)")
    .eq("tenant_id", tenant_id).eq("contact_id", contact_id).not("waiting_for", "is", null);
  if (!states?.length) return { skipped: "no_waiting" };
  const state = states[0];
  const run = state.flow_runs;
  const flow = await loadPublishedFlow(supabase, state.flow_id);
  if (!flow) return { error: "no_flow" };

  const waiting = state.waiting_for ?? {};
  const answer = String(message_text ?? "").trim();
  // basic validation
  const type = waiting.expected_type ?? "text";
  let valid = answer.length > 0;
  if (type === "email") valid = /^\S+@\S+\.\S+$/.test(answer);
  else if (type === "phone") valid = /^[+0-9\s\-()]{6,}$/.test(answer);
  else if (type === "number") valid = !isNaN(parseFloat(answer));

  const vars = { ...(state.variables ?? {}) };
  if (!valid) {
    // re-prompt (do nothing — keep waiting). Could send "invalid" message.
    return { reprompt: true };
  }
  if (waiting.field_key) {
    vars[waiting.field_key] = answer;
    // save to contact
    const { data: c } = await supabase.from("contacts").select("custom_data").eq("id", contact_id).maybeSingle();
    await supabase.from("contacts").update({ custom_data: { ...(c?.custom_data ?? {}), [waiting.field_key]: answer } }).eq("id", contact_id);
  } else {
    vars[waiting.node_key] = answer;
  }
  // clear waiting and advance
  await supabase.from("contact_flow_state").update({ waiting_for: null, variables: vars }).eq("id", state.id);
  const targets = nextNodes(flow.edges, waiting.node_key);
  const next = targets[0];
  if (!next) {
    await supabase.from("flow_runs").update({ status: "completed", ended_at: new Date().toISOString() }).eq("id", run.id);
    await bumpAnalytics(supabase, tenant_id, state.flow_id, "runs_completed");
    return { completed: true };
  }
  // load conversation/phone from run
  const { data: conv } = await supabase.from("conversations").select("phone_number_id,contact_id").eq("id", run.conversation_id).maybeSingle();
  const { data: ct } = await supabase.from("contacts").select("wa_id").eq("id", contact_id).maybeSingle();
  const ctx = {
    tenantId: tenant_id, flowId: state.flow_id, runId: run.id,
    contactId: contact_id, conversationId: run.conversation_id, contactWaId: ct?.wa_id,
    phoneNumberId: conv?.phone_number_id,
    edges: flow.edges, byKey: flow.byKey, vars, startedAt: run.started_at, hopCount: run.hop_count,
  };
  await supabase.from("flow_runs").update({ status: "running", variables: vars }).eq("id", run.id);
  await runFromNode(supabase, ctx, next);
  return { ok: true };
}

async function actionTick(supabase: any) {
  const { data: jobs } = await supabase.from("flow_scheduled_jobs")
    .select("*").eq("status", "pending").lte("run_at", new Date().toISOString()).limit(50);
  if (!jobs?.length) return { processed: 0 };
  let done = 0;
  for (const job of jobs) {
    await supabase.from("flow_scheduled_jobs").update({ status: "processing", attempts: (job.attempts ?? 0) + 1 }).eq("id", job.id);
    try {
      // stop-on-reply check: if contact replied after job was scheduled, skip
      if (job.stop_on_reply && job.contact_id) {
        const { data: lastIn } = await supabase.from("messages").select("created_at")
          .eq("tenant_id", job.tenant_id).eq("contact_id", job.contact_id).eq("direction", "inbound")
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (lastIn && new Date(lastIn.created_at) > new Date(job.created_at)) {
          await supabase.from("flow_scheduled_jobs").update({ status: "cancelled" }).eq("id", job.id);
          continue;
        }
      }
      const flow = await loadPublishedFlow(supabase, job.flow_id);
      const { data: run } = await supabase.from("flow_runs").select("*").eq("id", job.run_id).maybeSingle();
      if (!flow || !run) { await supabase.from("flow_scheduled_jobs").update({ status: "failed", last_error: "missing flow/run" }).eq("id", job.id); continue; }
      const { data: conv } = await supabase.from("conversations").select("phone_number_id").eq("id", run.conversation_id).maybeSingle();
      const { data: ct } = await supabase.from("contacts").select("wa_id").eq("id", run.contact_id).maybeSingle();
      const ctx = {
        tenantId: run.tenant_id, flowId: run.flow_id, runId: run.id,
        contactId: run.contact_id, conversationId: run.conversation_id, contactWaId: ct?.wa_id,
        phoneNumberId: conv?.phone_number_id,
        edges: flow.edges, byKey: flow.byKey, vars: job.payload?.vars ?? run.variables ?? {},
        startedAt: run.started_at, hopCount: run.hop_count,
      };
      await supabase.from("flow_runs").update({ status: "running" }).eq("id", run.id);
      await runFromNode(supabase, ctx, job.resume_node_key);
      await supabase.from("flow_scheduled_jobs").update({ status: "done" }).eq("id", job.id);
      done++;
    } catch (e: any) {
      await supabase.from("flow_scheduled_jobs").update({ status: job.attempts >= 3 ? "failed" : "pending", last_error: String(e?.message ?? e) }).eq("id", job.id);
    }
  }
  return { processed: done };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "tick";
    const supabase = sb();
    let result: any;
    if (action === "dispatch") result = await actionDispatch(supabase, body);
    else if (action === "start") result = await actionStart(supabase, body);
    else if (action === "resume") result = await actionResume(supabase, body);
    else if (action === "tick") result = await actionTick(supabase);
    else if (action === "test") {
      // manual test from UI — does not require contact, runs in dry mode
      result = await actionStart(supabase, { ...body, idempotency_key: `test-${Date.now()}` });
    } else result = { error: "unknown_action" };
    return new Response(JSON.stringify({ ok: true, ...result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("flow-engine error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
