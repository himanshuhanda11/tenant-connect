import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "missing id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: widget, error } = await supabase
      .from("widgets")
      .select("id, public_key, name, status, whatsapp_number, config, tenant_id")
      .eq("public_key", id)
      .maybeSingle();
    if (error) throw error;
    if (!widget || widget.status !== "published") {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: agents } = await supabase
      .from("widget_agents").select("id, name, role, department, avatar_url, phone_e164, prefilled_message, priority")
      .eq("widget_id", widget.id).eq("is_active", true).order("priority", { ascending: false });

    return new Response(JSON.stringify({
      id: widget.public_key,
      name: widget.name,
      whatsapp_number: widget.whatsapp_number,
      config: widget.config,
      agents: agents ?? [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
