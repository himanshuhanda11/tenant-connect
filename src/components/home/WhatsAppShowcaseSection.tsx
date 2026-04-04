import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import whatsappChatHero from '@/assets/whatsapp-chat-hero.png';

const highlights = [
  { icon: MessageSquare, title: 'Smart Conversations', desc: 'AI handles inquiries, shares catalogs & closes sales on WhatsApp' },
  { icon: Zap, title: 'Instant Responses', desc: 'Reply in under 5 seconds — 24/7, even when you sleep' },
  { icon: ShieldCheck, title: 'Official API', desc: 'Green tick verified business account with full compliance' },
  { icon: Globe, title: 'Multi-Language', desc: 'Auto-detect & reply in your customer\'s preferred language' },
];

export default function WhatsAppShowcaseSection() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] -translate-y-1/2 -translate-x-1/2 bg-primary/[0.04] rounded-full blur-[100px]" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] translate-x-1/2 bg-emerald-500/[0.03] rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Image */}
          <motion.div
            className="relative flex justify-center lg:justify-start order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Glow behind image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[80%] bg-gradient-to-br from-primary/20 via-emerald-400/10 to-transparent rounded-full blur-[60px]" />
            </div>
            
            <img
              src={whatsappChatHero}
              alt="WhatsApp Business chat showing AI-powered product catalog and automated replies"
              className="relative w-full max-w-[480px] rounded-3xl shadow-2xl shadow-primary/10 border border-border/30"
              loading="lazy"
              width={1024}
              height={1024}
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-5">
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Commerce
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-5 leading-tight">
              Your Store, Live on{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                WhatsApp
              </span>
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed max-w-lg">
              Turn WhatsApp into your most powerful sales channel. Showcase products, answer questions, and collect payments — all inside a single chat.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:border-primary/20 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20" asChild>
              <Link to="/signup">
                Start Selling on WhatsApp
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
