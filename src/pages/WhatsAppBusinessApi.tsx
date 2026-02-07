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
  FileText,
  Megaphone,
  Plug,
  ShoppingCart,
  Package,
  ClipboardCheck,
  Calendar,
  CreditCard,
  Star,
  Activity,
  Target,
  Eye,
  AlertTriangle,
  Globe,
  Lock,
  HeartPulse,
  RefreshCw,
  ChevronRight,
  Send,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/seo/JsonLd';
import dashboardPreview from '@/assets/dashboard-preview.png';
import whatsappApiHero from '@/assets/whatsapp-api-hero.png';

const WhatsAppBusinessApi = () => {
  const navigate = useNavigate();

  const differentiators = [
    {
      icon: Activity,
      title: 'Diagnostics Everywhere',
      description: 'Detect broken flows, SLA misses, drop-offs automatically.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Zap,
      title: 'AI Insights',
      description: 'AI explains what happened and what to fix.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Target,
      title: 'End-to-End Attribution',
      description: 'Meta Ads → WhatsApp → Flow → Agent → Conversion.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Eye,
      title: 'Visual Flow Builder + Heatmaps',
      badge: 'Pro',
      description: 'Optimize conversion with node-level insights.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: FileText,
      title: 'WhatsApp Forms in Chat',
      badge: 'Pro',
      description: 'Capture leads without external links.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: HeartPulse,
      title: 'Integration Health',
      description: 'Event logs, retries, alerts—no silent failures.',
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    }
  ];

  const productTabs = [
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageCircle,
      features: [
        'Unified team inbox with assignment & SLA timers',
        'AI-powered reply suggestions & intent detection',
        'Internal notes, tags, and conversation history'
      ]
    },
    {
      id: 'flows',
      label: 'Flows',
      icon: Workflow,
      features: [
        'Visual drag-and-drop flow builder',
        'Node-level heatmaps for optimization',
        'Versioning, A/B testing, and diagnostics'
      ]
    },
    {
      id: 'forms',
      label: 'WhatsApp Forms',
      icon: FileText,
      features: [
        'Native in-chat forms—no external links',
        'Conditional logic & smart validation',
        'End-to-end attribution tracking'
      ]
    },
    {
      id: 'broadcasts',
      label: 'Broadcasts',
      icon: Megaphone,
      features: [
        'Segment-based campaign targeting',
        'Template management with Meta approval',
        'Delivery reports & engagement analytics'
      ]
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Plug,
      features: [
        'Razorpay, Shopify, HubSpot, Zoho & more',
        'Webhook builder with event debugging',
        'Health monitoring & auto-retry'
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      features: [
        'Real-time conversation & message metrics',
        'Agent performance dashboards',
        'ROI attribution from ads to conversion'
      ]
    }
  ];

  const useCases = [
    {
      icon: ShoppingCart,
      title: 'Abandoned Cart Recovery',
      description: 'Recover lost sales with automated reminders.',
      cta: 'See template'
    },
    {
      icon: Package,
      title: 'Order Updates & Delivery',
      description: 'Keep customers informed in real-time.',
      cta: 'See template'
    },
    {
      icon: ClipboardCheck,
      title: 'Lead Qualification',
      description: 'Qualify leads with WhatsApp Forms.',
      cta: 'See template'
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Let customers book directly in chat.',
      cta: 'See template'
    },
    {
      icon: CreditCard,
      title: 'Payments & Invoices',
      description: 'Collect payments via Razorpay/PayU.',
      cta: 'See template'
    },
    {
      icon: Star,
      title: 'Surveys & Feedback',
      description: 'Gather insights with in-chat surveys.',
      cta: 'See template'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect WhatsApp Cloud API',
      description: 'Onboard your number with 1-click signup. No BSP setup required.'
    },
    {
      number: '02',
      title: 'Create Templates + Flows + Forms',
      description: 'Build pre-approved templates, visual flows, and native forms.'
    },
    {
      number: '03',
      title: 'Launch & Track with AI',
      description: 'Run campaigns, track conversions, and get AI-powered insights.'
    }
  ];

  const trustFeatures = [
    { icon: Shield, text: 'Official WhatsApp Business API' },
    { icon: FileText, text: 'Template-first messaging' },
    { icon: Users, text: 'Role-based access control' },
    { icon: Lock, text: 'Secure document storage' },
    { icon: RefreshCw, text: 'Webhook signature verification' }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      description: 'For small teams getting started',
      features: ['1 Phone Number', '2,000 messages/mo', 'Basic Analytics', 'Email Support'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$79',
      description: 'Diagnostics + Attribution + AI',
      features: ['3 Phone Numbers', '10,000 messages/mo', 'Flow Heatmaps', 'AI Insights', 'End-to-End Attribution', 'WhatsApp Forms'],
      popular: true
    },
    {
      name: 'Business',
      price: '$199',
      description: 'For enterprise teams at scale',
      features: ['Unlimited Numbers', '50,000 messages/mo', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee'],
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Do I need a verified business to start?',
      answer: 'No, you can start without Meta business verification. However, verification unlocks higher messaging limits and builds customer trust. We help you through the verification process when you\'re ready.'
    },
    {
      question: 'How long does setup take?',
      answer: 'Most businesses are live within 15 minutes using our 1-click WhatsApp Cloud API onboarding. Template approval by Meta typically takes 1-24 hours.'
    },
    {
      question: 'Can I use my existing phone number?',
      answer: 'Yes! You can migrate your existing number to WhatsApp Business API. We\'ll guide you through the process to ensure a smooth transition.'
    },
    {
      question: 'What\'s the difference between WhatsApp Cloud API & BSP?',
      answer: 'WhatsApp Cloud API is Meta\'s official, direct API—no middleman. BSPs (Business Solution Providers) add markup and complexity. AiReatro connects directly to Cloud API, giving you lower costs and full control.'
    },
    {
      question: 'Are templates required to message customers?',
      answer: 'Templates are required to start conversations outside the 24-hour customer service window. Within 24 hours of a customer message, you can send free-form replies. We make template creation and approval easy.'
    },
    {
      question: 'Is AiReatro safe and compliant?',
      answer: 'Absolutely. We use the Official WhatsApp Cloud API, enforce template-first messaging, provide role-based access control, and verify webhooks. Your data is encrypted and stored securely.'
    }
  ];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'WhatsApp Business API | AiReatro',
    description: 'Connect to Official WhatsApp Cloud API. Send verified messages, automate flows, manage team inbox, and measure ROI with AI-powered attribution.',
    url: 'https://aireatro.com/whatsapp-business-api'
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/whatsapp-business-api" fallbackTitle="WhatsApp Business API" fallbackDescription="Connect to Official WhatsApp Cloud API" />
      <JsonLd data={[organizationSchema, softwareApplicationSchema, webPageSchema]} />
      
      <Navbar />

      {/* Hero Section - Unique dark API-focused design */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        {/* Unique gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white [&_svg]:text-white/50" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-left">
              <Badge className="mb-6 px-4 py-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                <Zap className="w-4 h-4 mr-2" />
                Official WhatsApp Cloud API
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                Scale Your Business with{' '}
                <span className="text-primary">WhatsApp API</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl">
                Connect directly to Meta&apos;s WhatsApp Cloud API. No middleman, no markup. 
                Send templates, automate conversations, and track every conversion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base shadow-lg shadow-primary/30"
                  onClick={() => navigate('/signup')}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-base border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60"
                  onClick={() => navigate('/contact')}
                >
                  Talk to Sales
                </Button>
              </div>
              
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-slate-400">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">15 min</div>
                  <div className="text-sm text-slate-400">Setup Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">0%</div>
                  <div className="text-sm text-slate-400">Markup on API</div>
                </div>
              </div>
            </div>
            
            {/* Right - Hero Illustration */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={whatsappApiHero} 
                  alt="WhatsApp Business API Integration - Server and Cloud Connection" 
                  className="w-full h-auto"
                />
                {/* Gradient overlay for polish */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
              </div>
              
              {/* Floating stat cards */}
              <div className="absolute -left-4 top-1/4 bg-white rounded-xl p-4 shadow-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Messages Sent</div>
                    <div className="text-xl font-bold text-foreground">2.4M+</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl p-4 shadow-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                    <div className="text-xl font-bold text-foreground">32%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Meta Business Partner
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Direct Cloud API Access
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              No BSP Middleman
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Enterprise Security
            </span>
          </div>
        </div>
      </section>

      {/* What is WhatsApp Business API */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What is <span className="text-primary">WhatsApp Business API</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              The official API for businesses to send messages at scale, automate customer support, and drive growth on WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <Card className="border-border/50 bg-card shadow-soft">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Official API for Scale</h3>
                <p className="text-muted-foreground text-sm">
                  Send thousands of messages reliably with Meta&apos;s official WhatsApp Cloud API.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card shadow-soft">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Templates + Notifications</h3>
                <p className="text-muted-foreground text-sm">
                  Pre-approved message templates for marketing, support, and transactional alerts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card shadow-soft">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Works with Meta Cloud API</h3>
                <p className="text-muted-foreground text-sm">
                  Direct connection to WhatsApp Cloud API—no BSP markup or complexity.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto">
            <p className="text-center text-muted-foreground mb-4">Who it&apos;s for:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['D2C & eCommerce', 'Fintech & Banking', 'Education & EdTech', 'Healthcare', 'Real Estate', 'Professional Services'].map((industry) => (
                <Badge key={industry} variant="secondary" className="px-4 py-2 text-sm">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why AiReatro Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              Why Choose AiReatro
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="text-primary">AiReatro</span> is Different
            </h2>
            <p className="text-lg text-muted-foreground">
              Not just another WhatsApp tool. We bring clarity, diagnostics, and AI-powered intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {differentiators.map((item, index) => (
              <Card key={index} className="border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        {item.badge && (
                          <Badge className="bg-primary/10 text-primary text-xs">{item.badge}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tour Tabs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key <span className="text-primary">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage WhatsApp at scale
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto p-1 bg-muted">
                {productTabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {productTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  <Card className="border-border/50">
                    <CardContent className="p-6 md:p-8">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <tab.icon className="w-6 h-6 text-primary" />
                            {tab.label}
                          </h3>
                          <ul className="space-y-3">
                            {tab.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button className="mt-6" variant="outline" onClick={() => navigate('/features/' + tab.id)}>
                            Learn more <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                        <div className="bg-muted/50 rounded-xl aspect-video flex items-center justify-center border border-border/50">
                          <div className="text-center p-4">
                            <tab.icon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">{tab.label} UI Preview</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular <span className="text-primary">Use Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Ready-to-use templates for common business scenarios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/template-library')}>
                    {useCase.cta} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes, not days
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Need help? Our team can onboard you.</p>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Request Onboarding Help
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Trust */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compliance & <span className="text-primary">Trust</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Enterprise-grade security and compliance built-in
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto mb-8">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-card border border-border/50 rounded-full px-5 py-3 shadow-soft">
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Note on Business Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Business verification helps scale messaging limits, but you can start using AiReatro without it. We&apos;ll guide you through verification when you&apos;re ready to scale.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`border-border/50 relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-lg">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-emerald-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="link" onClick={() => navigate('/pricing')}>
              View full pricing details <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border/50 rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-emerald-500/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to launch WhatsApp the right way?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of businesses using AiReatro to grow on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground shadow-lg shadow-primary/25 h-12 px-8 text-base"
                onClick={() => navigate('/signup')}
              >
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8 text-base border-2 border-border text-foreground hover:bg-muted"
                onClick={() => navigate('/contact')}
              >
                Talk to Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhatsAppBusinessApi;
