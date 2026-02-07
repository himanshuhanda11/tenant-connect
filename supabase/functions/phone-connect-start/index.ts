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
    const phoneE164 = (body.phoneE164 as string)?.trim();
    const displayName = (body.displayName as string) ?? null;
    const provider = (body.provider as string) ?? "meta";

    if (!workspaceId || !phoneE164) {
      return json({ error: "workspaceId and phoneE164 required" }, 400);
    }

    // Validate E.164 format
    if (!/^\+\d{7,15}$/.test(phoneE164)) {
      return json({ error: "Invalid phone number format. Use E.164 (e.g. +919876543210)" }, 400);
    }

    const perm = await requireTenantRole(workspaceId, auth.user.id, ["owner", "admin"]);
    if (!perm.ok) return json({ error: perm.error }, 403);

    const admin = getAdminClient();

    // Insert pending phone number (DB constraints enforce uniqueness)
    const { data, error } = await admin
      .from("workspace_phone_numbers")
      .insert({
        workspace_id: workspaceId,
        phone_e164: phoneE164,
        display_name: displayName,
        provider,
        status: "pending",
        is_primary: true,
      })
      .select("*")
      .single();

    if (error) {
      // Unique constraint violations
      if (error.code === "23505") {
        if (error.message.includes("uniq_phone_global")) {
          return json({ error: "This phone number is already connected to another workspace." }, 409);
        }
        if (error.message.includes("uniq_one_phone_per_workspace")) {
          return json({ error: "This workspace already has a phone number connected." }, 409);
        }
      }
      return json({ error: error.message }, 409);
    }

    // Audit log
    await admin
      .from("audit_logs")
      .insert({
        tenant_id: workspaceId,
        user_id: auth.user.id,
        action: "phone_connect_start",
        resource_type: "workspace_phone_numbers",
        resource_id: data.id,
        details: { phone_e164: phoneE164, provider },
      })
      .catch(() => null);

    return json({ ok: true, phone: data });
  } catch (e) {
    console.error("phone-connect-start error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
