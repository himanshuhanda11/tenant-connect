import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_ORIGIN = "https://app.aireatro.com";

function htmlRedirect(url: string, message = "Connecting…") {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${message}</title>
<style>body{font-family:system-ui;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
<div><p>${message}</p><p><a style="color:#60a5fa" href="${url}">Continue →</a></p></div>
<script>location.replace(${JSON.stringify(url)})</script>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

async function verifyState(state: string): Promise<{ w: string; u: string; r: string } | null> {
  try {
    const [b64, sig] = state.split(".");
    if (!b64 || !sig) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"],
    );
    const expected = await crypto.subtle.sign("HMAC", key, enc.encode(b64));
    const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (expectedB64 !== sig) return null;
    const payload = JSON.parse(atob(b64));
    if (Date.now() - payload.t > 10 * 60 * 1000) return null; // 10-min state expiry
    return payload;
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const authCode = url.searchParams.get("auth_code") || url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error") || url.searchParams.get("error_description");

  if (errorParam) {
    return htmlRedirect(`${APP_ORIGIN}/app/integrations/tiktok-leads?error=${encodeURIComponent(errorParam)}`);
  }
  if (!authCode || !state) {
    return htmlRedirect(`${APP_ORIGIN}/app/integrations/tiktok-leads?error=missing_params`);
  }

  const verified = await verifyState(state);
  if (!verified) {
    return htmlRedirect(`${APP_ORIGIN}/app/integrations/tiktok-leads?error=invalid_state`);
  }

  const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
  const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");
  if (!clientKey || !clientSecret) {
    return htmlRedirect(`${APP_ORIGIN}${verified.r}?error=tiktok_not_configured`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: clientKey, secret: clientSecret, auth_code: authCode }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.code !== 0 || !tokenData.data?.access_token) {
      console.error("Token exchange failed", tokenData);
      return htmlRedirect(`${APP_ORIGIN}${verified.r}?error=token_exchange_failed`);
    }

    const accessToken = tokenData.data.access_token;
    const refreshToken = tokenData.data.refresh_token || null;
    const advertiserIds: string[] = tokenData.data.advertiser_ids || [];
    const expiresIn = tokenData.data.access_token_expire_in || tokenData.data.expires_in;
    const expiresAt = expiresIn ? new Date(Date.now() + Number(expiresIn) * 1000).toISOString() : null;
    const scope = tokenData.data.scope ? JSON.stringify(tokenData.data.scope) : null;

    // Fetch advertiser names
    let advertisers: Array<{ id: string; name: string }> = [];
    if (advertiserIds.length > 0) {
      const infoRes = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/?app_id=${encodeURIComponent(clientKey)}&secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(accessToken)}`,
        { headers: { "Access-Token": accessToken } }
      );
      const infoData = await infoRes.json();
      if (infoData.code === 0 && Array.isArray(infoData.data?.list)) {
        advertisers = infoData.data.list.map((a: any) => ({
          id: a.advertiser_id, name: a.advertiser_name,
        }));
      } else {
        advertisers = advertiserIds.map((id) => ({ id, name: `Advertiser ${id}` }));
      }
    }

    if (advertisers.length === 0) {
      return htmlRedirect(`${APP_ORIGIN}${verified.r}?error=no_advertisers`);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert one row per advertiser
    const rows = advertisers.map((a) => ({
      workspace_id: verified.w,
      connected_by_user_id: verified.u,
      advertiser_id: a.id,
      advertiser_name: a.name,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt,
      scope,
      status: "connected",
      last_sync_at: new Date().toISOString(),
    }));

    const { error: upsertErr } = await admin
      .from("tiktok_connections")
      .upsert(rows, { onConflict: "workspace_id,advertiser_id" });

    if (upsertErr) {
      console.error("Upsert failed", upsertErr);
      return htmlRedirect(`${APP_ORIGIN}${verified.r}?error=save_failed`);
    }

    return htmlRedirect(`${APP_ORIGIN}${verified.r}?connected=1`, "Connected to TikTok ✓");
  } catch (e) {
    console.error("callback error", e);
    return htmlRedirect(`${APP_ORIGIN}${verified.r}?error=server_error`);
  }
});
