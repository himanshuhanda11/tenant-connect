import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Gift, Rocket, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import TemplateChargesBlock from '@/components/shared/TemplateChargesBlock';

const planMeta: Record<string, { icon: React.ElementType; accent: string; glow: string; bg: string; borderHover: string }> = {
  free: { icon: Gift, accent: 'text-muted-foreground', glow: '', bg: 'bg-muted/50', borderHover: 'hover:border-border' },
  basic: { icon: Rocket, accent: 'text-blue-500', glow: 'shadow-blue-500/5', bg: 'bg-blue-500/10', borderHover: 'hover:border-blue-500/30' },
  pro: { icon: Crown, accent: 'text-primary', glow: 'shadow-primary/10', bg: 'bg-primary/10', borderHover: 'hover:border-primary/40' },
  business: { icon: Building2, accent: 'text-amber-500', glow: 'shadow-amber-500/5', bg: 'bg-amber-500/10', borderHover: 'hover:border-amber-500/30' },
};

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return isYearly ? Math.round((plan.price as number) * 0.8) : (plan.price as number);
  };

  const fmt = (p: number) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <section className="relative overflow-hidden isolate">
      {/* Two-tone background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl py-16 sm:py-24 lg:py-32">
        {/* Header */}
        <motion.div
          className="text-center mb-14 sm:mb-18"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Per Workspace Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Simple, Transparent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8">
            1 WhatsApp number per workspace. Scale as you grow.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border/60 shadow-sm backdrop-blur-sm">
            <span className={cn('text-sm transition-colors', !isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground')}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn('text-sm transition-colors', isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground')}>Yearly</span>
            {isYearly && (
              <span className="text-[10px] font-bold text-primary-foreground bg-gradient-to-r from-primary to-emerald-500 px-2.5 py-0.5 rounded-full">-20%</span>
            )}
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 xl:gap-5 mb-10">
          {pricingPlans.map((plan, i) => {
            const price = getPrice(plan);
            const meta = planMeta[plan.id];
            const Icon = meta.icon;
            const isPro = plan.highlight;

            return (
              <motion.div
                key={plan.id}
                className={cn(
                  'group relative flex flex-col rounded-2xl border backdrop-blur-sm transition-all duration-300',
                  isPro
                    ? 'bg-foreground text-background border-foreground shadow-2xl shadow-primary/15 sm:scale-[1.04] z-10'
                    : `bg-card/80 border-border/50 ${meta.borderHover} hover:shadow-xl ${meta.glow}`,
                )}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Popular ribbon */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r from-primary to-emerald-500 px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Plan header */}
                  <div className="mb-6">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                      isPro ? 'bg-background/15' : meta.bg,
                    )}>
                      <Icon className={cn('w-5 h-5', isPro ? 'text-primary' : meta.accent)} />
                    </div>
                    <h3 className={cn('text-lg font-bold mb-0.5', isPro ? 'text-background' : 'text-foreground')}>
                      {plan.name}
                    </h3>
                    <p className={cn('text-xs', isPro ? 'text-background/50' : 'text-muted-foreground')}>
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <div>
                        <span className={cn('text-4xl font-bold tracking-tight', isPro ? 'text-background' : 'text-foreground')}>Free</span>
                        <p className={cn('text-xs mt-1', isPro ? 'text-background/40' : 'text-muted-foreground')}>Forever</p>
                      </div>
                    ) : (
                      <div>
                        <span className={cn('text-4xl font-bold tracking-tight', isPro ? 'text-background' : 'text-foreground')}>{fmt(price)}</span>
                        <span className={cn('text-sm ml-1', isPro ? 'text-background/50' : 'text-muted-foreground')}>/mo</span>
                        {isYearly && (
                          <p className={cn('text-xs mt-1 line-through', isPro ? 'text-background/30' : 'text-muted-foreground/50')}>
                            {fmt(plan.price as number)}/mo
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className={cn('h-px mb-5', isPro ? 'bg-background/10' : 'bg-border/60')} />

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.slice(0, 5).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <div className={cn(
                          'w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          isPro ? 'bg-primary/20' : 'bg-primary/10',
                        )}>
                          <Check className={cn('w-3 h-3', isPro ? 'text-primary' : 'text-primary')} />
                        </div>
                        <span className={cn('leading-snug', isPro ? 'text-background/70' : 'text-muted-foreground')}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <TemplateChargesBlock compact className="mb-5" />

                  {/* CTA */}
                  {isPro ? (
                    <Button
                      className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                      asChild
                    >
                      <Link to="/signup">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  ) : (
                    <button
                      className={cn(
                        'w-full h-11 text-sm font-semibold rounded-xl border transition-colors',
                        'border-border/60 text-foreground bg-transparent hover:bg-muted/50',
                      )}
                      onClick={() => window.location.href = '/signup'}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mb-8">
          + Meta conversation fees (billed separately by Meta)
        </p>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 px-6" asChild>
            <Link to="/pricing">
              View Full Pricing & Comparison
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
