import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, MessageSquare, Bot, TrendingUp, UserCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Animated dashboard mock
function AnimatedDashboard() {
  const [chatCount, setChatCount] = useState(12);
  const [revenue, setRevenue] = useState(24500);
  const [leads, setLeads] = useState([
    { name: 'Rahul M.', status: 'Qualified', color: 'text-info' },
    { name: 'Priya S.', status: 'Converted', color: 'text-primary' },
    { name: 'Amit K.', status: 'New', color: 'text-warning' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChatCount(c => c + Math.floor(Math.random() * 3));
      setRevenue(r => r + Math.floor(Math.random() * 800 + 200));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
        </div>
        <span className="text-[10px] text-muted-foreground ml-2 font-medium">AiReatro Dashboard</span>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <motion.div 
            className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 text-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{chatCount}</p>
            <p className="text-[9px] text-muted-foreground">Active Chats</p>
          </motion.div>
          <div className="rounded-xl bg-info/10 border border-info/20 p-2.5 text-center">
            <Bot className="w-3.5 h-3.5 text-info mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">AI On</p>
            <p className="text-[9px] text-muted-foreground">Auto-Reply</p>
          </div>
          <div className="rounded-xl bg-accent border border-primary/20 p-2.5 text-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">₹{(revenue / 1000).toFixed(1)}k</p>
            <p className="text-[9px] text-muted-foreground">Revenue</p>
          </div>
        </div>

        {/* Mini revenue chart */}
        <div className="rounded-xl bg-muted/40 border border-border/40 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Revenue Growth</p>
          <div className="flex items-end gap-1 h-12">
            {[20, 35, 28, 45, 40, 55, 50, 68, 62, 78, 85, 95].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-primary/80 to-primary/40"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              />
            ))}
          </div>
        </div>

        {/* Lead pipeline */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground">Live Leads</p>
          {leads.map((lead, i) => (
            <motion.div
              key={lead.name}
              className="flex items-center justify-between rounded-lg bg-background/60 border border-border/30 px-3 py-1.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <UserCheck className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-[11px] font-medium text-foreground">{lead.name}</span>
              </div>
              <span className={`text-[10px] font-semibold ${lead.color}`}>{lead.status}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background overflow-hidden pt-8 sm:pt-12 lg:pt-20 pb-10 sm:pb-16 lg:pb-24">
      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-info/10 via-info/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-transparent to-info/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            
            {/* Left — Copy */}
            <div className="w-full lg:w-[55%] text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-5 sm:mb-6">
                  <Zap className="w-3.5 h-3.5" />
                  Official WhatsApp Cloud API Partner
                </div>
              </motion.div>

              <motion.h1
                className="text-3xl xs:text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.1] mb-5 sm:mb-6 text-foreground tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Turn WhatsApp Into Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  #1 Revenue Engine
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-7 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Automate chats, capture leads, and close sales 24/7 — without hiring more agents. Free lifetime API access, only pay Meta's conversation fees.
              </motion.p>

              <motion.div
                className="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-6 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-600 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 rounded-xl"
                  onClick={() => navigate('/signup')}
                >
                  Start Free — No Card Needed
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-border hover:bg-muted rounded-xl"
                  onClick={() => navigate('/contact')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  See Live Demo
                </Button>
              </motion.div>

              {/* Trust micro-badges */}
              <motion.div
                className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Free Forever
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  No Monthly Fees
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Official Cloud API
                </span>
              </motion.div>
            </div>

            {/* Right — Animated Dashboard */}
            <motion.div
              className="w-full lg:w-[45%]"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <AnimatedDashboard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
