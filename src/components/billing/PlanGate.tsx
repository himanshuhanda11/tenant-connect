import { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlanAccess } from "@/hooks/usePlanAccess";

interface PlanGateProps {
  tenantId: string | null | undefined;
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Conditionally renders children only if the workspace has access to `feature`.
 * The check is performed server-side; this is a UX wrapper.
 */
export function PlanGate({ tenantId, feature, children, fallback, showUpgrade = true }: PlanGateProps) {
  const { allowed, loading, reason, current_plan, upgrade_to } = usePlanAccess(tenantId, feature);

  if (loading) return null;
  if (allowed) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  if (!showUpgrade) return null;

  const expired = reason === "plan_expired";
  const paused = reason === "sending_paused";

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        {expired || paused ? (
          <Lock className="h-5 w-5 text-primary" />
        ) : (
          <Sparkles className="h-5 w-5 text-primary" />
        )}
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">
        {expired
          ? "Your plan has expired"
          : paused
            ? "Sending is paused"
            : `Upgrade to ${upgrade_to ?? "Pro"} to unlock this`}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {expired
          ? "Renew your subscription to continue using paid features."
          : paused
            ? "Resolve your billing issue to resume sending."
            : `You're on ${current_plan ?? "Free"}. This feature requires the ${upgrade_to ?? "Pro"} plan or higher.`}
      </p>
      <Button asChild size="sm">
        <Link to="/pricing">View plans</Link>
      </Button>
    </div>
  );
}
