import {
  MessageSquare, Users, Zap, Target, BarChart3, ArrowRight,
  Sparkles, Shield, Brain, Eye, Lock, Server,
  Rocket, Heart, Layers, Globe, Inbox, Megaphone,
  Workflow, Award, CheckCircle2, PlayCircle, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import aboutHero from '@/assets/about-hero.png';

const trustBadges = [
  { icon: Users, label: '2,000+ Businesses' },
  { icon: Shield, label: 'Official WhatsApp API' },
  { icon: Sparkles, label: 'Zero Platform Fee' },
  { icon: Brain, label: 'AI-Powered Automation' },
];

const timeline = [
  {
    year: '2023',
    title: 'The Spark',
    body: 'Founders watched small businesses lose leads daily because WhatsApp was fragmented across phones, spreadsheets and unreliable tools.',
    icon: Sparkles,
  },
  {
    year: '2024',
    title: 'Built on Official API',
    body: 'Aireatro launched on the official WhatsApp Business Cloud API — bringing enterprise reliability to teams of every size.',
    icon: Shield,
  },
  {
    year: '2025',
    title: 'AI-Native CRM',
    body: 'We rebuilt the inbox around automation: AI replies, smart routing, lead qualification and conversation analytics in one place.',
    icon: Brain,
  },
  {
    year: '2026',
    title: 'Trusted Globally',
    body: 'Today thousands of businesses across 30+ countries run their customer conversations on Aireatro — with zero monthly platform fees.',
    icon: Globe,
  },
];

const features = [
  { icon: MessageSquare, title: 'Official WhatsApp Cloud API', body: 'Direct Meta integration — no middlemen, no risk.' },
  { icon: Inbox, title: 'Team Inbox', body: 'Every chat, every agent, one collaborative workspace.' },
  { icon: Users, title: 'CRM & Lead Management', body: 'Capture, qualify, assign and close — natively on WhatsApp.' },
  { icon: Brain, title: 'AI Automation', body: 'Smart replies, qualification and routing powered by modern LLMs.' },
  { icon: Megaphone, title: 'Bulk & Broadcast', body: 'Send templates to thousands with audience segmentation.' },
  { icon: BarChart3, title: 'Analytics & Reports', body: 'Funnel, agent and campaign metrics in real time.' },
  { icon: Sparkles, title: 'Zero Platform Fee', body: 'Pay Meta directly. No hidden markups, ever.' },
  { icon: Workflow, title: 'Multi-Agent Routing', body: 'Round-robin, ownership and 24h window — handled.' },
  { icon: Rocket, title: 'Fast Setup', body: 'Live on the WhatsApp API in under 10 minutes.' },
  { icon: Server, title: 'Scalable Infrastructure', body: 'Built on cloud-native systems trusted by enterprises.' },
];

const stats = [
  { value: '2,000+', label: 'Businesses' },
  { value: '10M+', label: 'Messages Processed' },
  { value: '< 10 min', label: 'Average Setup' },
  { value: '99.9%', label: 'Infra Reliability' },
];

const steps = [
  { n: '01', icon: MessageSquare, title: 'Connect WhatsApp Business', body: 'Link your number through Meta in minutes — fully official, fully compliant.' },
  { n: '02', icon: Brain, title: 'Automate Conversations & Leads', body: 'Deploy AI replies, flows, qualification and routing without writing code.' },
  { n: '03', icon: Rocket, title: 'Scale Customer Engagement', body: 'Broadcast, analyze and convert — across teams, regions and campaigns.' },
];

const values = [
  { icon: Sparkles, title: 'Innovation', body: 'AI-first thinking in every feature we ship.' },
  { icon: Heart, title: 'Simplicity', body: 'Powerful tools that feel effortless to use.' },
  { icon: Award, title: 'Customer Success', body: 'Your growth is the metric we measure.' },
  { icon: Eye, title: 'Transparency', body: 'Honest pricing. Zero hidden platform fees.' },
  { icon: Lock, title: 'Security', body: 'Encryption, RLS and Meta-grade compliance.' },
  { icon: Layers, title: 'Reliability', body: 'Cloud-native infra engineered for uptime.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoMeta
        route="/about"
        fallbackTitle="About Aireatro — Building the Future of Business Communication"
        fallbackDescription="Aireatro helps businesses automate conversations, manage leads and grow faster on the official WhatsApp Business API."
      />
      <Navbar />

      {/* HERO */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden">
        {/* gradient mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute top-10 -right-32 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

          <div className="max-w-5xl mx-auto text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/60 backdrop-blur-md text-xs font-medium text-muted-foreground animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              About Aireatro
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-in">
              Building the Future of{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-primary to-emerald-500 bg-clip-text text-transparent">
                Business Communication
              </span>{' '}
              on WhatsApp
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Aireatro helps businesses automate conversations, manage leads and grow faster
              using official WhatsApp Business APIs, CRM automation and AI-powered workflows.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-primary hover:opacity-95 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)]">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-12 px-8 backdrop-blur-md bg-card/60">
                  <PlayCircle className="mr-2 h-4 w-4" /> Book a Demo
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-md text-xs font-medium text-foreground/80">
                  <Icon className="h-3.5 w-3.5 text-emerald-500" />
                  {label}
                </div>
              ))}
            </div>

            {/* floating dashboard mock */}
            <div className="relative mt-16 max-w-4xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-primary/30 to-emerald-500/30 rounded-3xl blur-2xl opacity-60" />
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-2 shadow-2xl">
                <img src={aboutHero} alt="Aireatro WhatsApp CRM dashboard" loading="lazy" className="rounded-xl w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">Our Story</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              From scattered chats to a {' '}
              <span className="bg-gradient-to-r from-emerald-500 to-primary bg-clip-text text-transparent">unified growth engine</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              We built Aireatro because we kept watching ambitious teams lose customers in chaotic
              WhatsApp threads. Sticky notes, shared phones, screenshots — and no way to measure
              what worked. So we engineered the platform we wished existed.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* gradient timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent md:-translate-x-1/2" />

            <div className="space-y-12">
              {timeline.map((t, i) => (
                <div key={t.year} className={`relative md:grid md:grid-cols-2 md:gap-12 items-center ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                  <div className={`pl-12 md:pl-0 ${i % 2 ? 'md:text-left' : 'md:text-right'}`}>
                    <div className="inline-flex flex-col gap-3 p-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md hover:border-primary/40 transition-all group">
                      <div className={`flex items-center gap-3 ${i % 2 ? '' : 'md:flex-row-reverse'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <t.icon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-sm font-semibold text-primary">{t.year}</span>
                      </div>
                      <h3 className="text-xl font-bold">{t.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
                    </div>
                  </div>
                  {/* dot */}
                  <div className="absolute left-4 md:left-1/2 top-6 w-3 h-3 rounded-full bg-primary ring-4 ring-background md:-translate-x-1/2" />
                  <div className="hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[
              { tag: 'Mission', icon: Target, title: 'Make official WhatsApp automation accessible.', body: 'Powerful, affordable and simple — for every business, not just enterprises.', glow: 'from-emerald-500/30 to-primary/30' },
              { tag: 'Vision', icon: Rocket, title: 'The most trusted business communication platform globally.', body: 'A world where every customer conversation is intelligent, instant and measurable.', glow: 'from-primary/30 to-emerald-500/30' },
            ].map((c) => (
              <div key={c.tag} className="relative group">
                <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${c.glow} opacity-60 blur-xl group-hover:opacity-100 transition-opacity`} />
                <div className="relative h-full rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-lg">
                      <c.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{c.tag}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">{c.title}</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY BUSINESSES CHOOSE */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">Why Aireatro</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything you need. Nothing you don't.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              An end-to-end WhatsApp growth stack — engineered for speed, scale and clarity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-primary/0 group-hover:from-emerald-500/5 group-hover:to-primary/10 transition-all" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/15 to-primary/15 border border-border/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / STATS */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="relative max-w-6xl mx-auto rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-br from-background via-card to-background p-10 md:p-16">
            <div className="absolute inset-0 -z-0">
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            </div>
            <div className="relative text-center mb-10">
              <Badge variant="outline" className="mb-4">Trusted at scale</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Built for serious growth</h2>
            </div>
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md hover:border-primary/40 transition-colors">
                  <div className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-emerald-400 to-primary bg-clip-text text-transparent">{s.value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">How it works</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Live in minutes. Scale for years.</h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* connector */}
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-3xl border border-border/60 bg-card/70 backdrop-blur-md p-8 hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <s.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-5xl font-bold text-foreground/10">{s.n}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">Our values</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The principles behind every line of code.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-7 hover:border-primary/40 transition-all">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/15 to-primary/15 flex items-center justify-center mb-4">
                  <v.icon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 opacity-60 blur-2xl" />
            <div className="relative rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/60 text-xs font-medium mb-6">
                  <Star className="h-3 w-3 text-emerald-500" /> Loved by 2,000+ businesses
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
                  Ready to transform your business communication?
                </h2>
                <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Start using official WhatsApp API with automation, CRM tools, AI workflows
                  and team collaboration — all inside Aireatro.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/auth">
                    <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-primary hover:opacity-95 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.7)]">
                      Start Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="h-12 px-8 backdrop-blur-md bg-card/60">
                      Contact Us
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card required</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Setup in &lt; 10 min</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Official WhatsApp API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
