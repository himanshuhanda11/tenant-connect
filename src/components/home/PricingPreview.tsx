import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';

export default function PricingPreview() {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 'custom') return null;
    if (plan.price === 0) return 0;
    return isYearly ? Math.round((plan.price as number) * 0.8) : plan.price as number;
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <section className="py-10 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            Each workspace includes 1 WhatsApp number. Upgrade when you automate.
          </p>
          <p className="text-xs text-muted-foreground mb-6">1 phone number per workspace</p>

          <div className="flex items-center justify-center gap-3">
            <span className={cn('text-sm', !isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn('text-sm', isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Yearly
            </span>
            {isYearly && <Badge className="bg-green-500/10 text-green-600 border-0 text-xs">Save 20%</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mb-8">
          {pricingPlans.map((plan) => {
            const price = getPrice(plan);
            const isCustom = plan.price === 'custom';

            return (
              <Card key={plan.id} className={cn(
                'relative flex flex-col',
                plan.highlight && 'border-green-500 shadow-xl sm:scale-105',
              )}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white text-xs gap-1">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-3 p-4 sm:p-6">
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
                      <li key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                    {plan.restrictions?.slice(0, 2).map((r, i) => (
                      <li key={`r-${i}`} className="flex items-center gap-2 text-xs sm:text-sm opacity-40">
                        <X className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-through">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full h-10 text-sm"
                    variant={plan.highlight ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={isCustom ? '/contact' : '/signup'}>{plan.cta}</Link>
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
            <Link to="/pricing">
              View Full Pricing & Comparison
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
