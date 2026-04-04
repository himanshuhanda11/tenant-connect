import React from 'react';
import { MousePointerClick, Bot, MessageSquare, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: MousePointerClick,
    title: 'Customer Reaches Out',
    desc: 'Via ads, website widget, or direct WhatsApp message',
    color: 'from-info to-blue-400',
  },
  {
    icon: Bot,
    title: 'AI Engages Instantly',
    desc: 'Smart auto-replies qualify leads & answer FAQs 24/7',
    color: 'from-primary to-emerald-400',
  },
  {
    icon: MessageSquare,
    title: 'Team Takes Over',
    desc: 'Hot leads are routed to agents with full context',
    color: 'from-warning to-orange-400',
  },
  {
    icon: BarChart3,
    title: 'Revenue Grows',
    desc: 'Track conversions, ROI and scale campaigns automatically',
    color: 'from-destructive to-rose-400',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            From Click to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Conversion
            </span>{' '}
            in 4 Steps
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            A seamless automation pipeline that turns every WhatsApp conversation into revenue
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                {/* Connector line — desktop only */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-[2px]">
                    <div className="w-full h-full bg-gradient-to-r from-border to-border/30" />
                    <ArrowRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  </div>
                )}

                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-4 relative z-10`}>
                  <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                  Step {i + 1}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
