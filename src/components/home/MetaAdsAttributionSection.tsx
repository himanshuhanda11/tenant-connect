import React from 'react';
import {
  MousePointerClick, MessageSquare, Users, TrendingUp,
  ArrowRight, DollarSign, Target, Clock, CheckCircle2,
} from 'lucide-react';
import girlWithPhone from '@/assets/girl-with-phone.png';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const funnel = [
  { num: '1', icon: MousePointerClick, title: 'Ad Click', sub: 'Customer clicks your Facebook or Instagram ad', accent: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  { num: '2', icon: MessageSquare, title: 'WhatsApp Chat', sub: 'AI greets, qualifies & collects lead info instantly', accent: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary' },
  { num: '3', icon: Users, title: 'Agent Handoff', sub: 'Hot leads routed to the right sales agent', accent: 'text-violet-500', bg: 'bg-violet-500/10', dot: 'bg-violet-500' },
  { num: '4', icon: TrendingUp, title: 'Conversion', sub: 'Deal closed — tracked back to the exact ad', accent: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
];

const metrics = [
  { icon: DollarSign, value: '₹45', label: 'Cost per Lead', change: '-32%' },
  { icon: Target, value: '28%', label: 'Lead → Sale', change: '+15%' },
  { icon: Clock, value: '2 min', label: 'Avg Response', change: '-68%' },
  { icon: TrendingUp, value: '4.2x', label: 'ROAS', change: '+89%' },
];

export default function MetaAdsAttributionSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-info/10 border border-info/20 text-info text-xs font-medium mb-5 tracking-wide uppercase">
            <MousePointerClick className="w-3.5 h-3.5" />
            Meta Ads Integration
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Know Exactly Which Ad{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-info to-primary">
              Drove Every Sale
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Full-funnel attribution from ad click to closed deal. Stop guessing — start scaling what works.
          </p>
        </motion.div>

        {/* Hero row: Girl image + Funnel steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          
          {/* Girl with phone - takes 5 cols on desktop */}
          <motion.div
            className="lg:col-span-5 flex justify-center relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Glow behind */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[70%] h-[70%] bg-gradient-to-br from-info/15 via-primary/10 to-transparent rounded-full blur-[60px]" />
            </div>
            <img
              src={girlWithPhone}
              alt="Business professional using WhatsApp on phone"
              className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-none lg:w-full object-contain drop-shadow-2xl"
              loading="lazy"
              width={1280}
              height={1920}
            />
          </motion.div>

          {/* Funnel steps - takes 7 cols on desktop */}
          <div className="lg:col-span-7 space-y-4">
            {funnel.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-lg hover:border-info/20 hover:-translate-y-0.5 transition-all duration-300"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {/* Step number */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${step.dot} flex items-center justify-center shrink-0`}>
                    <span className="text-xs sm:text-sm font-bold text-white">{step.num}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${step.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${step.accent}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-0.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.sub}</p>
                  </div>

                  {/* Arrow connector (desktop only) */}
                  {i < funnel.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0 hidden sm:block self-center" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Metrics row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 sm:p-5 text-center hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-info/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{m.label}</p>
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-500">{m.change}</span>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            asChild
            className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base bg-gradient-to-r from-info to-primary hover:from-info/90 hover:to-primary/90 shadow-xl shadow-info/20 rounded-xl"
          >
            <Link to="/features/integrations">
              Connect Meta Ads
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
