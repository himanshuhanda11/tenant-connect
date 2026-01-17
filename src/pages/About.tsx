import { 
  MessageSquare, 
  Users, 
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  TrendingUp,
  Brain,
  GitBranch,
  Eye,
  Activity,
  XCircle,
  Building2,
  GraduationCap,
  Landmark,
  ShoppingBag,
  Briefcase,
  Globe,
  Lock,
  Server,
  FileText,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';

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
    {
      icon: Brain,
      title: 'AI-First by Design',
      description: 'AI is not an add-on. It is built into flows, inbox, analytics, and growth decisions.'
    },
    {
      icon: Activity,
      title: 'Diagnostics Everywhere',
      description: 'From flows to agents to integrations — AiReatro highlights issues automatically.'
    },
    {
      icon: Target,
      title: 'True Attribution',
      description: 'Meta Ads → WhatsApp → Flow → Agent → Conversion. No blind spots.'
    },
    {
      icon: BarChart3,
      title: 'Insights, Not Just Analytics',
      description: 'We do not show charts. We explain outcomes.'
    },
    {
      icon: Shield,
      title: 'Enterprise-Ready from Day One',
      description: 'Built for teams, scale, and reliability — not hacks.'
    },
    {
      icon: Eye,
      title: 'Clean, Calm UX',
      description: 'Designed for daily use. No clutter. No confusion.'
    }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Shared Team Inbox',
      description: 'With SLA tracking & AI intent detection'
    },
    {
      icon: GitBranch,
      title: 'Visual Flow Builder',
      description: 'With diagnostics, heatmaps & versioning'
    },
    {
      icon: FileText,
      title: 'WhatsApp Forms',
      description: 'Inside chat — no external links needed'
    },
    {
      icon: TrendingUp,
      title: 'Meta Ads Attribution',
      description: 'Complete growth analytics & ROI tracking'
    },
    {
      icon: Zap,
      title: 'One-Click Integrations',
      description: 'With health monitoring & retry logic'
    },
    {
      icon: Lightbulb,
      title: 'AI Insights Engine',
      description: 'Recommendations that fix problems automatically'
    }
  ];

  const industries = [
    { icon: TrendingUp, name: 'Growth & Marketing teams' },
    { icon: Users, name: 'Sales & Support operations' },
    { icon: ShoppingBag, name: 'eCommerce & D2C brands' },
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
    <div className="min-h-screen bg-white">
      <SEO
        title="About AiReatro | AI-Powered WhatsApp Cloud API Platform"
        description="AiReatro is an AI-powered WhatsApp Cloud API platform designed to help businesses understand what's working, fix what's broken, and grow conversations into revenue."
        canonical="/about"
        keywords={['about AiReatro', 'WhatsApp API platform', 'AI WhatsApp automation', 'WhatsApp business platform']}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-white">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              About AiReatro
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Built to Make WhatsApp</span>{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">Smarter — Not Noisier.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-4 leading-relaxed">
              AiReatro is an AI-powered WhatsApp Cloud API platform designed to help businesses 
              understand what's working, fix what's broken, and grow conversations into revenue.
            </p>
            
            <p className="text-base text-slate-500 max-w-2xl mx-auto mb-10">
              We don't just automate messages. We bring clarity, diagnostics, and intelligence 
              to the most important customer channel.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button size="lg" className="h-14 px-8 text-base font-medium" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium border-slate-300" asChild>
                <Link to="/contact">
                  Book a Demo
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-slate-500">
              No credit card required • Setup in minutes • Built on WhatsApp Cloud API
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our <span className="text-primary">Mission</span>
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6">
                WhatsApp has become the most powerful customer communication channel — but most 
                businesses still operate it <span className="font-semibold text-slate-900">blindly</span>.
              </p>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6">
                <span className="text-primary font-semibold">AiReatro exists to change that.</span>
              </p>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Our mission is to help teams <span className="font-semibold text-slate-900">see clearly</span>, 
                <span className="font-semibold text-slate-900"> act faster</span>, and 
                <span className="font-semibold text-slate-900"> grow smarter</span> on WhatsApp 
                using AI-driven insights, diagnostics, and automation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Before/After */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                The Problem with <span className="text-primary">Most WhatsApp Platforms</span>
              </h2>
              <p className="text-lg text-slate-600">
                Traditional platforms leave you guessing. AiReatro gives you answers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    Before
                  </h3>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {problemBefore.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                          <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-emerald-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    After AiReatro
                  </h3>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {problemAfter.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{item}</span>
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
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <Badge className="mb-6 bg-white/10 text-white border-white/20">
                Why AiReatro
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why AiReatro Is <span className="text-primary">Different</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Not just another WhatsApp tool. A complete intelligence platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {differentiators.map((item, index) => (
                <Card 
                  key={index} 
                  className="border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We've Built Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                A Platform Built for <span className="text-primary">Clarity and Growth</span>
              </h2>
              <p className="text-lg text-slate-600">
                Everything you need to turn WhatsApp conversations into revenue
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-slate-100 bg-white hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Build For */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Who AiReatro Is <span className="text-primary">Built For</span>
              </h2>
              <p className="text-lg text-slate-600">
                If WhatsApp is critical to your business — AiReatro is built for you.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <industry.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-slate-800 font-medium">{industry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Scale Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise Ready
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Built to <span className="text-primary">Scale with You</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                From startup to enterprise, AiReatro grows with your business
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12">
              <div className="grid sm:grid-cols-2 gap-4">
                {trustPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <point.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white font-medium">{point.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Our <span className="text-primary">Vision</span>
            </h2>
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-primary/10">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6">
                We believe the future of customer communication is 
                <span className="font-semibold text-primary"> intelligent</span>, 
                <span className="font-semibold text-primary"> measurable</span>, and 
                <span className="font-semibold text-primary"> human-friendly</span>.
              </p>
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
                AiReatro is building the intelligence layer for WhatsApp — where every 
                conversation becomes a growth signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10M+</div>
              <div className="text-slate-600">Messages/Month</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-slate-600">Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-slate-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-slate-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to See WhatsApp Clearly?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using AiReatro to grow faster with WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-primary hover:bg-white/90 shadow-xl" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/contact">
                Book a Demo
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/60">
            No credit card required • Setup in minutes • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
