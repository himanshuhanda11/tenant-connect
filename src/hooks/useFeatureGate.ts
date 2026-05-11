import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUpgradeModal } from "@/components/billing/UpgradeModal";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

export type FeatureCheck = {
  allowed: boolean;
  loading: boolean;
  reason?: string;
  current_plan?: string;
  upgrade_to?: string;
  current_usage?: number;
  plan_limit?: number;
};

async function rpcCheck(tenantId: string, featureKey: string): Promise<FeatureCheck> {
  const { data, error } = await supabase.rpc("check_plan_access", {
    p_tenant_id: tenantId,
    p_feature_key: featureKey,
  } as never);
  if (error) return { allowed: false, loading: false, reason: "rpc_error" };
  const r = (data as any) ?? { allowed: false };
  return { ...r, loading: false };
}

/**
 * Server-authoritative feature gate. Use at click sites:
 *   const gate = useFeatureGate("create_automation");
 *   if (!await gate.guard()) return; // shows upgrade modal & aborts
 */
export function useFeatureGate(featureKey: string) {
  const { currentTenant } = useTenant();
  const currentTenantId = currentTenant?.id ?? null;
  const { open } = useUpgradeModal();
  const [state, setState] = useState<FeatureCheck>({ allowed: false, loading: true });

  useEffect(() => {
    let alive = true;
    if (!currentTenantId) {
      setState({ allowed: false, loading: false, reason: "no_tenant" });
      return;
    }
    rpcCheck(currentTenantId, featureKey).then((r) => alive && setState(r));
    return () => {
      alive = false;
    };
  }, [currentTenantId, featureKey]);

  const refresh = useCallback(async () => {
    if (!currentTenantId) return;
    setState((s) => ({ ...s, loading: true }));
    setState(await rpcCheck(currentTenantId, featureKey));
  }, [currentTenantId, featureKey]);

  /** Run-time check before performing an action; opens modal & returns false on deny. */
  const guard = useCallback(async (): Promise<boolean> => {
    if (!currentTenantId) {
      toast.error("No workspace selected");
      return false;
    }
    const r = await rpcCheck(currentTenantId, featureKey);
    setState(r);
    if (r.allowed) return true;
    if (r.reason === "not_a_member" || r.reason === "rpc_error") {
      toast.error("You don't have access to this action.");
      return false;
    }
    open({
      feature: featureKey,
      currentPlan: r.current_plan,
      requiredPlan: r.upgrade_to,
      reason: r.reason,
      currentUsage: r.current_usage,
      planLimit: r.plan_limit,
    });
    return false;
  }, [currentTenantId, featureKey, open]);

  /** Convert any backend error message starting with "plan_access_denied" into an upgrade modal. */
  const handleDbError = useCallback(
    (err: any): boolean => {
      const msg: string = err?.message || err?.error?.message || "";
      if (!msg.includes("plan_access_denied")) return false;
      // Format: plan_access_denied:<reason>:<feature>:<current_plan>:<upgrade_to>
      const parts = msg.split("plan_access_denied:")[1]?.split(":") ?? [];
      const [reason, feature, current_plan, upgrade_to] = parts;
      open({
        feature: feature || featureKey,
        currentPlan: current_plan,
        requiredPlan: upgrade_to,
        reason,
      });
      return true;
    },
    [open, featureKey],
  );

  return { ...state, guard, refresh, handleDbError };
}
