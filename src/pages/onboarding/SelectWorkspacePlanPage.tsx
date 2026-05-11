import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Building2, ShieldCheck, Lock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlanCardsGrid } from '@/components/billing/PlanCardsGrid';
import { MonthlyYearlyToggle } from '@/components/billing/MonthlyYearlyToggle';
import { regionFromCountry, getPlan, type PlanId } from '@/data/plans.config';
import { useLaunchOffer, useTrialEligibility } from '@/hooks/useLaunchOffer';
import { useStartCheckout } from '@/hooks/useWorkspaceBilling';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import ContactAdminDialog from '@/components/billing/ContactAdminDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import aireatroLogo from '@/assets/aireatro-logo.png';

export default function SelectWorkspacePlanPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { tenants, currentTenant, setCurrentTenant, loading: tenantLoading } = useTenant();
  const { claim, isClaiming } = useLaunchOffer();
  const { data: isEligible, isLoading: eligLoading } = useTrialEligibility();
  const startCheckout = useStartCheckout();

  const [isYearly, setIsYearly] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const targetWorkspaceId = params.get('workspace_id') || currentTenant?.id || tenants[0]?.id || null;
  const targetWorkspace = useMemo(
    () => tenants.find((t) => t.id === targetWorkspaceId) ?? null,
    [tenants, targetWorkspaceId],
  );
  const region = useMemo(
    () => regionFromCountry((targetWorkspace as any)?.country),
    [targetWorkspace],
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

  // Sync currentTenant with target
  useEffect(() => {
    if (targetWorkspace && currentTenant?.id !== targetWorkspace.id) {
      setCurrentTenant(targetWorkspace);
    }
  }, [targetWorkspace, currentTenant?.id, setCurrentTenant]);

  // Cancel-from-Stripe toast
  useEffect(() => {
    if (params.get('payment') === 'cancelled') {
      toast.info('Payment setup was cancelled. Please choose a plan to continue.');
    }
  }, [params]);

  const handleSelect = async (planId: PlanId) => {
    if (isClaiming || startCheckout.isPending || !targetWorkspaceId) return;
    const plan = getPlan(planId);
    if (!plan) return;

    // FREE → instant activation
    if (plan.id === 'free') {
      setPendingPlan(plan.id);
      try {
        await claim({ planId: plan.id, workspaceId: targetWorkspaceId });
        toast.success(`${plan.name} plan activated for ${targetWorkspace?.name ?? 'your workspace'}`, {
          description: 'Redirecting to your dashboard…', duration: 1800,
        });
        setSuccess(true);
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      } catch (e: any) {
        toast.error(e?.message ?? 'Could not activate plan');
        setPendingPlan(null);
      }
      return;
    }

    // PAID → Stripe Checkout (30-day trial via webhook)
    setPendingPlan(plan.id);
    try {
      const res = await startCheckout.mutateAsync({
        workspaceId: targetWorkspaceId,
        planId: plan.id,
        billingCycle: isYearly ? 'yearly' : 'monthly',
        region,
        country: (targetWorkspace as any)?.country ?? undefined,
        successPath: '/onboarding/billing-return',
        cancelPath: '/onboarding/plan?payment=cancelled',
      });
      if (res?.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }
      toast.error('Could not start checkout');
      setPendingPlan(null);
    } catch (e: any) {
      const msg = e?.message || 'Could not start checkout';
      if (msg.toLowerCase().includes('not configured')) {
        toast.error('Stripe is not fully configured yet. Please contact support.');
      } else {
        toast.error(msg);
      }
      setPendingPlan(null);
    }
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
              <Sparkles className="w-3 h-3" /> 30-Day Free Trial on any paid plan
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
          <p className={cn('text-sm sm:text-base text-white/70')}>
            {isEligible
              ? <>Pick any paid plan and start a <span className="text-emerald-300 font-semibold">30-day free trial</span> — no card charged today.</>
              : <>You've used your one free trial. Free plan is always available, or contact admin to activate paid plans.</>}
          </p>

          <div className="mt-5">
            <MonthlyYearlyToggle yearly={isYearly} onChange={setIsYearly} variant="dark" />
          </div>
        </div>

        {/* Plans */}
        <div className="pb-12">
          <PlanCardsGrid
            region={region}
            cycle={isYearly ? 'yearly' : 'monthly'}
            onSelect={(id) => handleSelect(id)}
            loadingPlanId={pendingPlan}
            variant="dark"
            showTrialBadge={!!isEligible}
            trialLocked={isEligible === false}
          />
        </div>

        <div className="text-center text-xs text-white/60 inline-flex items-center justify-center gap-2 w-full pb-10">
          <ShieldCheck className="w-3.5 h-3.5" />
          {isEligible
            ? 'No card required • Cancel anytime • 30-day free trial'
            : '1 free trial per account • Free plan always available'}
        </div>
      </div>

      <ContactAdminDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        onContinueFree={() => handleSelect('free')}
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
