import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MousePointer, 
  Zap, 
  BarChart3, 
  Target, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Workflow,
  FileText,
  Megaphone,
  QrCode,
  Globe,
  Users,
  Link2,
  Settings,
  HeartHandshake,
  Shield,
  Lock,
  RefreshCw,
  ClipboardList,
  MessageCircle,
  TrendingUp,
  Sparkles,
  Clock,
  Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/seo/JsonLd';

const ClickToWhatsApp = () => {
  const navigate = useNavigate();

  const differentiators = [
    {
      icon: Zap,
      title: 'Instant Conversations',
      description: 'Open WhatsApp in one click from ads, websites, emails, or QR codes.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      icon: Target,
      title: 'Full Attribution',
      description: 'Track clicks from Meta Ads → WhatsApp → Flow → Agent → Conversion.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Brain,
      title: 'AI Intent Detection',
      description: 'AI identifies high-intent leads instantly and prioritizes them.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Workflow,
      title: 'Smart Routing & Automation',
      description: 'Auto-start flows, assign agents, or trigger WhatsApp Forms based on entry source.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: BarChart3,
      title: 'Click & Conversation Analytics',
      description: 'See which links, ads, or campaigns convert — not just who clicked.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Plug,
      title: 'Integrations Ready',
      description: 'Send click data to CRM, analytics, and automation tools via webhooks.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    }
  ];

  const useCases = [
    {
      icon: Megaphone,
      title: 'Meta Click-to-WhatsApp Ads',
      description: 'Capture and qualify ad leads instantly.'
    },
    {
      icon: Globe,
      title: 'Website CTA Buttons',
      description: 'Replace forms with instant WhatsApp conversations.'
    },
    {
      icon: QrCode,
      title: 'QR Codes (Offline → Online)',
      description: 'Stores, events, packaging, posters.'
    },
    {
      icon: HeartHandshake,
      title: 'Sales & Support Links',
      description: 'Direct customers to the right team automatically.'
    },
    {
      icon: Link2,
      title: 'Campaign-Specific Links',
      description: 'Track performance by source, campaign, or medium.'
    },
    {
      icon: Settings,
      title: 'Personalized Entry Points',
      description: 'Pre-filled messages, language, and flows.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create a Click to WhatsApp link or QR',
      description: 'Generate trackable links with custom parameters and pre-filled messages.',
      icon: Link2
    },
    {
      number: '02',
      title: 'Share it on ads, website, social, or offline',
      description: 'Deploy across all your marketing channels and touchpoints.',
      icon: Globe
    },
    {
      number: '03',
      title: 'Track, automate, and convert with AI insights',
      description: 'Monitor performance and let AI optimize your conversions.',
      icon: TrendingUp
    }
  ];

  const advancedFeatures = [
    { icon: Sparkles, text: 'AI-generated welcome messages' },
    { icon: FileText, text: 'Auto-start WhatsApp Forms for qualification' },
    { icon: Clock, text: 'SLA-based agent assignment' },
    { icon: Workflow, text: 'Entry-source based flows' },
    { icon: BarChart3, text: 'Drop-off & response-time insights' },
    { icon: Target, text: 'Meta Ads performance mapping' }
  ];

  const trustFeatures = [
    { icon: Shield, text: 'Official WhatsApp Cloud API' },
    { icon: FileText, text: 'Template-based messaging' },
    { icon: Lock, text: 'Secure Edge Function webhooks' },
    { icon: Users, text: 'Role-based access & audit logs' },
    { icon: CheckCircle2, text: 'Works without business verification' }
  ];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Click to WhatsApp App | AiReatro',
    description: 'Turn ads, links, QR codes, and buttons into instant WhatsApp conversations with full attribution, AI insights, and automation.',
    url: 'https://aireatro.com/click-to-whatsapp'
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/click-to-whatsapp" fallbackTitle="Click to WhatsApp" fallbackDescription="Turn ads and links into instant WhatsApp conversations" />
      <JsonLd data={[organizationSchema, softwareApplicationSchema, webPageSchema]} />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6" />
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              <MousePointer className="w-4 h-4 mr-2" />
              Click to WhatsApp App
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
              Click to WhatsApp.{' '}
              <span className="text-primary">Convert Faster.</span>{' '}
              Powered by AI.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Turn ads, links, QR codes, and buttons into instant WhatsApp conversations — with full attribution, AI insights, and automation built in.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base shadow-lg shadow-primary/30"
                onClick={() => navigate('/signup')}
              >
                Create Click to WhatsApp Link
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-base border-2 border-border text-foreground hover:bg-muted"
                onClick={() => navigate('/contact')}
              >
                Talk to Sales
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Powered by Official WhatsApp Cloud API
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Track every click
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* What is Click to WhatsApp */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              What Is <span className="text-primary">Click to WhatsApp</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Click to WhatsApp lets customers start a WhatsApp chat with your business instantly by clicking an ad, link, button, or QR code.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              <strong className="text-foreground">No forms. No waiting. Just direct conversations.</strong>
            </p>
            <p className="text-lg text-muted-foreground">
              AiReatro takes this further by adding <span className="text-primary font-medium">AI intelligence</span>, <span className="text-primary font-medium">attribution</span>, and <span className="text-primary font-medium">automation</span> to every click.
            </p>
          </div>
        </div>
      </section>

      {/* Why AiReatro - Differentiators */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why AiReatro Is More Than Just a{' '}
              <span className="text-primary">WhatsApp Link</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We don't just create links. We turn every click into a tracked, optimized, AI-assisted conversation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {differentiators.map((item, index) => (
              <Card key={index} className="border-border/50 bg-card shadow-soft hover:shadow-lg transition-all duration-300 group">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How Click to WhatsApp Works with{' '}
              <span className="text-primary">AiReatro</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Setup takes minutes. Start converting immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.number.replace('0', '')}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-10">
            Need help? <Button variant="link" className="text-primary p-0 h-auto" onClick={() => navigate('/contact')}>Our team can onboard you.</Button>
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Use Cases for{' '}
              <span className="text-primary">Click to WhatsApp</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Deploy across every channel to capture high-intent leads.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {useCases.map((item, index) => (
              <Card key={index} className="border-border/50 bg-card shadow-soft hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                  <Button variant="link" className="text-primary p-0 h-auto text-sm">
                    See template →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-primary/20 text-primary border-primary/30">
              AI + Pro Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Growth, Not Just Clicks
            </h2>
            <p className="text-lg text-slate-300">
              Every click becomes a measurable growth signal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {advancedFeatures.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-slate-200">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Trust */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Compliance &{' '}
              <span className="text-primary">Trust</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Enterprise-grade security and full Meta compliance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {trustFeatures.map((item, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted/50 border border-border">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Turn Every Click into a{' '}
              <span className="text-primary">Conversation That Converts</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop losing leads to forms and friction. Start conversations instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base shadow-lg shadow-primary/30"
                onClick={() => navigate('/signup')}
              >
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-base border-2 border-border text-foreground hover:bg-muted"
                onClick={() => navigate('/contact')}
              >
                Talk to Sales
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              No credit card required • Fast onboarding
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ClickToWhatsApp;
