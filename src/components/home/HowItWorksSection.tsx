import React from 'react';
import { MousePointerClick, Bot, MessageSquare, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    icon: MousePointerClick,
    title: 'Customer Reaches Out',
    desc: 'A customer clicks your ad, scans a QR code, or messages your WhatsApp number directly.',
    accent: 'text-blue-500',
    bg: 'bg-blue-500/10',
    dot: 'bg-blue-500',
  },
  {
    num: '02',
    icon: Bot,
    title: 'AI Responds Instantly',
    desc: 'Your AI assistant greets them, answers questions, qualifies the lead, and collects details — all automatically.',
    accent: 'text-primary',
    bg: 'bg-primary/10',
    dot: 'bg-primary',
  },
  {
    num: '03',
    icon: MessageSquare,
    title: 'Team Closes the Deal',
    desc: 'Hot leads get routed to the right agent with full conversation context. No repetition, no delays.',
    accent: 'text-orange-500',
    bg: 'bg-orange-500/10',
    dot: 'bg-orange-500',
  },
  {
    num: '04',
    icon: BarChart3,
    title: 'Revenue Scales Up',
    desc: 'Track every conversion, measure ROI per campaign, and let automation handle the follow-ups.',
    accent: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5 tracking-wide uppercase">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            4 Steps to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Automated Revenue
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Every WhatsApp conversation becomes a revenue opportunity — fully automated.
          </p>
        </motion.div>

        {/* Steps — alternating left/right cards */}
        <div className="relative">
          {/* Center line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent" />

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={step.num}
                  className={`relative lg:flex lg:items-center lg:py-8 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Center dot (desktop) */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <div className={`w-10 h-10 rounded-full ${step.dot} ring-4 ring-background shadow-lg flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">{step.num}</span>
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`lg:w-[calc(50%-2.5rem)] ${isLeft ? 'lg:pr-0 lg:ml-0' : 'lg:pl-0 lg:mr-0'}`}>
                    <div className="group rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-6 hover:shadow-xl hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        {/* Mobile number + icon */}
                        <div className="flex flex-col items-center gap-2 lg:hidden">
                          <div className={`w-8 h-8 rounded-full ${step.dot} flex items-center justify-center`}>
                            <span className="text-[10px] font-bold text-white">{step.num}</span>
                          </div>
                        </div>

                        <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${step.accent}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
