import { getAdminClient, json } from "./supabase.ts";

export type PlanAccessResult = {
  allowed: boolean;
  reason?: string;
  current_plan?: string;
  upgrade_to?: string;
  feature?: string;
};

/**
 * Server-side plan/feature access check from edge functions.
 * Calls the SECURITY DEFINER `check_plan_access` RPC.
 *
 * Returns `{ ok: true }` when the action is permitted, otherwise a 402-style
 * Response payload with the upgrade reason.
 */
export async function requirePlanAccess(
  tenantId: string,
  featureKey: string,
): Promise<{ ok: true } | { ok: false; res: Response }> {
  const admin = getAdminClient();
  const { data, error } = await admin.rpc("check_plan_access", {
    p_tenant_id: tenantId,
    p_feature_key: featureKey,
  });

  if (error) {
    console.error("check_plan_access error:", error);
    return {
      ok: false,
      res: json(
        { error: "plan_check_failed", detail: error.message },
        500,
      ),
    };
  }

  const result = (data as PlanAccessResult) ?? { allowed: false };
  if (!result.allowed) {
    return {
      ok: false,
      res: json(
        {
          error: "plan_access_denied",
          reason: result.reason ?? "feature_not_in_plan",
          current_plan: result.current_plan,
          upgrade_to: result.upgrade_to,
          feature: featureKey,
        },
        402,
      ),
    };
  }

  return { ok: true };
}
