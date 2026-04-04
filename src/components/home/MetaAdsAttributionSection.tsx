import React from 'react';
import {
  MousePointerClick, MessageSquare, Users, TrendingUp,
  ArrowRight, DollarSign, Target, Clock,
} from 'lucide-react';
import girlWithPhone from '@/assets/girl-with-phone.png';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const funnel = [
  { num: '1', icon: MousePointerClick, title: 'Ad Click', sub: 'Customer clicks your Facebook or Instagram ad', accent: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  { num: '2', icon: MessageSquare, title: 'WhatsApp Chat', sub: 'AI greets, qualifies, and collects lead info instantly', accent: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary' },
  { num: '3', icon: Users, title: 'Agent Handoff', sub: 'Hot leads are routed to the right sales agent', accent: 'text-violet-500', bg: 'bg-violet-500/10', dot: 'bg-violet-500' },
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
    <section className="py-14 sm:py-20 lg:py-28 bg-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-info/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-14 sm:mb-20"
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

        {/* Funnel + Girl image layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12 sm:mb-16 items-center">
          {/* Funnel cards — 3 columns */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {funnel.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="group rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-6 hover:shadow-xl hover:border-info/20 hover:-translate-y-0.5 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${step.dot} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-xs font-bold text-white">{step.num}</span>
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${step.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${step.accent}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.sub}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Girl with phone — 2 columns */}
          <motion.div
            className="lg:col-span-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={girlWithPhone}
              alt="Business professional using WhatsApp on phone"
              className="max-h-[600px] w-auto object-contain drop-shadow-2xl"
              loading="lazy"
              width={1280}
              height={1920}
            />
          </motion.div>
        </div>

        {/* Metrics */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
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
                className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 text-center"
              >
                <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-4 h-4 text-info" />
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                <span className="text-xs font-semibold text-emerald-500">{m.change}</span>
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
