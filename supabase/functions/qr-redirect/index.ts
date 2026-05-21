// Public QR redirect: tracks scan + redirects to wa.me link
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function detectDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobile|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Other";
}

async function hash(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1];

  if (!slug || slug === "qr-redirect") {
    return new Response("Missing slug", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: campaign } = await supabase
    .from("qr_campaigns")
    .select("id, tenant_id, whatsapp_number, prefilled_message, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign || campaign.status !== "active") {
    return new Response(
      `<!doctype html><html><head><meta charset="utf-8"><title>QR not found</title></head><body style="font-family:sans-serif;text-align:center;padding:40px"><h1>QR Code not found</h1><p>This link is invalid or has been deactivated.</p></body></html>`,
      { status: 404, headers: { ...corsHeaders, "content-type": "text/html" } },
    );
  }

  const ua = req.headers.get("user-agent") || "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = await hash(ip + ":" + new Date().toISOString().slice(0, 10));

  await supabase.from("qr_scan_events").insert({
    qr_campaign_id: campaign.id,
    tenant_id: campaign.tenant_id,
    device_type: detectDevice(ua),
    browser: detectBrowser(ua),
    user_agent: ua.slice(0, 500),
    ip_hash: ipHash,
    referrer: req.headers.get("referer")?.slice(0, 500) || null,
  });

  // Increment scan count
  await supabase.rpc("increment_qr_scan", { _campaign_id: campaign.id }).catch(() => {
    // Fallback: best-effort update
    supabase
      .from("qr_campaigns")
      .update({ scan_count: (undefined as any) })
      .eq("id", campaign.id);
  });

  const phone = String(campaign.whatsapp_number).replace(/[^0-9]/g, "");
  const text = encodeURIComponent(campaign.prefilled_message || "");
  const waUrl = `https://wa.me/${phone}${text ? `?text=${text}` : ""}`;

  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: waUrl },
  });
});
