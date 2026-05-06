import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub;

    const { workspace_id, return_url } = await req.json();
    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "workspace_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify membership
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: member } = await admin
      .from("tenant_members")
      .select("role")
      .eq("tenant_id", workspace_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!member || !["owner", "admin"].includes(member.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    if (!clientKey) {
      return new Response(JSON.stringify({
        error: "TikTok app not yet configured. Please add TIKTOK_CLIENT_KEY in project secrets.",
      }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate signed state with workspace_id, user_id, nonce, return_url
    const stateSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const statePayload = {
      w: workspace_id, u: userId,
      r: return_url || "/app/integrations/tiktok-leads",
      n: crypto.randomUUID(), t: Date.now(),
    };
    const stateB64 = btoa(JSON.stringify(statePayload));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(stateSecret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(stateB64));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const state = `${stateB64}.${sigB64}`;

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/tiktok-oauth-callback`;

    // TikTok Marketing API auth endpoint
    const authUrl = new URL("https://business-api.tiktok.com/portal/auth");
    authUrl.searchParams.set("app_id", clientKey);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);

    return new Response(JSON.stringify({ auth_url: authUrl.toString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tiktok-oauth-start error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
