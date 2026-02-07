import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { pricingPlans, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PricingCardsProps {
  isAnnual: boolean;
  setIsAnnual?: (v: boolean) => void;
}

export default function PricingCards({ isAnnual, setIsAnnual }: PricingCardsProps) {
  const navigate = useNavigate();

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 'custom') return null;
    if (plan.price === 0) return 0;
    return isAnnual ? Math.round((plan.price as number) * 0.8) : (plan.price as number);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <section id="pricing-cards" className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        {/* Billing toggle */}
        {setIsAnnual && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center rounded-full border border-border bg-card shadow-sm p-1">
              <button
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all',
                  !isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all',
                  isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setIsAnnual(true)}
              >
                Yearly (save 20%)
              </button>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto items-start">
          {pricingPlans.map((plan) => {
            const price = getPrice(plan);
            const isCustom = plan.price === 'custom';
            const isPro = plan.highlight;

            return (
              <Card key={plan.id} className={cn(
                'relative flex flex-col rounded-2xl p-6 transition-all duration-300',
                isPro
                  ? 'border-primary shadow-xl ring-1 ring-primary/20'
                  : 'border-border hover:shadow-lg hover:border-primary/20',
              )}>
                {/* Most Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-md shadow-md">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-xl font-bold text-foreground text-center mt-2">{plan.name}</h3>

                {/* Tagline */}
                <p className="text-xs text-muted-foreground text-center mt-1 mb-4">{plan.tagline}</p>

                {/* Price */}
                <div className="text-center mb-5">
                  {isCustom ? (
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                  ) : price === 0 ? (
                    <span className="text-3xl font-bold text-foreground">Free</span>
                  ) : (
                    <div>
                      {isAnnual && (
                        <span className="text-sm text-muted-foreground line-through block mb-0.5">
                          {formatPrice(plan.price as number)}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-foreground">{formatPrice(price!)}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  )}
                </div>

                {/* CTA button */}
                <Button
                  className={cn(
                    'w-full h-11 font-semibold rounded-xl transition-all',
                    isPro
                      ? 'bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground shadow-lg shadow-primary/20'
                      : isCustom
                        ? 'border-foreground'
                        : '',
                  )}
                  variant={isPro ? 'default' : 'outline'}
                  onClick={() => isCustom ? navigate('/contact') : navigate('/signup')}
                >
                  {plan.cta}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
