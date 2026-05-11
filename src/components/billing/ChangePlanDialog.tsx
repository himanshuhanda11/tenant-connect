import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PlanCardsGrid } from '@/components/billing/PlanCardsGrid';
import { MonthlyYearlyToggle } from '@/components/billing/MonthlyYearlyToggle';
import { useTenant } from '@/contexts/TenantContext';
import { useStartCheckout, useChangePlan, useWorkspaceBilling } from '@/hooks/useWorkspaceBilling';
import { useLaunchOffer, useTrialEligibility } from '@/hooks/useLaunchOffer';
import { regionFromCountry, type PlanId } from '@/data/plans.config';
import ContactAdminDialog from './ContactAdminDialog';

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
  onChanged?: () => void;
}

export default function ChangePlanDialog({ open, onOpenChange, currentPlanId, onChanged }: ChangePlanDialogProps) {
  const { currentTenant } = useTenant();
  const { data: billing } = useWorkspaceBilling();
  const { claim } = useLaunchOffer();
  const { data: isEligible } = useTrialEligibility();
  const startCheckout = useStartCheckout();
  const changePlan = useChangePlan();

  const [pending, setPending] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const region = regionFromCountry((currentTenant as any)?.country);
  const country = (currentTenant as any)?.country ?? undefined;

  const handlePick = async (planId: PlanId, cycle: 'monthly' | 'yearly') => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    if (planId !== 'free' && isEligible === false && !billing?.has_subscription) {
      setContactOpen(true);
      return;
    }

    setPending(planId);
    try {
      // FREE → instant claim
      if (planId === 'free') {
        await claim({ planId, workspaceId: currentTenant.id });
        toast.success('Switched to Free plan');
        onChanged?.();
        onOpenChange(false);
        return;
      }
      // Active sub → in-place change
      if (billing?.has_subscription) {
        await changePlan.mutateAsync({
          workspaceId: currentTenant.id, planId, billingCycle: cycle,
        });
        toast.success('Plan change applied');
        onChanged?.();
        onOpenChange(false);
        return;
      }
      // No active sub → Stripe Checkout
      const res = await startCheckout.mutateAsync({
        workspaceId: currentTenant.id, planId, billingCycle: cycle,
        region, country,
        successPath: '/billing?status=success',
        cancelPath: '/billing?status=cancelled',
      });
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not change plan');
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <Badge className="self-start bg-primary/10 text-primary border-primary/20 gap-1 mb-2">
              <Sparkles className="w-3 h-3" /> Workspace plan
            </Badge>
            <DialogTitle className="text-2xl font-bold">Change Your Plan</DialogTitle>
            <DialogDescription>
              Plan applies to <span className="font-semibold text-foreground">{currentTenant?.name}</span>.
              Same pricing as the public Pricing page.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center my-2">
            <MonthlyYearlyToggle yearly={isYearly} onChange={setIsYearly} variant="light" />
          </div>

          <PlanCardsGrid
            region={region}
            cycle={isYearly ? 'yearly' : 'monthly'}
            currentPlanId={currentPlanId}
            showFree
            onSelect={handlePick}
            loadingPlanId={pending}
            variant="light"
            showTrialBadge={!billing?.has_subscription && !!isEligible}
            trialLocked={!billing?.has_subscription && isEligible === false}
          />
        </DialogContent>
      </Dialog>

      <ContactAdminDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        onContinueFree={() => handlePick('free', 'monthly')}
        reason="trial_already_used"
      />
    </>
  );
}
