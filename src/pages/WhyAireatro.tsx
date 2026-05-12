import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ArrowRight, CheckCircle2, Zap, Users, Bot, Send,
  BarChart3, Shield, Sparkles, Phone, Target,
  Layers, HeartHandshake, Download, ChevronRight, Home, Star,
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
  { number: '01', badge: 'FREE FOREVER', title: 'Free WhatsApp API — Zero Monthly Fees', subtitle: 'Only pay Meta\'s conversation charges. No hidden fees, no subscriptions.', description: 'Unlike competitors charging ₹999–₹14,999/month, Aireatro gives you the full WhatsApp Cloud API absolutely free. Connect your business number, start messaging — forever.', steps: ['Sign up for free in 2 minutes', 'Connect your WhatsApp Business number', 'Start sending — only pay Meta\'s per-conversation fees'], image: uspFreeApi, icon: Phone, accent: 'from-emerald-500 to-green-400', stat: '₹0/mo', statLabel: 'Platform fee' },
  { number: '02', badge: 'TEAM COLLABORATION', title: 'Shared Team Inbox — Multiple Agents, One Number', subtitle: 'Your entire team on one WhatsApp number with smart routing.', description: 'No more sharing one phone. Every team member gets their own login. Conversations auto-route to the right agent based on skills, workload, or round-robin.', steps: ['Add unlimited team members with role-based access', 'Set up auto-assignment rules (round-robin, skill-based)', 'Use internal notes & quick replies for faster resolution'], image: uspTeamInbox, icon: Users, accent: 'from-blue-500 to-cyan-400', stat: '∞', statLabel: 'Agents on free plan' },
  { number: '03', badge: 'AI POWERED', title: 'AI Auto-Reply & Lead Qualification — 24/7', subtitle: 'AI handles first responses, qualifies leads, and routes hot prospects.', description: 'Set up AI-powered auto-replies that understand customer intent. The AI asks qualifying questions, scores leads, and transfers hot prospects — even at 3 AM.', steps: ['Enable AI auto-reply with your business context', 'Define qualification questions (budget, timeline, needs)', 'AI routes qualified leads to your sales team instantly'], image: uspAiReplies, icon: Bot, accent: 'from-violet-500 to-purple-400', stat: '24/7', statLabel: 'Always responding' },
  { number: '04', badge: 'BROADCAST', title: 'Bulk Campaigns with Real-Time Analytics', subtitle: 'Send promotions to thousands with delivery, read & reply tracking.', description: 'Create targeted WhatsApp campaigns with scheduling, frequency caps, and quiet hours. Track every message — sent, delivered, read, and replied — in real-time.', steps: ['Create campaign with approved template', 'Select audience by tags, segments, or CSV upload', 'Schedule & send — track delivery/read/reply rates live'], image: uspCampaigns, icon: Send, accent: 'from-orange-500 to-amber-400', stat: '98%', statLabel: 'Open rate' },
  { number: '05', badge: 'META ADS', title: 'Click-to-WhatsApp Ads — Full Funnel Tracking', subtitle: 'Track from ad click → WhatsApp chat → conversion. Know your exact ROI.', description: 'Connect your Meta Ads account and see the complete journey. Which ad brought which lead, which agent handled it, and whether it converted.', steps: ['Connect Meta Ads account in one click', 'Create Click-to-WhatsApp ad campaigns', 'Track full funnel: Ad → Chat → Agent → Sale'], image: uspMetaAds, icon: Target, accent: 'from-cyan-500 to-teal-400', stat: '3.5x', statLabel: 'Conversion rate' },
  { number: '06', badge: 'NO CODE', title: 'AI Flow Builder — Describe in English, Get Automation', subtitle: 'Build complex automation flows by simply describing what you want.', description: 'Type "recover abandoned carts" or "welcome new leads" — AI builds the complete multi-step flow for you. No coding, no drag-and-drop complexity.', steps: ['Describe your goal in plain English', 'AI generates the complete automation flow', 'Review, customize & activate — done in 2 minutes'], image: uspAiAutomation, icon: Zap, accent: 'from-purple-500 to-pink-400', stat: '2 min', statLabel: 'Avg. setup time' },
  { number: '07', badge: 'CRM', title: 'Built-In CRM — Contacts, Tags & Segments', subtitle: 'Manage all your WhatsApp contacts with lead scoring and smart segmentation.', description: 'Every conversation creates a contact profile. Tag customers, create segments, track lead stages, and score leads based on engagement.', steps: ['Contacts auto-created from WhatsApp conversations', 'Tag & segment customers for targeted messaging', 'Track lead stages and engagement scores'], image: uspCrm, icon: HeartHandshake, accent: 'from-pink-500 to-rose-400', stat: '100%', statLabel: 'Auto-organized' },
  { number: '08', badge: 'TEMPLATES', title: 'Pre-Built Templates & Quick Setup', subtitle: 'Industry-ready message templates. Go live in under 10 minutes.', description: 'Choose from 50+ industry templates for e-commerce, real estate, healthcare, education, and more. Customize, submit for Meta approval, and start sending.', steps: ['Browse 50+ industry-specific templates', 'Customize with your business details & variables', 'Submit for approval — start sending once approved'], image: uspTemplates, icon: Layers, accent: 'from-amber-500 to-yellow-400', stat: '50+', statLabel: 'Ready templates' },
  { number: '09', badge: 'DIAGNOSTICS', title: 'Smart Diagnostics — Know What\'s Broken & Why', subtitle: 'Not just analytics. Actionable insights that tell you exactly what to fix.', description: 'Aireatro doesn\'t just show numbers. It tells you "Replies dropped because message was too long" or "Flow #3 causes 42% drop-off". AI turns your data into actions.', steps: ['Dashboard shows flow health scores & heatmaps', 'AI highlights issues: broken paths, SLA breaches', 'Get specific fix suggestions — not just raw stats'], image: uspDiagnostics, icon: BarChart3, accent: 'from-teal-500 to-emerald-400', stat: '↓45%', statLabel: 'Cost per lead' },
  { number: '10', badge: 'ENTERPRISE', title: 'Built for Teams & Scale — From Day One', subtitle: 'SLA tracking, agent scorecards, RBAC, audit logs & multi-workspace.', description: 'Features that competitors charge ₹10,000+/month for — included free. Role-based access, performance tracking, SLA management, and multi-workspace support.', steps: ['Set up roles: Owner, Admin, Manager, Agent', 'Track agent performance with scorecards & SLA', 'Manage multiple workspaces for different brands/clients'], image: uspTeamScale, icon: Shield, accent: 'from-indigo-500 to-blue-400', stat: '∞', statLabel: 'Workspaces' },
];

