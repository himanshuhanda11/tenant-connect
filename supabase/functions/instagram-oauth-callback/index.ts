import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

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

    const META_APP_ID = Deno.env.get("META_APP_ID")!;
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate state
    const { data: stateRow } = await supabase
      .from("instagram_oauth_states")
      .select("*")
      .eq("state", parsed.s)
      .maybeSingle();

    if (!stateRow || new Date(stateRow.expires_at) < new Date()) {
      return htmlRedirect(`${fallback}?error=state_expired`, "Session expired");
    }

    await supabase.from("instagram_oauth_states").delete().eq("state", parsed.s);

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/instagram-oauth-callback`;

    // 1. Exchange code → short-lived token
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("Token exchange failed:", tokenJson);
      return htmlRedirect(`${fallback}?error=token_exchange`, "Token exchange failed");
    }
    const shortToken = tokenJson.access_token;

    // 2. Exchange for long-lived token (~60 days)
    const llRes = await fetch(
      `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortToken}`
    );
    const llJson = await llRes.json();
    const longToken = llJson.access_token || shortToken;
    const expiresIn = Number(llJson.expires_in || 60 * 24 * 3600);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 3. Fetch FB user
    const meRes = await fetch(`${GRAPH}/me?fields=id,name&access_token=${longToken}`);
    const me = await meRes.json();

    // 4. Fetch pages → IG accounts
    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${longToken}`
    );
    const pages = await pagesRes.json();

    const igPage = (pages.data || []).find((p: any) => p.instagram_business_account);
    if (!igPage) {
      return htmlRedirect(
        `${fallback}?error=no_ig_account`,
        "No Instagram Professional account linked to your Facebook pages"
      );
    }

    const ig = igPage.instagram_business_account;

    // 5. Upsert account
    const { data: account, error: accErr } = await supabase
      .from("instagram_accounts")
      .upsert(
        {
          tenant_id: stateRow.tenant_id,
          instagram_user_id: ig.id,
          ig_username: ig.username,
          ig_name: ig.name,
          profile_picture_url: ig.profile_picture_url,
          followers_count: ig.followers_count,
          facebook_page_id: igPage.id,
          facebook_page_name: igPage.name,
          facebook_user_id: me.id,
          status: "connected",
          health_status: "healthy",
          scopes: tokenJson.scope?.split(",") || [],
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

    // 6. Store tokens
    await supabase.from("instagram_tokens").upsert(
      {
        tenant_id: stateRow.tenant_id,
        instagram_account_id: account.id,
        access_token: longToken,
        page_access_token: igPage.access_token,
        token_type: "long_lived",
        expires_at: expiresAt,
        refreshed_at: new Date().toISOString(),
      },
      { onConflict: "instagram_account_id" }
    );

    // 7. Subscribe page to webhooks (best-effort)
    try {
      await fetch(`${GRAPH}/${igPage.id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reactions,comments&access_token=${igPage.access_token}`, { method: "POST" });
      await supabase.from("instagram_accounts").update({ webhook_subscribed: true }).eq("id", account.id);
    } catch (e) {
      console.warn("Webhook subscribe failed (non-fatal):", e);
    }

    // 8. Audit log
    await supabase.from("audit_logs").insert({
      tenant_id: stateRow.tenant_id,
      user_id: stateRow.user_id,
      action: "instagram.connected",
      resource_type: "instagram_account",
      resource_id: account.id,
      details: { username: ig.username, page_id: igPage.id },
    });

    const returnTo = parsed.r && parsed.r.startsWith("http") ? parsed.r : fallback;
    return htmlRedirect(`${returnTo}?connected=1`, "Instagram connected!");
  } catch (err) {
    console.error("instagram-oauth-callback error:", err);
    return htmlRedirect(`${fallback}?error=server_error`, "Connection failed");
  }
});
