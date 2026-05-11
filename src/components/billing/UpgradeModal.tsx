import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Lock, Check, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { registerUpgradeOpener } from "@/lib/planErrorBus";

type PlanId = "free" | "basic" | "pro" | "business";

const PLAN_LABEL: Record<PlanId, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  business: "Business",
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

const PLAN_PERKS: Record<PlanId, string[]> = {
  free: ["1 team member", "1 automation", "100 conversations/mo"],
  basic: ["5 team members", "5 automations", "3 flows", "Integrations", "Auto-forms"],
  pro: ["10 team members", "25 automations", "15 flows", "Meta Ads", "Full AI"],
  business: ["25 team members", "Unlimited everything", "Enterprise AI", "Priority support"],
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

  const open = useCallback((ctx: UpgradeContext) => setState({ ...ctx, open: true }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    registerUpgradeOpener(open);
  }, [open]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  const currentPlan = (state.currentPlan as PlanId) || "free";
  const requiredPlan = (state.requiredPlan as PlanId) || "pro";
  const featureLabel = FEATURE_LABEL[state.feature] || state.feature;
  const isQuota = state.reason === "quota_exceeded";

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={state.open} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
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
                      ? `${PLAN_LABEL[currentPlan]} plan includes ${state.planLimit} — you're using ${state.currentUsage ?? state.planLimit}.`
                      : `${PLAN_LABEL[currentPlan]} plan doesn't include this feature.`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current</span>
                  <Badge variant="outline">{PLAN_LABEL[currentPlan]}</Badge>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {PLAN_PERKS[currentPlan].map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 mt-0.5 opacity-50" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border-2 border-primary/40 p-4 bg-primary/5 relative">
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Recommended
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">Upgrade to</span>
                  <Badge className="bg-primary text-primary-foreground">{PLAN_LABEL[requiredPlan]}</Badge>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {PLAN_PERKS[requiredPlan].map((p) => (
                    <li key={p} className="flex items-start gap-2 text-foreground">
                      <Check className="h-3.5 w-3.5 mt-0.5 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1 gap-2">
                <Link to="/pricing" onClick={close}>
                  <Sparkles className="h-4 w-4" /> Upgrade to {PLAN_LABEL[requiredPlan]} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" onClick={close}>
                <Link to="/pricing">Compare plans</Link>
              </Button>
            </div>
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
 * Returns true if it was a plan error (so caller can suppress toast).
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