const comparisonData = [
  { feature: 'Platform Fee', aireatro: '₹0 Forever', others: '₹999–₹14,999/mo' },
  { feature: 'Team Agents', aireatro: 'Unlimited (Free)', others: '2–5 agents' },
  { feature: 'AI Auto-Reply', aireatro: 'Built-in', others: 'Extra cost / None' },
  { feature: 'Flow Diagnostics', aireatro: 'Health scores & fixes', others: 'Not available' },
  { feature: 'Ad Attribution', aireatro: 'End-to-end tracking', others: 'Click only' },
  { feature: 'Setup Time', aireatro: '< 10 minutes', others: 'Hours to days' },
  { feature: 'UI/UX Quality', aireatro: 'Premium (Stripe-level)', others: 'Cluttered' },
  { feature: 'Multi-Workspace', aireatro: 'Included', others: 'Enterprise plan only' },
];

export default function WhyAireatro() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Why Aireatro — 10 Reasons to Choose the Best WhatsApp API Platform</title>
        <meta name="description" content="Discover why 2,000+ businesses choose Aireatro. Free WhatsApp API, AI automation, team inbox, bulk campaigns & full Meta Ads tracking. Zero monthly fees." />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* HERO */}
        <section className="relative pt-20 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
            <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
            <div className="absolute top-10 -right-32 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          </div>

          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5" /> Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              <span className="text-foreground font-medium">Why Aireatro</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/60 backdrop-blur-md text-xs font-semibold text-muted-foreground animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Official WhatsApp Cloud API Partner
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-in">
                Take your business to the{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-primary to-emerald-500 bg-clip-text text-transparent">
                  next level
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Everything you need to sell, support and grow on WhatsApp — AI automation, team inbox and bulk campaigns. <span className="text-foreground font-semibold">Zero monthly fees.</span>
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-primary hover:opacity-95 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)]" onClick={() => navigate('/signup')}>
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 backdrop-blur-md bg-card/60" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </div>

              <a
                href="/Aireatro-USP-Brochure.pdf"
                download
                className="inline-flex items-center gap-2 mt-6 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
              >
                <Download className="h-4 w-4" /> Download USP Brochure (PDF)
              </a>

              {/* Stats */}
              <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: '2,000+', label: 'Businesses' },
                  { value: '₹0', label: 'Platform Fee' },
                  { value: '< 10 min', label: 'Setup Time' },
                  { value: '98%', label: 'Open Rate' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-5 hover:border-primary/40 transition-colors">
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-emerald-400 to-primary bg-clip-text text-transparent">{s.value}</p>
                    <p className="text-[11px] mt-1 text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* USP SECTIONS */}
        <section className="relative py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4">10 Reasons</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Built to save time. <span className="bg-gradient-to-r from-emerald-500 to-primary bg-clip-text text-transparent">Engineered to grow revenue.</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-base md:text-lg">Every feature designed to reduce cost and grow your WhatsApp pipeline.</p>
            </div>

            <div className="space-y-16 md:space-y-24 max-w-6xl mx-auto">
              {usps.map((usp, idx) => {
                const isReversed = idx % 2 !== 0;
                const Icon = usp.icon;
                return (
                  <div key={usp.number} className={cn('grid md:grid-cols-2 gap-8 md:gap-14 items-center', isReversed && 'md:[&>*:first-child]:order-2')}>
                    {/* Image */}
                    <div className="relative group">
                      <div className={cn('absolute -inset-3 rounded-3xl bg-gradient-to-br opacity-40 blur-2xl group-hover:opacity-70 transition-opacity', usp.accent)} />
                      <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card/80 backdrop-blur-md shadow-2xl">
                        <img src={usp.image} alt={usp.title} loading="lazy" width={1280} height={800} className="w-full h-60 sm:h-72 md:h-80 object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                      </div>
                      {/* Number */}
                      <div className={cn('absolute -top-4 -left-4 h-14 w-14 rounded-2xl bg-gradient-to-br shadow-xl flex items-center justify-center', usp.accent)}>
                        <span className="text-lg font-bold text-white">{usp.number}</span>
                      </div>
                      {/* Stat */}
                      <div className="absolute -bottom-4 right-4 rounded-xl border border-border/60 bg-card/90 backdrop-blur-md px-4 py-2.5 shadow-xl text-center">
                        <p className={cn('text-xl font-bold bg-gradient-to-br bg-clip-text text-transparent', usp.accent)}>{usp.stat}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{usp.statLabel}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn('h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', usp.accent)}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{usp.badge}</span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{usp.title}</h3>
                      <p className="mt-3 text-base text-foreground/80 leading-relaxed">{usp.subtitle}</p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{usp.description}</p>

                      <div className="mt-6 space-y-3">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">How it works</p>
                        {usp.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={cn('h-6 w-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-md', usp.accent)}>
                              {i + 1}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MID CTA */}
        <section className="relative py-20">
          <div className="container mx-auto px-4">
            <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 opacity-60 blur-2xl" />
              <div className="relative rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-10 md:p-14 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/60 text-xs font-medium mb-5">
                    <Sparkles className="h-3 w-3 text-emerald-500" /> Ready to grow?
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to 10× your WhatsApp revenue?</h2>
                  <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Get started in under 10 minutes. No credit card. No monthly fees.</p>
                  <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-primary hover:opacity-95 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.7)]" onClick={() => navigate('/signup')}>
                      Start Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 backdrop-blur-md bg-card/60" onClick={() => navigate('/contact')}>
                      Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="relative py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">Comparison</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Aireatro vs. the others</h2>
              <p className="mt-4 text-muted-foreground">See why teams switch from legacy WhatsApp platforms.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-primary/20 blur-2xl rounded-3xl" />
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-3 bg-muted/40 border-b border-border/60">
                  <div className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Feature</div>
                  <div className="p-4 text-xs font-bold uppercase tracking-wider text-emerald-500 text-center flex items-center justify-center gap-1.5">
                    <Star className="h-3 w-3 fill-emerald-500" /> Aireatro
                  </div>
                  <div className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Others</div>
                </div>
                {comparisonData.map((row, i) => (
                  <div key={row.feature} className={cn('grid grid-cols-3 border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30', i % 2 === 0 && 'bg-emerald-500/[0.03]')}>
                    <div className="p-4 text-sm font-medium">{row.feature}</div>
                    <div className="p-4 text-sm text-center font-semibold text-emerald-500 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> {row.aireatro}
                    </div>
                    <div className="p-4 text-sm text-center text-muted-foreground/70">{row.others}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative py-24 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/60 text-xs font-semibold text-emerald-500 mb-5">
                <Sparkles className="h-3 w-3" /> Join 2,000+ businesses
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Start free today — no credit card required</h2>
              <p className="mt-4 text-muted-foreground text-base md:text-lg">Sell more, support faster and automate smarter on WhatsApp.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-primary hover:opacity-95 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.7)]" onClick={() => navigate('/signup')}>
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 backdrop-blur-md bg-card/60" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-border/60 bg-background/90 backdrop-blur-xl px-4 py-3 flex gap-2">
        <Button className="flex-1 h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-primary hover:opacity-95 gap-1.5" onClick={() => navigate('/signup')}>
          Start Free <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="h-11 rounded-xl text-sm font-semibold px-4" onClick={() => navigate('/contact')}>
          Contact Us
        </Button>
      </div>

      <Footer />
    </>
  );
}
