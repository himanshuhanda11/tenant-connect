import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Gift, Sparkles, ShieldCheck, Crown, Rocket, Building2, Loader2, X } from 'lucide-react';
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
  const { isActive, secondsLeft, claim, isClaiming } = useLaunchOffer();
  const { data: claimCount } = useTodayClaimCount();
  const { getPlanPrice, formatAmount } = useGeoLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [view, setView] = useState<'intro' | 'plans'>('intro');

  if (!isActive) return null;

  const handleSelect = async (plan: PricingPlan) => {
    if (isClaiming) return;
    if (!user) {
      onOpenChange(false);
      navigate('/signup');
      return;
    }
    setPendingPlan(plan.id);
    try {
      await claim(plan.id);
      toast.success(`🎉 1 month FREE activated on ${plan.name}!`);
      onOpenChange(false);
      setTimeout(() => navigate('/select-workspace'), 400);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not activate offer');
      setPendingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-2xl',
          'my-6 sm:my-10 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto',
          view === 'plans' ? 'max-w-3xl' : 'max-w-lg'
        )}
      >
        {/* Glow halo */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />

        {/* Custom high-contrast close (mobile-friendly) */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-2.5 top-2.5 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 backdrop-blur-sm border border-white/20 transition-all touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-5 sm:p-7 pt-12 sm:pt-7">

          {view === 'intro' ? (
            <>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4"
              >
                <Gift className="w-7 h-7 text-white" />
              </motion.div>

              <div className="text-center space-y-2 mb-5">
                <Badge className="bg-emerald-400/15 text-emerald-200 border-emerald-300/30 gap-1">
                  <Sparkles className="w-3 h-3" /> Launch Offer
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  🎁 Get 1 Month FREE — Pick Any Plan
                </h2>
                <p className="text-sm text-white/70">
                  Subscribe to any Aireatro plan today and we'll cover your first month on us.
                  Limited launch offer — countdown resets every 24 hours.
                </p>
                <div className="pt-1 flex justify-center">
                  <CountdownPill secondsLeft={secondsLeft} size="lg" />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  className="w-full h-12 px-4 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 font-semibold text-sm sm:text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.01] transition-all whitespace-normal leading-tight"
                  onClick={() => setView('plans')}
                >
                  <Sparkles className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>Select Plan &amp; Get 1 Month Free</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white font-medium text-sm"
                  onClick={() => onOpenChange(false)}
                >
                  Maybe later
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  No card • No hidden fee • Instant
                </span>
                {typeof claimCount === 'number' && claimCount > 0 && (
                  <span>🔥 {claimCount} users claimed today</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <Badge className="bg-emerald-400/15 text-emerald-200 border-emerald-300/30 gap-1 mb-2">
                    <Sparkles className="w-3 h-3" /> 1 Month FREE on Any Plan
                  </Badge>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Pick your plan — your first month is on us
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">
                    Choose any plan below. We'll activate it FREE for 30 days. Cancel anytime.
                  </p>
                </div>
                <CountdownPill secondsLeft={secondsLeft} size="sm" />
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
                        'relative rounded-xl border p-4 bg-white/5 backdrop-blur transition-all',
                        plan.highlight
                          ? 'border-emerald-400/60 ring-1 ring-emerald-400/40'
                          : 'border-white/10 hover:border-white/20'
                      )}
                    >
                      {plan.highlight && (
                        <Badge className="absolute -top-2 right-3 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 text-[10px]">
                          Most Popular
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-200">
                          {planIcons[plan.id] ?? <Gift className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="font-semibold text-sm">{plan.name}</div>
                          <div className="text-[11px] text-white/60">{plan.tagline}</div>
                        </div>
                      </div>

                      <div className="flex items-end gap-1 mb-1">
                        {typeof price === 'number' ? (
                          <>
                            <span className="text-lg font-bold line-through text-white/40">
                              {formatAmount(price)}
                            </span>
                            <span className="text-2xl font-extrabold text-emerald-300">FREE</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">Custom</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/60 mb-3">
                        First month free, then {typeof price === 'number' ? `${formatAmount(price)}/mo` : 'custom pricing'}
                      </p>

                      <ul className="space-y-1 mb-3">
                        {plan.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-[11px] text-white/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-300 mt-0.5 flex-shrink-0" />
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
                            ? 'bg-gradient-to-r from-emerald-400 to-primary text-white border-0 hover:shadow-lg hover:shadow-emerald-500/30'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
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

              <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-white/60">
                <button
                  onClick={() => setView('intro')}
                  className="hover:text-white underline-offset-2 hover:underline"
                >
                  ← Back
                </button>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  No card • Cancel anytime
                </span>
                {typeof claimCount === 'number' && claimCount > 0 && (
                  <span>🔥 {claimCount} claimed today</span>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
