import { 
  MessageSquare, Users, Zap, Target, BarChart3, ArrowRight,
  CheckCircle2, Sparkles, Shield, TrendingUp, Brain, GitBranch,
  Eye, Activity, XCircle, Building2, GraduationCap, Landmark,
  ShoppingBag, Briefcase, Globe, Lock, Server, FileText, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import aboutHero from '@/assets/about-hero.png';
import aboutProblem from '@/assets/about-problem.png';
import aboutVision from '@/assets/about-vision.png';

export default function About() {
  const problemBefore = [
    'Messages sent, but no clarity',
    'Flows running, but no optimization',
    'Dashboards full of numbers, no answers',
    'No idea which ad, flow, or agent converted'
  ];

  const problemAfter = [
    'AI explains what is broken',
    'Flow health & drop-off visibility',
    'End-to-end attribution',
    'Confident decisions, not guesswork'
  ];

  const differentiators = [
    { icon: Brain, title: 'AI-First by Design', description: 'AI is built into flows, inbox, analytics, and growth decisions.' },
    { icon: Activity, title: 'Diagnostics Everywhere', description: 'From flows to agents to integrations — issues highlighted automatically.' },
    { icon: Target, title: 'True Attribution', description: 'Meta Ads → WhatsApp → Flow → Agent → Conversion. No blind spots.' },
    { icon: BarChart3, title: 'Insights, Not Just Analytics', description: 'We do not show charts. We explain outcomes.' },
    { icon: Shield, title: 'Enterprise-Ready', description: 'Built for teams, scale, and reliability — not hacks.' },
    { icon: Eye, title: 'Clean, Calm UX', description: 'Designed for daily use. No clutter. No confusion.' }
  ];

  const features = [
    { icon: MessageSquare, title: 'Shared Team Inbox', description: 'With SLA tracking & AI intent detection' },
    { icon: GitBranch, title: 'Visual Flow Builder', description: 'With diagnostics, heatmaps & versioning' },
    { icon: FileText, title: 'WhatsApp Forms', description: 'Inside chat — no external links needed' },
    { icon: TrendingUp, title: 'Meta Ads Attribution', description: 'Complete growth analytics & ROI tracking' },
    { icon: Zap, title: 'One-Click Integrations', description: 'With health monitoring & retry logic' },
    { icon: Lightbulb, title: 'AI Insights Engine', description: 'Recommendations that fix problems automatically' }
  ];

  const industries = [
    { icon: TrendingUp, name: 'Growth & Marketing' },
    { icon: Users, name: 'Sales & Support' },
    { icon: ShoppingBag, name: 'eCommerce & D2C' },
    { icon: Landmark, name: 'Fintech & Insurance' },
    { icon: GraduationCap, name: 'Education & Services' },
    { icon: Briefcase, name: 'Enterprise & Startups' }
  ];

  const trustPoints = [
    { icon: Globe, text: 'Powered by Official WhatsApp Cloud API' },
    { icon: Lock, text: 'Secure, compliant infrastructure' },
    { icon: Users, text: 'Multi-workspace & role-based access' },
    { icon: FileText, text: 'Audit logs & operational visibility' },
    { icon: Server, text: 'Designed for startups → enterprises' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/about" fallbackTitle="About AiReatro" fallbackDescription="AI-powered WhatsApp Cloud API platform" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 overflow-hidden bg-background">
        <div className="absolute top-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 sm:w-80 h-48 sm:h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-4 sm:mb-6" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2" />
                About AiReatro
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-foreground">
                Built to Make WhatsApp{' '}
                <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  Smarter — Not Noisier.
                </span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 sm:mb-6 leading-relaxed">
                AiReatro is an AI-powered WhatsApp Cloud API platform designed to help businesses 
                understand what's working, fix what's broken, and grow conversations into revenue.
              </p>
              
              <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4">
                <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base" asChild>
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-border" asChild>
                  <Link to="/contact">Book a Demo</Link>
                </Button>
              </div>
              
              <p className="text-xs sm:text-sm text-muted-foreground">
                No credit card required • Setup in minutes • Official Cloud API
              </p>
            </div>

            {/* Hero Image */}
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md shrink-0">
              <img src={aboutHero} alt="Team collaboration on WhatsApp platform" className="w-full h-auto rounded-2xl" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our <span className="text-primary">Mission</span>
              </h2>
            </div>
            
            <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg border border-border">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                WhatsApp has become the most powerful customer communication channel — but most 
                businesses still operate it <span className="font-semibold text-foreground">blindly</span>.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                <span className="text-primary font-semibold">AiReatro exists to change that.</span>
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Our mission is to help teams <span className="font-semibold text-foreground">see clearly</span>, 
                <span className="font-semibold text-foreground"> act faster</span>, and 
                <span className="font-semibold text-foreground"> grow smarter</span> on WhatsApp 
                using AI-driven insights, diagnostics, and automation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Before/After */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                The Problem with <span className="text-primary">Most WhatsApp Platforms</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Traditional platforms leave you guessing. AiReatro gives you answers.
              </p>
            </div>

            {/* Illustration */}
            <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
              <img src={aboutProblem} alt="Before and after transformation" className="w-full rounded-2xl" loading="lazy" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Before */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-destructive to-destructive/80 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-destructive-foreground flex items-center gap-2">
                    <XCircle className="w-5 sm:w-6 h-5 sm:h-6" />
                    Before
                  </h3>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <ul className="space-y-3 sm:space-y-4">
                    {problemBefore.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                        </div>
                        <span className="text-sm sm:text-base text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-emerald-600 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-5 sm:w-6 h-5 sm:h-6" />
                    After AiReatro
                  </h3>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <ul className="space-y-3 sm:space-y-4">
                    {problemAfter.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <span className="text-sm sm:text-base text-foreground font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 sm:mb-6 bg-background/10 text-background border-background/20 text-xs sm:text-sm">
                Why AiReatro
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-background">
                Why AiReatro Is <span className="text-primary">Different</span>
              </h2>
              <p className="text-sm sm:text-base text-background/60 max-w-2xl mx-auto">
                Not just another WhatsApp tool. A complete intelligence platform.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {differentiators.map((item, index) => (
                <Card 
                  key={index} 
                  className="border-0 bg-background/5 backdrop-blur-sm hover:bg-background/10 transition-all duration-300 group"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-lg text-background mb-1 sm:mb-2">{item.title}</h3>
                    <p className="text-background/50 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We've Built Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                A Platform Built for <span className="text-primary">Clarity and Growth</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Everything you need to turn WhatsApp conversations into revenue
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-lg text-foreground mb-1 sm:mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Build For */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Who AiReatro Is <span className="text-primary">Built For</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                If WhatsApp is critical to your business — AiReatro is built for you.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {industries.map((industry, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <industry.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <span className="text-foreground font-medium text-xs sm:text-base">{industry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Scale Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                <Shield className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2" />
                Enterprise Ready
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Built to <span className="text-primary">Scale with You</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                From startup to enterprise, AiReatro grows with your business
              </p>
            </div>

            <div className="bg-foreground rounded-2xl p-4 sm:p-8 md:p-12">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {trustPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-background/5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <point.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-background font-medium text-xs sm:text-sm">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 to-accent/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                  Our <span className="text-primary">Vision</span>
                </h2>
                <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-primary/10">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    We believe the future of customer communication is 
                    <span className="font-semibold text-primary"> intelligent</span>, 
                    <span className="font-semibold text-primary"> measurable</span>, and 
                    <span className="font-semibold text-primary"> human-friendly</span>.
                  </p>
                  <p className="text-base sm:text-lg text-foreground leading-relaxed font-medium">
                    AiReatro is building the intelligence layer for WhatsApp — where every 
                    conversation becomes a growth signal.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-xs sm:max-w-sm shrink-0">
                <img src={aboutVision} alt="Vision for WhatsApp intelligence" className="w-full rounded-2xl" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-14 bg-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { value: '10M+', label: 'Messages/Month' },
              { value: '2,500+', label: 'Businesses' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '50+', label: 'Countries' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 sm:py-20 md:py-24 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-background/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-foreground/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
            Ready to See WhatsApp Clearly?
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-primary-foreground/80 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using AiReatro to grow faster with WhatsApp.
          </p>
          <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg bg-background text-primary hover:bg-background/90 shadow-xl" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Link>
            </Button>
            <button
              className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-lg border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-medium rounded-xl transition-colors"
              onClick={() => window.location.href = '/contact'}
            >
              Book a Demo
            </button>
          </div>
          <p className="text-xs sm:text-sm text-primary-foreground/60">
            No credit card required • Setup in minutes • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
