import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

const getAuthenticatedUserId = async (authClient: ReturnType<typeof createClient>, authHeader: string) => {
  const token = authHeader.replace("Bearer ", "");

  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
  if (!claimsError && claimsData?.claims?.sub) {
    return claimsData.claims.sub as string;
  }

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (!userError && userData?.user?.id) {
    return userData.user.id;
  }

  console.error("instagram-manage auth failed:", claimsError?.message || userError?.message || "missing user id");
  return null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const userId = await getAuthenticatedUserId(authClient, authHeader);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenantId, action, accountId } = await req.json();
    if (!tenantId) {
      return new Response(JSON.stringify({ error: "tenantId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: membership } = await supabase
      .from("tenant_members").select("role")
      .eq("tenant_id", tenantId).eq("user_id", userId).maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STATUS
    if (!action || action === "status") {
      const { data: account } = await supabase
        .from("instagram_accounts").select("*")
        .eq("tenant_id", tenantId).maybeSingle();
      return new Response(JSON.stringify({ account }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // HEALTH CHECK
    if (action === "health") {
      const { data: account } = await supabase
        .from("instagram_accounts").select("*")
        .eq("tenant_id", tenantId).maybeSingle();
      if (!account) {
        return new Response(JSON.stringify({ status: "disconnected" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: tok } = await supabase
        .from("instagram_tokens").select("*")
        .eq("instagram_account_id", account.id).maybeSingle();
      if (!tok) {
        await supabase.from("instagram_accounts").update({ status: "expired", health_status: "error" }).eq("id", account.id);
        return new Response(JSON.stringify({ status: "expired" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Probe Graph
      const probe = await fetch(`${GRAPH}/${account.instagram_user_id}?fields=id,username&access_token=${tok.page_access_token || tok.access_token}`);
      const probeJson = await probe.json();
      let status = "connected", health = "healthy", lastError: string | null = null;
      if (probeJson.error) {
        status = probeJson.error.code === 190 ? "expired" : "permission_issue";
        health = "error";
        lastError = probeJson.error.message;
      }
      await supabase.from("instagram_accounts")
        .update({ status, health_status: health, last_error: lastError, last_synced_at: new Date().toISOString() })
        .eq("id", account.id);
      return new Response(JSON.stringify({ status, health, error: lastError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DISCONNECT
    if (action === "disconnect") {
      if (!["owner", "admin"].includes(membership.role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: account } = await supabase
        .from("instagram_accounts").select("*")
        .eq("tenant_id", tenantId).eq("id", accountId).maybeSingle();
      if (account) {
        const { data: tok } = await supabase.from("instagram_tokens")
          .select("*").eq("instagram_account_id", account.id).maybeSingle();
        if (tok && account.facebook_page_id) {
          try {
            await fetch(`${GRAPH}/${account.facebook_page_id}/subscribed_apps?access_token=${tok.page_access_token || tok.access_token}`, { method: "DELETE" });
          } catch (_) { /* ignore */ }
        }
        await supabase.from("instagram_accounts").delete().eq("id", account.id);
        await supabase.from("audit_logs").insert({
          tenant_id: tenantId, user_id: userId,
          action: "instagram.disconnected", resource_type: "instagram_account",
          resource_id: account.id, details: { username: account.ig_username },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("instagram-manage error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
