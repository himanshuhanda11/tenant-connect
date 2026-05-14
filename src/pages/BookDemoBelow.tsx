import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Bot, BarChart3, ShieldCheck, Rocket, Headphones, Star, MessageCircle } from 'lucide-react';
import SocialProofBar from '@/components/home/SocialProofBar';
import Footer from '@/components/layout/Footer';

const WHY_AIREATRO = [
  { icon: Zap, title: 'Setup in < 10 min', desc: 'Connect your number and start sending in minutes — no developers needed.' },
  { icon: Bot, title: 'Built-in AI auto-replies', desc: 'Qualify leads 24/7 in 50+ languages with multi-turn AI that hands off to humans cleanly.' },
  { icon: BarChart3, title: 'True Meta Ads attribution', desc: 'See which CTWA ad, campaign and creative drove every WhatsApp lead and revenue.' },
  { icon: ShieldCheck, title: 'Official Meta Cloud API', desc: 'Green tick ready, fully compliant, with zero per-message platform fees.' },
];

export default function BookDemoBelow() {
  return (
    <>
      <SocialProofBar />

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3" variant="secondary">Why teams pick AiReatro</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Built different from generic WhatsApp tools
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              See how AiReatro stacks up against legacy chatbots and bloated CRMs — purpose-built for WhatsApp-first growth.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_AIREATRO.map((w, i) => (
              <motion.div key={w.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <w.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{w.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-3">What you'll learn</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                A 25-minute session, completely tailored to your business
              </h2>
              <p className="text-muted-foreground mb-6">
                Skip the generic pitch. Our specialist will map AiReatro to your exact workflow — from inbound leads to closed deals.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Rocket, title: 'How to launch in under 10 minutes', desc: 'Connect your Meta number, import contacts, send your first broadcast.' },
                  { icon: Bot, title: 'AI workflows for your industry', desc: 'See pre-built automations for ecommerce, education, real estate and more.' },
                  { icon: BarChart3, title: 'Meta Ads to WhatsApp ROI', desc: 'Track every CTWA click to lead, conversation and revenue.' },
                  { icon: Headphones, title: 'Onboarding & support roadmap', desc: 'Understand SLAs, dedicated CSM options and migration support.' },
                ].map((it) => (
                  <li key={it.title} className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <it.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{it.title}</h4>
                      <p className="text-sm text-muted-foreground">{it.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="border-border/60 bg-gradient-to-br from-primary/[0.04] to-emerald-500/[0.04]">
              <CardContent className="p-7">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-foreground text-base leading-relaxed mb-5">
                  "We replaced two tools with AiReatro and increased our WhatsApp lead conversion by 3.2x in the first month. The demo alone was worth it — they showed us exactly how to wire Meta Ads to our sales inbox."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-semibold">
                    R
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Rohit Sharma</div>
                    <div className="text-xs text-muted-foreground">Head of Growth, ParadiseMigration</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Prefer to chat first? <a href="https://wa.me/971586585863" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">WhatsApp us</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
