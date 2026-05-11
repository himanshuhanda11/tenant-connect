import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PricingCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-foreground via-foreground to-foreground/95 px-6 py-12 sm:px-12 sm:py-14 text-center shadow-2xl"
        >
          {/* Glow effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/30 blur-[120px]" />
            <div className="absolute bottom-[-30%] left-[10%] w-[300px] h-[300px] rounded-full bg-emerald-400/20 blur-[100px]" />
            <div className="absolute bottom-[-30%] right-[10%] w-[300px] h-[300px] rounded-full bg-violet-500/20 blur-[100px]" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white/90 text-[11px] font-semibold mb-5">
              <Sparkles className="w-3 h-3" />
              30-day free trial · No credit card
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-background tracking-tight mb-3">
              Start scaling on WhatsApp today
            </h2>
            <p className="text-sm sm:text-base text-background/70 max-w-md mx-auto mb-7">
              Join thousands of teams running their entire customer journey on Aireatro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground font-semibold shadow-[0_0_40px_-8px_hsl(var(--primary))] hover:shadow-[0_0_60px_-4px_hsl(var(--primary))] hover:scale-[1.02] transition-all rounded-xl"
                onClick={() => navigate('/signup')}
              >
                Start Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-white/20 bg-white/5 text-background hover:bg-white/15 hover:text-background font-semibold rounded-xl backdrop-blur"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
            <p className="text-[11px] text-background/50 mt-5">
              Cancel anytime · Transparent pricing · No hidden fees
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
