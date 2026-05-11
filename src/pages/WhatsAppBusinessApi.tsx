import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Zap,
  BarChart3,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Megaphone,
  Tag,
  Bot,
  Inbox,
  Repeat,
  Facebook,
  UserPlus,
  Briefcase,
  CreditCard,
  Plug,
  Building2,
  Rocket,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  PhoneCall,
  X,
  Check,
  ChevronRight,
  Send,
  Activity,
  Headphones,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { JsonLd, organizationSchema, softwareApplicationSchema, createFAQSchema } from '@/components/seo/JsonLd';

const WhatsAppBusinessApi = () => {
  const navigate = useNavigate();

  const goSignup = () => navigate('/signup');
  const goDemo = () => navigate('/demo');

  const features = [
    { icon: Repeat, title: 'Team Lead Rotation', desc: 'Auto-distribute leads equally across your sales team in real-time.' },
    { icon: Bot, title: 'WhatsApp Auto Reply', desc: 'Instant responses 24/7 so no lead is ever missed.' },
    { icon: Workflow, title: 'Automation Flows', desc: 'Drag-and-drop builder for chat journeys, qualification & follow-ups.' },
    { icon: Tag, title: 'Smart Lead Tagging', desc: 'Auto-tag conversations by intent, source, stage and more.' },
    { icon: Facebook, title: 'Facebook Lead Ads', desc: 'Instantly reply to every Meta lead form on WhatsApp.' },
    { icon: Inbox, title: 'Shared Team Inbox', desc: 'One inbox, multiple agents, zero confusion.' },
    { icon: Sparkles, title: 'AI Chat Automation', desc: 'GPT-powered replies that qualify leads while you sleep.' },
    { icon: Megaphone, title: 'Bulk Campaigns', desc: 'Send approved templates to thousands with one click.' },
    { icon: Users, title: 'CRM Contact Management', desc: '360° contact view with tags, notes, history & attributes.' },
    { icon: Activity, title: 'Live Chat Tracking', desc: 'Real-time analytics on response time, SLA & agent performance.' },
  ];

  const steps = [
    { n: '01', icon: UserPlus, title: 'Create Account', desc: 'Sign up free in 30 seconds. No credit card needed.' },
    { n: '02', icon: Building2, title: 'Create Workspace', desc: 'Set up your business workspace and invite your team.' },
    { n: '03', icon: CreditCard, title: 'Choose Plan', desc: 'Start free or pick a plan that fits your scale.' },
    { n: '04', icon: Plug, title: 'Connect WhatsApp API', desc: 'One-click Meta signup. Use your own number.' },
    { n: '05', icon: Briefcase, title: 'Complete Business Profile', desc: 'Add logo, description, and templates for approval.' },
    { n: '06', icon: Rocket, title: 'Grow 5X', desc: 'Automate sales, support and marketing on autopilot.' },
  ];

  const compareOthers = [
    'Expensive monthly fees',
    'Limited automation depth',
    'Complicated onboarding',
    'No team rotation built-in',
    'Hidden setup & template costs',
    'Slow, generic support',
  ];

  const compareUs = [
    'Affordable transparent pricing',
    'Full CRM + AI automation',
    'Live in under 10 minutes',
    'Built-in lead rotation & rules',
    'No hidden fees, ever',
    'White-glove onboarding',
  ];

  const testimonials = [
    { name: 'Rohan M.', role: 'Founder, EdTech Agency', text: 'We 4X-ed our reply rate the first week. The team inbox is simply unmatched.' },
    { name: 'Priya S.', role: 'Marketing Head, D2C Brand', text: 'Bulk campaigns + automation = our best ROAS quarter ever.' },
    { name: 'Aman G.', role: 'Immigration Consultant', text: 'Lead rotation closed our follow-up gaps overnight. Setup took 8 minutes.' },
  ];

  const stats = [
    { v: '98%', l: 'Message Open Rate' },
    { v: '< 10 min', l: 'Setup Time' },
    { v: '5X', l: 'Faster Lead Response' },
    { v: '3.4X', l: 'Higher Conversions' },
  ];

  const faqs = [
    { question: 'What is WhatsApp Business API?', answer: 'The official Meta WhatsApp Cloud API lets businesses send templates, automate replies, run team inboxes, and integrate WhatsApp into their CRM at scale.' },
    { question: 'Can I use my existing phone number?', answer: 'Yes. You can migrate any active mobile or landline number to WhatsApp Business API. We guide you through the entire migration.' },
    { question: 'How long does setup take?', answer: 'Most businesses go live in under 10 minutes with our 1-click Meta embedded signup.' },
    { question: 'Is any coding required?', answer: 'Zero coding. Aireatro is built for business owners and marketers, not developers.' },
    { question: 'Can my whole team use it?', answer: 'Absolutely. Add unlimited agents, assign leads automatically, set permissions and track performance.' },
    { question: 'How does automation work?', answer: 'Build visual flows for auto-replies, lead qualification, follow-ups, tagging, routing and AI responses — all triggered by keywords or events.' },
    { question: 'Is there a free trial?', answer: 'Yes, start completely free with no credit card. Upgrade only when you scale.' },
  ];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'WhatsApp Business API + CRM | Aireatro',
    description: 'Boost your business 5X with WhatsApp API + CRM. Automate replies, distribute leads, run campaigns and manage your sales team from one platform.',
    url: 'https://aireatro.com/whatsapp-business-api',
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        route="/whatsapp-business-api"
        fallbackTitle="WhatsApp Business API + CRM — Boost Your Business 5X | Aireatro"
        fallbackDescription="Official WhatsApp API + CRM in one platform. Automate replies, distribute leads, run campaigns and manage your team. Setup in under 10 minutes."
      />
      <JsonLd data={[organizationSchema, softwareApplicationSchema, webPageSchema, createFAQSchema(faqs)]} />

      <Navbar />

      {/* ============ 1. HERO ============ */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Premium gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.15),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        {/* floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/40" />

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT */}
            <div className="text-center lg:text-left animate-fade-in">
              <Badge className="mb-6 px-4 py-2 bg-primary/15 text-primary border border-primary/30 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Official WhatsApp API + AI CRM Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6 text-white tracking-tight">
                Boost Your Business{' '}
                <span className="relative inline-block">
                  <span className="relative bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                    5X
                  </span>
                </span>{' '}
                with WhatsApp{' '}
                <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  API + CRM
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Automate replies, distribute leads, run campaigns and manage your entire sales team from one powerful WhatsApp CRM platform.
              </p>

              {/* Trust line */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-8 max-w-md mx-auto lg:mx-0 text-sm text-slate-300">
                {[
                  'Setup in < 10 minutes',
                  'Official WhatsApp API',
                  'Team Inbox + Automation',
                  'No technical skills needed',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-4">
                <Button
                  size="lg"
                  onClick={goSignup}
                  className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_60px_-5px_hsl(var(--primary)/0.8)] transition-all hover:scale-[1.02]"
                >
                  Start Free Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={goDemo}
                  className="h-14 px-8 text-base font-semibold border-2 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:border-white/50 backdrop-blur-sm"
                >
                  Book Demo
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center lg:text-left">
                Free setup • No coding • Fast onboarding
              </p>
            </div>

            {/* RIGHT — Conversation + dashboard mock */}
            <div className="relative animate-fade-in">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-emerald-500/20 rounded-3xl blur-2xl" />

              {/* Phone-style conversation card */}
              <div className="relative bg-gradient-to-br from-white/95 to-white/85 dark:from-slate-100 dark:to-white backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-5 sm:p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold">A</div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Aireatro Business</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> online
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    <Bot className="w-3 h-3 mr-1" /> AI
                  </Badge>
                </div>

                <div className="space-y-3 py-4">
                  <div className="flex">
                    <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%]">
                      Hi! Interested in your CRM 👋
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[hsl(152_60%_45%)] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[85%] shadow-md">
                      Welcome 🎉 I can show you a 2-min demo. Are you a small business or agency?
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%]">
                      Agency. Need team inbox + automation
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[hsl(152_60%_45%)] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[85%] shadow-md">
                      Perfect. Sending pricing + booking link now ✨
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                  <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-400">Type a message…</div>
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="hidden md:flex absolute -left-6 top-10 bg-white rounded-2xl p-3 pr-4 shadow-2xl items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Conversion</div>
                  <div className="text-sm font-bold text-slate-900">+340% ↑</div>
                </div>
              </div>
              <div className="hidden md:flex absolute -right-4 bottom-16 bg-white rounded-2xl p-3 pr-4 shadow-2xl items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Leads Today</div>
                  <div className="text-sm font-bold text-slate-900">1,284</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-400">
            {['Meta Business Partner', 'GDPR Ready', '99.9% Uptime', '10,000+ Businesses', 'ISO Compliant'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 2. VISUAL CRM DEMO ============ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Live Product</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Your entire WhatsApp business{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">in one screen</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Inbox, automation, campaigns, AI replies, team performance — all unified.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 to-emerald-500/10 rounded-3xl blur-3xl" />
            <div className="relative bg-card border rounded-3xl shadow-2xl overflow-hidden">
              {/* Mock browser */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/40">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4 bg-background border rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                  app.aireatro.com/inbox
                </div>
              </div>

              <div className="grid md:grid-cols-[260px_1fr_280px] min-h-[480px]">
                {/* Sidebar */}
                <div className="border-r bg-muted/30 p-4 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Inbox</div>
                  {[
                    { l: 'All Conversations', n: 248, a: true },
                    { l: 'Unassigned', n: 12 },
                    { l: 'My Leads', n: 38 },
                    { l: 'Unreplied', n: 9 },
                    { l: 'Closed', n: 1284 },
                  ].map((i) => (
                    <div
                      key={i.l}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                        i.a ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70'
                      }`}
                    >
                      <span>{i.l}</span>
                      <span className="text-xs">{i.n}</span>
                    </div>
                  ))}
                </div>

                {/* Conversation list */}
                <div className="border-r p-3 space-y-2">
                  {[
                    { n: 'Rohan Mehta', m: 'Yes please send pricing!', t: '2m', u: 2, t2: 'Hot Lead' },
                    { n: 'Priya Sharma', m: 'Booking confirmed ✅', t: '8m', t2: 'Customer' },
                    { n: 'Anand K.', m: 'Need API docs', t: '15m', u: 1 },
                    { n: 'Sara Lee', m: 'Thanks for the demo!', t: '1h', t2: 'Demo Done' },
                    { n: 'Vikram J.', m: 'Interested in Pro plan', t: '2h' },
                  ].map((c, i) => (
                    <div key={i} className={`flex gap-3 p-3 rounded-xl ${i === 0 ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/40'}`}>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-emerald-500/30 flex items-center justify-center text-xs font-semibold text-primary">
                        {c.n[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm truncate">{c.n}</div>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{c.t}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{c.m}</div>
                        <div className="flex gap-1.5 mt-1.5">
                          {c.t2 && <Badge variant="outline" className="text-[9px] py-0 h-4 px-1.5">{c.t2}</Badge>}
                          {c.u && <Badge className="text-[9px] py-0 h-4 px-1.5 bg-primary text-primary-foreground">{c.u}</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right context panel */}
                <div className="p-5 bg-muted/20 space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-500 mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">R</div>
                    <div className="font-semibold">Rohan Mehta</div>
                    <div className="text-xs text-muted-foreground">+91 98xxx xxxxx</div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Source</span><Badge variant="outline" className="text-[10px]">Meta Ads</Badge></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Stage</span><span className="font-medium">Hot Lead 🔥</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Owner</span><span className="font-medium">Sales · Aman</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Score</span><span className="font-medium text-primary">92 / 100</span></div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">AI Suggested Reply</div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
                      "Sharing the pricing PDF + booking link now. Best time for a quick call?"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. TOP FEATURES ============ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Top Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">close more deals</span>
            </h2>
            <p className="text-lg text-muted-foreground">10 powerful tools, one premium platform built for growing businesses.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 group-hover:to-primary/10 transition-all" />
                <CardContent className="relative p-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1.5 text-[15px]">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. WHY AIREATRO (compare) ============ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Why Aireatro</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              The smarter, more affordable{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">WhatsApp CRM</span>
            </h2>
            <p className="text-lg text-muted-foreground">See how we stack up against legacy WhatsApp tools.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="border-border/60 bg-card/50">
              <CardContent className="p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-muted-foreground">Other Tools</h3>
                </div>
                <ul className="space-y-3.5">
                  {compareOthers.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-red-500/70 mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-emerald-500/5 shadow-xl shadow-primary/10">
              <div className="absolute -top-3 left-7">
                <Badge className="bg-primary text-primary-foreground shadow-lg">Aireatro</Badge>
              </div>
              <CardContent className="p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Aireatro</h3>
                </div>
                <ul className="space-y-3.5">
                  {compareUs.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="font-medium">{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={goSignup} className="h-12 px-8 shadow-lg shadow-primary/20">
              Start Free Setup <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ============ 5. HOW IT WORKS ============ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="secondary" className="mb-4">Onboarding</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Live in <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">6 simple steps</span>
            </h2>
            <p className="text-lg text-muted-foreground">From signup to growing 5X — all in under 10 minutes.</p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="hidden lg:block absolute top-12 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {steps.map((s) => (
                <div key={s.n} className="relative text-center group">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <s.icon className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-primary text-[10px] font-bold flex items-center justify-center text-primary">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. AUTOMATION FLOW ============ */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <Badge variant="secondary" className="mb-4">Automation</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
                Automate sales & support{' '}
                <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">24/7</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Build powerful workflows visually — auto-replies, lead routing, tagging, follow-ups, campaign triggers and more. No coding required.
              </p>
              <div className="space-y-3">
                {[
                  { i: Bot, t: 'Instant auto-replies & smart greetings' },
                  { i: Repeat, t: 'Round-robin lead routing to agents' },
                  { i: Tag, t: 'Automatic tagging by intent & source' },
                  { i: Clock, t: 'Time-based follow-up sequences' },
                  { i: Megaphone, t: 'Trigger campaigns from any event' },
                ].map(({ i: Ic, t }) => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Ic className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
              <Button onClick={goSignup} className="mt-8 h-12 px-7">
                Try Automation Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Flow visual */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-primary/20 to-emerald-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-card border rounded-2xl p-6 shadow-2xl space-y-4">
                {[
                  { i: MessageCircle, t: 'New WhatsApp Message', s: 'Trigger', c: 'bg-blue-500/10 text-blue-500' },
                  { i: Bot, t: 'AI Detects Intent', s: 'Sales Inquiry · 94% confidence', c: 'bg-purple-500/10 text-purple-500' },
                  { i: Tag, t: 'Tag as "Hot Lead"', s: 'Action', c: 'bg-orange-500/10 text-orange-500' },
                  { i: Repeat, t: 'Assign to Aman (Sales)', s: 'Round-robin', c: 'bg-primary/10 text-primary' },
                  { i: Send, t: 'Send Pricing Template', s: '✓ Delivered', c: 'bg-emerald-500/10 text-emerald-500' },
                ].map((node, idx, arr) => (
                  <div key={idx}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background border hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${node.c}`}>
                        <node.i className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{node.t}</div>
                        <div className="text-xs text-muted-foreground">{node.s}</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-4 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 7. TEAM MANAGEMENT ============ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Visual first on desktop */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/10 to-primary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="font-semibold">Team Performance · Today</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Live</Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { n: 'Aman G.', l: 42, r: '1.2 min', s: 96 },
                    { n: 'Priya S.', l: 38, r: '2.1 min', s: 91 },
                    { n: 'Rohan M.', l: 31, r: '0.8 min', s: 88 },
                    { n: 'Sara K.', l: 28, r: '3.4 min', s: 82 },
                  ].map((m) => (
                    <div key={m.n} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center font-semibold text-xs">
                        {m.n[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{m.n}</div>
                        <div className="text-xs text-muted-foreground">{m.l} leads · {m.r} avg reply</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{m.s}</div>
                        <div className="text-[10px] text-muted-foreground">SCORE</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">Team Inbox</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">
                Manage your entire team{' '}
                <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">from one inbox</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Multi-agent inbox with intelligent lead rotation, custom assignment rules, performance tracking and private internal notes.
              </p>
              <div className="space-y-3">
                {[
                  'Multi-agent shared WhatsApp inbox',
                  'Round-robin & rule-based lead routing',
                  'Real-time performance dashboards',
                  'Private internal notes & mentions',
                  'Granular role-based permissions',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. FACEBOOK + LEAD INTEGRATION ============ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.2),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">Meta Ads Integration</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Turn every Facebook lead into a{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">WhatsApp conversation</span>
            </h2>
            <p className="text-lg text-slate-300">Auto-capture leads from Facebook & Instagram ads, instantly engage on WhatsApp, sync everything to CRM.</p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 md:gap-2 items-center">
            {[
              { i: Facebook, t: 'Facebook Lead Ad', d: 'Instant lead capture', c: 'from-blue-500 to-blue-700' },
              { i: Zap, t: 'Aireatro CRM', d: 'Auto-sync & tag', c: 'from-primary to-emerald-500' },
              { i: MessageCircle, t: 'WhatsApp Reply', d: 'Within 30 seconds', c: 'from-emerald-500 to-emerald-700' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.t}>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${s.c} flex items-center justify-center mb-4 shadow-xl`}>
                    <s.i className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{s.t}</h3>
                  <p className="text-sm text-slate-400">{s.d}</p>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="hidden md:block w-6 h-6 text-primary mx-auto" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={goSignup} className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)]">
              Connect WhatsApp API <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ============ 9. TESTIMONIALS / TRUST ============ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
            {stats.map((s) => (
              <div key={s.l} className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-1">{s.v}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-4">Trusted by 10,000+ businesses</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Loved by founders, agencies <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">& sales teams</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/60 hover:shadow-xl hover:-translate-y-1 transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center font-semibold">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 11. FAQ ============ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                Got <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">questions?</span>
              </h2>
              <p className="text-lg text-muted-foreground">Everything you need to know to get started.</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border bg-card rounded-xl px-5 data-[state=open]:border-primary/40 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ============ 12. FINAL CTA ============ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.3),transparent_60%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Start free in under 10 minutes
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Ready to scale your business{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">on WhatsApp?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Start using Aireatro today and automate your customer communication, sales and support — all on the official WhatsApp API.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                size="lg"
                onClick={goSignup}
                className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_50px_-5px_hsl(var(--primary)/0.7)] hover:shadow-[0_0_70px_-5px_hsl(var(--primary)/0.9)] hover:scale-[1.02] transition-all"
              >
                Start Free Setup
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={goDemo}
                className="h-14 px-8 text-base font-semibold border-2 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:border-white/50 backdrop-blur-sm"
              >
                Book Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Free forever plan</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t p-3 flex gap-2 shadow-2xl">
        <Button onClick={goDemo} variant="outline" className="flex-1 h-11">Book Demo</Button>
        <Button onClick={goSignup} className="flex-1 h-11 shadow-lg shadow-primary/30">
          Start Free <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="lg:hidden h-20" /> {/* spacer for sticky CTA */}

      <Footer />
    </div>
  );
};

export default WhatsAppBusinessApi;
