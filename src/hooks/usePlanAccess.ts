import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanAccessResult = {
  allowed: boolean;
  reason?: string;
  current_plan?: string;
  upgrade_to?: string;
  feature?: string;
};

/**
 * Server-authoritative plan/feature gating.
 * The DB function `check_plan_access` is the source of truth.
 * Frontend results are advisory only — the server still enforces
 * via `enforce_plan_access` inside protected RPCs and edge functions.
 */
export function usePlanAccess(tenantId: string | null | undefined, featureKey: string) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PlanAccessResult>({ allowed: false });

  const check = useCallback(async () => {
    if (!tenantId || !featureKey) {
      setResult({ allowed: false, reason: "missing_params" });
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("check_plan_access", {
      p_tenant_id: tenantId,
      p_feature_key: featureKey,
    } as never);
    if (error) {
      setResult({ allowed: false, reason: "rpc_error" });
    } else {
      setResult((data as PlanAccessResult) ?? { allowed: false });
    }
    setLoading(false);
  }, [tenantId, featureKey]);

  useEffect(() => {
    check();
  }, [check]);

  return { ...result, loading, refresh: check };
}

/** Imperative one-shot check (e.g. before submitting a form). */
export async function checkPlanAccess(
  tenantId: string,
  featureKey: string
): Promise<PlanAccessResult> {
  const { data, error } = await supabase.rpc("check_plan_access", {
    p_tenant_id: tenantId,
    p_feature_key: featureKey,
  } as never);
  if (error) return { allowed: false, reason: "rpc_error" };
  return (data as PlanAccessResult) ?? { allowed: false };
}
