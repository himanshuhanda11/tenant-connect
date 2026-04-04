import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Gift, Rocket, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import TemplateChargesBlock from '@/components/shared/TemplateChargesBlock';

const planMeta: Record<string, { icon: React.ElementType; accent: string; border: string; bg: string }> = {
  free: { icon: Gift, accent: 'text-muted-foreground', border: 'border-border/60', bg: 'bg-muted/40' },
  basic: { icon: Rocket, accent: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
  pro: { icon: Crown, accent: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/10' },
  business: { icon: Building2, accent: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
};

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return isYearly ? Math.round((plan.price as number) * 0.8) : (plan.price as number);
  };

  const fmt = (p: number) => `₹${p.toLocaleString('en-IN')}`;

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Per Workspace Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
            Each workspace includes 1 WhatsApp number. Upgrade when you automate.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card border border-border/60 shadow-sm">
            <span className={cn('text-sm transition-colors', !isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground')}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn('text-sm transition-colors', isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground')}>Yearly</span>
            {isYearly && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Save 20%</span>
            )}
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {pricingPlans.map((plan, i) => {
            const price = getPrice(plan);
            const meta = planMeta[plan.id];
            const Icon = meta.icon;

            return (
              <motion.div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card/70 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl',
                  plan.highlight
                    ? 'border-primary/40 shadow-lg shadow-primary/10 ring-1 ring-primary/20 sm:scale-[1.03]'
                    : meta.border,
                )}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-xs font-bold text-primary-foreground bg-gradient-to-r from-primary to-emerald-500 px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', meta.bg)}>
                    <Icon className={cn('w-5 h-5', meta.accent)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {price === 0 ? (
                    <span className="text-3xl font-bold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-foreground">{fmt(price)}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-5 flex-1">
                  {plan.features.slice(0, 5).map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <TemplateChargesBlock compact className="mb-4" />

                {/* CTA */}
                <Button
                  className={cn(
                    'w-full h-11 text-sm font-semibold rounded-xl',
                    plan.highlight && 'bg-gradient-to-r from-primary to-emerald-500 shadow-lg shadow-primary/20',
                  )}
                  variant={plan.highlight ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/signup">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
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
