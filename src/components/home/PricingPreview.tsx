import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Zap, Users, MessageSquare, Bot, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import TemplateChargesBlock from '@/components/shared/TemplateChargesBlock';

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return isYearly ? Math.round((plan.price as number) * 0.8) : (plan.price as number);
  };

  const fmt = (p: number) => `₹${p.toLocaleString('en-IN')}`;

  const limitItems = (plan: PricingPlan) => [
    { icon: Users, label: 'Members', value: plan.limits.team_members },
    { icon: MessageSquare, label: 'Contacts', value: plan.limits.contacts === 'unlimited' ? '∞' : plan.limits.contacts.toLocaleString('en-IN') },
    { icon: Workflow, label: 'Flows', value: plan.limits.flows === 'unlimited' ? '∞' : plan.limits.flows },
    { icon: Bot, label: 'Automations', value: plan.limits.automations === 'unlimited' ? '∞' : plan.limits.automations },
  ];

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold mb-5 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
            One workspace. One price.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-10">
            No hidden fees. Scale your team, not your bill.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center rounded-full bg-muted border border-border p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all',
                !isYearly ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                isYearly ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Yearly
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                isYearly ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary',
              )}>
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3 mb-8">
          {pricingPlans.map((plan, i) => {
            const price = getPrice(plan);
            const isPro = plan.highlight;

            return (
              <motion.div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300',
                  isPro
                    ? 'bg-gradient-to-b from-primary/10 to-primary/[0.03] border-2 border-primary/40 shadow-xl shadow-primary/10'
                    : 'bg-card border border-border hover:border-primary/20 hover:shadow-lg',
                )}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-[11px] font-bold text-center py-1.5 tracking-wider uppercase">
                    ⚡ {plan.badge}
                  </div>
                )}

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  {/* Name */}
                  <h3 className={cn('text-xl font-bold mb-1', isPro ? 'text-primary' : 'text-foreground')}>
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-5">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-foreground tracking-tight">₹0</span>
                        <span className="text-muted-foreground text-sm">/forever</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-foreground tracking-tight">{fmt(price)}</span>
                          <span className="text-muted-foreground text-sm">/mo</span>
                        </div>
                        {isYearly && (
                          <p className="text-muted-foreground/60 text-xs mt-1 line-through">{fmt(plan.price as number)}/mo</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Limits grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {limitItems(plan).map((item) => (
                      <div key={item.label} className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
                        <item.icon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-none">{item.label}</span>
                          <span className="text-sm font-bold text-foreground leading-tight">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border mb-4" />

                  {/* Features */}
                  <ul className="space-y-2.5 mb-5 flex-1">
                    {plan.features.slice(0, 4).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <TemplateChargesBlock compact className="mb-5" />

                  {/* CTA */}
                  {isPro ? (
                    <Button
                      className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                      asChild
                    >
                      <Link to="/signup">
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-11 text-sm font-semibold rounded-xl border-border text-foreground hover:bg-muted"
                      asChild
                    >
                      <Link to="/signup">{plan.cta}</Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mb-8">
          + Meta conversation fees apply (billed directly by Meta)
        </p>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 px-6" asChild>
            <Link to="/pricing">
              Compare All Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
