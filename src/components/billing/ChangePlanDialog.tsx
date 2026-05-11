import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, business: 3 };
const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

type ConfirmKind = 'upgrade' | 'downgrade' | 'free' | 'trial-swap' | null;

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
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; planId: PlanId; cycle: 'monthly' | 'yearly' } | null>(null);

  const region = regionFromCountry((currentTenant as any)?.country);
  const country = (currentTenant as any)?.country ?? undefined;
  const hasSelectedPlan = !!billing?.has_selected_plan || !!billing?.has_subscription;
  const effectiveCurrentPlanId = hasSelectedPlan && billing?.plan_id
    ? billing.plan_id.replace(/^plan_/, '').toLowerCase()
    : currentPlanId;
  const periodEnd = billing?.current_period_end ? new Date(billing.current_period_end) : null;
  const periodEndStr = periodEnd?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const runChange = async (planId: PlanId, cycle: 'monthly' | 'yearly') => {
    if (!currentTenant?.id) return;
    setPending(planId);
    try {
      // Free with no existing sub → instant claim
      if (planId === 'free' && !billing?.has_subscription) {
        await claim({ planId, workspaceId: currentTenant.id });
        toast.success('Switched to Free plan');
        onChanged?.(); onOpenChange(false); return;
      }

      // Has Stripe sub OR target is paid → call change-workspace-plan first
      if (billing?.has_subscription || planId !== 'free') {
        const res = await changePlan.mutateAsync({
          workspaceId: currentTenant.id, planId, billingCycle: cycle,
        });

        if (res?.action === 'checkout_required') {
          // First time paying → Stripe Checkout (collects card + 30-day trial)
          const co = await startCheckout.mutateAsync({
            workspaceId: currentTenant.id, planId, billingCycle: cycle,
            region, country,
            successPath: '/billing?status=success',
            cancelPath: '/billing?status=cancelled',
          });
          if (co?.checkout_url) { window.location.href = co.checkout_url; return; }
        }

        if (res?.noop) toast.info('Already on this plan');
        else if (res?.effective === 'immediate' && res?.kind === 'upgrade')
          toast.success(`Upgraded to ${cap(planId)} — prorated charge applied`);
        else if (res?.effective === 'immediate' && planId === 'free')
          toast.success('Switched to Free plan');
        else if (res?.effective === 'trial_end')
          toast.success(`Plan switched to ${cap(planId)} — trial continues, no charge yet`);
        else if (res?.effective === 'next_period') {
          const when = res.scheduled_at
            ? new Date(res.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
            : 'next billing date';
          toast.success(planId === 'free'
            ? `Subscription will end on ${when}`
            : `Plan will switch to ${cap(planId)} on ${when}`);
        }

        onChanged?.(); onOpenChange(false); return;
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not change plan');
    } finally {
      setPending(null);
    }
  };

  const handlePick = (planId: PlanId, cycle: 'monthly' | 'yearly') => {
    if (!currentTenant?.id) { toast.error('No workspace selected'); return; }
    if (planId !== 'free' && isEligible === false && !billing?.has_subscription) {
      setContactOpen(true); return;
    }

    // Decide which confirmation to show
    const current = (effectiveCurrentPlanId || 'free').toLowerCase();
    if (current === planId && (billing?.billing_cycle ?? 'monthly') === cycle) {
      runChange(planId, cycle); return; // noop fast-path
    }

    if (planId === 'free' && billing?.has_subscription) {
      setConfirm({ kind: 'free', planId, cycle }); return;
    }
    if (billing?.is_trialing && billing?.has_subscription && planId !== 'free') {
      setConfirm({ kind: 'trial-swap', planId, cycle }); return;
    }
    if (billing?.has_subscription && (PLAN_RANK[planId] ?? 0) > (PLAN_RANK[current] ?? 0)) {
      setConfirm({ kind: 'upgrade', planId, cycle }); return;
    }
    if (billing?.has_subscription && (PLAN_RANK[planId] ?? 0) < (PLAN_RANK[current] ?? 0)) {
      setConfirm({ kind: 'downgrade', planId, cycle }); return;
    }
    runChange(planId, cycle);
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
              {billing?.next_plan_message && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400">{billing.next_plan_message}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center my-2">
            <MonthlyYearlyToggle yearly={isYearly} onChange={setIsYearly} variant="light" />
          </div>

          <PlanCardsGrid
            region={region}
            cycle={isYearly ? 'yearly' : 'monthly'}
            currentPlanId={effectiveCurrentPlanId}
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

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          {confirm?.kind === 'upgrade' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Upgrade to {cap(confirm.planId)}?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll be charged the prorated difference on your saved card today and {cap(confirm.planId)} features unlock immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </>
          )}
          {confirm?.kind === 'downgrade' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Downgrade to {cap(confirm.planId)}?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll keep {cap(billing?.plan_id || '')} access until {periodEndStr ?? 'your next billing date'}, then move to {cap(confirm.planId)}. Future renewals will charge the {cap(confirm.planId)} price.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </>
          )}
          {confirm?.kind === 'trial-swap' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Switch trial to {cap(confirm.planId)}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your free trial continues — no charge today. When the trial ends, your saved card will be charged the {cap(confirm.planId)} {confirm.cycle} price.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </>
          )}
          {confirm?.kind === 'free' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Switch to Free plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  {billing?.is_trialing
                    ? `Your trial will be cancelled immediately and you'll lose ${cap(billing?.plan_id || '')} features.`
                    : `You'll keep ${cap(billing?.plan_id || '')} access until ${periodEndStr ?? 'your next billing date'}, then move to Free. No further charges.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm) { runChange(confirm.planId, confirm.cycle); setConfirm(null); }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
