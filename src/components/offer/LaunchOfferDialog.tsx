import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Gift, Sparkles, ShieldCheck, Crown, Rocket, Building2, Loader2, X, Zap } from 'lucide-react';
import { CountdownPill } from './CountdownPill';
import { useLaunchOffer, useTodayClaimCount } from '@/hooks/useLaunchOffer';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

const PENDING_CLAIM_KEY = 'lovable.pending_claim_offer';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const planIcons: Record<string, JSX.Element> = {
  free: <Gift className="w-4 h-4" />,
  basic: <Rocket className="w-4 h-4" />,
  pro: <Crown className="w-4 h-4" />,
  business: <Building2 className="w-4 h-4" />,
};

export function LaunchOfferDialog({ open, onOpenChange }: Props) {
  const { isActive, secondsLeft, isClaiming } = useLaunchOffer();
  const { data: claimCount } = useTodayClaimCount();
  const { getPlanPrice, formatAmount } = useGeoLocation();
  const { user } = useAuth();
  const { tenants, currentTenant } = useTenant();
  const navigate = useNavigate();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [view, setView] = useState<'intro' | 'plans'>('intro');

  if (!isActive) return null;

  const routeToPlanFlow = (planId?: string) => {
    onOpenChange(false);
    if (!user) {
      try { sessionStorage.setItem(PENDING_CLAIM_KEY, planId ?? '1'); } catch {}
      navigate('/signup');
      return;
    }
    if (tenants.length === 0) {
      try { sessionStorage.setItem(PENDING_CLAIM_KEY, planId ?? '1'); } catch {}
      navigate('/select-workspace');
      return;
    }
    const wsId = currentTenant?.id ?? tenants[0].id;
    const planParam = planId ? `&plan=${planId}` : '';
    navigate(`/select-workspace-plan?workspace_id=${wsId}${planParam}`);
  };

  const handleSelect = (plan: PricingPlan) => {
    if (isClaiming) return;
    setPendingPlan(plan.id);
    routeToPlanFlow(plan.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 via-background to-background text-foreground rounded-2xl shadow-2xl',
          'my-6 sm:my-10 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto',
          view === 'plans' ? 'max-w-3xl' : 'max-w-lg'
        )}
      >
        {/* Soft ambient glows */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-emerald-300/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-[80px]" />

        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-50 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground p-2 backdrop-blur-sm border border-border/60 transition-all touch-manipulation shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-6 sm:p-8 pt-12 sm:pt-8">

          {view === 'intro' ? (
            <>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5"
              >
                <Gift className="w-8 h-8 text-white" />
              </motion.div>

              <div className="text-center space-y-2 mb-6">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 font-medium">
                  <Sparkles className="w-3 h-3" /> Launch Offer
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Get 1 Month FREE — Pick Any Plan
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Subscribe to any Aireatro plan today and we'll cover your first month on us.
                  Limited launch offer — countdown resets every 24 hours.
                </p>
                <div className="pt-1 flex justify-center">
                  <CountdownPill secondsLeft={secondsLeft} size="lg" light />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  className="w-full h-12 px-4 bg-gradient-to-r from-emerald-500 to-primary text-white border-0 font-semibold text-sm sm:text-base shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-[1.01] transition-all whitespace-normal leading-tight"
                  onClick={() => routeToPlanFlow()}
                >
                  <Sparkles className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>Select Plan &amp; Get 1 Month Free</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-11 text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm"
                  onClick={() => onOpenChange(false)}
                >
                  Maybe later
                </Button>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  No credit card required
                </span>
                {typeof claimCount === 'number' && claimCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {claimCount} users claimed today
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 mb-2 font-medium">
                    <Sparkles className="w-3 h-3" /> 1 Month FREE on Any Plan
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Pick your plan — your first month is on us
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Choose any plan below. We'll activate it FREE for 30 days. Cancel anytime.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="w-3 h-3" /> No credit card required
                  </div>
                </div>
                <CountdownPill secondsLeft={secondsLeft} size="sm" light />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pricingPlans.map((plan) => {
                  const price = getPlanPrice(plan.id as any, false);
                  const isPending = pendingPlan === plan.id && isClaiming;
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -2 }}
                      className={cn(
                        'relative rounded-xl border p-4 bg-card/60 backdrop-blur transition-all',
                        plan.highlight
                          ? 'border-emerald-400/60 ring-1 ring-emerald-400/30 shadow-sm shadow-emerald-500/10'
                          : 'border-border/80 hover:border-emerald-300/60'
                      )}
                    >
                      {plan.highlight && (
                        <Badge className="absolute -top-2 right-3 bg-gradient-to-r from-emerald-500 to-primary text-white border-0 text-[10px]">
                          Most Popular
                        </Badge>
                      )}
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          {planIcons[plan.id] ?? <Gift className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="font-semibold text-sm">{plan.name}</div>
                          <div className="text-[11px] text-muted-foreground">{plan.tagline}</div>
                        </div>
                      </div>

                      <div className="flex items-end gap-1.5 mb-1">
                        {typeof price === 'number' ? (
                          <>
                            <span className="text-base font-bold line-through text-muted-foreground/70">
                              {formatAmount(price)}
                            </span>
                            <span className="text-xl font-extrabold text-emerald-600">FREE</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">Custom</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-3">
                        First month free, then {typeof price === 'number' ? `${formatAmount(price)}/mo` : 'custom pricing'}
                      </p>

                      <ul className="space-y-1.5 mb-4">
                        {plan.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        size="sm"
                        disabled={isClaiming}
                        onClick={() => handleSelect(plan)}
                        className={cn(
                          'w-full font-semibold',
                          plan.highlight
                            ? 'bg-gradient-to-r from-emerald-500 to-primary text-white border-0 hover:shadow-lg hover:shadow-emerald-500/20'
                            : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                        )}
                      >
                        {isPending ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Activating…</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5 mr-1" /> Get 1 Month Free</>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <button
                  onClick={() => setView('intro')}
                  className="hover:text-foreground underline-offset-2 hover:underline"
                >
                  ← Back
                </button>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  No card • Cancel anytime
                </span>
                {typeof claimCount === 'number' && claimCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {claimCount} claimed today
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
