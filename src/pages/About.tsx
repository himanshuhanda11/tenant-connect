import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Zap,
  Target,
  BarChart3,
  Tags,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  TrendingUp,
  Clock,
  Brain,
  GitBranch,
  Megaphone,
  UserCheck,
  Eye,
  History,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function About() {
  const whatWeDo = [
    { icon: MessageSquare, text: 'Shared team inbox for faster responses' },
    { icon: GitBranch, text: 'Visual automation flows' },
    { icon: Megaphone, text: 'Meta Ads to WhatsApp integration' },
    { icon: BarChart3, text: 'Real-time analytics and insights' },
    { icon: Users, text: 'Built for teams and scale' },
  ];

  const differentiators = [
    {
      icon: Activity,
      title: 'Diagnostics Everywhere',
      description: 'Flow health, inbox metrics, and ad performance — all with built-in diagnostics.'
    },
    {
      icon: Brain,
      title: 'AI Insights, Not Raw Numbers',
      description: 'Get actionable recommendations instead of overwhelming data dumps.'
    },
    {
      icon: TrendingUp,
      title: 'Clear Attribution',
      description: 'Track the complete journey from Ads → Flows → Agents → Conversions.'
    },
    {
      icon: Eye,
      title: 'Clean, Calm UI',
      description: 'Designed for daily use without cognitive overload or unnecessary complexity.'
    },
    {
      icon: Sparkles,
      title: 'Pro Features That Matter',
      description: 'Unlock real business value with advanced capabilities when you need them.'
    },
    {
      icon: Clock,
      title: 'Setup in Minutes',
      description: 'Templates and guided onboarding that get you productive fast.'
    },
  ];

  const pillars = [
    {
      icon: MessageSquare,
      title: 'Inbox & Team Collaboration',
      features: [
        'Shared inbox with smart assignment',
        'SLA tracking & response time goals',
        'AI intent detection (Sales/Support/Urgent)',
        'Internal notes & @mentions',
        'Supervisor shadow mode'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: GitBranch,
      title: 'Flows & Automations',
      features: [
        'Drag-and-drop visual builder',
        'Sales & support templates',
        'Multi-trigger flows (keyword, QR, ads)',
        'Flow diagnostics & health score',
        'Version history (Pro)'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Megaphone,
      title: 'Meta Ads & Growth',
      features: [
        'Meta Ads → WhatsApp integration',
        'Lead quality scoring with AI',
        'Ad-to-flow journey preview',
        'Conversion attribution tracking',
        'ROI dashboard'
      ],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Tags,
      title: 'Contacts & Profiles',
      features: [
        '360° customer profiles',
        'Dynamic tags & segments',
        'Engagement scoring',
        'Lifecycle tracking',
        'Consent & opt-out management'
      ],
      color: 'from-green-500 to-emerald-500'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Clean, Minimal, White */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-white">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Smarter Conversations.</span>
              <br />
              <span className="text-primary">Powered by AI.</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              AiReatro Communications helps businesses automate WhatsApp conversations, manage teams, 
              track growth, and convert leads using AI — all from one clean platform.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button size="lg" className="h-14 px-8 text-base font-medium" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium" asChild>
                <Link to="/contact">
                  Book a Demo
                </Link>
              </Button>
            </div>
            
            {/* Trust line */}
            <p className="text-sm text-slate-500">
              No credit card required • Setup in minutes • Built on WhatsApp Cloud API
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: What We Do */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                One Platform. <span className="text-primary">Every WhatsApp Workflow.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                AiReatro Communications is built to help businesses turn WhatsApp into a powerful 
                sales, support, and growth channel — not just a messaging tool.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {whatWeDo.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-slate-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Why AiReatro is Different */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Built Beyond <span className="text-primary">Basic Automation</span>
              </h2>
              <p className="text-lg text-slate-600">
                What makes AiReatro different from everything else out there
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {differentiators.map((item, index) => (
                <Card 
                  key={index} 
                  className="border-slate-100 bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Product Pillars */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                The Four Pillars of <span className="text-primary">AiReatro</span>
              </h2>
              <p className="text-lg text-slate-600">
                Everything you need to turn WhatsApp into your #1 growth channel
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {pillars.map((pillar, index) => (
                <Card 
                  key={index} 
                  className="border-slate-100 bg-white overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${pillar.color} p-6`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <pillar.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-xl text-white">{pillar.title}</h3>
                      </div>
                    </div>
                    
                    {/* Features list */}
                    <div className="p-6">
                      <ul className="space-y-3">
                        {pillar.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-slate-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-slate-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Enterprise Ready
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Built for Scale. <span className="text-primary">Secured by Design.</span>
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              SOC 2 compliant infrastructure, role-based access control, audit logs, 
              and end-to-end encryption. Your data is protected at every level.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Meta Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your <span className="text-primary">WhatsApp Game?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using AiReatro to grow faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-base font-medium" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-base font-medium border-slate-600 text-white hover:bg-slate-800" 
              asChild
            >
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
