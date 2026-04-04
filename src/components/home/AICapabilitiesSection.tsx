import React from 'react';
import {
  Brain, MessageSquare, Sparkles, Target, TrendingUp, Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Auto-Replies',
    desc: 'Instantly responds to customer messages with context-aware answers — no manual typing needed.',
    accent: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Target,
    title: 'Intent Detection',
    desc: 'Classifies every message as sales, support, or complaint so it reaches the right person.',
    accent: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Sparkles,
    title: 'Flow Builder',
    desc: 'Describe what you want in plain English — AI creates the entire automation workflow.',
    accent: 'text-primary',
    bg: 'bg-primary/10',
    tag: 'Pro',
  },
  {
    icon: TrendingUp,
    title: 'AI Insights',
    desc: 'Spots trends, flags anomalies, and gives you actionable recommendations automatically.',
    accent: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    tag: 'Pro',
  },
  {
    icon: Lightbulb,
    title: 'Smart Routing',
    desc: 'Assigns conversations to the best agent based on skills, language, and current workload.',
    accent: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Brain,
    title: 'Sentiment Analysis',
    desc: 'Detects frustrated customers in real-time and escalates them before they churn.',
    accent: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
];

export default function AICapabilitiesSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />
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
            <Brain className="w-3.5 h-3.5" />
            AI-Powered
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            AI That Saves You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Hours Every Day
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Real features, real results — not just buzzwords.
          </p>
        </motion.div>

        {/* 2×3 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="group rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-6 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${f.accent}`} />
                  </div>
                  {f.tag && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {f.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
