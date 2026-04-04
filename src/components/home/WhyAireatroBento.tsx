import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, Users, Bot, Send, Target, Zap,
  HeartHandshake, Layers, BarChart3, Shield, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const usps = [
  { icon: Phone, title: 'Free WhatsApp API', desc: 'Zero platform fees, forever. Only pay Meta\'s conversation charges — saving you lakhs per year.', stat: '₹0/mo', accent: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  { icon: Users, title: 'Shared Team Inbox', desc: 'Multiple agents collaborate on one number with smart auto-routing and collision detection.', stat: '∞ Agents', accent: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  { icon: Bot, title: 'AI Auto-Reply 24/7', desc: 'AI qualifies leads, answers FAQs & routes hot prospects instantly — even while you sleep.', stat: '24/7', accent: 'text-violet-500', bg: 'bg-violet-500/10', dot: 'bg-violet-500' },
  { icon: Send, title: 'Bulk Campaigns', desc: 'Send promotions to thousands with real-time delivery, read & reply tracking.', stat: '98% Open', accent: 'text-orange-500', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
  { icon: Target, title: 'Meta Ads Attribution', desc: 'Full funnel visibility: Ad click → WhatsApp chat → conversion. Know exactly what\'s working.', stat: '3.5x ROAS', accent: 'text-cyan-500', bg: 'bg-cyan-500/10', dot: 'bg-cyan-500' },
  { icon: Zap, title: 'AI Flow Builder', desc: 'Describe automation in plain English. AI builds the entire WhatsApp workflow for you.', stat: '2 min setup', accent: 'text-purple-500', bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
  { icon: HeartHandshake, title: 'Built-In CRM', desc: 'Contacts, tags, segments & lead scoring — auto-organized from every conversation.', stat: 'Auto-sort', accent: 'text-pink-500', bg: 'bg-pink-500/10', dot: 'bg-pink-500' },
  { icon: Layers, title: '50+ Templates', desc: 'Industry-ready templates across e-commerce, edtech, real estate & more. Go live in minutes.', stat: '50+', accent: 'text-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
  { icon: BarChart3, title: 'Smart Diagnostics', desc: 'AI-powered insights show what\'s broken and why — with actionable fixes, not just data.', stat: '↓45% CPL', accent: 'text-teal-500', bg: 'bg-teal-500/10', dot: 'bg-teal-500' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'SLA tracking, RBAC, audit logs & multi-workspace support from day one.', stat: '∞ Workspaces', accent: 'text-indigo-500', bg: 'bg-indigo-500/10', dot: 'bg-indigo-500' },
];

export default function WhyAireatroBento() {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5 tracking-wide uppercase">
            The Aireatro Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Your Growth Journey,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-teal-400">
              Fully Automated
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Every tool you need — from AI replies to campaigns — designed to grow revenue and cut costs.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />

          <div className="space-y-6 sm:space-y-0">
            {usps.map((usp, i) => {
              const Icon = usp.icon;
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={usp.title}
                  className="relative sm:pl-16 lg:pl-20 sm:py-6"
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                >
                  {/* Timeline dot */}
                  <div className="hidden sm:flex absolute left-3 sm:left-4.5 top-8 sm:top-9 z-10">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${usp.dot} ring-4 ring-background shadow-lg flex items-center justify-center`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 sm:p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Icon */}
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${usp.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${usp.accent}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug">{usp.title}</h3>
                          <span className={`text-sm sm:text-base font-bold ${usp.accent} whitespace-nowrap`}>{usp.stat}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{usp.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-14 sm:mt-20 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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
