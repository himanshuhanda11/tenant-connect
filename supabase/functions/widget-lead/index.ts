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
    const { data: widget } = await supabase.from("widgets").select("id, tenant_id, whatsapp_number, status, config").eq("public_key", id).maybeSingle();
    if (!widget || widget.status !== "published") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const name = clean(body?.name);
    const phone = clean(body?.phone, 32);
    const email = clean(body?.email, 200);
    const message = clean(body?.message, 2000);
    const page_url = clean(body?.page_url, 500);

    const variant_id = clean(body?.variant_id, 32);

    const { data: lead } = await supabase.from("widget_leads").insert({
      widget_id: widget.id,
      tenant_id: widget.tenant_id,
      name, phone, email, message, page_url,
      device: clean(body?.device, 32),
      country: clean(body?.country, 8),
      variant_id,
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : null,
    }).select("id").maybeSingle();

    await supabase.from("widget_events").insert({
      widget_id: widget.id, tenant_id: widget.tenant_id, event_type: "lead", page_url,
      device: clean(body?.device, 32), country: clean(body?.country, 8),
      session_id: clean(body?.session_id, 64), variant_id, metadata: { lead_id: lead?.id },
    });

    // Best-effort: create or upsert contact in CRM
    if (phone) {
      const wa_id = phone.replace(/[^\d]/g, "");
      try {
        await supabase.from("contacts").upsert({
          tenant_id: widget.tenant_id, wa_id, name: name ?? null, source: "website_widget",
        }, { onConflict: "tenant_id,wa_id" });
      } catch (_) { /* ignore */ }
    }

    const target = body?.agent_phone && typeof body.agent_phone === "string" ? body.agent_phone : widget.whatsapp_number;
    const wa = target ? String(target).replace(/[^\d]/g, "") : null;
    const text = encodeURIComponent(message ?? (name ? `Hi, I'm ${name}.` : "Hi"));
    const link = wa ? `https://wa.me/${wa}?text=${text}` : null;

    return new Response(JSON.stringify({ ok: true, lead_id: lead?.id, whatsapp_url: link }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
