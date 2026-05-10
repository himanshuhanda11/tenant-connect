import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function clean(v: unknown, max = 240): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s.length ? s : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const id = clean(body?.id);
    if (!id) return new Response(JSON.stringify({ error: "invalid" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: widget } = await supabase.from("widgets")
      .select("id, tenant_id, whatsapp_number, status, config")
      .eq("public_key", id).maybeSingle();
    if (!widget || widget.status !== "published") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Two-phase flow:
    //   phase 1 (default): "save" — capture lead in widget_leads only.
    //   phase 2: "start_chat" — when customer actually clicks the WhatsApp CTA,
    //            push the lead into the Inbox as a real conversation.
    const phase = clean(body?.phase) === "start_chat" ? "start_chat" : "save";
    const existingLeadId = clean(body?.lead_id, 64);

    let name = clean(body?.name);
    let phone = clean(body?.phone, 32);
    let email = clean(body?.email, 200);
    let message = clean(body?.message, 2000);
    const page_url = clean(body?.page_url, 500);
    const variant_id = clean(body?.variant_id, 32);
    const device = clean(body?.device, 32);
    const country = clean(body?.country, 8);

    let lead: { id: string } | null = null;

    if (phase === "save") {
      const { data: inserted } = await supabase.from("widget_leads").insert({
        widget_id: widget.id, tenant_id: widget.tenant_id,
        name, phone, email, message, page_url, device, country, variant_id,
        metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : null,
      }).select("id").maybeSingle();
      lead = inserted ?? null;

      await supabase.from("widget_events").insert({
        widget_id: widget.id, tenant_id: widget.tenant_id, event_type: "lead",
        page_url, device, country, session_id: clean(body?.session_id, 64),
        variant_id, metadata: { lead_id: lead?.id },
      });
    } else if (existingLeadId) {
      // Reload original lead so we don't trust client-mutated values
      const { data: existing } = await supabase.from("widget_leads")
        .select("id, name, phone, email, message")
        .eq("id", existingLeadId).eq("tenant_id", widget.tenant_id).maybeSingle();
      if (existing) {
        lead = { id: existing.id };
        name = existing.name ?? name;
        phone = existing.phone ?? phone;
        email = existing.email ?? email;
        message = existing.message ?? message;
      }
    }

    // ===== Push into Aireatro Inbox (only when customer clicks Start Chat) =====
    const shouldPushToInbox = phase === "start_chat";
    const routing = (widget.config as any)?.routing as
      | { mode?: string; agent_id?: string | null; team_id?: string | null } | undefined;
    const routingMode = routing?.mode ?? "inbox_unassigned";

    let assignTo: string | null = null;
    if (phone && routingMode !== "none") {
      const wa_id = phone.replace(/[^\d]/g, "");

      // 1) Upsert contact
      await supabase.from("contacts").upsert({
        tenant_id: widget.tenant_id, wa_id,
        name: name ?? null, source: "website_widget",
      }, { onConflict: "tenant_id,wa_id" });

      const { data: contact } = await supabase.from("contacts")
        .select("id").eq("tenant_id", widget.tenant_id).eq("wa_id", wa_id).maybeSingle();
      const contactId = contact?.id;

      if (contactId) {
        // 2) Pick a default phone_number for this tenant (required by conversations)
        const { data: phoneRow } = await supabase.from("phone_numbers")
          .select("id").eq("tenant_id", widget.tenant_id)
          .order("is_default", { ascending: false }).order("created_at", { ascending: true })
          .limit(1).maybeSingle();
        const phoneNumberId = phoneRow?.id ?? null;

        if (phoneNumberId) {
          // 3) Pick assignee
          if (routingMode === "specific_agent" && routing?.agent_id) {
            assignTo = routing.agent_id;
          } else if (routingMode === "team_round_robin" && routing?.team_id) {
            const { data: picked } = await supabase.rpc("pick_agent_round_robin", {
              p_tenant_id: widget.tenant_id, p_team_id: routing.team_id,
            });
            assignTo = (picked as string | null) ?? null;
          }

          // 4) Upsert conversation (unique on phone_number_id + contact_id)
          const nowIso = new Date().toISOString();
          const preview = `🌐 Website widget lead${name ? ` — ${name}` : ""}`;
          const { data: conv } = await supabase.from("conversations").upsert({
            tenant_id: widget.tenant_id, phone_number_id: phoneNumberId, contact_id: contactId,
            status: "open", source: "website_widget",
            last_message_at: nowIso, last_inbound_at: nowIso,
            last_message_preview: preview,
            assigned_to: assignTo, assigned_at: assignTo ? nowIso : null,
          }, { onConflict: "phone_number_id,contact_id" })
            .select("id, assigned_to").maybeSingle();

          // If existing conversation had no assignee but routing wants one, set it
          if (conv?.id && assignTo && !conv.assigned_to) {
            await supabase.from("conversations").update({
              assigned_to: assignTo, assigned_at: nowIso,
            }).eq("id", conv.id);
          }

          // 5) Insert a system inbound message so it shows up in the inbox feed
          if (conv?.id) {
            const summary = [
              `🌐 New lead from website widget`,
              name ? `Name: ${name}` : null,
              phone ? `Phone: ${phone}` : null,
              email ? `Email: ${email}` : null,
              page_url ? `Page: ${page_url}` : null,
              message ? `\n${message}` : null,
            ].filter(Boolean).join("\n");

            await supabase.from("messages").insert({
              tenant_id: widget.tenant_id, conversation_id: conv.id,
              direction: "inbound", type: "text", text: summary,
              status: "received", sent_at: nowIso,
              metadata: { source: "website_widget", widget_id: widget.id, lead_id: lead?.id },
            });
          }
        }
      }
    }

    const target = body?.agent_phone && typeof body.agent_phone === "string" ? body.agent_phone : widget.whatsapp_number;
    const wa = target ? String(target).replace(/[^\d]/g, "") : null;
    const text = encodeURIComponent(message ?? (name ? `Hi, I'm ${name}.` : "Hi"));
    const link = wa ? `https://wa.me/${wa}?text=${text}` : null;

    return new Response(JSON.stringify({ ok: true, lead_id: lead?.id, whatsapp_url: link, assigned_to: assignTo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
