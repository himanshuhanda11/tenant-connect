import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { PlanCardsGrid } from '@/components/billing/PlanCardsGrid';
import { MonthlyYearlyToggle } from '@/components/billing/MonthlyYearlyToggle';
import { useTenant } from '@/contexts/TenantContext';
import { useStartCheckout, useChangePlan, useWorkspaceBilling } from '@/hooks/useWorkspaceBilling';
import { regionFromCountry, type PlanId } from '@/data/plans.config';

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentPlanId?: string;
}

export function UpgradePlanDialog({ open, onOpenChange, currentPlanId }: UpgradePlanDialogProps) {
  const { currentTenant } = useTenant();
  const { data: billing } = useWorkspaceBilling();
  const startCheckout = useStartCheckout();
  const changePlan = useChangePlan();
  const [pending, setPending] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const isTopPlan = (currentPlanId ?? '').replace(/^plan_/, '') === 'business';
  const region = regionFromCountry((currentTenant as any)?.country);
  const country = (currentTenant as any)?.country ?? undefined;

  const handleSelect = async (planId: PlanId, cycle: 'monthly' | 'yearly') => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    setPending(planId);
    try {
      // Active sub → in-place plan change via Stripe
      if (billing?.has_subscription) {
        await changePlan.mutateAsync({
          workspaceId: currentTenant.id, planId, billingCycle: cycle,
        });
        toast.success('Plan change requested');
        onOpenChange(false);
        return;
      }
      // No active sub → fresh Checkout (same path as onboarding)
      const res = await startCheckout.mutateAsync({
        workspaceId: currentTenant.id,
        planId,
        billingCycle: cycle,
        region,
        country,
        successPath: '/billing?status=success',
        cancelPath: '/billing?status=cancelled',
      });
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast.success('Plan updated');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || 'Could not update plan');
    } finally {
      setPending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isTopPlan ? "You're on the Business Plan" : 'Upgrade Workspace Plan'}
          </DialogTitle>
          <DialogDescription>
            {isTopPlan
              ? "You're already on the highest plan. You can add extra capacity via add-ons."
              : 'Same pricing as the public Pricing page. Includes 1 WhatsApp number.'}
          </DialogDescription>
        </DialogHeader>

        {isTopPlan ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              You have full access to all features. Need more capacity? Check out add-ons for extra team seats, flows, or AI credits.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Got it</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-center my-2">
              <MonthlyYearlyToggle yearly={isYearly} onChange={setIsYearly} variant="light" />
            </div>
            <PlanCardsGrid
              region={region}
              cycle={isYearly ? 'yearly' : 'monthly'}
              currentPlanId={currentPlanId}
              showFree={false}
              onSelect={(id, cycle) => handleSelect(id, cycle)}
              loadingPlanId={pending}
              variant="light"
              showTrialBadge={!billing?.has_subscription}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
