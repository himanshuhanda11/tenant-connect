import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IG_GRAPH = "https://graph.instagram.com";

function htmlRedirect(url: string, message: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${message}</title>
<style>body{font-family:system-ui;background:linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045);color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.card{background:rgba(0,0,0,.3);padding:2rem 3rem;border-radius:1rem;text-align:center;backdrop-filter:blur(10px)}</style></head>
<body><div class="card"><h2>${message}</h2><p>Redirecting...</p></div>
<script>setTimeout(()=>{window.location.href=${JSON.stringify(url)}},800)</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const APP_URL = Deno.env.get("APP_URL") || "https://aireatro.com";
  const fallback = `${APP_URL}/app/integrations/instagram`;

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");

    if (errorParam) {
      return htmlRedirect(`${fallback}?error=${encodeURIComponent(errorParam)}`, "Connection cancelled");
    }
    if (!code || !stateRaw) {
      return htmlRedirect(`${fallback}?error=missing_params`, "Missing parameters");
    }

    let parsed: { s: string; r?: string };
    try {
      parsed = JSON.parse(stateRaw);
    } catch {
      return htmlRedirect(`${fallback}?error=invalid_state`, "Invalid state");
    }

    const IG_APP_ID = Deno.env.get("INSTAGRAM_APP_ID")!;
    const IG_APP_SECRET = Deno.env.get("INSTAGRAM_APP_SECRET")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: stateRow } = await supabase
      .from("instagram_oauth_states")
      .select("*")
      .eq("state", parsed.s)
      .maybeSingle();

    if (!stateRow || new Date(stateRow.expires_at) < new Date()) {
      return htmlRedirect(`${fallback}?error=state_expired`, "Session expired");
    }

    await supabase.from("instagram_oauth_states").delete().eq("state", parsed.s);

    // Instagram Login callback URL (must match what we registered)
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/instagram-oauth-callback`;

    // 1. Exchange code → short-lived IG user token (POST form-encoded)
    const tokenForm = new URLSearchParams({
      client_id: IG_APP_ID,
      client_secret: IG_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenForm.toString(),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("IG token exchange failed:", tokenJson);
      return htmlRedirect(`${fallback}?error=token_exchange`, "Token exchange failed");
    }
    const shortToken = tokenJson.access_token as string;
    const igUserId = String(tokenJson.user_id);

    // 2. Exchange for long-lived token (~60 days)
    const llRes = await fetch(
      `${IG_GRAPH}/access_token?grant_type=ig_exchange_token&client_secret=${IG_APP_SECRET}&access_token=${shortToken}`
    );
    const llJson = await llRes.json();
    const longToken = llJson.access_token || shortToken;
    const expiresIn = Number(llJson.expires_in || 60 * 24 * 3600);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 3. Fetch IG account profile
    const meRes = await fetch(
      `${IG_GRAPH}/v21.0/me?fields=user_id,username,name,account_type,profile_picture_url,followers_count&access_token=${longToken}`
    );
    const me = await meRes.json();
    if (me.error) {
      console.error("IG profile fetch failed:", me.error);
      return htmlRedirect(`${fallback}?error=profile_fetch`, "Failed to load profile");
    }

    // 4. Upsert account (no facebook page involved in IG Login for Business)
    const { data: account, error: accErr } = await supabase
      .from("instagram_accounts")
      .upsert(
        {
          tenant_id: stateRow.tenant_id,
          instagram_user_id: igUserId,
          ig_username: me.username,
          ig_name: me.name || me.username,
          profile_picture_url: me.profile_picture_url,
          followers_count: me.followers_count,
          facebook_page_id: null,
          facebook_page_name: null,
          facebook_user_id: null,
          status: "connected",
          health_status: "healthy",
          scopes: Array.isArray(tokenJson.permissions)
            ? tokenJson.permissions
            : typeof tokenJson.permissions === "string"
              ? tokenJson.permissions.split(",").filter(Boolean)
              : [],
          connected_by: stateRow.user_id,
          connected_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,instagram_user_id" }
      )
      .select()
      .single();

    if (accErr) {
      console.error("Account upsert error:", accErr);
      return htmlRedirect(`${fallback}?error=save_failed`, "Failed to save account");
    }

    // 5. Store tokens (page_access_token = same long-lived IG token in this flow)
    await supabase.from("instagram_tokens").upsert(
      {
        tenant_id: stateRow.tenant_id,
        instagram_account_id: account.id,
        access_token: longToken,
        page_access_token: longToken,
        token_type: "long_lived",
        expires_at: expiresAt,
        refreshed_at: new Date().toISOString(),
      },
      { onConflict: "instagram_account_id" }
    );

    // 6. Subscribe IG account to webhooks (best-effort)
    try {
      await fetch(
        `${IG_GRAPH}/v21.0/${igUserId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reactions,comments&access_token=${longToken}`,
        { method: "POST" }
      );
      await supabase.from("instagram_accounts").update({ webhook_subscribed: true }).eq("id", account.id);
    } catch (e) {
      console.warn("Webhook subscribe failed (non-fatal):", e);
    }

    await supabase.from("audit_logs").insert({
      tenant_id: stateRow.tenant_id,
      user_id: stateRow.user_id,
      action: "instagram.connected",
      resource_type: "instagram_account",
      resource_id: account.id,
      details: { username: me.username, ig_user_id: igUserId, flow: "instagram_login_for_business" },
    });

    const returnTo = parsed.r && parsed.r.startsWith("http") ? parsed.r : fallback;
    return htmlRedirect(`${returnTo}?connected=1`, "Instagram connected!");
  } catch (err) {
    console.error("instagram-oauth-callback error:", err);
    return htmlRedirect(`${fallback}?error=server_error`, "Connection failed");
  }
});
