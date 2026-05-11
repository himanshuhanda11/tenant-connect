import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Sparkles, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { registerUpgradeOpener } from "@/lib/planErrorBus";
import { PlanCardsGrid } from "@/components/billing/PlanCardsGrid";
import { MonthlyYearlyToggle } from "@/components/billing/MonthlyYearlyToggle";
import { useTenant } from "@/contexts/TenantContext";
import { useStartCheckout, useChangePlan, useWorkspaceBilling } from "@/hooks/useWorkspaceBilling";
import { regionFromCountry, type PlanId } from "@/data/plans.config";

const PLAN_LABEL: Record<string, string> = {
  free: "Free", basic: "Basic", pro: "Pro", business: "Business",
};

const FEATURE_LABEL: Record<string, string> = {
  add_team_member: "Add team members",
  invite_member: "Invite team members",
  create_automation: "Create automations",
  create_flow: "Create WhatsApp flows",
  create_widget: "Create chat widgets",
  create_integration: "Connect integrations",
  create_autoform: "Create auto-forms",
  send_campaign: "Send campaigns",
  meta_ads: "Meta Ads",
  create_meta_ad_account: "Connect Meta Ads",
  ai_reply: "AI auto-reply",
  advanced_reports: "Advanced analytics",
  create_template: "Submit templates",
};

export interface UpgradeContext {
  feature: string;
  currentPlan?: string;
  requiredPlan?: string;
  reason?: string;
  currentUsage?: number;
  planLimit?: number;
}

interface ModalState extends UpgradeContext {
  open: boolean;
}

const Ctx = createContext<{
  open: (ctx: UpgradeContext) => void;
  close: () => void;
} | null>(null);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({ open: false, feature: "" });
  const [isYearly, setIsYearly] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const { currentTenant } = useTenant();
  const { data: billing } = useWorkspaceBilling();
  const startCheckout = useStartCheckout();
  const changePlan = useChangePlan();

  const open = useCallback((ctx: UpgradeContext) => setState({ ...ctx, open: true }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  useEffect(() => { registerUpgradeOpener(open); }, [open]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  const currentPlan = state.currentPlan || billing?.plan_id?.replace(/^plan_/, "") || "free";
  const requiredPlan = state.requiredPlan || "pro";
  const featureLabel = FEATURE_LABEL[state.feature] || state.feature;
  const isQuota = state.reason === "quota_exceeded";

  const region = regionFromCountry((currentTenant as any)?.country);
  const country = (currentTenant as any)?.country ?? undefined;

  const handleSelect = async (planId: PlanId, cycle: "monthly" | "yearly") => {
    if (!currentTenant?.id) {
      toast.error("No workspace selected");
      return;
    }
    setPending(planId);
    try {
      if (billing?.has_subscription) {
        await changePlan.mutateAsync({
          workspaceId: currentTenant.id, planId, billingCycle: cycle,
        });
        toast.success("Plan change requested");
        close();
        return;
      }
      const res = await startCheckout.mutateAsync({
        workspaceId: currentTenant.id,
        planId,
        billingCycle: cycle,
        region,
        country,
        successPath: "/billing?status=success",
        cancelPath: "/billing?status=cancelled",
      });
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast.success("Plan updated");
      close();
    } catch (e: any) {
      toast.error(e?.message || "Could not start checkout");
    } finally {
      setPending(null);
    }
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={state.open} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8 border-b border-border/50">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  {isQuota ? <Lock className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl">
                    {isQuota
                      ? `You've reached your ${featureLabel.toLowerCase()} limit`
                      : `Upgrade to unlock ${featureLabel.toLowerCase()}`}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {isQuota && state.planLimit !== undefined
                      ? `${PLAN_LABEL[currentPlan] ?? currentPlan} plan includes ${state.planLimit} — you're using ${state.currentUsage ?? state.planLimit}. Pick a plan below to continue.`
                      : `${PLAN_LABEL[currentPlan] ?? currentPlan} plan doesn't include this. Choose a plan below — checkout opens instantly.`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex justify-center">
              <MonthlyYearlyToggle yearly={isYearly} onChange={setIsYearly} variant="light" />
            </div>
            <PlanCardsGrid
              region={region}
              cycle={isYearly ? "yearly" : "monthly"}
              currentPlanId={billing?.plan_id ?? `plan_${currentPlan}`}
              showFree={false}
              onSelect={handleSelect}
              loadingPlanId={pending}
              variant="light"
              showTrialBadge={!billing?.has_subscription}
            />
            <p className="text-xs text-center text-muted-foreground">
              Your plan upgrades automatically right after a successful payment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useUpgradeModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUpgradeModal must be used inside UpgradeModalProvider");
  return ctx;
}

/**
 * Parses a Postgres error from a plan-quota trigger and opens the upgrade modal.
 * Format: plan_access_denied:<reason>:<feature>:<current_plan>:<upgrade_to>
 */
export function handlePlanError(err: any, open: (ctx: UpgradeContext) => void): boolean {
  const msg: string = err?.message || err?.error?.message || err?.details || "";
  if (!msg.includes("plan_access_denied")) return false;
  const parts = msg.split("plan_access_denied:")[1]?.split(":") ?? [];
  const [reason, feature, current_plan, upgrade_to] = parts;
  open({
    feature: (feature || "").trim(),
    currentPlan: (current_plan || "").trim(),
    requiredPlan: (upgrade_to || "").trim(),
    reason: (reason || "").trim(),
  });
  return true;
}
