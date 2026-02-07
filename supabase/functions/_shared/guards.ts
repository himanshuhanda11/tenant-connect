import { getAdminClient, getUserClient, json } from "./supabase.ts";

export async function requireUser(req: Request) {
  const userClient = getUserClient(req);
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) {
    return { ok: false as const, res: json({ error: "Unauthorized" }, 401) };
  }
  return { ok: true as const, user: data.user };
}

/**
 * Check tenant membership + role.
 * Uses tenant_members (your existing table) instead of workspace_members.
 */
export async function requireTenantRole(
  tenantId: string,
  userId: string,
  allowedRoles: string[]
) {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.role) {
    return { ok: false as const, error: "Not a member of this workspace" };
  }
  if (!allowedRoles.includes(data.role)) {
    return { ok: false as const, error: "Insufficient permissions" };
  }
  return { ok: true as const, role: data.role };
}

export function requirePlatformSecret(req: Request): boolean {
  const provided = req.headers.get("x-platform-secret");
  const expected = Deno.env.get("PLATFORM_WEBHOOK_SECRET");
  return !!provided && !!expected && provided === expected;
}
