import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, X, Zap, MessageCircle, ArrowRight, Clock } from 'lucide-react';
import { useLaunchOffer, useTodayClaimCount, formatCountdown } from '@/hooks/useLaunchOffer';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const PENDING_CLAIM_KEY = 'lovable.pending_claim_offer';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const trustItems = [
  { icon: ShieldCheck, label: 'No Credit Card' },
  { icon: MessageCircle, label: 'Official WhatsApp API' },
  { icon: Zap, label: 'Setup in < 10 min' },
];

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-lg" />
        <div className="relative w-11 sm:w-14 h-11 sm:h-14 rounded-lg bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center font-mono font-bold text-lg sm:text-2xl tabular-nums text-white">
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <span className="mt-1.5 text-[9px] uppercase tracking-[0.15em] text-white/50 font-medium">
        {label}
      </span>
    </div>
  );
}

export function LaunchOfferDialog({ open, onOpenChange }: Props) {
  const { isActive, secondsLeft, isClaiming } = useLaunchOffer();
  const { data: claimCount } = useTodayClaimCount();
  const { user } = useAuth();
  const { tenants, currentTenant } = useTenant();
  const navigate = useNavigate();
  const [hovering, setHovering] = useState(false);

  if (!isActive) return null;

  const { h, m, s } = formatCountdown(secondsLeft);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 border-0 bg-transparent shadow-none overflow-visible',
          'w-[calc(100%-2rem)] max-w-[22rem] sm:max-w-md',
          'data-[state=open]:animate-none data-[state=closed]:animate-none',
        )}
      >
        <VisuallyHidden>
          <DialogTitle>Get 1 Month FREE on Any Plan</DialogTitle>
          <DialogDescription>Limited launch offer for new Aireatro subscribers</DialogDescription>
        </VisuallyHidden>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -4, 0],
              }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { type: 'spring', stiffness: 280, damping: 22 },
                y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
              }}
              className="relative w-full"
            >
              {/* Outer glow halos — softer */}
              <div className="pointer-events-none absolute -inset-8 -z-10">
                <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full bg-emerald-500/15 blur-[70px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-52 h-52 rounded-full bg-primary/12 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Frosted glass card — lighter */}
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]"
                style={{
                  background:
                    'linear-gradient(140deg, rgba(15,23,42,0.85) 0%, rgba(2,6,23,0.9) 50%, rgba(6,30,22,0.85) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {/* Top emerald hairline glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

                {/* Sparkle / particle layer */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-emerald-300/70"
                      style={{
                        top: `${15 + i * 13}%`,
                        left: `${10 + (i * 17) % 80}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                        y: [0, -20],
                      }}
                      transition={{
                        duration: 3 + i * 0.4,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </div>

                {/* Close */}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                  className="group absolute right-3 top-3 z-50 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
                </button>

                <div className="relative px-5 sm:px-7 pt-6 pb-5 sm:pb-6">
                  {/* Premium animated badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md animate-pulse" />
                      <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-emerald-300/30 backdrop-blur-md">
                        <span className="text-sm">🎁</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                          Limited Launch Offer
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Headline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="text-center text-[22px] sm:text-[26px] font-bold tracking-tight leading-[1.15] text-white"
                  >
                    Get{' '}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-teal-300 bg-clip-text text-transparent">
                        1 Month FREE
                      </span>
                      <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
                    </span>
                    <br />
                    <span className="text-white/95">on Any Plan</span>
                  </motion.h2>

                  {/* Subheading */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="text-center text-[12.5px] sm:text-[13px] text-white/60 mt-2.5 leading-relaxed max-w-[20rem] mx-auto"
                  >
                    Scale your WhatsApp sales with AI automation, CRM, team inbox & campaigns — free for your first month.
                  </motion.p>

                  {/* Countdown timer */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34 }}
                    className="mt-5 mx-auto"
                  >
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 blur-md" />
                      <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <Clock className="w-3 h-3 text-emerald-300/80" />
                          <span className="text-[9.5px] uppercase tracking-[0.18em] text-emerald-200/80 font-semibold">
                            Offer resets in
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <TimeBlock value={h} label="Hours" />
                          <span className="text-white/30 font-bold text-xl pb-4">:</span>
                          <TimeBlock value={m} label="Mins" />
                          <span className="text-white/30 font-bold text-xl pb-4">:</span>
                          <TimeBlock value={s} label="Secs" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-5 flex flex-col gap-2.5"
                  >
                    {/* Primary CTA with glow */}
                    <div
                      className="relative group"
                      onMouseEnter={() => setHovering(true)}
                      onMouseLeave={() => setHovering(false)}
                    >
                      <div
                        className={cn(
                          'absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 opacity-60 blur-md transition-all duration-300',
                          hovering && 'opacity-100 blur-lg',
                        )}
                      />
                      <Button
                        disabled={isClaiming}
                        onClick={() => routeToPlanFlow()}
                        className="relative w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-0 font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-[1.015] active:scale-[0.99] group/btn"
                      >
                        <Sparkles className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-12" />
                        Claim Free Access
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-0.5" />
                      </Button>
                    </div>

                    {/* Secondary CTA */}
                    <Button
                      onClick={() => {
                        onOpenChange(false);
                        navigate('/pricing');
                      }}
                      variant="ghost"
                      className="w-full h-10 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white/85 hover:text-white font-medium text-[13px] backdrop-blur-md transition-all"
                    >
                      Explore Plans
                    </Button>
                  </motion.div>

                  {/* Trust indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-5 flex items-center justify-between gap-2"
                  >
                    {trustItems.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-[10.5px] text-white/55 font-medium"
                      >
                        <Icon className="w-3 h-3 text-emerald-400/80 flex-shrink-0" />
                        <span className="whitespace-nowrap">{label}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Social proof */}
                  {typeof claimCount === 'number' && claimCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10.5px] text-white/45"
                    >
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                        <span className="relative rounded-full bg-emerald-400 w-1.5 h-1.5" />
                      </span>
                      <span className="font-medium text-white/65">{claimCount}</span> founders claimed today
                    </motion.div>
                  )}
                </div>

                {/* Bottom hairline */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
