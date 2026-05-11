import { motion } from 'framer-motion';
import {
  Gift, Rocket, Crown, Building2, CheckCircle2, Sparkles, ArrowRight, Lock, Loader2, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PLANS, type PlanConfig, type PlanId, type Region, type BillingCycle,
  formatPlanPrice, PLAN_RANK,
} from '@/data/plans.config';
import { cn } from '@/lib/utils';

const planIcons: Record<PlanId, JSX.Element> = {
  free: <Gift className="w-5 h-5" />,
  basic: <Rocket className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

interface Props {
  region: Region;
  cycle: BillingCycle;
  onSelect: (planId: PlanId, cycle: BillingCycle) => void;
  currentPlanId?: string | null;
  showFree?: boolean;
  loadingPlanId?: string | null;
  variant?: 'dark' | 'light';
  /** Show "1 Month FREE" badge + "First month on us" label on paid plans */
  showTrialBadge?: boolean;
  /** When trial is locked (already used), tag paid plans as Contact Admin */
  trialLocked?: boolean;
  className?: string;
}

export function PlanCardsGrid({
  region, cycle, onSelect, currentPlanId, showFree = true,
  loadingPlanId, variant = 'light', showTrialBadge = false, trialLocked = false,
  className,
}: Props) {
  const dark = variant === 'dark';
  const visible = showFree ? PLANS : PLANS.filter((p) => p.id !== 'free');
  const normalizedCurrent = (currentPlanId ?? '').replace(/^plan_/, '').toLowerCase();
  const currentRank = PLAN_RANK[(normalizedCurrent || 'free') as PlanId] ?? 0;

  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto',
      className,
    )}>
      {visible.map((plan, idx) => {
        const isFree = plan.id === 'free';
        const isPro = plan.highlight;
        const isCurrent = normalizedCurrent === plan.id;
        const thisRank = PLAN_RANK[plan.id];
        const isDowngrade = !isCurrent && thisRank < currentRank;
        const locked = !isFree && trialLocked;
        const isLoading = loadingPlanId === plan.id;
        const priceLabel = formatPlanPrice(plan, region, cycle);

        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ y: -4 }}
            className={cn(
              'relative rounded-2xl p-5 flex flex-col',
              dark
                ? cn(
                    'backdrop-blur-md',
                    isPro && !locked
                      ? 'bg-gradient-to-b from-emerald-500/15 to-white/5 border border-emerald-300/40 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-300/30'
                      : 'bg-white/5 border border-white/10',
                    isCurrent && 'ring-2 ring-emerald-300/60',
                  )
                : cn(
                    'bg-card border transition-all hover:shadow-xl',
                    isPro
                      ? 'border-primary/40 ring-1 ring-primary/20 shadow-lg shadow-primary/10'
                      : 'border-border',
                    isCurrent && 'ring-2 ring-primary/50',
                  ),
            )}
          >
            {/* Top badges */}
            {isCurrent && (
              <Badge className={cn(
                'absolute -top-2.5 left-1/2 -translate-x-1/2 border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg',
                dark ? 'bg-emerald-400/30 text-emerald-100' : 'bg-primary text-primary-foreground',
              )}>
                <Check className="w-3 h-3" /> Current Plan
              </Badge>
            )}
            {!isCurrent && plan.badge && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg">
                <Sparkles className="w-2.5 h-2.5" /> {plan.badge}
              </Badge>
            )}
            {!isCurrent && !plan.badge && showTrialBadge && !isFree && !locked && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-primary text-white border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg">
                <Sparkles className="w-2.5 h-2.5" /> {plan.trialDays}-Day Free Trial
              </Badge>
            )}
            {locked && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white border-0 text-[10px] px-2.5 py-0.5 gap-1 shadow-lg">
                <Lock className="w-2.5 h-2.5" /> Contact Admin
              </Badge>
            )}

            {/* Icon */}
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
              dark
                ? (isPro ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/80')
                : (isPro ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'),
            )}>
              {planIcons[plan.id]}
            </div>

            <h3 className={cn('text-lg font-bold', dark ? 'text-white' : 'text-foreground')}>{plan.name}</h3>
            <p className={cn('text-xs mb-3 min-h-[2.5em]', dark ? 'text-white/60' : 'text-muted-foreground')}>
              {plan.tagline}
            </p>

            {/* Price */}
            <div className="mb-4">
              {isFree ? (
                <span className={cn('text-3xl font-bold', dark ? 'text-white' : 'text-foreground')}>Free</span>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-3xl font-bold', dark ? 'text-white' : 'text-foreground')}>{priceLabel}</span>
                  <span className={cn('text-xs', dark ? 'text-white/60' : 'text-muted-foreground')}>/mo</span>
                </div>
              )}
              {!isFree && cycle === 'yearly' && (
                <p className={cn('text-[11px] mt-1', dark ? 'text-emerald-300' : 'text-primary')}>Billed yearly · save 20%</p>
              )}
              {!isFree && cycle !== 'yearly' && showTrialBadge && !locked && (
                <p className={cn('text-[11px] mt-1 font-medium', dark ? 'text-emerald-300' : 'text-primary')}>
                  {plan.trialDays}-day free trial · no card required
                </p>
              )}
            </div>

            {/* Features */}
            <ul className={cn('space-y-1.5 mb-5 text-xs flex-1', dark ? 'text-white/85' : 'text-foreground/85')}>
              {plan.features.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', dark ? 'text-emerald-300' : 'text-primary')} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                'w-full font-semibold gap-1.5',
                isCurrent
                  ? (dark ? 'bg-white/10 text-white/70 hover:bg-white/10 cursor-default' : 'bg-muted text-muted-foreground hover:bg-muted cursor-default')
                  : locked
                    ? 'bg-amber-500/90 hover:bg-amber-500 text-white border-0'
                    : isPro
                      ? 'bg-gradient-to-r from-emerald-400 to-primary text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl border-0'
                      : isFree
                        ? (dark
                            ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80')
                        : (dark
                            ? 'bg-white text-emerald-900 hover:bg-emerald-50'
                            : 'bg-foreground text-background hover:bg-foreground/90'),
              )}
              disabled={isCurrent || isLoading}
              onClick={() => !isCurrent && !isLoading && onSelect(plan.id, cycle)}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : isCurrent ? (
                'Current Plan'
              ) : locked ? (
                <>🔒 Contact Admin</>
              ) : isFree ? (
                'Free Lifetime'
              ) : isDowngrade ? (
                <>Downgrade <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>{showTrialBadge ? '🎁 Start Free Trial' : 'Get ' + plan.name} <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
