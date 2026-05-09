import { motion } from 'framer-motion';
import { Sparkles, Phone, Lock, Gift, Globe2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import heroImage from '@/assets/pricing-hero-premium.png';

interface PricingHeroProps {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
}

const REGION_LABEL: Record<string, string> = {
  IN: '🇮🇳 India · INR',
  GULF: '🌙 Gulf · AED',
  OTHER: '🌍 Global · USD',
};

export default function PricingHero({ isAnnual, setIsAnnual }: PricingHeroProps) {
  const { region } = useGeoLocation();

  return (
    <section className="relative pt-20 pb-4 md:pt-24 md:pb-6 overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px] animate-pulse" />
        <div
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px] animate-pulse"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute top-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px] animate-pulse"
          style={{ animationDelay: '3s' }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <Breadcrumb className="mb-4" />

        {/* Hero row */}
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 mb-6">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-primary text-xs font-semibold mb-5 shadow-lg shadow-primary/5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Official WhatsApp Business API
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-[1.05] text-foreground tracking-tight">
              Pricing that{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                  scales with you
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </span>
              .
              <br className="hidden sm:block" />
              <span className="text-muted-foreground/90 text-3xl sm:text-4xl md:text-5xl">
                No surprises.
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-5 leading-relaxed">
              One workspace. One WhatsApp number. Pay only for what you need —
              expand with add-ons when you grow.
            </p>

            {/* Region pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/70 backdrop-blur-md border border-border/60 shadow-sm mb-5"
            >
              <Globe2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Showing prices for</span>
              <span className="text-xs font-bold text-foreground">{REGION_LABEL[region]}</span>
            </motion.div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-muted-foreground mb-6">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-primary" /> 1 WhatsApp number
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Gift className="w-3 h-3 text-primary" /> Free forever plan
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-primary" /> No credit card
              </span>
            </div>
          </motion.div>

          {/* Hero image with float animation */}
          <motion.div
            className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Glow halo */}
            <div
              className="absolute inset-0 blur-3xl"
              style={{ background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.25), transparent 70%)' }}
            />
            <motion.img
              src={heroImage}
              alt="Premium WhatsApp pricing"
              className="relative w-full"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* Billing toggle + CTA */}
        <motion.div
          className="flex flex-col items-center text-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-card/80 backdrop-blur-md border border-border/60 shadow-xl shadow-primary/5">
            <span
              className={cn(
                'text-sm font-medium transition-colors cursor-pointer select-none',
                !isAnnual ? 'text-foreground' : 'text-muted-foreground',
              )}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span
              className={cn(
                'text-sm font-medium transition-colors cursor-pointer select-none',
                isAnnual ? 'text-foreground' : 'text-muted-foreground',
              )}
              onClick={() => setIsAnnual(true)}
            >
              Yearly
            </span>
            {isAnnual && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground border-0 text-[10px] font-bold px-2 py-0.5">
                  SAVE 20%
                </Badge>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground font-semibold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02]"
              onClick={() => document.getElementById('pricing-cards')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Free
              <Sparkles className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 font-semibold border-border/80 hover:bg-card/60"
              onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Compare Plans
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
