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

  // Check read-only mode for support on mutations
  if (role === "support" && req.method !== "GET") {
    const { data: setting } = await sb
      .from("platform_settings")
      .select("value")
      .eq("key", "support_read_only")
      .single();

    if (setting?.value === true) {
      throw new Error("Read-only mode is currently enabled for support. Mutations are disabled.");
    }
  }

  return { user, role };
}

async function logAction(sb: any, actor: any, action: string, details: any) {
  await sb.from("platform_audit_logs").insert({
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
      const { data: kpi } = await sb.from("platform_kpi_overview").select("*").single();
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
      let query = sb.from("platform_workspace_directory").select("*", { count: "exact" });
      if (search) {
        query = query.or(`workspace_name.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      const { data, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
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
        workspace: workspace.data, entitlements: entitlements.data,
        members: members.data, phones: phones.data,
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // POST /workspaces/:id/update
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/update$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const SUPPORT_ALLOWED = new Set(["sending_paused", "enable_ai", "enable_ads", "enable_integrations", "enable_autoforms"]);
      const safeUpdates: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(body.updates || body)) {
        if (k === 'note' || k === 'updates') continue;
        if (actor.role === "super_admin") safeUpdates[k] = v;
        else if (SUPPORT_ALLOWED.has(k)) safeUpdates[k] = v;
      }
      if (Object.keys(safeUpdates).length === 0) {
        return new Response(JSON.stringify({ error: "No permitted fields to update" }), {
          status: 403, headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }
      const { data: before } = await sb.from("workspace_entitlements").select("*").eq("workspace_id", workspaceId).maybeSingle();
      const { data: after, error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId, ...safeUpdates,
        updated_by: actor.user.id, updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" }).select().single();
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_WORKSPACE_UPDATE", {
        workspace_id: workspaceId, target_table: "workspace_entitlements", before, after, note: body.note || null,
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
      await logAction(sb, actor, body.suspend ? "PLATFORM_WORKSPACE_SUSPEND" : "PLATFORM_WORKSPACE_UNSUSPEND", {
        workspace_id: workspaceId, note: body.reason,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/pause-sending
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/pause-sending$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { error } = await sb.from("workspace_entitlements").upsert({
        workspace_id: workspaceId, sending_paused: body.paused ?? true,
        updated_by: actor.user.id, updated_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, body.paused ? "PLATFORM_SENDING_PAUSED" : "PLATFORM_SENDING_RESUMED", {
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
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = (page - 1) * limit;
      let query = sb.from("platform_audit_logs").select("*", { count: "exact" });
      const workspaceFilter = url.searchParams.get("workspace_id");
      if (workspaceFilter) query = query.eq("workspace_id", workspaceFilter);
      const actionFilter = url.searchParams.get("action");
      if (actionFilter) query = query.eq("action", actionFilter);
      const { data, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      return new Response(JSON.stringify({ logs: data, total: count, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /audit-logs/export
    if (req.method === "GET" && path === "audit-logs/export") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const format = url.searchParams.get("format") || "json";

      let query = sb.from("platform_audit_logs").select("*");
      const workspaceFilter = url.searchParams.get("workspace_id");
      if (workspaceFilter) query = query.eq("workspace_id", workspaceFilter);
      const actionFilter = url.searchParams.get("action");
      if (actionFilter) query = query.eq("action", actionFilter);

      const { data } = await query.order("created_at", { ascending: false }).limit(1000);

      await logAction(sb, actor, "PLATFORM_AUDIT_EXPORT", {
        note: `Exported ${data?.length || 0} audit logs as ${format}`,
      });

      if (format === "csv") {
        const headers = ["created_at", "actor_user_id", "actor_role", "action", "workspace_id", "target_table", "target_id", "note"];
        const csv = [
          headers.join(","),
          ...(data || []).map(row =>
            headers.map(h => `"${String((row as any)[h] ?? '').replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        return new Response(csv, {
          headers: {
            ...corsHeaders,
            "content-type": "text/csv",
            "content-disposition": `attachment; filename="audit-export-${new Date().toISOString().slice(0,10)}.csv"`,
          },
        });
      }

      const exportData = {
        generated_at: new Date().toISOString(),
        generated_by: actor.user.email,
        total_events: data?.length || 0,
        events: data,
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "content-disposition": `attachment; filename="audit-export-${new Date().toISOString().slice(0,10)}.json"`,
        },
      });
    }

    // GET /me
    if (req.method === "GET" && path === "me") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data: roSetting } = await sb.from("platform_settings").select("value").eq("key", "support_read_only").single();
      return new Response(JSON.stringify({
        role: actor.role, user_id: actor.user.id, email: actor.user.email,
        support_read_only: roSetting?.value === true,
      }), { headers: { ...corsHeaders, "content-type": "application/json" } });
    }

    // GET /settings
    if (req.method === "GET" && path === "settings") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_settings").select("*");
      return new Response(JSON.stringify({ settings: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /settings
    if (req.method === "POST" && path === "settings") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.key) throw new Error("Setting key required");
      const { data: before } = await sb.from("platform_settings").select("*").eq("key", body.key).maybeSingle();
      const { error } = await sb.from("platform_settings").upsert({
        key: body.key, value: body.value,
        updated_at: new Date().toISOString(), updated_by: actor.user.id,
      }, { onConflict: "key" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_SETTINGS_UPDATE", {
        target_table: "platform_settings", target_id: body.key,
        before: before ? { value: before.value } : null,
        after: { value: body.value }, note: body.note || `Updated ${body.key}`,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /incidents
    if (req.method === "GET" && path === "incidents") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_incidents").select("*").order("created_at", { ascending: false });
      return new Response(JSON.stringify({ incidents: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /incidents/:id/events
    if (req.method === "GET" && path.match(/^incidents\/[^/]+\/events$/)) {
      const incidentId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_incident_events")
        .select("*")
        .eq("incident_id", incidentId)
        .order("created_at", { ascending: true });
      return new Response(JSON.stringify({ events: data }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /incidents - declare new incident
    if (req.method === "POST" && path === "incidents") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const { data: incident, error } = await sb.from("platform_incidents").insert({
        title: body.title,
        description: body.description || null,
        severity: body.severity || 'medium',
        affected_systems: body.affected_systems || [],
        declared_by: actor.user.id,
      }).select().single();
      if (error) throw new Error(error.message);

      // Add initial event
      await sb.from("platform_incident_events").insert({
        incident_id: incident.id,
        event_type: 'declared',
        description: `Incident declared: ${body.title}`,
        actor_user_id: actor.user.id,
      });

      await logAction(sb, actor, "PLATFORM_INCIDENT_DECLARED", {
        target_table: "platform_incidents", target_id: incident.id,
        note: body.title,
      });

      return new Response(JSON.stringify({ success: true, incident }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /incidents/:id/resolve
    if (req.method === "POST" && path.match(/^incidents\/[^/]+\/resolve$/)) {
      const incidentId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();

      const { error } = await sb.from("platform_incidents").update({
        status: 'resolved',
        root_cause: body.root_cause || null,
        actions_taken: body.actions_taken || null,
        resolved_by: actor.user.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", incidentId);
      if (error) throw new Error(error.message);

      await sb.from("platform_incident_events").insert({
        incident_id: incidentId,
        event_type: 'resolved',
        description: `Incident resolved. Root cause: ${body.root_cause || 'N/A'}`,
        actor_user_id: actor.user.id,
      });

      await logAction(sb, actor, "PLATFORM_INCIDENT_RESOLVED", {
        target_table: "platform_incidents", target_id: incidentId,
        note: body.root_cause || 'Resolved',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /team
    if (req.method === "GET" && path === "team") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data } = await sb.from("platform_admins").select("*").order("created_at", { ascending: false });
      const enriched = [];
      for (const pa of (data || [])) {
        const { data: { user } } = await sb.auth.admin.getUserById(pa.user_id);
        enriched.push({ ...pa, email: user?.email || "unknown" });
      }
      return new Response(JSON.stringify({ team: enriched }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /team/add
    if (req.method === "POST" && path === "team/add") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const email = body.email?.trim().toLowerCase();
      const role = body.role || "support";
      if (!email) throw new Error("Email required");
      if (!["super_admin", "support"].includes(role)) throw new Error("Invalid role");
      const { data: { users } } = await sb.auth.admin.listUsers();
      const targetUser = (users || []).find((u: any) => u.email?.toLowerCase() === email);
      if (!targetUser) throw new Error(`No user found with email: ${email}`);
      const { error } = await sb.from("platform_admins").upsert({
        user_id: targetUser.id, role, is_active: true,
      }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_TEAM_MEMBER_ADDED", { note: `Added ${email} as ${role}` });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /team/remove
    if (req.method === "POST" && path === "team/remove") {
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.user_id) throw new Error("user_id required");
      if (body.user_id === actor.user.id) throw new Error("Cannot remove yourself");
      const { error } = await sb.from("platform_admins").update({ is_active: false }).eq("user_id", body.user_id);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_TEAM_MEMBER_REMOVED", { note: `Deactivated ${body.user_id}` });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/reset-password
    if (req.method === "POST" && path.match(/^users\/[^/]+\/reset-password$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: { user } } = await sb.auth.admin.getUserById(userId);
      if (!user?.email) throw new Error("User not found or no email");
      const { data, error } = await sb.auth.admin.generateLink({ type: "recovery", email: user.email });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_PASSWORD_RESET", {
        target_table: "auth.users", target_id: userId, note: `Password reset for ${user.email}`,
      });
      return new Response(JSON.stringify({ success: true, email: user.email, reset_link: data?.properties?.action_link }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/update-email
    if (req.method === "POST" && path.match(/^users\/[^/]+\/update-email$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.email) throw new Error("New email required");
      const { data: { user: before } } = await sb.auth.admin.getUserById(userId);
      const { data: { user }, error } = await sb.auth.admin.updateUserById(userId, { email: body.email });
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_USER_EMAIL_UPDATED", {
        target_table: "auth.users", target_id: userId,
        before: { email: before?.email }, after: { email: body.email },
      });
      return new Response(JSON.stringify({ success: true, email: user?.email }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /users/:id/update-phone
    if (req.method === "POST" && path.match(/^users\/[^/]+\/update-phone$/)) {
      const userId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      if (!body.phone) throw new Error("New phone required");
      const { data: { user: before } } = await sb.auth.admin.getUserById(userId);
      const { data: { user }, error } = await sb.auth.admin.updateUserById(userId, { phone: body.phone });
      if (error) throw new Error(error.message);
      await sb.from("profiles").update({ phone: body.phone }).eq("id", userId);
      await logAction(sb, actor, "PLATFORM_USER_PHONE_UPDATED", {
        target_table: "auth.users", target_id: userId,
        before: { phone: before?.phone }, after: { phone: body.phone },
      });
      return new Response(JSON.stringify({ success: true, phone: user?.phone }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /workspaces/:id/delete
    if (req.method === "POST" && path.match(/^workspaces\/[^/]+\/delete$/)) {
      const workspaceId = path.split("/")[1];
      const body = await req.json();
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const deleteType = body.type || 'soft';
      const reason = body.reason || '';

      if (deleteType === 'soft') {
        // Soft delete: suspend + mark as deleted
        const { error } = await sb.from("tenants").update({
          is_suspended: true,
          suspended_reason: `Archived by admin: ${reason}`.trim(),
          suspended_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        }).eq("id", workspaceId);
        if (error) throw new Error(error.message);
        await logAction(sb, actor, "PLATFORM_WORKSPACE_ARCHIVED", {
          workspace_id: workspaceId, note: reason || 'Soft deleted / archived',
        });
      } else {
        // Hard delete: remove workspace and all associated data
        // Delete in order to respect foreign keys
        const tables = [
          "campaign_jobs", "campaign_logs", "campaign_analytics", "campaign_audiences", "campaigns",
          "automation_steps", "automation_scheduled_jobs", "automation_runs",
          "automation_deadletters", "automation_cooldowns", "automation_rate_limits",
          "automation_loop_guards", "automation_edges", "automation_nodes", "automation_workflows",
          "messages", "conversations", "contact_tags", "contact_timeline", "contacts",
          "templates", "smeksh_phone_numbers", "agents",
          "workspace_entitlements", "tenant_members", "audit_logs",
        ];
        for (const table of tables) {
          await sb.from(table).delete().eq("tenant_id", workspaceId);
        }
        // Finally delete the tenant itself
        const { error } = await sb.from("tenants").delete().eq("id", workspaceId);
        if (error) throw new Error(error.message);
        await logAction(sb, actor, "PLATFORM_WORKSPACE_HARD_DELETED", {
          workspace_id: workspaceId, note: reason || 'Permanently deleted',
        });
      }

      return new Response(JSON.stringify({ success: true, type: deleteType }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /incidents/:id/ai-summary
    if (req.method === "POST" && path.match(/^incidents\/[^/]+\/ai-summary$/)) {
      const incidentId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      
      const [incidentRes, eventsRes, auditRes] = await Promise.all([
        sb.from("platform_incidents").select("*").eq("id", incidentId).single(),
        sb.from("platform_incident_events").select("*").eq("incident_id", incidentId).order("created_at", { ascending: true }),
        sb.from("platform_audit_logs").select("action,created_at,note").order("created_at", { ascending: false }).limit(20),
      ]);

      const incident = incidentRes.data;
      const events = eventsRes.data || [];

      const summaryParts = [
        `Incident: ${incident?.title || 'Unknown'}`,
        `Severity: ${incident?.severity || 'unknown'}`,
        `Status: ${incident?.status || 'unknown'}`,
        `Declared: ${incident?.created_at || 'N/A'}`,
        incident?.resolved_at ? `Resolved: ${incident.resolved_at}` : 'Still active',
        '',
        `Affected systems: ${(incident?.affected_systems || []).join(', ') || 'None specified'}`,
        '',
        'Timeline:',
        ...events.map((e: any) => `  • [${new Date(e.created_at).toLocaleString()}] ${e.event_type}: ${e.description}`),
        '',
        incident?.root_cause ? `Root Cause: ${incident.root_cause}` : '',
        incident?.actions_taken ? `Actions Taken: ${incident.actions_taken}` : '',
      ].filter(Boolean).join('\n');

      await logAction(sb, actor, "PLATFORM_AI_SUMMARY_GENERATED", {
        target_table: "platform_incidents", target_id: incidentId,
      });

      return new Response(JSON.stringify({ success: true, summary: summaryParts }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // GET /phone-numbers
    if (req.method === "GET" && path === "phone-numbers") {
      const actor = await requirePlatformRole(req, ["super_admin", "support"]);
      const sb = adminClient();
      const search = url.searchParams.get("search") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 25;
      const offset = (page - 1) * limit;

      let query = sb.from("phone_numbers").select("id, tenant_id, waba_account_id, phone_number_id, display_number, verified_name, quality_rating, status, messaging_limit, webhook_health, last_webhook_at, is_default, created_at, updated_at", { count: "exact" });
      if (search) {
        query = query.or(`display_number.ilike.%${search}%,verified_name.ilike.%${search}%`);
      }
      const { data: phones, count } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

      // Enrich with workspace names
      const tenantIds = [...new Set((phones || []).map((p: any) => p.tenant_id))];
      let tenantMap: Record<string, string> = {};
      if (tenantIds.length > 0) {
        const { data: tenants } = await sb.from("tenants").select("id, name").in("id", tenantIds);
        for (const t of tenants || []) tenantMap[t.id] = t.name;
      }

      // Enrich with WABA status
      const wabaIds = [...new Set((phones || []).filter((p: any) => p.waba_account_id).map((p: any) => p.waba_account_id))];
      let wabaMap: Record<string, any> = {};
      if (wabaIds.length > 0) {
        const { data: wabas } = await sb.from("waba_accounts").select("id, waba_id, status, name").in("id", wabaIds);
        for (const w of wabas || []) wabaMap[w.id] = w;
      }

      const enriched = (phones || []).map((p: any) => ({
        ...p,
        workspace_name: tenantMap[p.tenant_id] || null,
        waba: wabaMap[p.waba_account_id] || null,
      }));

      return new Response(JSON.stringify({ phones: enriched, total: count, page, limit }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /phone-numbers/:id/update-status
    if (req.method === "POST" && path.match(/^phone-numbers\/[^/]+\/update-status$/)) {
      const phoneId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const { data: before } = await sb.from("phone_numbers").select("*").eq("id", phoneId).single();
      const { error } = await sb.from("phone_numbers").update({
        status: body.status,
        updated_at: new Date().toISOString(),
      }).eq("id", phoneId);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, "PLATFORM_PHONE_STATUS_UPDATED", {
        target_table: "phone_numbers", target_id: phoneId,
        before: { status: before?.status }, after: { status: body.status },
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /phone-numbers/:id/delete
    if (req.method === "POST" && path.match(/^phone-numbers\/[^/]+\/delete$/)) {
      const phoneId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const { data: phone } = await sb.from("phone_numbers").select("*").eq("id", phoneId).single();
      if (!phone) throw new Error("Phone number not found");

      // Remove from workspace_phone_numbers mapping
      await sb.from("workspace_phone_numbers").delete().eq("phone_e164", phone.display_number);

      // Delete the phone number record
      const { error } = await sb.from("phone_numbers").delete().eq("id", phoneId);
      if (error) throw new Error(error.message);

      await logAction(sb, actor, "PLATFORM_PHONE_DELETED", {
        workspace_id: phone.tenant_id, target_table: "phone_numbers", target_id: phoneId,
        note: `Deleted phone ${phone.display_number} from workspace`,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // POST /phone-numbers/:id/toggle-waba
    if (req.method === "POST" && path.match(/^phone-numbers\/[^/]+\/toggle-waba$/)) {
      const phoneId = path.split("/")[1];
      const actor = await requirePlatformRole(req, ["super_admin"]);
      const sb = adminClient();
      const body = await req.json();
      const { data: phone } = await sb.from("phone_numbers").select("waba_account_id").eq("id", phoneId).single();
      if (!phone?.waba_account_id) throw new Error("No WABA account linked");
      const newStatus = body.enabled ? 'active' : 'disabled';
      const { error } = await sb.from("waba_accounts").update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      }).eq("id", phone.waba_account_id);
      if (error) throw new Error(error.message);
      await logAction(sb, actor, body.enabled ? "PLATFORM_WABA_ENABLED" : "PLATFORM_WABA_DISABLED", {
        target_table: "waba_accounts", target_id: phone.waba_account_id,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e: any) {
    const msg = e.message || "";
    const status = msg.includes("Forbidden") ? 403
      : msg.includes("auth") || msg.includes("Access") || msg.includes("Read-only") ? 401
      : 500;
    return new Response(JSON.stringify({ error: e.message }), {
      status, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
