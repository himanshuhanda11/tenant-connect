import { getAdminClient, getUserClient, corsHeaders, json } from "../_shared/supabase.ts";
import { requireUser, requireTenantRole } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify caller is authenticated
    const auth = await requireUser(req);
    if (!auth.ok) return auth.res;

    const { email, password, fullName, tenantId, roleId, teamIds, phoneNumberIds } = await req.json();

    if (!email || !password || !tenantId) {
      return json({ error: "email, password, and tenantId are required" }, 400);
    }

    if (password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }

    // 2. Verify caller has admin/owner role in this tenant
    const roleCheck = await requireTenantRole(tenantId, auth.user.id, ["owner", "admin"]);
    if (!roleCheck.ok) {
      return json({ error: roleCheck.error }, 403);
    }

    const admin = getAdminClient();

    // 3. Create auth user
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || email.split("@")[0] },
    });

    if (createErr) {
      console.error("Create user error:", createErr);
      return json({ error: createErr.message }, 400);
    }

    const userId = newUser.user.id;

    // 4. Update profile full_name
    await admin.from("profiles").update({
      full_name: fullName || email.split("@")[0],
      email,
    }).eq("id", userId);

    // 5. Add as tenant member
    await admin.from("tenant_members").insert({
      tenant_id: tenantId,
      user_id: userId,
      role: "agent",
    });

    // 6. Create agent record
    const { data: agentData, error: agentErr } = await admin.from("agents").insert({
      tenant_id: tenantId,
      user_id: userId,
      display_name: fullName || email.split("@")[0],
      is_active: true,
      status: "active",
      presence: "offline",
      role: "Agent",
    }).select("id").single();

    if (agentErr) {
      console.error("Agent create error:", agentErr);
    }

    // 7. Assign role if provided
    if (roleId && agentData) {
      // Get base_role from roles table
      const { data: roleData } = await admin.from("roles").select("base_role").eq("id", roleId).single();
      
      await admin.from("user_roles").insert({
        tenant_id: tenantId,
        user_id: userId,
        role_id: roleId,
      });

      // Update agent role field
      if (roleData?.base_role) {
        await admin.from("agents").update({ role: roleData.base_role }).eq("id", agentData.id);
      }
    }

    // 8. Add to teams if specified
    if (teamIds?.length > 0 && agentData) {
      const teamInserts = teamIds.map((tid: string) => ({
        tenant_id: tenantId,
        team_id: tid,
        agent_id: agentData.id,
        is_active: true,
      }));
      await admin.from("team_members").insert(teamInserts);
    }

    return json({ success: true, userId, agentId: agentData?.id });
  } catch (err) {
    console.error("create-team-member error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
