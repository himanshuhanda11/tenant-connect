import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ArrowRight, CheckCircle2, Zap, MessageSquare, Users, Bot, Send,
  BarChart3, Shield, Sparkles, Phone, Target, Clock, Star,
  ChevronRight, Globe, Layers, TrendingUp, Award, HeartHandshake,
} from 'lucide-react';

import uspFreeApi from '@/assets/usp-free-api.jpg';
import uspTeamInbox from '@/assets/usp-team-inbox.jpg';
import uspAiAutomation from '@/assets/usp-ai-automation.jpg';
import uspCampaigns from '@/assets/usp-campaigns.jpg';
import uspMetaAds from '@/assets/usp-meta-ads.jpg';
import uspAiReplies from '@/assets/usp-ai-replies.jpg';
import uspCrm from '@/assets/usp-crm.jpg';
import uspTemplates from '@/assets/usp-templates.jpg';
import uspDiagnostics from '@/assets/usp-diagnostics.jpg';
import uspTeamScale from '@/assets/usp-team-scale.jpg';

const usps = [
  {
    number: '01',
    badge: 'FREE FOREVER',
    title: 'Free WhatsApp API — Zero Monthly Fees',
    subtitle: 'Only pay Meta\'s conversation charges. No hidden fees, no subscriptions.',
    description: 'Unlike competitors charging ₹999–₹14,999/month, Aireatro gives you the full WhatsApp Cloud API absolutely free. Connect your business number, start messaging — forever.',
    steps: ['Sign up for free in 2 minutes', 'Connect your WhatsApp Business number', 'Start sending messages — only pay Meta\'s per-conversation fees'],
    image: uspFreeApi,
    icon: Phone,
    color: 'emerald',
    stat: '₹0/mo',
    statLabel: 'Platform fee',
  },
  {
    number: '02',
    badge: 'TEAM COLLABORATION',
    title: 'Shared Team Inbox — Multiple Agents, One Number',
    subtitle: 'Your entire team on one WhatsApp number with smart routing.',
    description: 'No more sharing one phone. Every team member gets their own login. Conversations auto-route to the right agent based on skills, workload, or round-robin. Internal notes keep everyone aligned.',
    steps: ['Add unlimited team members with role-based access', 'Set up auto-assignment rules (round-robin, skill-based)', 'Use internal notes & quick replies for faster resolution'],
    image: uspTeamInbox,
    icon: Users,
    color: 'blue',
    stat: '∞',
    statLabel: 'Agents on free plan',
  },
  {
    number: '03',
    badge: 'AI POWERED',
    title: 'AI Auto-Reply & Lead Qualification — 24/7',
    subtitle: 'AI handles first responses, qualifies leads, and routes hot prospects to your sales team.',
    description: 'Set up AI-powered auto-replies that understand customer intent. The AI asks qualifying questions, scores leads, and transfers hot prospects to the right agent — even at 3 AM.',
    steps: ['Enable AI auto-reply with your business context', 'Define qualification questions (budget, timeline, needs)', 'AI routes qualified leads to your sales team instantly'],
    image: uspAiReplies,
    icon: Bot,
    color: 'violet',
    stat: '24/7',
    statLabel: 'Always responding',
  },
  {
    number: '04',
    badge: 'BROADCAST',
    title: 'Bulk Campaigns with Real-Time Analytics',
    subtitle: 'Send promotions to thousands with delivery, read & reply tracking.',
    description: 'Create targeted WhatsApp campaigns with scheduling, frequency caps, and quiet hours. Track every message — sent, delivered, read, and replied — in real-time.',
    steps: ['Create campaign with approved template', 'Select audience by tags, segments, or CSV upload', 'Schedule & send — track delivery/read/reply rates live'],
    image: uspCampaigns,
    icon: Send,
    color: 'orange',
    stat: '98%',
    statLabel: 'Open rate',
  },
  {
    number: '05',
    badge: 'META ADS',
    title: 'Click-to-WhatsApp Ads — Full Funnel Tracking',
    subtitle: 'Track from ad click → WhatsApp chat → conversion. Know your exact ROI.',
    description: 'Connect your Meta Ads account and see the complete journey. Which ad brought which lead, which agent handled it, and whether it converted. No more guessing where your ad spend goes.',
    steps: ['Connect Meta Ads account in one click', 'Create Click-to-WhatsApp ad campaigns', 'Track full funnel: Ad → Chat → Agent → Sale'],
    image: uspMetaAds,
    icon: Target,
    color: 'cyan',
    stat: '3.5x',
    statLabel: 'Conversion rate',
  },
  {
    number: '06',
    badge: 'NO CODE',
    title: 'AI Flow Builder — Describe in English, Get Automation',
    subtitle: 'Build complex automation flows by simply describing what you want.',
    description: 'Type "recover abandoned carts" or "welcome new leads" — AI builds the complete multi-step flow for you. No coding, no drag-and-drop complexity. Just describe your goal.',
    steps: ['Describe your goal in plain English', 'AI generates the complete automation flow', 'Review, customize & activate — done in 2 minutes'],
    image: uspAiAutomation,
    icon: Zap,
    color: 'purple',
    stat: '2 min',
    statLabel: 'Avg. setup time',
  },
  {
    number: '07',
    badge: 'CRM',
    title: 'Built-In CRM — Contacts, Tags & Segments',
    subtitle: 'Manage all your WhatsApp contacts with lead scoring and smart segmentation.',
    description: 'Every conversation creates a contact profile. Tag customers, create segments, track lead stages, and score leads based on engagement. No need for a separate CRM tool.',
    steps: ['Contacts auto-created from WhatsApp conversations', 'Tag & segment customers for targeted messaging', 'Track lead stages and engagement scores'],
    image: uspCrm,
    icon: HeartHandshake,
    color: 'pink',
    stat: '100%',
    statLabel: 'Auto-organized',
  },
  {
    number: '08',
    badge: 'TEMPLATES',
    title: 'Pre-Built Templates & Quick Setup',
    subtitle: 'Industry-ready message templates. Go live in under 30 minutes.',
    description: 'Choose from 50+ industry templates for e-commerce, real estate, healthcare, education, and more. Customize, submit for Meta approval, and start sending within minutes.',
    steps: ['Browse 50+ industry-specific templates', 'Customize with your business details & variables', 'Submit for approval — start sending once approved'],
    image: uspTemplates,
    icon: Layers,
    color: 'amber',
    stat: '50+',
    statLabel: 'Ready templates',
  },
  {
    number: '09',
    badge: 'DIAGNOSTICS',
    title: 'Smart Diagnostics — Know What\'s Broken & Why',
    subtitle: 'Not just analytics. Actionable insights that tell you exactly what to fix.',
    description: 'Aireatro doesn\'t just show numbers. It tells you "Replies dropped because message was too long" or "Flow #3 causes 42% drop-off". AI turns your data into actions.',
    steps: ['Dashboard shows flow health scores & heatmaps', 'AI highlights issues: broken paths, SLA breaches', 'Get specific fix suggestions — not just raw stats'],
    image: uspDiagnostics,
    icon: BarChart3,
    color: 'teal',
    stat: '↓45%',
    statLabel: 'Cost per lead',
  },
  {
    number: '10',
    badge: 'ENTERPRISE',
    title: 'Built for Teams & Scale — From Day One',
    subtitle: 'SLA tracking, agent scorecards, RBAC, audit logs & multi-workspace.',
    description: 'Features that competitors charge ₹10,000+/month for — included free. Role-based access, performance tracking, SLA management, and multi-workspace support for agencies.',
    steps: ['Set up roles: Owner, Admin, Manager, Agent', 'Track agent performance with scorecards & SLA', 'Manage multiple workspaces for different brands/clients'],
    image: uspTeamScale,
    icon: Shield,
    color: 'indigo',
    stat: '∞',
    statLabel: 'Workspaces',
  },
];

