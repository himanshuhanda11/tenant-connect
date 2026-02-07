import { getAdminClient, json, corsHeaders } from "../_shared/supabase.ts";
import { requireUser, requireTenantRole } from "../_shared/guards.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.res;

    const body = await req.json().catch(() => ({}));
    const workspaceId = body.workspaceId as string;

    if (!workspaceId) return json({ error: "workspaceId required" }, 400);

    const perm = await requireTenantRole(workspaceId, auth.user.id, ["owner", "admin"]);
    if (!perm.ok) return json({ error: perm.error }, 403);

    const admin = getAdminClient();

    // Read current row
    const { data: before } = await admin
      .from("workspace_phone_numbers")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (!before) {
      return json({ error: "No phone number found for this workspace. Start connection first." }, 404);
    }

    if (before.status === "active") {
      return json({ ok: true, phone: before, message: "Already active" });
    }

    const patch: Record<string, unknown> = {
      status: "active",
      quality_rating: body.quality_rating ?? before.quality_rating ?? null,
      messaging_limit: body.messaging_limit ?? before.messaging_limit ?? null,
      waba_id: body.waba_id ?? before.waba_id ?? null,
      phone_number_id: body.phone_number_id ?? before.phone_number_id ?? null,
      display_name: body.display_name ?? before.display_name ?? null,
    };

    const { data: after, error } = await admin
      .from("workspace_phone_numbers")
      .update(patch)
      .eq("workspace_id", workspaceId)
      .select("*")
      .single();

    if (error) return json({ error: error.message }, 400);

    // Update tenant onboarding status
    await admin
      .from("tenants")
      .update({ onboarding_status: "number_connected" })
      .eq("id", workspaceId)
      .catch(() => null);

    // Recompute entitlements
    await admin
      .rpc("compute_workspace_entitlements", { p_workspace_id: workspaceId })
      .catch(() => null);

    // Audit log
    await admin
      .from("audit_logs")
      .insert({
        tenant_id: workspaceId,
        user_id: auth.user.id,
        action: "phone_connect_complete",
        resource_type: "workspace_phone_numbers",
        resource_id: after.id,
        details: { before_status: before.status, after_status: "active" },
      })
      .catch(() => null);

    return json({ ok: true, phone: after });
  } catch (e) {
    console.error("phone-connect-complete error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
