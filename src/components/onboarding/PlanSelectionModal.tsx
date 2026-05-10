import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Check, Rocket, Crown, Building2, Gift,
  ChevronLeft, ChevronRight, Loader2, ShieldCheck, Users, Flame, Star, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { useGeoLocation, type PlanId } from '@/hooks/useGeoLocation';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  tenantId: string;
  onSelected: (planName: string) => void;
  onPaidIntent: () => void;
  onDismiss?: () => void;
}

const planMeta: Record<string, { icon: React.ReactNode; gradient: string; ring: string; iconBg: string; iconText: string; badge?: { label: string; icon: React.ReactNode; cls: string } }> = {
  free: {
    icon: <Gift className="w-5 h-5" />,
    gradient: 'from-slate-50 to-white',
    ring: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
  },
  basic: {
    icon: <Rocket className="w-5 h-5" />,
    gradient: 'from-blue-50/60 to-white',
    ring: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  pro: {
    icon: <Crown className="w-5 h-5" />,
    gradient: 'from-emerald-50 via-white to-teal-50',
    ring: 'border-emerald-400 ring-2 ring-emerald-300/50',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    iconText: 'text-emerald-600',
    badge: { label: 'Most Popular', icon: <Flame className="w-3 h-3" />, cls: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30' },
  },
  business: {
    icon: <Building2 className="w-5 h-5" />,
    gradient: 'from-amber-50/60 to-white',
    ring: 'border-amber-300',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    badge: { label: 'Enterprise Ready', icon: <Crown className="w-3 h-3" />, cls: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30' },
  },
};

export default function PlanSelectionModal({ open, tenantId, onSelected, onPaidIntent, onDismiss }: Props) {
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const { getPlanPrice, formatAmount } = useGeoLocation();
  const navigate = useNavigate();

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(updateArrows, 150);
    return () => clearTimeout(t);
  }, [open]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-plan-card]') as HTMLElement | null;
    const dist = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * dist, behavior: 'smooth' });
  };

  const handleFree = async () => {
    if (activatingId) return;
    setActivatingId('free');
    try {
      try {
        await supabase.from('subscriptions').upsert(
          { tenant_id: tenantId, plan_id: 'plan_free', status: 'active' } as any,
          { onConflict: 'tenant_id' },
        );
      } catch (e) {
        console.warn('[PlanSelection] free upsert non-fatal:', e);
      }
      onSelected('Free');
      toast.success('Free Lifetime activated 🎉');
    } finally {
      setActivatingId(null);
    }
  };

  const handlePaid = async (plan: PricingPlan) => {
    if (activatingId) return;
    setActivatingId(plan.id);
    try {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 30);
      try {
        await supabase.from('subscriptions').upsert(
          {
            tenant_id: tenantId,
            plan_id: `plan_${plan.id}`,
            status: 'trialing',
            trial_ends_at: trialEnds.toISOString(),
          } as any,
          { onConflict: 'tenant_id' },
        );
      } catch (e) {
        console.warn('[PlanSelection] paid trial upsert non-fatal:', e);
      }
      onSelected(plan.name);
      toast.success(`${plan.name} trial started — 1 month free 🚀`);
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-[1100px] w-[calc(100vw-1rem)] p-0 border-0 bg-transparent shadow-none [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Close button — dismisses modal and keeps user on dashboard (defaults to Free plan) */}
          <button
            type="button"
            onClick={() => {
              if (activatingId) return;
              handleFree();
            }}
            aria-label="Close"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Header */}
          <div className="relative px-5 sm:px-8 pt-5 sm:pt-7 pb-4 text-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-emerald-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3" /> Choose your plan to continue
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Pick a plan and unlock your <span className="text-emerald-600">WhatsApp Growth Cloud</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              Start free forever or unlock pro automation. Switch anytime.
            </p>

            {/* Social proof */}
            <div className="mt-3 flex items-center justify-center gap-2.5">
              <div className="flex -space-x-2">
                {['from-emerald-400 to-teal-500', 'from-blue-400 to-indigo-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500'].map((g, i) => (
                  <div key={i} className={cn('w-6 h-6 rounded-full bg-gradient-to-br ring-2 ring-white', g)} />
                ))}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-600 inline-flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-500" />
                Trusted by <strong className="text-slate-900">2,000+</strong> businesses
              </span>
            </div>
          </div>

          {/* Slider area */}
          <div className="relative flex-1 overflow-hidden bg-slate-50/60">
            {/* Arrows */}
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canLeft}
              aria-label="Previous plan"
              className={cn(
                'absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center transition-all duration-200',
                'hover:scale-110 hover:shadow-emerald-500/20 hover:border-emerald-300',
                !canLeft && 'opacity-0 pointer-events-none',
              )}
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canRight}
              aria-label="Next plan"
              className={cn(
                'absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-all duration-200 text-white',
                'hover:scale-110 hover:shadow-emerald-500/60',
                !canRight && 'opacity-0 pointer-events-none',
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-50/80 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-50/80 to-transparent z-10" />

            <div
              ref={scrollerRef}
              onScroll={updateArrows}
              className="flex gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-6 py-4 sm:py-5 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              {pricingPlans.map((plan) => {
                const meta = planMeta[plan.id] ?? planMeta.free;
                const price = getPlanPrice(plan.id as PlanId, false);
                const isFree = plan.id === 'free';
                return (
                  <motion.div
                    key={plan.id}
                    data-plan-card
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className={cn(
                      'snap-center sm:snap-start flex-shrink-0 w-[78vw] max-w-[280px] sm:w-[300px] sm:max-w-none rounded-2xl border bg-gradient-to-b p-4 sm:p-5 flex flex-col relative shadow-sm hover:shadow-xl transition-shadow',
                      meta.gradient,
                      meta.ring,
                    )}
                  >
                    {meta.badge && (
                      <div className={cn('absolute -top-2.5 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1', meta.badge.cls)}>
                        {meta.badge.icon} {meta.badge.label}
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', meta.iconBg, meta.iconText)}>
                        {meta.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-[10.5px] text-slate-500 leading-tight">{plan.tagline}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      {price === 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-900">Free</span>
                          <span className="text-xs text-slate-500">forever</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-slate-900">{formatAmount(price!)}</span>
                          <span className="text-xs text-slate-500">/mo</span>
                        </div>
                      )}
                    </div>

                    {/* Limits grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 rounded-xl bg-white/70 border border-slate-200/70">
                      {[
                        { label: 'Agents', value: plan.limits.team_members === 25 ? '25+' : plan.limits.team_members },
                        { label: 'Contacts', value: plan.limits.contacts === 'unlimited' ? '∞' : (plan.limits.contacts as number).toLocaleString('en-IN') },
                        { label: 'Flows', value: plan.limits.flows === 'unlimited' ? '∞' : plan.limits.flows === 0 ? '—' : plan.limits.flows },
                        { label: 'Automations', value: plan.limits.automations === 'unlimited' ? '∞' : plan.limits.automations === 0 ? '—' : plan.limits.automations },
                      ].map((item) => (
                        <div key={item.label} className="min-w-0">
                          <p className="text-[9.5px] text-slate-500 leading-tight uppercase tracking-wide">{item.label}</p>
                          <p className="text-xs font-semibold text-slate-900 truncate">{String(item.value)}</p>
                        </div>
                      ))}
                    </div>

                    <ul className="space-y-1.5 flex-1 mb-4">
                      {plan.features.slice(0, 6).map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[11.5px] text-slate-700 leading-snug">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isFree ? (
                      <Button
                        onClick={handleFree}
                        disabled={!!activatingId}
                        variant="outline"
                        className="h-10 rounded-xl border-slate-300 hover:bg-slate-50 font-semibold text-sm"
                      >
                        {activatingId === 'free' ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating…</>
                        ) : (
                          <><Gift className="w-4 h-4 mr-2" /> Free Lifetime</>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePaid(plan)}
                        disabled={!!activatingId}
                        className={cn(
                          'h-10 rounded-xl font-semibold text-sm text-white shadow-lg',
                          plan.id === 'pro' && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30',
                          plan.id === 'basic' && 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/30',
                          plan.id === 'business' && 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30',
                        )}
                      >
                        {activatingId === plan.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting trial…</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-1.5" /> Start 1 Month Free</>
                        )}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* footer trust */}
          <div className="px-5 sm:px-8 py-3 border-t border-slate-100 bg-white flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Official Meta Partner</span>
            <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Cancel anytime</span>
            <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9/5 rated</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500" /> No credit card for free</span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
