import { Zap, Phone, Gift, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import heroImage from '@/assets/pricing-hero.png';

interface PricingHeroProps {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
}

export default function PricingHero({ isAnnual, setIsAnnual }: PricingHeroProps) {
  return (
    <section className="relative pt-20 pb-6 md:pt-24 md:pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/40 via-background to-background" />

      <div className="container mx-auto px-4 relative">
        <Breadcrumb className="mb-6" />
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-5">
            <Zap className="w-3.5 h-3.5" />
            Official WhatsApp Business API
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold mb-4 leading-[1.15] text-foreground tracking-tight">
            Simple pricing.{' '}
            <span className="text-primary">Powerful automation.</span>
            <br className="hidden sm:block" />
            Zero WhatsApp ban risk.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            One workspace. One WhatsApp number. Scale with add-ons when you grow.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground mb-8">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-primary" /> 1 number per workspace
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Gift className="w-3 h-3 text-primary" /> Free plan forever
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-primary" /> No credit card required
            </span>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-card border border-border shadow-sm">
            <span className={cn('text-sm font-medium transition-colors', !isAnnual ? 'text-foreground' : 'text-muted-foreground')}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={cn('text-sm font-medium transition-colors', isAnnual ? 'text-foreground' : 'text-muted-foreground')}>
              Yearly
            </span>
            {isAnnual && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Save 20%</Badge>
            )}
          </div>
          {/* Hero illustration */}
          <div className="mt-8 max-w-2xl mx-auto">
            <img src={heroImage} alt="WhatsApp API + AI Automation" className="w-full rounded-2xl" />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
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
      </div>
    </section>
  );
}
