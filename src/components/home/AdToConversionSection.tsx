import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, DollarSign, TrendingUp, CheckCircle2, 
  ShoppingCart, Eye, ArrowRight, Sparkles, MousePointerClick,
  Send, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const stats = [
  { icon: TrendingUp, value: '10X', label: 'ROAS', color: 'text-primary' },
  { icon: Eye, value: '92%', label: 'Read Rate', color: 'text-blue-500' },
  { icon: ShoppingCart, value: '3.2X', label: 'Conversions', color: 'text-amber-500' },
  { icon: DollarSign, value: '₹0', label: 'Platform Fee', color: 'text-primary' },
];

export default function AdToConversionSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-muted/30" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-5">
            <MousePointerClick className="w-3.5 h-3.5" />
            Click-to-WhatsApp Ads
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            From Ad Click to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Paid Order
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Turn every Meta ad into a WhatsApp conversation that converts — automatically.
          </p>
        </motion.div>

        {/* Main visual area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
          
          {/* Left: Journey visualization */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative connection line */}
            <div className="absolute left-8 top-12 bottom-12 w-px border-l-2 border-dashed border-primary/20 hidden sm:block" />

            {/* Step 1: Ad */}
            <div className="relative flex items-start gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 z-10">
                <Send className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 p-5 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Step 1</span>
                  <span className="text-sm font-bold text-foreground">Customer Sees Your Ad</span>
                </div>
                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-muted/60">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg font-bold">F</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">Your Brand · Sponsored</p>
                    <p className="text-[11px] text-muted-foreground">🎉 20% OFF — Use code SAVE20</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                    Chat Now
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: WhatsApp Chat */}
            <div className="relative flex items-start gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 z-10">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 p-5 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Step 2</span>
                  <span className="text-sm font-bold text-foreground">AI Replies Instantly</span>
                </div>
                <div className="space-y-2 mt-3">
                  {/* Incoming message */}
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-3.5 py-2 rounded-2xl rounded-tl-sm bg-muted text-xs text-foreground">
                      Is this available? I saw the ad 👀
                    </div>
                  </div>
                  {/* AI reply */}
                  <div className="flex justify-end">
                    <div className="max-w-[75%] px-3.5 py-2 rounded-2xl rounded-tr-sm bg-primary/10 text-xs text-foreground">
                      <p>Hey! 👋 Yes, it's live till midnight.</p>
                      <p className="font-semibold mt-1">Place your order now → 20% OFF</p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-semibold">
                        <Sparkles className="w-3 h-3" /> AI Auto-Reply
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Conversion */}
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 z-10">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 p-5 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Step 3</span>
                  <span className="text-sm font-bold text-foreground">Order Placed ✅</span>
                </div>
                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-primary/[0.06] border border-primary/10">
                  <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">₹899.00</p>
                    <p className="text-[11px] text-muted-foreground">Payment received · Order confirmed</p>
                  </div>
                  <div className="ml-auto">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Stats + description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-snug">
              Every click becomes a conversation.<br />
              <span className="text-muted-foreground font-normal text-lg sm:text-xl">Every conversation becomes revenue.</span>
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
              Connect your Meta Ads directly to WhatsApp. Our AI greets every lead instantly, answers questions, qualifies intent, and drives them to purchase — all without human intervention.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all group"
                >
                  <stat.icon className={cn('w-5 h-5 mb-2', stat.color)} />
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-3 mb-8">
              {[
                'Auto-capture leads from Instagram & Facebook ads',
                'AI qualifies and responds in <5 seconds',
                'Full attribution — know which ad drove each sale',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" asChild>
              <Link to="/signup">
                Start Free <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
