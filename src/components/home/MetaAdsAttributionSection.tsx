import React from 'react';
import {
  MousePointerClick, MessageSquare, Users, TrendingUp,
  ArrowRight, DollarSign, Target, Clock, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const funnel = [
  { icon: MousePointerClick, label: 'Ad Click', sub: 'Facebook / Instagram', color: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  { icon: MessageSquare, label: 'WhatsApp Chat', sub: 'AI Auto-Reply', color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary' },
  { icon: Users, label: 'Agent Handoff', sub: 'Smart Routing', color: 'text-violet-500', bg: 'bg-violet-500/10', dot: 'bg-violet-500' },
  { icon: TrendingUp, label: 'Conversion', sub: 'Deal Closed', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
];

const metrics = [
  { icon: DollarSign, value: '₹45', label: 'Cost per Lead', change: '-32%', accent: 'text-emerald-500' },
  { icon: Target, value: '28%', label: 'Lead to Sale', change: '+15%', accent: 'text-blue-500' },
  { icon: Clock, value: '2 min', label: 'Avg. Response', change: '-68%', accent: 'text-violet-500' },
  { icon: TrendingUp, value: '4.2x', label: 'ROAS', change: '+89%', accent: 'text-primary' },
];

export default function MetaAdsAttributionSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-info/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-info/10 border border-info/20 text-info text-xs font-medium mb-5 tracking-wide uppercase">
            <MousePointerClick className="w-3.5 h-3.5" />
            Meta Ads Integration
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            From Ad Click to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-info via-primary to-emerald-500">
              Closed Deal
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Full-funnel attribution for Click-to-WhatsApp ads. Know exactly which ad drove which sale.
          </p>
        </motion.div>

        {/* Funnel Journey — horizontal on desktop, vertical on mobile */}
        <motion.div
          className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-6 text-center">Customer Journey</p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0">
            {funnel.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <motion.div
                    className="flex sm:flex-col items-center gap-4 sm:gap-3 flex-1"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${step.bg} border border-border/40 flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color}`} />
                    </div>
                    <div className="sm:text-center">
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sub}</p>
                    </div>
                  </motion.div>

                  {i < funnel.length - 1 && (
                    <>
                      {/* Desktop connector */}
                      <div className="hidden sm:flex items-center px-2 lg:px-4 -mt-6">
                        <div className="w-8 lg:w-14 h-px bg-gradient-to-r from-border to-primary/30" />
                        <ChevronRight className="w-4 h-4 text-primary/40 -ml-1" />
                      </div>
                      {/* Mobile connector */}
                      <div className="flex sm:hidden items-center justify-center">
                        <div className="w-px h-4 bg-border" />
                      </div>
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-info" />
                  </div>
                  <span className={`text-xs font-bold ${m.accent} bg-emerald-500/10 px-2 py-0.5 rounded-full`}>
                    {m.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </motion.div>
            );
          })}
        </div>

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
