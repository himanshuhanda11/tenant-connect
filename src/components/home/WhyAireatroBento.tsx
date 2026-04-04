import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, Users, Bot, Send, Target, Zap,
  HeartHandshake, Layers, BarChart3, Shield, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const usps = [
  { icon: Phone, title: 'Free WhatsApp API', desc: 'Zero platform fees, forever. Only pay Meta\'s conversation charges.', stat: '₹0/mo', statLabel: 'Platform fee', gradient: 'from-emerald-500 to-green-400' },
  { icon: Users, title: 'Shared Team Inbox', desc: 'Multiple agents on one number with smart auto-routing.', stat: '∞', statLabel: 'Agents', gradient: 'from-blue-500 to-cyan-400' },
  { icon: Bot, title: 'AI Auto-Reply 24/7', desc: 'AI qualifies leads, answers FAQs & routes hot prospects instantly.', stat: '24/7', statLabel: 'Always on', gradient: 'from-violet-500 to-purple-400' },
  { icon: Send, title: 'Bulk Campaigns', desc: 'Send promotions to thousands with real-time delivery tracking.', stat: '98%', statLabel: 'Open rate', gradient: 'from-orange-500 to-amber-400' },
  { icon: Target, title: 'Meta Ads Attribution', desc: 'Full funnel: Ad click → WhatsApp chat → conversion tracking.', stat: '3.5x', statLabel: 'Conversions', gradient: 'from-cyan-500 to-teal-400' },
  { icon: Zap, title: 'AI Flow Builder', desc: 'Describe automation in English, AI builds the complete flow.', stat: '2 min', statLabel: 'Setup time', gradient: 'from-purple-500 to-pink-400' },
  { icon: HeartHandshake, title: 'Built-In CRM', desc: 'Contacts, tags, segments & lead scoring — auto-organized.', stat: '100%', statLabel: 'Auto-organized', gradient: 'from-pink-500 to-rose-400' },
  { icon: Layers, title: '50+ Templates', desc: 'Industry-ready templates. Go live in under 30 minutes.', stat: '50+', statLabel: 'Ready templates', gradient: 'from-amber-500 to-yellow-400' },
  { icon: BarChart3, title: 'Smart Diagnostics', desc: 'Know what\'s broken & why. AI-powered actionable insights.', stat: '↓45%', statLabel: 'Cost per lead', gradient: 'from-teal-500 to-emerald-400' },
  { icon: Shield, title: 'Enterprise Ready', desc: 'SLA tracking, RBAC, audit logs & multi-workspace from day one.', stat: '∞', statLabel: 'Workspaces', gradient: 'from-indigo-500 to-blue-400' },
];

export default function WhyAireatroBento() {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            Why AiReatro
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Grow Fast, Spend Less
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            10 powerful capabilities that help you run your business faster, cheaper, and smarter on WhatsApp.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto mb-8">
          {usps.map((usp, i) => {
            const Icon = usp.icon;
            return (
              <motion.div
                key={usp.title}
                className="group relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-3 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Stat badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <div className="text-right">
                    <p className="text-sm sm:text-lg font-bold text-foreground leading-none">{usp.stat}</p>
                    <p className="text-[8px] sm:text-[9px] text-muted-foreground">{usp.statLabel}</p>
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${usp.gradient} flex items-center justify-center mb-2.5 sm:mb-3 shadow-md`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1 leading-snug pr-8 sm:pr-10">{usp.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-3">{usp.desc}</p>
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
        >
          <Button
            variant="outline"
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => navigate('/why-aireatro')}
          >
            See All 10 Reasons in Detail
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
