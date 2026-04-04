import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, MessageSquare, Rocket, Users, Eye, Clock, DollarSign, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = [
  { icon: Users, value: '2,000+', label: 'Businesses Trust Us' },
  { icon: Eye, value: '98%', label: 'Message Open Rate' },
  { icon: Clock, value: '<30 min', label: 'Setup Time' },
  { icon: DollarSign, value: '₹0', label: 'Platform Fee' },
];

const badges = [
  { icon: Shield, title: 'Verified Reliability', desc: 'Enterprise-grade uptime & compliance', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: MessageSquare, title: 'WhatsApp API Leader', desc: 'Official API partner with green-tick support', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Rocket, title: 'Fastest Growing CRM', desc: 'Trusted by India\'s top D2C & service brands', color: 'text-violet-500', bg: 'bg-violet-500/10' },
];

export default function AwardsTrustSection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-widest uppercase mb-5">
            <Award className="w-3.5 h-3.5" />
            Recognized Across Asia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            🏆 Asia's #2 Most Reliable{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">
              WhatsApp CRM
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Aireatro is trusted by thousands of businesses for automation, sales, and customer engagement on WhatsApp.
          </p>
        </motion.div>

        {/* Main Award Card */}
        <motion.div
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative group mx-auto max-w-2xl">
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

            <div className="relative rounded-3xl border border-amber-500/20 bg-card/80 backdrop-blur-xl p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-xl group-hover:scale-[1.01] group-hover:shadow-2xl transition-all duration-300">
              {/* Trophy */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>

              {/* Text */}
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1.5">
                  Ranked #2 in Asia
                </h3>
                <p className="text-sm sm:text-base font-medium text-amber-600 dark:text-amber-400 mb-2">
                  Most Genuine & Reliable WhatsApp API + CRM SaaS
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recognized for performance, reliability, and customer satisfaction across 2,000+ businesses.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 sm:p-5 text-center hover:shadow-md hover:border-amber-500/20 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 sm:mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300 text-center"
              >
                <div className={`w-11 h-11 rounded-xl ${b.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">{b.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <Button size="lg" asChild className="rounded-xl shadow-lg shadow-primary/20 h-12 sm:h-13 px-8 text-sm sm:text-base">
            <Link to="/signup">
              Start Free — No Card Needed
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-xl h-12 sm:h-13 px-8 text-sm sm:text-base">
            <Link to="/why-aireatro">
              See Why Businesses Trust Us
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
