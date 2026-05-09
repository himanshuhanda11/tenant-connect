import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Sparkles, Crown, Rocket, Building2, Gift, ArrowRight, ShieldCheck, Lock, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { useGeoLocation, type PlanId } from '@/hooks/useGeoLocation';
import { useLaunchOffer, useTrialEligibility } from '@/hooks/useLaunchOffer';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import ContactAdminDialog from '@/components/billing/ContactAdminDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';

const planIcons: Record<string, JSX.Element> = {
  free: <Gift className="w-5 h-5" />,
  basic: <Rocket className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

export default function SelectWorkspacePlanPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { tenants, currentTenant, setCurrentTenant, loading: tenantLoading } = useTenant();
  const { claim, isClaiming } = useLaunchOffer();
  const { data: isEligible, isLoading: eligLoading, refetch: refetchEligible } = useTrialEligibility();
  const { getPlanPrice, formatAmount } = useGeoLocation();

  const [isYearly, setIsYearly] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Resolve target workspace (from query param or current tenant)
  const targetWorkspaceId = params.get('workspace_id') || currentTenant?.id || tenants[0]?.id || null;
  const targetWorkspace = useMemo(
    () => tenants.find((t) => t.id === targetWorkspaceId) ?? null,
    [tenants, targetWorkspaceId],
  );

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  // No workspace yet → send to selector
  useEffect(() => {
    if (!authLoading && !tenantLoading && user && tenants.length === 0) {
      navigate('/select-workspace', { replace: true });
    }
  }, [authLoading, tenantLoading, user, tenants.length, navigate]);

  // Make sure currentTenant matches target so downstream features load right context
  useEffect(() => {
    if (targetWorkspace && currentTenant?.id !== targetWorkspace.id) {
      setCurrentTenant(targetWorkspace);
    }
  }, [targetWorkspace, currentTenant?.id, setCurrentTenant]);

  const handleSelect = async (plan: PricingPlan) => {
    if (isClaiming || !targetWorkspaceId) return;

    // Paid plan + ineligible → contact admin popup
    if (plan.id !== 'free' && isEligible === false) {
      setContactOpen(true);
      return;
    }

    setPendingPlan(plan.id);
    try {
      await claim({ planId: plan.id, workspaceId: targetWorkspaceId });
      const isFree = plan.id === 'free';
      toast.success(
        isFree ? `${plan.name} plan activated for ${targetWorkspace?.name ?? 'your workspace'}` : `🎉 ${plan.name} trial started — first month free!`,
        { description: 'Redirecting to your dashboard…', duration: 2200 },
      );
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1400);
    } catch (e: any) {
      if (e?.reason === 'trial_already_used') {
        await refetchEligible();
        setContactOpen(true);
      } else {
        toast.error(e?.message ?? 'Could not activate plan');
      }
      setPendingPlan(null);
    }
  };

  const handleContinueFree = async () => {
    const free = pricingPlans.find((p) => p.id === 'free');
    if (free) await handleSelect(free);
  };

  if (authLoading || tenantLoading || eligLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      {/* Aurora */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative px-4 sm:px-8 py-4 flex items-center justify-between">
        <img src={aireatroLogo} alt="Aireatro" className="h-9 w-auto" />
        <button
          onClick={() => navigate('/select-workspace')}
          className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition"
        >
          <X className="w-3.5 h-3.5" /> Skip for now
        </button>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          {targetWorkspace && (
            <Badge className="bg-white/10 text-white border-white/20 mb-3">
              <Building2 className="w-3 h-3 mr-1" /> {targetWorkspace.name}
            </Badge>
          )}
          {isEligible ? (
            <Badge className="bg-emerald-400/15 text-emerald-200 border-emerald-300/30 gap-1 mb-3 ml-2">
              <Sparkles className="w-3 h-3" /> 1 Month FREE on any paid plan
            </Badge>
          ) : (
            <Badge className="bg-amber-400/15 text-amber-200 border-amber-300/30 gap-1 mb-3 ml-2">
              <Lock className="w-3 h-3" /> Trial already used
            </Badge>
          )}

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-3">
            Choose this workspace's{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-primary to-emerald-300 bg-clip-text text-transparent">
              plan
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/70">
            {isEligible
              ? <>Pick any paid plan and your <span className="text-emerald-300 font-semibold">first month is on us</span> — no card required.</>
              : <>You've used your one free trial. Free plan is always available, or contact admin to activate paid plans.</>}
          </p>

          <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Label htmlFor="yearly" className={cn('text-xs cursor-pointer', !isYearly ? 'text-white' : 'text-white/60')}>Monthly</Label>
            <Switch id="yearly" checked={isYearly} onCheckedChange={setIsYearly} />
            <Label htmlFor="yearly" className={cn('text-xs cursor-pointer flex items-center gap-1.5', isYearly ? 'text-white' : 'text-white/60')}>
              Yearly
              <Badge className="bg-emerald-400/20 text-emerald-200 border-0 text-[10px] px-1.5 py-0">−20%</Badge>
            </Label>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto pb-12">
          {pricingPlans.map((plan, idx) => {
            const price = getPlanPrice(plan.id as PlanId, isYearly);
            const isPro = plan.highlight;
            const isFree = plan.id === 'free';
            const locked = !isFree && isEligible === false;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ y: -4 }}
                className={cn(
                  'relative rounded-2xl p-5 backdrop-blur-md flex flex-col',
                  isPro && !locked
                    ? 'bg-gradient-to-b from-emerald-500/15 to-white/5 border border-emerald-300/40 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-300/30'
                    : 'bg-white/5 border border-white/10',
                  locked && 'opacity-90',
                )}
              >
                {!isFree && isEligible && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg">
                    <Sparkles className="w-2.5 h-2.5" /> 1 Month FREE
                  </Badge>
                )}
                {locked && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg">
                    <Lock className="w-2.5 h-2.5" /> Contact Admin
                  </Badge>
                )}

                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                  isPro && !locked ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/80',
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
                  {!isFree && isEligible && (
                    <p className="text-[11px] text-emerald-300 font-medium mt-1">First month on us · no card</p>
                  )}
                  {!isFree && !isEligible && (
                    <p className="text-[11px] text-amber-300 font-medium mt-1">Activation via admin</p>
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
                    locked
                      ? 'bg-amber-500/90 hover:bg-amber-500 text-white border-0'
                      : isPro
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
                    : locked
                      ? <>🔒 Contact Admin</>
                      : isFree
                        ? 'Continue with Free'
                        : '🎁 Start Free Month'}
                  {!locked && <ArrowRight className="w-4 h-4" />}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center text-xs text-white/60 inline-flex items-center justify-center gap-2 w-full pb-10">
          <ShieldCheck className="w-3.5 h-3.5" />
          {isEligible
            ? 'No card required • Cancel anytime • Activated instantly'
            : '1 free trial per account • Free plan always available'}
        </div>
      </div>

      <ContactAdminDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        onContinueFree={handleContinueFree}
        reason="trial_already_used"
      />

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
              <h3 className="text-2xl font-bold text-white mb-1">🎉 Plan Activated</h3>
              <p className="text-sm text-white/85">Redirecting to your workspace…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
