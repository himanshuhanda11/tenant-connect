import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED = new Set(["view", "open", "click", "close", "lead"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { id, event_type, page_url, referrer, device, country, session_id, metadata, variant_id } = body ?? {};
    if (!id || !ALLOWED.has(event_type)) {
      return new Response(JSON.stringify({ error: "invalid" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: widget } = await supabase.from("widgets").select("id, tenant_id, status").eq("public_key", id).maybeSingle();
    if (!widget || widget.status !== "published") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    await supabase.from("widget_events").insert({
      widget_id: widget.id,
      tenant_id: widget.tenant_id,
      event_type,
      page_url: typeof page_url === "string" ? page_url.slice(0, 500) : null,
      referrer: typeof referrer === "string" ? referrer.slice(0, 500) : null,
      device: typeof device === "string" ? device.slice(0, 32) : null,
      country: typeof country === "string" ? country.slice(0, 8) : null,
      session_id: typeof session_id === "string" ? session_id.slice(0, 64) : null,
      variant_id: typeof variant_id === "string" ? variant_id.slice(0, 32) : null,
      metadata: metadata && typeof metadata === "object" ? metadata : null,
    });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
