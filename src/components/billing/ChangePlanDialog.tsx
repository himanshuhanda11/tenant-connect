import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Crown, Rocket, Building2, Gift, Lock, ArrowRight, Check, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { pricingPlans } from '@/data/pricingPlans';
import { useLaunchOffer, useTrialEligibility } from '@/hooks/useLaunchOffer';
import { useTenant } from '@/contexts/TenantContext';
import ContactAdminDialog from './ContactAdminDialog';

const planMeta: Record<string, { icon: JSX.Element; gradient: string; ring: string }> = {
  free:     { icon: <Gift className="w-4 h-4" />,     gradient: 'from-slate-500 to-slate-700',   ring: 'ring-slate-400/30' },
  basic:    { icon: <Rocket className="w-4 h-4" />,   gradient: 'from-blue-500 to-cyan-500',     ring: 'ring-blue-400/40' },
  pro:      { icon: <Crown className="w-4 h-4" />,    gradient: 'from-emerald-400 to-green-600', ring: 'ring-emerald-400/50' },
  business: { icon: <Building2 className="w-4 h-4" />,gradient: 'from-amber-400 to-orange-500',  ring: 'ring-amber-400/40' },
};

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
  onChanged?: () => void;
}

export default function ChangePlanDialog({ open, onOpenChange, currentPlanId, onChanged }: ChangePlanDialogProps) {
  const { currentTenant } = useTenant();
  const { claim, isClaiming } = useLaunchOffer();
  const { data: isEligible, refetch: refetchEligible } = useTrialEligibility();
  const [pending, setPending] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
      onChanged?.();
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1800);
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
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl ring-1 ring-white/10">
            {/* Aurora */}
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/25 blur-[100px]" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-500/20 blur-[100px]" />
            </div>

            <div className="relative p-5 sm:p-7">
              <DialogHeader className="text-left">
                <Badge className="self-start bg-emerald-400/15 text-emerald-200 border-emerald-300/30 gap-1 mb-2">
                  <Sparkles className="w-3 h-3" /> Activate your workspace
                </Badge>
                <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Select Your{' '}
                  <span className="bg-gradient-to-r from-emerald-300 via-primary to-emerald-300 bg-clip-text text-transparent">
                    Workspace Plan
                  </span>
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm sm:text-base">
                  Plan applies to <span className="font-semibold text-white">{currentTenant?.name}</span>.{' '}
                  {isEligible
                    ? 'Enjoy your first month free on any paid plan — no card required.'
                    : "You've used your free trial. Free is instant; paid plans need admin activation."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 mt-5">
                {pricingPlans.map((plan, idx) => {
                  const meta = planMeta[plan.id] ?? planMeta.free;
                  const isCurrent = plan.id === currentPlanId;
                  const isFree = plan.id === 'free';
                  const isPro = plan.highlight;
                  const locked = !isFree && isEligible === false;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -3 }}
                      className={cn(
                        'relative rounded-2xl p-4 backdrop-blur-md flex flex-col gap-3 transition-all',
                        'bg-white/[0.04] border border-white/10 hover:border-white/25',
                        isCurrent && 'border-emerald-300/50 ring-1 ring-emerald-300/40 bg-emerald-400/[0.06]',
                        isPro && !isCurrent && !locked && 'ring-1 ring-emerald-300/30',
                      )}
                    >
                      {isPro && !locked && !isCurrent && (
                        <Badge className="absolute -top-2.5 left-4 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 text-[10px] gap-1 shadow-lg">
                          <Sparkles className="w-2.5 h-2.5" /> Most popular
                        </Badge>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md',
                            meta.gradient,
                          )}>
                            {meta.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm leading-tight truncate">{plan.name}</h3>
                            <p className="text-[11px] text-white/60 truncate">{plan.tagline}</p>
                          </div>
                        </div>
                        {isCurrent && (
                          <Badge className="bg-emerald-400/20 text-emerald-200 border-emerald-300/40 text-[10px] gap-1">
                            <Check className="w-3 h-3" /> Current
                          </Badge>
                        )}
                        {locked && !isCurrent && (
                          <Badge className="bg-amber-400/20 text-amber-200 border-amber-300/40 text-[10px] gap-1">
                            <Lock className="w-3 h-3" /> Admin
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        disabled={isCurrent || isClaiming}
                        onClick={() => handlePick(plan.id)}
                        className={cn(
                          'w-full mt-1 gap-1.5 font-semibold border-0 transition-all',
                          isCurrent
                            ? 'bg-white/10 text-white/70 hover:bg-white/10 cursor-default'
                            : locked
                              ? 'bg-amber-500/90 hover:bg-amber-500 text-white'
                              : isFree
                                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                                : 'bg-gradient-to-r from-emerald-400 to-primary text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl',
                        )}
                      >
                        {isClaiming && pending === plan.id
                          ? 'Activating…'
                          : isCurrent
                            ? 'Current plan'
                            : locked
                              ? <>🔒 Contact Admin</>
                              : isFree
                                ? 'Free Lifetime'
                                : '🎁 Start 1 Month Free'}
                        {!isCurrent && !locked && <ArrowRight className="w-3.5 h-3.5" />}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-[11px] text-white/50 text-center mt-5">
                {isEligible
                  ? 'No card required • Cancel anytime • Activated instantly'
                  : '1 free trial per account • Free Lifetime always available'}
              </p>
            </div>

            {/* Success overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.7 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                    >
                      <PartyPopper className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-1">🎉 Workspace Activated</h3>
                    <p className="text-sm text-white/75">Your plan is live. Loading dashboard…</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
