import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const perks = [
  'Free WhatsApp API — Lifetime',
  'Zero Platform Fees',
  'Official Meta Cloud API',
  'AI Auto-Reply Included',
];

export default function FinalCTANew() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden isolate">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.04] blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start Growing Today
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-5"
          >
            Ready to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-500">
              5x Your Revenue
            </span>
            ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Join 2,000+ businesses automating WhatsApp conversations, capturing leads, and growing revenue — all on autopilot.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Button
              size="lg"
              className="h-13 sm:h-14 px-8 sm:px-10 text-base font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600 shadow-xl shadow-primary/20 transition-all duration-300 rounded-xl"
              onClick={() => navigate('/signup')}
            >
              Start Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 sm:h-14 px-8 sm:px-10 text-base font-semibold border-border text-foreground hover:bg-muted rounded-xl"
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-3"
          >
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
