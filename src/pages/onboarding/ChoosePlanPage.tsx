import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Crown, Rocket, Building2, Gift, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { useGeoLocation, type PlanId } from '@/hooks/useGeoLocation';
import { useLaunchOffer, useTodayClaimCount } from '@/hooks/useLaunchOffer';
import { CountdownPill } from '@/components/offer/CountdownPill';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';

const planIcons: Record<string, JSX.Element> = {
  free: <Gift className="w-5 h-5" />,
  basic: <Rocket className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

export default function ChoosePlanPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { offer, isActive, secondsLeft, claim, isClaiming, isLoading } = useLaunchOffer();
  const { data: claimCount } = useTodayClaimCount();
  const { getPlanPrice, formatAmount } = useGeoLocation();
  const [isYearly, setIsYearly] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  // If already claimed → onward
  useEffect(() => {
    if (offer?.offer_claimed) {
      navigate('/select-workspace', { replace: true });
    }
  }, [offer?.offer_claimed, navigate]);

  const handleSelect = async (plan: PricingPlan) => {
    if (isClaiming) return;
    setPendingPlan(plan.id);
    try {
      await claim(plan.id);
      setSuccess(true);
      setTimeout(() => navigate('/select-workspace', { replace: true }), 1600);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not activate offer');
      setPendingPlan(null);
    }
  };

  const cards = useMemo(() => pricingPlans, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      {/* Aurora */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative px-4 sm:px-8 py-4 flex items-center justify-between">
        <img src={aireatroLogo} alt="Aireatro" className="h-9 w-auto" />
        <div className="text-xs text-white/60">Step 3 of 3 · Choose Plan</div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8 mt-2">
          <Badge className="bg-emerald-400/15 text-emerald-200 border-emerald-300/30 gap-1 mb-3">
            <Sparkles className="w-3 h-3" /> 24-Hour Launch Offer
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-3">
            🚀 Start Growing with{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-primary to-emerald-300 bg-clip-text text-transparent">
              Aireatro
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 mb-4">
            Free plan needs <span className="text-emerald-300 font-semibold">no card</span> · Paid plans start a
            <span className="text-emerald-300 font-semibold"> 30-day free trial</span> (card required, cancel anytime).
          </p>

          {isActive && (
            <div className="flex flex-col items-center gap-3">
              <CountdownPill secondsLeft={secondsLeft} size="lg" />
              {typeof claimCount === 'number' && claimCount > 0 && (
                <p className="text-xs text-white/60">🔥 {claimCount} users claimed today</p>
              )}
            </div>
          )}

          <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Label htmlFor="yearly" className={cn('text-xs', !isYearly ? 'text-white' : 'text-white/60')}>
              Monthly
            </Label>
            <Switch id="yearly" checked={isYearly} onCheckedChange={setIsYearly} />
            <Label htmlFor="yearly" className={cn('text-xs flex items-center gap-1.5', isYearly ? 'text-white' : 'text-white/60')}>
              Yearly
              <Badge className="bg-emerald-400/20 text-emerald-200 border-0 text-[10px] px-1.5 py-0">−20%</Badge>
            </Label>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {cards.map((plan, idx) => {
            const price = getPlanPrice(plan.id as PlanId, isYearly);
            const isPro = plan.highlight;
            const isFree = plan.id === 'free';
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={cn(
                  'relative rounded-2xl p-5 backdrop-blur-md flex flex-col',
                  isPro
                    ? 'bg-gradient-to-b from-emerald-500/15 to-white/5 border border-emerald-300/40 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-300/30'
                    : 'bg-white/5 border border-white/10',
                )}
              >
                {!isFree && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" /> 1 Month FREE
                  </Badge>
                )}

                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                  isPro ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/80',
                )}>
                  {planIcons[plan.id]}
                </div>

                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-xs text-white/60 mb-3 min-h-[2.5em]">{plan.tagline}</p>

                <div className="mb-4">
                  {isFree ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{formatAmount(price ?? 0)}</span>
                      <span className="text-xs text-white/60">/mo</span>
                    </div>
                  )}
                  {!isFree && (
                    <p className="text-[11px] text-emerald-300 font-medium mt-1">First month on us</p>
                  )}
                </div>

                <ul className="space-y-1.5 mb-5 text-xs text-white/85 flex-1">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    'w-full font-semibold gap-1.5',
                    isPro
                      ? 'bg-gradient-to-r from-emerald-400 to-primary text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl border-0'
                      : isFree
                        ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                        : 'bg-white text-emerald-900 hover:bg-emerald-50',
                  )}
                  disabled={isClaiming}
                  onClick={() => handleSelect(plan)}
                >
                  {isClaiming && pendingPlan === plan.id
                    ? 'Activating…'
                    : isFree
                      ? 'Free Lifetime'
                      : 'Start Free Month'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-white/60 inline-flex items-center justify-center gap-2 w-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          No card • Cancel anytime • Activated instantly
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="bg-gradient-to-br from-emerald-500 to-primary rounded-3xl p-8 max-w-sm text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/25 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-1">🎉 Your Free Month Has Started</h3>
              <p className="text-sm text-white/85">Redirecting to your workspace…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
