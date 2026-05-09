import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, Gift, Rocket, Building2, Calendar, Lock, ArrowRight, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { useSubscription } from '@/hooks/useBilling';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useTrialEligibility } from '@/hooks/useLaunchOffer';
import { useTenant } from '@/contexts/TenantContext';
import ChangePlanDialog from '@/components/billing/ChangePlanDialog';

const planMeta: Record<string, { icon: JSX.Element; gradient: string; label: string }> = {
  free: { icon: <Gift className="w-4 h-4" />, gradient: 'from-slate-500/15 to-slate-600/10', label: 'Free' },
  basic: { icon: <Rocket className="w-4 h-4" />, gradient: 'from-blue-500/15 to-cyan-500/10', label: 'Basic' },
  pro: { icon: <Crown className="w-4 h-4" />, gradient: 'from-emerald-500/15 to-primary/10', label: 'Pro' },
  business: { icon: <Building2 className="w-4 h-4" />, gradient: 'from-amber-500/15 to-orange-500/10', label: 'Business' },
};

export default function SubscriptionStatusBanner() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTenant } = useTenant();
  const { data: subscription } = useSubscription();
  const { data: entitlements } = useEntitlements();
  const { data: isEligible } = useTrialEligibility();
  const [changeOpen, setChangeOpen] = useState(false);

  // Auto-open plan picker when redirected from workspace creation (?select_plan=1)
  useEffect(() => {
    if (searchParams.get('select_plan') === '1') {
      setChangeOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('select_plan');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const planId = (entitlements?.plan_id ?? subscription?.plan_id ?? 'free').replace(/^plan_/, '');
  const meta = planMeta[planId] ?? planMeta.free;
  const isFree = planId === 'free';
  const isTrial = (subscription?.status as string) === 'trialing';
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;
  const daysLeft = periodEnd ? Math.max(0, differenceInDays(periodEnd, new Date())) : null;

  const trialChip = useMemo(() => {
    if (isTrial) return { label: `Free trial · ${daysLeft ?? '—'}d left`, tone: 'emerald' as const };
    if (isEligible === true && isFree) return { label: '🎁 1 free trial available', tone: 'emerald' as const };
    if (isEligible === false) return { label: 'Trial used', tone: 'amber' as const };
    return null;
  }, [isTrial, daysLeft, isEligible, isFree]);

  return (
    <>
      <Card className={cn(
        'relative overflow-hidden border-border/50 bg-gradient-to-br p-4 sm:p-5 rounded-2xl',
        meta.gradient,
      )}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              {meta.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">{meta.label} Plan</h3>
                <Badge variant="outline" className="text-[10px] py-0 h-5 border-border/60">
                  {currentTenant?.name}
                </Badge>
                {isTrial && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30 text-[10px] py-0 h-5 gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Trial
                  </Badge>
                )}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 flex items-center flex-wrap gap-x-3 gap-y-1">
                {periodEnd ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Next billing: <span className="font-medium text-foreground">{format(periodEnd, 'MMM d, yyyy')}</span>
                  </span>
                ) : isFree ? (
                  <span>No billing cycle · Free forever</span>
                ) : (
                  <span>Active</span>
                )}
                {trialChip && (
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                    trialChip.tone === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                  )}>
                    {trialChip.tone === 'amber' && <Lock className="w-2.5 h-2.5" />}
                    {trialChip.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => setChangeOpen(true)}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Change plan
            </Button>
            {isFree && (
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-gradient-to-r from-primary to-emerald-500 border-0"
                onClick={() => setChangeOpen(true)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isEligible ? 'Start Free Month' : 'Upgrade'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <ChangePlanDialog
        open={changeOpen}
        onOpenChange={setChangeOpen}
        currentPlanId={planId}
      />
    </>
  );
}
