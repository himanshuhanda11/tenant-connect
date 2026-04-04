import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, X, Users, Workflow, Bot, Brain, Gift, Rocket, Crown, Building2, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import TemplateChargesBlock from '@/components/shared/TemplateChargesBlock';

const planIcons: Record<string, React.ReactNode> = {
  free: <Gift className="w-5 h-5" />,
  basic: <Rocket className="w-5 h-5" />,
  pro: <Crown className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

const planAccent: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-info/10 text-info',
  pro: 'bg-primary/10 text-primary',
  business: 'bg-accent text-accent-foreground',
};

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return isYearly ? Math.round((plan.price as number) * 0.8) : plan.price as number;
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <section className="py-10 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Per Workspace Pricing
          </Badge>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            Each workspace includes 1 WhatsApp number. Upgrade when you automate.
          </p>
          <p className="text-xs text-muted-foreground mb-6">1 phone number per workspace</p>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-card border border-border shadow-sm">
            <span className={cn('text-sm', !isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn('text-sm', isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Yearly
            </span>
            {isYearly && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Save 20%</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mb-8">
          {pricingPlans.map((plan) => {
            const price = getPrice(plan);
            const isCustom = false;

            return (
              <Card key={plan.id} className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-lg',
                plan.highlight && 'border-primary shadow-xl sm:scale-105 ring-1 ring-primary/20',
              )}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
                )}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-3 p-4 sm:p-6">
                  <div className={cn('w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center', planAccent[plan.id])}>
                    {planIcons[plan.id]}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{plan.tagline}</CardDescription>
                  <div className="pt-3">
                    {isCustom ? (
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">Custom</span>
                    ) : price === 0 ? (
                      <span className="text-3xl sm:text-4xl font-bold text-foreground">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl sm:text-4xl font-bold text-foreground">{formatPrice(price!)}</span>
                        <span className="text-muted-foreground text-sm">/mo</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 flex-1 flex flex-col">
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                    {plan.restrictions?.slice(0, 2).map((r, i) => (
                      <li key={`r-${i}`} className="flex items-start gap-2 text-xs sm:text-sm opacity-40">
                        <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span className="line-through">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <TemplateChargesBlock compact className="mb-4" />
                  <Button
                    className={cn(
                      "w-full h-10 text-sm gap-2 font-semibold",
                      plan.highlight && "bg-gradient-to-r from-primary to-emerald-500 shadow-lg"
                    )}
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={isCustom ? '/contact' : '/signup'}>
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mb-6">
          + Meta conversation fees (billed separately by Meta)
        </p>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/pricing" className="gap-2">
              View Full Pricing & Comparison
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
