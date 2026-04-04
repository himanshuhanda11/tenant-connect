import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, Users, Bot, Send, Target, Zap,
  HeartHandshake, Layers, BarChart3, Shield, ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const usps = [
  { icon: Phone, title: 'Free WhatsApp API', desc: 'Zero platform fees, forever. Only pay Meta\'s conversation charges.', stat: '₹0/mo', statLabel: 'Platform fee', accent: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: Users, title: 'Shared Team Inbox', desc: 'Multiple agents on one number with smart auto-routing.', stat: '∞', statLabel: 'Agents', accent: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Bot, title: 'AI Auto-Reply 24/7', desc: 'AI qualifies leads, answers FAQs & routes hot prospects instantly.', stat: '24/7', statLabel: 'Always on', accent: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: Send, title: 'Bulk Campaigns', desc: 'Send promotions to thousands with real-time delivery tracking.', stat: '98%', statLabel: 'Open rate', accent: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: Target, title: 'Meta Ads Attribution', desc: 'Full funnel: Ad click → WhatsApp chat → conversion tracking.', stat: '3.5x', statLabel: 'Conversions', accent: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { icon: Zap, title: 'AI Flow Builder', desc: 'Describe automation in English, AI builds the complete flow.', stat: '2 min', statLabel: 'Setup time', accent: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { icon: HeartHandshake, title: 'Built-In CRM', desc: 'Contacts, tags, segments & lead scoring — auto-organized.', stat: '100%', statLabel: 'Auto-organized', accent: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { icon: Layers, title: '50+ Templates', desc: 'Industry-ready templates. Go live in under 30 minutes.', stat: '50+', statLabel: 'Ready templates', accent: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { icon: BarChart3, title: 'Smart Diagnostics', desc: 'Know what\'s broken & why. AI-powered actionable insights.', stat: '↓45%', statLabel: 'Cost per lead', accent: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'SLA tracking, RBAC, audit logs & multi-workspace from day one.', stat: '∞', statLabel: 'Workspaces', accent: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
];

const flowSteps = [
  { label: 'Connect API', icon: Phone, color: 'text-emerald-500', ring: 'ring-emerald-500/30' },
  { label: 'Setup AI', icon: Bot, color: 'text-violet-500', ring: 'ring-violet-500/30' },
  { label: 'Launch Campaigns', icon: Send, color: 'text-orange-500', ring: 'ring-orange-500/30' },
  { label: 'Grow Revenue', icon: Target, color: 'text-cyan-500', ring: 'ring-cyan-500/30' },
];

export default function WhyAireatroBento() {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5 tracking-wide uppercase">
            The Aireatro Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-400">
              Grow Faster
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From AI replies to campaigns, attribution to CRM — every tool designed to increase revenue and reduce cost.
          </p>
        </motion.div>

        {/* Flow Chart - Visual Journey */}
        <motion.div
          className="mb-14 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <motion.div
                    className="flex flex-col items-center gap-2.5 group"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card border border-border/60 shadow-lg ring-2 ${step.ring} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color}`} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">{step.label}</span>
                  </motion.div>
                  {i < flowSteps.length - 1 && (
                    <div className="hidden sm:flex items-center px-3 sm:px-5 -mt-5">
                      <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-border to-primary/40" />
                      <ChevronRight className="w-4 h-4 text-primary/50 -ml-1" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* USP Grid — 2 rows × 5 on desktop, responsive on mobile */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10 sm:mb-14">
          {usps.map((usp, i) => {
            const Icon = usp.icon;
            return (
              <motion.div
                key={usp.title}
                className={`group relative rounded-2xl border ${usp.border} bg-card/60 backdrop-blur-sm p-5 sm:p-6 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 cursor-default`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                {/* Stat in top-right */}
                <div className="absolute top-4 right-4">
                  <span className={`text-lg sm:text-xl font-bold ${usp.accent} leading-none`}>{usp.stat}</span>
                  <p className="text-[9px] text-muted-foreground text-right mt-0.5">{usp.statLabel}</p>
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${usp.bg} flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${usp.accent}`} />
                </div>

                <h3 className="text-sm sm:text-[15px] font-semibold text-foreground mb-1.5 pr-12 leading-snug">{usp.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{usp.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom stats row */}
        <motion.div
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: '5x', label: 'Revenue Growth' },
            { value: '24/7', label: 'AI Qualification' },
            { value: '₹0', label: 'Platform Fee' },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm px-4 py-4"
            >
              <p className="text-xl sm:text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 px-6"
            onClick={() => navigate('/why-aireatro')}
          >
            Explore All Platform Advantages
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
