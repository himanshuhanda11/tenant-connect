import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, X, Sparkles,
  Rocket, Crown, Building2, Gift, TrendingUp,
} from 'lucide-react';
import TemplateChargesBlock from '@/components/shared/TemplateChargesBlock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useGeoLocation, type PlanId } from '@/hooks/useGeoLocation';
import addonExtraAgents from '@/assets/addon-extra-agents.png';
import addonExtraFlows from '@/assets/addon-extra-flows.png';
import addonAutoforms from '@/assets/addon-autoforms.png';
import addonAiCredits from '@/assets/addon-ai-credits.png';

const planIcons: Record<string, React.ReactNode> = {
  free: <Gift className="w-5 h-5" />,
  basic: <Rocket className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

const planColors: Record<string, { text: string; iconBg: string }> = {
  free: { text: 'text-slate-600', iconBg: 'bg-slate-100' },
  basic: { text: 'text-blue-600', iconBg: 'bg-blue-50' },
  pro: { text: 'text-primary', iconBg: 'bg-primary/10' },
  business: { text: 'text-amber-600', iconBg: 'bg-amber-50' },
};

const limitImages: Record<string, string> = {
  team_members: addonExtraAgents,
  contacts: addonAutoforms,
  flows: addonExtraFlows,
  automations: addonAiCredits,
};

interface PricingCardsProps {
  isAnnual: boolean;
}

export default function PricingCards({ isAnnual }: PricingCardsProps) {
  const navigate = useNavigate();
  const { getPlanPrice, formatAmount } = useGeoLocation();

  const getPrice = (plan: PricingPlan) => getPlanPrice(plan.id as PlanId, isAnnual);
  const getBasePrice = (plan: PricingPlan) => getPlanPrice(plan.id as PlanId, false);

  const formatPrice = (price: number) => formatAmount(price);

  return (
    <section id="pricing-cards" className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => {
            const price = getPrice(plan);
            const isCustom = false;
            const colors = planColors[plan.id];
            const isPro = plan.highlight;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -6 }}
                className="flex"
              >
                <Card className={cn(
                  'relative flex flex-col w-full transition-all duration-300 rounded-2xl overflow-hidden',
                  isPro
                    ? 'border-primary/40 shadow-2xl shadow-primary/20 lg:scale-[1.04] z-10 ring-2 ring-primary/30 bg-gradient-to-b from-primary/[0.04] via-card to-card'
                    : 'border-border/60 hover:shadow-xl hover:border-primary/30 bg-card',
                )}>
                  {/* Pro shimmer top bar */}
                  {isPro && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-emerald-400 to-primary" />
                      <motion.div
                        className="absolute -top-px left-0 h-[3px] w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                        animate={{ x: ['-100%', '400%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                      />
                      {/* Soft inner glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-emerald-500/[0.04] pointer-events-none" />
                    </>
                  )}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="px-3 py-1 bg-gradient-to-r from-primary to-emerald-500 text-white text-[11px] font-semibold rounded-full shadow-lg shadow-primary/30 gap-1.5 border-0">
                        <Sparkles className="w-3 h-3" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-2 relative">
                    <motion.div
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        'w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-md',
                        isPro ? 'bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary ring-1 ring-primary/30' : cn(colors.iconBg, colors.text),
                      )}
                    >
                      {planIcons[plan.id]}
                    </motion.div>
                    <CardTitle className={cn('text-lg font-bold', isPro && 'text-primary')}>{plan.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5 px-2">{plan.tagline}</CardDescription>

                    <div className="mt-4 min-h-[80px]">
                      {isCustom ? (
                        <span className="text-3xl font-bold text-foreground">Custom</span>
                      ) : price === 0 ? (
                        <div>
                          <span className="text-4xl font-bold text-foreground">Free</span>
                          <p className="text-xs text-muted-foreground mt-0.5">Forever</p>
                        </div>
                      ) : (
                        <div>
                          {isAnnual && (
                            <span className="text-xs text-muted-foreground line-through block mb-0.5">
                              {formatPrice(getBasePrice(plan))}/mo
                            </span>
                          )}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${plan.id}-${isAnnual}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                              className="flex items-baseline justify-center gap-0.5"
                            >
                              <span className={cn(
                                'text-4xl font-bold tracking-tight',
                                isPro ? 'bg-gradient-to-br from-primary to-emerald-500 bg-clip-text text-transparent' : 'text-foreground',
                              )}>
                                {formatPrice(price!)}
                              </span>
                              <span className="text-muted-foreground text-sm">/mo</span>
                            </motion.div>
                          </AnimatePresence>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Per workspace</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                <CardContent className="pb-6 flex-1 flex flex-col px-5">
                  <Button
                    className={cn(
                      'w-full mb-4 h-11 font-semibold gap-2 rounded-xl transition-all',
                      isPro && 'bg-gradient-to-r from-primary to-emerald-500 shadow-lg shadow-primary/20 hover:shadow-xl',
                    )}
                    variant={isPro ? 'default' : 'outline'}
                    onClick={() => isCustom ? navigate('/contact') : navigate('/signup')}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {/* Key limits */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-muted/30 border border-border/40">
                    {[
                      { key: 'team_members', label: 'Members', value: plan.limits.team_members === 25 ? '25+' : plan.limits.team_members },
                      { key: 'contacts', label: 'Contacts', value: plan.limits.contacts === 'unlimited' ? '∞' : (plan.limits.contacts as number).toLocaleString('en-IN') },
                      { key: 'flows', label: 'Flows', value: plan.limits.flows === 'unlimited' ? '∞' : plan.limits.flows === 0 ? '—' : plan.limits.flows },
                      { key: 'automations', label: 'Automations', value: plan.limits.automations === 'unlimited' ? '∞' : plan.limits.automations === 0 ? '—' : plan.limits.automations },
                    ].map((item) => {
                      const img = limitImages[item.key];
                      return (
                        <div key={item.key} className="flex items-center gap-2">
                          <img src={img} alt={item.label} className="w-6 h-6 rounded flex-shrink-0 object-cover" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
                            <p className="text-xs font-semibold text-foreground capitalize truncate">{String(item.value)}</p>
                          </div>
                        </div>
                      );
                    })}
                    </div>

                    {/* Template Message Charges */}
                    <TemplateChargesBlock compact className="mb-4" />

                  {/* Features — 4-5 high impact bullets */}
                  <div className="space-y-2 flex-1">
                    {plan.features.slice(0, 5).map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground leading-snug">{feature}</span>
                      </div>
                    ))}
                    {plan.restrictions?.slice(0, 2).map((r, i) => (
                      <div key={`r-${i}`} className="flex items-start gap-2 opacity-35">
                        <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm line-through leading-snug">{r}</span>
                      </div>
                    ))}
                  </div>

                  {plan.addons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40 text-center">
                      <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Add-ons available
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
