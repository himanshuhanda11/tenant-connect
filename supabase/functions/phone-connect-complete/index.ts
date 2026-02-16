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

    // Read current phone number from phone_numbers table
    const { data: phone } = await admin
      .from("phone_numbers")
      .select("*")
      .eq("tenant_id", workspaceId)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!phone) {
      return json({ error: "No phone number found for this workspace. Start connection first." }, 404);
    }

    // Return current status - this is a "refresh" action
    return json({ ok: true, phone });
  } catch (e) {
    console.error("phone-connect-complete error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});
