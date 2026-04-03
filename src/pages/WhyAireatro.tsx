import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ArrowRight, CheckCircle2, Zap, Users, Bot, Send,
  BarChart3, Shield, Sparkles, Phone, Target,
  Layers, HeartHandshake, Download, ChevronRight, Home,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
    accent: 'from-emerald-500 to-green-400',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    stat: '₹0/mo',
    statLabel: 'Platform fee',
  },
  {
    number: '02',
    badge: 'TEAM COLLABORATION',
    title: 'Shared Team Inbox — Multiple Agents, One Number',
    subtitle: 'Your entire team on one WhatsApp number with smart routing.',
    description: 'No more sharing one phone. Every team member gets their own login. Conversations auto-route to the right agent based on skills, workload, or round-robin.',
    steps: ['Add unlimited team members with role-based access', 'Set up auto-assignment rules (round-robin, skill-based)', 'Use internal notes & quick replies for faster resolution'],
    image: uspTeamInbox,
    icon: Users,
    accent: 'from-blue-500 to-cyan-400',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-600',
    stat: '∞',
    statLabel: 'Agents on free plan',
  },
  {
    number: '03',
    badge: 'AI POWERED',
    title: 'AI Auto-Reply & Lead Qualification — 24/7',
    subtitle: 'AI handles first responses, qualifies leads, and routes hot prospects.',
    description: 'Set up AI-powered auto-replies that understand customer intent. The AI asks qualifying questions, scores leads, and transfers hot prospects — even at 3 AM.',
    steps: ['Enable AI auto-reply with your business context', 'Define qualification questions (budget, timeline, needs)', 'AI routes qualified leads to your sales team instantly'],
    image: uspAiReplies,
    icon: Bot,
    accent: 'from-violet-500 to-purple-400',
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-600',
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
    accent: 'from-orange-500 to-amber-400',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    stat: '98%',
    statLabel: 'Open rate',
  },
  {
    number: '05',
    badge: 'META ADS',
    title: 'Click-to-WhatsApp Ads — Full Funnel Tracking',
    subtitle: 'Track from ad click → WhatsApp chat → conversion. Know your exact ROI.',
    description: 'Connect your Meta Ads account and see the complete journey. Which ad brought which lead, which agent handled it, and whether it converted.',
    steps: ['Connect Meta Ads account in one click', 'Create Click-to-WhatsApp ad campaigns', 'Track full funnel: Ad → Chat → Agent → Sale'],
    image: uspMetaAds,
    icon: Target,
    accent: 'from-cyan-500 to-teal-400',
    accentBg: 'bg-cyan-50',
    accentText: 'text-cyan-600',
    stat: '3.5x',
    statLabel: 'Conversion rate',
  },
  {
    number: '06',
    badge: 'NO CODE',
    title: 'AI Flow Builder — Describe in English, Get Automation',
    subtitle: 'Build complex automation flows by simply describing what you want.',
    description: 'Type "recover abandoned carts" or "welcome new leads" — AI builds the complete multi-step flow for you. No coding, no drag-and-drop complexity.',
    steps: ['Describe your goal in plain English', 'AI generates the complete automation flow', 'Review, customize & activate — done in 2 minutes'],
    image: uspAiAutomation,
    icon: Zap,
    accent: 'from-purple-500 to-pink-400',
    accentBg: 'bg-purple-50',
    accentText: 'text-purple-600',
    stat: '2 min',
    statLabel: 'Avg. setup time',
  },
  {
    number: '07',
    badge: 'CRM',
    title: 'Built-In CRM — Contacts, Tags & Segments',
    subtitle: 'Manage all your WhatsApp contacts with lead scoring and smart segmentation.',
    description: 'Every conversation creates a contact profile. Tag customers, create segments, track lead stages, and score leads based on engagement.',
    steps: ['Contacts auto-created from WhatsApp conversations', 'Tag & segment customers for targeted messaging', 'Track lead stages and engagement scores'],
    image: uspCrm,
    icon: HeartHandshake,
    accent: 'from-pink-500 to-rose-400',
    accentBg: 'bg-pink-50',
    accentText: 'text-pink-600',
    stat: '100%',
    statLabel: 'Auto-organized',
  },
  {
    number: '08',
    badge: 'TEMPLATES',
    title: 'Pre-Built Templates & Quick Setup',
    subtitle: 'Industry-ready message templates. Go live in under 30 minutes.',
    description: 'Choose from 50+ industry templates for e-commerce, real estate, healthcare, education, and more. Customize, submit for Meta approval, and start sending.',
    steps: ['Browse 50+ industry-specific templates', 'Customize with your business details & variables', 'Submit for approval — start sending once approved'],
    image: uspTemplates,
    icon: Layers,
    accent: 'from-amber-500 to-yellow-400',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-600',
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
    accent: 'from-teal-500 to-emerald-400',
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-600',
    stat: '↓45%',
    statLabel: 'Cost per lead',
  },
  {
    number: '10',
    badge: 'ENTERPRISE',
    title: 'Built for Teams & Scale — From Day One',
    subtitle: 'SLA tracking, agent scorecards, RBAC, audit logs & multi-workspace.',
    description: 'Features that competitors charge ₹10,000+/month for — included free. Role-based access, performance tracking, SLA management, and multi-workspace support.',
    steps: ['Set up roles: Owner, Admin, Manager, Agent', 'Track agent performance with scorecards & SLA', 'Manage multiple workspaces for different brands/clients'],
    image: uspTeamScale,
    icon: Shield,
    accent: 'from-indigo-500 to-blue-400',
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-600',
    stat: '∞',
    statLabel: 'Workspaces',
  },
];

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

      <Navbar />

      <div className="min-h-screen bg-white">
        {/* ── BREADCRUMBS ── */}
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            <span className="text-gray-900 font-medium">Why Aireatro</span>
          </nav>
        </div>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
          {/* Premium background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 lg:py-28">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-8">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-xs font-semibold tracking-wider uppercase">Official WhatsApp Cloud API Partner</span>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                <span className="text-white">Take Your Business</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">to the Next Level</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                Everything you need to sell, support & grow on WhatsApp — AI automation, team inbox, and bulk campaigns. <span className="text-white font-semibold">Zero monthly fees.</span>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Button size="lg" className="rounded-xl text-sm font-semibold px-8 gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 border-0 h-12" onClick={() => navigate('/signup')}>
                  Start Free — No Card Needed <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-8 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white h-12" onClick={() => navigate('/contact')}>
                  Start Free
                </Button>
              </div>
              
              {/* Download PDF */}
              <a
                href="/Aireatro-USP-Brochure.pdf"
                download="Aireatro-USP-Brochure.pdf"
                className="inline-flex items-center gap-2 text-sm text-emerald-400/80 hover:text-emerald-300 font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                Download USP Brochure (PDF)
              </a>
            </div>
            
            {/* Stats row */}
            <div className="mt-16 pt-10 border-t border-slate-800/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[
                  { value: '2,000+', label: 'Businesses Trust Us' },
                  { value: '₹0', label: 'Monthly Platform Fee' },
                  { value: '< 30 min', label: 'Setup Time' },
                  { value: '98%', label: 'Message Open Rate' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1.5 uppercase tracking-wider font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── USP SECTIONS ── */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">10 Powerful Reasons to Choose Aireatro</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-xl mx-auto">Each feature designed to save time, reduce costs, and grow your revenue on WhatsApp.</p>
          </div>

          <div className="space-y-14 sm:space-y-20">
            {usps.map((usp, idx) => {
              const isReversed = idx % 2 !== 0;
              const Icon = usp.icon;

              return (
                <div key={usp.number} className="group">
                  <div className={cn("flex flex-col gap-6", isReversed ? "md:flex-row-reverse" : "md:flex-row")}>
                    {/* Image */}
                    <div className="md:w-1/2 relative">
                      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg shadow-gray-100 bg-white">
                        <img
                          src={usp.image}
                          alt={usp.title}
                          className="w-full h-56 sm:h-72 md:h-80 object-cover object-top"
                          loading="lazy"
                          width={1280}
                          height={800}
                        />
                      </div>
                      {/* Number badge */}
                      <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4">
                        <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center", usp.accent)}>
                          <span className="text-lg sm:text-xl font-bold text-white">{usp.number}</span>
                        </div>
                      </div>
                      {/* Stat pill */}
                      <div className="absolute -bottom-3 right-4 sm:-bottom-4 sm:right-6">
                        <div className="bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-100 text-center">
                          <p className={cn("text-xl sm:text-2xl font-bold", usp.accentText)}>{usp.stat}</p>
                          <p className="text-[10px] text-gray-500">{usp.statLabel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-1/2 flex flex-col justify-center py-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", usp.accentBg)}>
                          <Icon className={cn("h-4 w-4", usp.accentText)} />
                        </div>
                        <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border-0", usp.accentBg, usp.accentText)}>
                          {usp.badge}
                        </Badge>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{usp.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{usp.subtitle}</p>
                      <p className="text-xs text-gray-500 mt-3 leading-relaxed">{usp.description}</p>

                      {/* Steps */}
                      <div className="mt-5 space-y-2.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">How to use</p>
                        {usp.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={cn("h-5 w-5 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5", usp.accent)}>
                              {i + 1}
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{step}</p>
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

        {/* ── MID-PAGE CTA ── */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-500 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-white">Ready to 10x Your WhatsApp Revenue?</h2>
            <p className="text-emerald-100 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              Get started in under 2 minutes. No credit card required. No monthly fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button size="lg" className="rounded-xl text-sm font-semibold px-8 gap-2 bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg" onClick={() => navigate('/signup')}>
                Start Free Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
                Start Free
              </Button>
            </div>
            <p className="text-emerald-200 text-xs mt-4">✓ Free forever &nbsp;·&nbsp; ✓ No setup fees &nbsp;·&nbsp; ✓ Cancel anytime</p>
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Aireatro vs. Others</h2>
              <p className="text-gray-500 mt-2 text-sm">See why businesses switch from legacy WhatsApp platforms</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                <div className="p-3 sm:p-4 text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature</div>
                <div className="p-3 sm:p-4 text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider text-center">Aireatro</div>
                <div className="p-3 sm:p-4 text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Others</div>
              </div>
              {comparisonData.map((row, i) => (
                <div key={row.feature} className={cn("grid grid-cols-3 border-b border-gray-100 last:border-0", i % 2 === 0 && "bg-emerald-50/30")}>
                  <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-800">{row.feature}</div>
                  <div className="p-3 sm:p-4 text-xs sm:text-sm text-center font-semibold text-emerald-600 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> {row.aireatro}
                  </div>
                  <div className="p-3 sm:p-4 text-xs sm:text-sm text-center text-gray-400">{row.others}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-gray-200 bg-gradient-to-b from-white to-emerald-50/50">
          <div className="max-w-3xl mx-auto px-4 py-14 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Ready to grow?
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">Start Free Today — No Credit Card Required</h2>
            <p className="text-gray-600 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              Join 2,000+ businesses already using Aireatro to sell more, support faster, and automate smarter on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="lg" className="rounded-xl text-sm font-semibold px-8 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" onClick={() => navigate('/signup')}>
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl text-sm font-semibold px-8 border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 flex gap-2">
        <Button className="flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => navigate('/signup')}>
          Start Free <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" className="rounded-xl text-xs font-semibold border-gray-300 text-gray-700 px-4" onClick={() => navigate('/contact')}>
          Demo
        </Button>
      </div>

      <Footer />
    </>
  );
}
