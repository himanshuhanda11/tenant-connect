import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { MonthlyYearlyToggle } from '@/components/billing/MonthlyYearlyToggle';

interface PricingHeroProps {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
}

const REGION_LABEL: Record<string, string> = {
  IN: '🇮🇳 India · AED',
  GULF: '🌙 Gulf · AED',
  OTHER: '🌍 Global · AED',
};

export default function PricingHero({ isAnnual, setIsAnnual }: PricingHeroProps) {
  const { region } = useGeoLocation();

  return (
    <section className="relative pt-20 pb-6 md:pt-24 md:pb-8 overflow-hidden">
      {/* Subtle aurora background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-400/10 blur-[100px]" />
        <div className="absolute top-[10%] right-[8%] w-[420px] h-[420px] rounded-full bg-violet-500/10 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative max-w-5xl">
        <Breadcrumb className="mb-3" />

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/[0.08] backdrop-blur text-primary text-[11px] font-semibold mb-5"
          >
            <Sparkles className="w-3 h-3" />
            Official WhatsApp Business API · No setup fees
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-[3.6rem] font-bold mb-3 leading-[1.05] text-foreground tracking-tight">
            Simple WhatsApp pricing
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
              for growing businesses
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
            Team inbox, automation, campaigns, AI replies and CRM — all in one
            platform. Start free. Scale when you grow.
          </p>

          {/* Toggle + region */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <MonthlyYearlyToggle yearly={isAnnual} onChange={setIsAnnual} variant="light" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/70 backdrop-blur border border-border/60 text-xs">
              <Globe2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">Region</span>
              <span className="font-semibold text-foreground">{REGION_LABEL[region]}</span>
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Meta-verified
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" /> Setup in &lt; 10 min
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> 30-day free trial on paid plans
            </span>
            <span className="text-border">•</span>
            <span>Free plan needs no card</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
