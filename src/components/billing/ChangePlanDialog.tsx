import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Crown, Rocket, Building2, Gift, Lock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { pricingPlans } from '@/data/pricingPlans';
import { useLaunchOffer, useTrialEligibility } from '@/hooks/useLaunchOffer';
import { useTenant } from '@/contexts/TenantContext';
import ContactAdminDialog from './ContactAdminDialog';

const planIcons: Record<string, JSX.Element> = {
  free: <Gift className="w-4 h-4" />,
  basic: <Rocket className="w-4 h-4" />,
  pro: <Crown className="w-4 h-4" />,
  business: <Building2 className="w-4 h-4" />,
};

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
  onChanged?: () => void;
}

/**
 * Lightweight in-product plan-switcher.
 * - Eligible users → claim free trial on the new plan.
 * - Ineligible users (already used trial) → ContactAdminDialog popup.
 * - Free plan is always switchable.
 */
export default function ChangePlanDialog({ open, onOpenChange, currentPlanId, onChanged }: ChangePlanDialogProps) {
  const { currentTenant } = useTenant();
  const { claim, isClaiming } = useLaunchOffer();
  const { data: isEligible, refetch: refetchEligible } = useTrialEligibility();
  const [pending, setPending] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const handlePick = async (planId: string) => {
    if (!currentTenant?.id) {
      toast.error('No workspace selected');
      return;
    }
    if (planId === currentPlanId) return;

    if (planId !== 'free' && isEligible === false) {
      setContactOpen(true);
      return;
    }

    setPending(planId);
    try {
      await claim({ planId, workspaceId: currentTenant.id });
      toast.success(`Switched to the ${planId.charAt(0).toUpperCase()}${planId.slice(1)} plan ✨`);
      onChanged?.();
      onOpenChange(false);
    } catch (e: any) {
      if (e?.reason === 'trial_already_used') {
        await refetchEligible();
        setContactOpen(true);
      } else {
        toast.error(e?.message ?? 'Could not change plan');
      }
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto my-6 sm:my-10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-primary" /> Change Workspace Plan
            </DialogTitle>
            <DialogDescription>
              Plan applies to <span className="font-semibold text-foreground">{currentTenant?.name}</span> only.
              {isEligible
                ? ' Enjoy your first month free on any paid plan — no card required.'
                : ' You\'ve used your free trial. Free plan switches instantly; paid plans require admin activation.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2 mt-3">
            {pricingPlans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isFree = plan.id === 'free';
              const locked = !isFree && isEligible === false;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-xl border p-4 flex flex-col gap-2 transition-all',
                    isCurrent ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {planIcons[plan.id]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">{plan.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{plan.tagline}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
                        <Check className="w-3 h-3" /> Current
                      </Badge>
                    )}
                    {locked && !isCurrent && (
                      <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 text-[10px] gap-1">
                        <Lock className="w-3 h-3" /> Admin
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isCurrent ? 'outline' : locked ? 'secondary' : 'default'}
                    disabled={isCurrent || isClaiming}
                    onClick={() => handlePick(plan.id)}
                    className="w-full mt-1 gap-1.5"
                  >
                    {isClaiming && pending === plan.id
                      ? 'Switching…'
                      : isCurrent
                        ? 'Current plan'
                        : locked
                          ? <>🔒 Contact Admin</>
                          : isFree
                            ? 'Switch to Free'
                            : '🎁 Start Free Month'}
                    {!isCurrent && !locked && <ArrowRight className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ContactAdminDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        reason="trial_already_used"
      />
    </>
  );
}
