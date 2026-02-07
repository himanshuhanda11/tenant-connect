import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/layout/Breadcrumb';
import heroImage from '@/assets/pricing-hero.png';

interface PricingHeroProps {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
}

export default function PricingHero({ isAnnual, setIsAnnual }: PricingHeroProps) {
  return (
    <section className="relative pt-20 pb-4 md:pt-24 md:pb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/40 via-background to-background" />

      <div className="container mx-auto px-4 relative">
        <Breadcrumb className="mb-4" />

        {/* Top badge */}
        <p className="text-center text-sm text-primary font-medium mb-4">
          Per workspace pricing · 1 WhatsApp number per workspace
        </p>

        {/* Hero row: heading left, image right */}
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-[1.15] text-foreground tracking-tight">
              Simple pricing. Powerful{' '}
              <span className="text-primary">automation.</span>{' '}
              Zero WhatsApp ban risk.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-5">
              One workspace. One phone number. Scale with add-ons when you grow — not forced upgrades.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-5">
              <Button
                size="lg"
                className="h-11 px-8 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                onClick={() => {
                  document.getElementById('pricing-cards')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-8 font-semibold"
                onClick={() => {
                  document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Compare Plans
              </Button>
            </div>
          </div>

          <div className="flex-1 max-w-sm lg:max-w-md xl:max-w-lg">
            <img src={heroImage} alt="WhatsApp API + AI Automation" className="w-full" />
          </div>
        </div>

        {/* Trust strip */}
        <p className="text-center text-xs text-muted-foreground mt-4 mb-2">
          Built on Official WhatsApp Business API · Secure · Compliant · Scalable · Cancel or downgrade anytime
        </p>
      </div>
    </section>
  );
}
