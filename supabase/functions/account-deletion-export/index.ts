// Generates a CSV archive of all contacts owned by a user across their workspaces,
// uploads it to the account-archives bucket, and emails signed download links to the
// account holder + super admins. Called by:
//   - delete-account (user self-delete)
//   - admin-api /users/:id/delete (admin permanent delete)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { user_id, account_email, account_name } = await req.json();
    if (!user_id) throw new Error("user_id required");

    // 1. Find owned workspaces
    const { data: owned } = await sb
      .from("tenant_members").select("tenant_id").eq("user_id", user_id).eq("role", "owner");
    const tenantIds: string[] = (owned || []).map((r: any) => r.tenant_id);

    // 2. Fetch tenants + teams + agents + contacts
    const [
      { data: tenants },
      { data: teams },
      { data: teamMembers },
      { data: agents },
      { data: contacts },
    ] = await Promise.all([
      sb.from("tenants").select("id,name").in("id", tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"]),
      sb.from("teams").select("id,tenant_id,name").in("tenant_id", tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"]),
      sb.from("team_members").select("team_id,agent_id,tenant_id").in("tenant_id", tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"]),
      sb.from("agents").select("id,tenant_id,display_name").in("tenant_id", tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"]),
      sb.from("contacts").select("id,tenant_id,name,first_name,wa_id,country,language,source,lead_status,deal_stage,first_message_time,last_seen,created_at")
        .in("tenant_id", tenantIds.length ? tenantIds : ["00000000-0000-0000-0000-000000000000"])
        .order("created_at", { ascending: false }),
    ]);

    const tenantName = new Map((tenants || []).map((t: any) => [t.id, t.name]));
    const teamName = new Map((teams || []).map((t: any) => [t.id, t.name]));
    const agentToTeam = new Map<string, string>();
    for (const tm of teamMembers || []) {
      if (!agentToTeam.has(tm.agent_id)) agentToTeam.set(tm.agent_id, teamName.get(tm.team_id) || "");
    }
    // Contacts don't have direct team mapping in schema; group by tenant + creation date.

    // 3. Build CSV grouped by Workspace > Date(YYYY-MM-DD)
    const header = [
      "workspace", "team", "date_added", "name", "first_name", "phone_wa_id",
      "country", "language", "source", "lead_status", "deal_stage",
      "first_message_at", "last_seen", "created_at",
    ];
    const rows: string[] = [header.join(",")];

    // Sort by tenant then by created_at desc (already sorted)
    const grouped = new Map<string, any[]>();
    for (const c of contacts || []) {
      const key = `${tenantName.get(c.tenant_id) || c.tenant_id}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(c);
    }

    for (const [wsName, list] of grouped) {
      // group separator row
      rows.push(`"=== Workspace: ${wsName.replace(/"/g, '""')} (${list.length} contacts) ===",,,,,,,,,,,,,,`);
      for (const c of list) {
        const dateAdded = c.created_at ? String(c.created_at).slice(0, 10) : "";
        rows.push([
          wsName, "",
          dateAdded,
          c.name || "", c.first_name || "", c.wa_id || "",
          c.country || "", c.language || "", c.source || "",
          c.lead_status || "", c.deal_stage || "",
          c.first_message_time || "", c.last_seen || "", c.created_at || "",
        ].map(csvEscape).join(","));
      }
    }

    const csv = rows.join("\n");
    const buf = new TextEncoder().encode(csv);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const path = `${user_id}/${ts}-contacts-export.csv`;

    const { error: upErr } = await sb.storage.from("account-archives").upload(path, buf, {
      contentType: "text/csv",
      upsert: true,
    });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    // 7-day signed URL
    const { data: signed, error: signErr } = await sb.storage.from("account-archives")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signErr) throw new Error(`Sign URL failed: ${signErr.message}`);
    const downloadUrl = signed?.signedUrl;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // 4. Email customer
    if (account_email) {
      await sb.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contacts-export",
          recipientEmail: account_email,
          idempotencyKey: `contacts-export-user-${user_id}`,
          templateData: {
            recipientName: account_name || null,
            accountEmail: account_email,
            contactCount: contacts?.length || 0,
            workspaceCount: tenantIds.length,
            downloadUrl,
            expiresAt,
            isAdminCopy: false,
          },
        },
      }).catch((e: any) => console.error("[archive] send to user failed:", e?.message));
    }

    // 5. Email super admins
    const { data: superAdmins } = await sb
      .from("platform_admins").select("user_id").eq("role", "super_admin").eq("is_active", true);
    const adminUserIds = (superAdmins || []).map((r: any) => r.user_id);
    for (const adminId of adminUserIds) {
      const { data: adminUser } = await sb.auth.admin.getUserById(adminId);
      const adminEmail = adminUser?.user?.email;
      if (!adminEmail) continue;
      await sb.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contacts-export",
          recipientEmail: adminEmail,
          idempotencyKey: `contacts-export-admin-${user_id}-${adminId}`,
          templateData: {
            recipientName: null,
            accountEmail: account_email,
            contactCount: contacts?.length || 0,
            workspaceCount: tenantIds.length,
            downloadUrl,
            expiresAt,
            isAdminCopy: true,
          },
        },
      }).catch((e: any) => console.error("[archive] send to admin failed:", e?.message));
    }

    return new Response(JSON.stringify({
      success: true,
      contact_count: contacts?.length || 0,
      workspace_count: tenantIds.length,
      archive_path: path,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[account-deletion-export]", e?.message);
    return new Response(JSON.stringify({ error: e?.message || "Failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
