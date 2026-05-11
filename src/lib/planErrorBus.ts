// Global bridge so non-React code (services, hooks) can open the upgrade modal
// when a Postgres plan-trigger raises `plan_access_denied:...`.
import type { UpgradeContext } from "@/components/billing/UpgradeModal";

type Opener = (ctx: UpgradeContext) => void;

let opener: Opener | null = null;

export function registerUpgradeOpener(fn: Opener) {
  opener = fn;
}

/** Returns true if `err` was a plan error and the modal was opened. */
export function reportPlanError(err: any): boolean {
  const msg: string =
    err?.message || err?.error?.message || err?.details || err?.hint || "";
  if (!msg.includes("plan_access_denied")) return false;
  const parts = msg.split("plan_access_denied:")[1]?.split(":") ?? [];
  const [reason, feature, current_plan, upgrade_to] = parts;
  opener?.({
    feature: (feature || "").trim(),
    currentPlan: (current_plan || "").trim(),
    requiredPlan: (upgrade_to || "").trim(),
    reason: (reason || "").trim(),
  });
  return true;
}
