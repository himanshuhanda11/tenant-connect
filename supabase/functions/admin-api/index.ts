import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function requirePlatformRole(req: Request, allowed: string[]) {
  const sb = adminClient();
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) throw new Error("Missing auth");

  const { data: { user }, error } = await sb.auth.getUser(jwt);
  if (error || !user) throw new Error("Invalid auth");

  const { data: pu } = await sb
    .from("platform_admins")
    .select("role,is_active")
    .eq("user_id", user.id)
    .single();

  if (!pu || !pu.is_active) throw new Error("Access denied");
  const role = pu.role as string;
  if (!allowed.includes(role)) throw new Error("Forbidden: insufficient role");

  return { user, role };
}

async function logAction(sb: any, actor: any, action: string, details: any) {
  await sb.from("admin_audit_logs").insert({
    actor_user_id: actor.user.id,
    actor_role: actor.role,
    action,
    workspace_id: details.workspace_id || null,
    target_table: details.target_table || null,
    target_id: details.target_id || null,
    before_data: details.before || null,
    after_data: details.after || null,
    note: details.note || null,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-api\/?/, "");

    // GET /overview
    if (req.method === "GET" && path === "overview") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();

      const { data: kpi } = await sb.from("admin_kpi_overview").select("*").single();

      return new Response(JSON.stringify({ kpi }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /workspaces
    if (req.method === "GET" && path === "workspaces") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();

      const search = url.searchParams.get("search") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 25;
      const offset = (page - 1) * limit;

      let query = sb.from("admin_workspace_directory").select("*", { count: "exact" });

      if (search) {
        query = query.or(`workspace_name.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return new Response(JSON.stringify({ workspaces: data, total: count, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /workspaces/:id
    if (req.method === "GET" && path.startsWith("workspaces/") && !path.includes("/", 11)) {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const workspaceId = path.replace("workspaces/", "");

      const [workspace, entitlements, members, phones] = await Promise.all([
        sb.from("tenants").select("*").eq("id", workspaceId).single(),
        sb.from("workspace_entitlements").select("*").eq("workspace_id", workspaceId).maybeSingle(),
        sb.from("tenant_members").select("*, profiles(email, full_name)").eq("tenant_id", workspaceId),
        sb.from("smeksh_phone_numbers").select("id,display_name,phone_e164,status,quality_rating").eq("tenant_id", workspaceId),
      ]);

      return new Response(JSON.stringify({
        workspace: workspace.data,
        entitlements: entitlements.data,
        members: members.data,
        phones: phones.data,
      }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/update
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/update$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();

      // Get before state
      const { data: before } = await sb.from("workspace_entitlements").select("*").eq("workspace_id", workspaceId).maybeSingle();

      // Upsert entitlements
      const { data: after, error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId,
        ...body,
        updated_by: actor.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" }).select().single();

      if (error) throw new Error(error.message);

      await logAction(sb, actor, "WORKSPACE_ENTITLEMENTS_UPDATE", {
        workspace_id: workspaceId,
        target_table: "workspace_entitlements",
        before,
        after,
      });

      return new Response(JSON.stringify({ success: true, data: after }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/suspend
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/suspend$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();

      const { error } = await sb.from("tenants").update({
        is_suspended: body.suspend ?? true,
        suspended_reason: body.reason || null,
        suspended_at: body.suspend ? new Date().toISOString() : null,
      }).eq("id", workspaceId);

      if (error) throw new Error(error.message);

      await logAction(sb, actor, body.suspend ? "WORKSPACE_SUSPENDED" : "WORKSPACE_UNSUSPENDED", {
        workspace_id: workspaceId,
        note: body.reason,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/pause-sending (support allowed)
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/pause-sending$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();

      const { error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId,
        sending_paused: body.paused ?? true,
        updated_by: actor.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" });

      if (error) throw new Error(error.message);

      await logAction(sb, actor, body.paused ? "SENDING_PAUSED" : "SENDING_RESUMED", {
        workspace_id: workspaceId,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /audit-logs
    if (req.method === "GET" && path === "audit-logs") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();

      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 50;
      const offset = (page - 1) * limit;

      let query = sb.from("admin_audit_logs").select("*", { count: "exact" });

      const workspaceFilter = url.searchParams.get("workspace_id");
      if (workspaceFilter) query = query.eq("workspace_id", workspaceFilter);

      const actionFilter = url.searchParams.get("action");
      if (actionFilter) query = query.eq("action", actionFilter);

      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      return new Response(JSON.stringify({ logs: data, total: count, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /me - check caller's admin role
    if (req.method === "GET" && path === "me") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      return new Response(JSON.stringify({ role: actor.role, user_id: actor.user.id, email: actor.user.email }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e: any) {
    const status = e.message?.includes("Forbidden") ? 403 : e.message?.includes("auth") || e.message?.includes("Access") ? 401 : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