const colorMap: Record<string, { badge: string; icon: string; border: string; stat: string; step: string }> = {
  emerald: { badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-500', border: 'border-emerald-200 dark:border-emerald-500/20', stat: 'text-emerald-600 dark:text-emerald-400', step: 'bg-emerald-500' },
  blue: { badge: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400', icon: 'text-blue-500', border: 'border-blue-200 dark:border-blue-500/20', stat: 'text-blue-600 dark:text-blue-400', step: 'bg-blue-500' },
  violet: { badge: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400', icon: 'text-violet-500', border: 'border-violet-200 dark:border-violet-500/20', stat: 'text-violet-600 dark:text-violet-400', step: 'bg-violet-500' },
  orange: { badge: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400', icon: 'text-orange-500', border: 'border-orange-200 dark:border-orange-500/20', stat: 'text-orange-600 dark:text-orange-400', step: 'bg-orange-500' },
  cyan: { badge: 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400', icon: 'text-cyan-500', border: 'border-cyan-200 dark:border-cyan-500/20', stat: 'text-cyan-600 dark:text-cyan-400', step: 'bg-cyan-500' },
  purple: { badge: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400', icon: 'text-purple-500', border: 'border-purple-200 dark:border-purple-500/20', stat: 'text-purple-600 dark:text-purple-400', step: 'bg-purple-500' },
  pink: { badge: 'bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-400', icon: 'text-pink-500', border: 'border-pink-200 dark:border-pink-500/20', stat: 'text-pink-600 dark:text-pink-400', step: 'bg-pink-500' },
  amber: { badge: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400', icon: 'text-amber-500', border: 'border-amber-200 dark:border-amber-500/20', stat: 'text-amber-600 dark:text-amber-400', step: 'bg-amber-500' },
  teal: { badge: 'bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400', icon: 'text-teal-500', border: 'border-teal-200 dark:border-teal-500/20', stat: 'text-teal-600 dark:text-teal-400', step: 'bg-teal-500' },
  indigo: { badge: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400', icon: 'text-indigo-500', border: 'border-indigo-200 dark:border-indigo-500/20', stat: 'text-indigo-600 dark:text-indigo-400', step: 'bg-indigo-500' },
};

const comparisonData = [
  { feature: 'Platform Fee', aireatro: '₹0 Forever', others: '₹999–₹14,999/mo' },
  { feature: 'Team Agents', aireatro: 'Unlimited (Free)', others: '2–5 agents' },
  { feature: 'AI Auto-Reply', aireatro: 'Built-in', others: 'Extra cost / None' },
  { feature: 'Flow Diagnostics', aireatro: 'Health scores & fixes', others: 'Not available' },
  { feature: 'Ad Attribution', aireatro: 'End-to-end tracking', others: 'Click only' },
  { feature: 'Setup Time', aireatro: '< 30 minutes', others: 'Hours to days' },
  { feature: 'UI/UX Quality', aireatro: 'Premium (Stripe-level)', others: 'Cluttered' },
  { feature: 'Multi-Workspace', aireatro: 'Included', others: 'Enterprise plan only' },
];

export default function WhyAireatro() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Why Aireatro — 10 Reasons to Choose India's Best WhatsApp API Platform</title>
        <meta name="description" content="Discover why 2,000+ businesses choose Aireatro. Free WhatsApp API, AI automation, team inbox, bulk campaigns & full Meta Ads tracking. Zero monthly fees." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5" />
          <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
            <Badge className="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              OFFICIAL WHATSAPP CLOUD API PARTNER
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Take Your Business to the
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"> Next Level</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to sell, support, and grow on WhatsApp — with AI automation, team inbox, and bulk campaigns. <strong className="text-foreground">Zero monthly fees.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="lg" className="rounded-xl text-sm font-semibold px-8 gap-2" onClick={() => navigate('/signup')}>
                Start Free — No Card Needed <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-8" onClick={() => navigate('/contact')}>
                Book a Demo
              </Button>
            </div>
            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12 pt-8 border-t border-border/40">
              {[
                { value: '2,000+', label: 'Businesses' },
                { value: '₹0', label: 'Monthly fee' },
                { value: '< 30 min', label: 'Setup time' },
                { value: '98%', label: 'Open rate' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── USP SECTIONS ── */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">10 Powerful Reasons to Choose Aireatro</h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl mx-auto">Each feature designed to save time, reduce costs, and grow your revenue on WhatsApp.</p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {usps.map((usp, idx) => {
              const colors = colorMap[usp.color];
              const isReversed = idx % 2 !== 0;

              return (
                <div key={usp.number} className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", colors.border)}>
                  {/* Image + Content */}
                  <div className={cn("flex flex-col", isReversed ? "md:flex-row-reverse" : "md:flex-row")}>
                    {/* Image */}
                    <div className="md:w-1/2 relative">
                      <img
                        src={usp.image}
                        alt={usp.title}
                        className="w-full h-48 sm:h-64 md:h-full object-cover"
                        loading="lazy"
                        width={800}
                        height={512}
                      />
                      {/* Number overlay */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <span className="text-lg sm:text-xl font-bold text-foreground">{usp.number}</span>
                        </div>
                      </div>
                      {/* Stat overlay */}
                      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                        <div className="bg-background/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg text-center">
                          <p className={cn("text-xl sm:text-2xl font-bold", colors.stat)}>{usp.stat}</p>
                          <p className="text-[10px] text-muted-foreground">{usp.statLabel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <usp.icon className={cn("h-5 w-5", colors.icon)} />
                        <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border-0", colors.badge)}>
                          {usp.badge}
                        </Badge>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{usp.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">{usp.subtitle}</p>
                      <p className="text-xs text-muted-foreground/80 mt-3 leading-relaxed">{usp.description}</p>

                      {/* Steps */}
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">How to use</p>
                        {usp.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={cn("h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5", colors.step)}>
                              {i + 1}
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="bg-muted/30 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Aireatro vs. Others</h2>
              <p className="text-muted-foreground mt-2 text-sm">See why businesses switch from legacy WhatsApp platforms</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border/40">
                <div className="p-3 sm:p-4 text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</div>
                <div className="p-3 sm:p-4 text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-center">Aireatro</div>
                <div className="p-3 sm:p-4 text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Others</div>
              </div>
              {comparisonData.map((row, i) => (
                <div key={row.feature} className={cn("grid grid-cols-3 border-b border-border/20 last:border-0", i % 2 === 0 && "bg-muted/10")}>
                  <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-foreground">{row.feature}</div>
                  <div className="p-3 sm:p-4 text-xs sm:text-sm text-center font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> {row.aireatro}
                  </div>
                  <div className="p-3 sm:p-4 text-xs sm:text-sm text-center text-muted-foreground">{row.others}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border/40">
          <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Ready to grow?
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground">Start Free Today — No Credit Card Required</h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl mx-auto">
              Join 2,000+ businesses already using Aireatro to sell more, support faster, and automate smarter on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="lg" className="rounded-xl text-sm font-semibold px-8 gap-2" onClick={() => navigate('/signup')}>
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-8" onClick={() => navigate('/contact')}>
                Talk to Sales
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
