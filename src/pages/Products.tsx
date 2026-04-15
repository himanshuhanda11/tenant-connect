import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  MousePointer, 
  TrendingUp, 
  FileText,
  Inbox,
  Users,
  Megaphone,
  Bot,
  BarChart3,
  Plug,
  Phone,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Globe,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SeoMeta from '@/components/seo/SeoMeta';
import { JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/seo/JsonLd';
import productsHero from '@/assets/products-hero.png';

export default function Products() {
  const navigate = useNavigate();

  const whatsappSolutions = [
    {
      icon: Zap,
      title: 'WhatsApp Business API',
      description: 'Connect to the official WhatsApp Cloud API. No middleman, no markup.',
      href: '/whatsapp-business-api',
      gradient: 'from-green-500 to-emerald-600',
      features: ['Official Meta Partnership', 'Unlimited messaging', '99.9% uptime']
    },
    {
      icon: MousePointer,
      title: 'Click to WhatsApp App',
      description: 'Turn ads, links, and QR codes into instant WhatsApp conversations.',
      href: '/click-to-whatsapp',
      gradient: 'from-blue-500 to-indigo-600',
      features: ['Full attribution', 'AI intent detection', 'Smart routing']
    },
    {
      icon: TrendingUp,
      title: 'Why WhatsApp Marketing',
      description: 'Understand why WhatsApp converts 3× better than email and SMS.',
      href: '/why-whatsapp-marketing',
      gradient: 'from-purple-500 to-pink-600',
      features: ['90%+ open rates', 'Two-way conversations', 'No spam risk']
    },
    {
      icon: FileText,
      title: 'WhatsApp Forms',
      description: 'Capture leads directly in WhatsApp without external links.',
      href: '/whatsapp-forms',
      gradient: 'from-orange-500 to-red-500',
      features: ['Native in-chat forms', 'Conditional logic', 'Auto-qualification']
    }
  ];

  const platformFeatures = [
    {
      icon: Inbox,
      title: 'Unified Inbox',
      description: 'All conversations in one place with AI-powered suggestions.',
      href: '/features/inbox'
    },
    {
      icon: Users,
      title: 'Contacts & Segments',
      description: 'Mini CDP with lifecycle tracking and smart segmentation.',
      href: '/features/contacts'
    },
    {
      icon: FileText,
      title: 'Message Templates',
      description: 'Pre-approved templates with variable personalization.',
      href: '/features/templates'
    },
    {
      icon: Megaphone,
      title: 'Campaigns',
      description: 'Broadcast marketing with A/B testing and analytics.',
      href: '/features/campaigns'
    },
    {
      icon: Bot,
      title: 'Automation',
      description: 'Visual flow builder with AI-generated nodes.',
      href: '/features/automation'
    },
    {
      icon: Plug,
      title: 'Integrations',
      description: 'Connect Razorpay, Shopify, HubSpot, and more.',
      href: '/features/integrations'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Real-time dashboards with ROI attribution.',
      href: '/features/analytics'
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      description: 'Multi-number support with quality monitoring.',
      href: '/features/phone-numbers'
    },
    {
      icon: Users,
      title: 'Team & Roles',
      description: 'Role-based access with agent performance tracking.',
      href: '/features/team-roles'
    },
    {
      icon: ClipboardList,
      title: 'Audit Logs',
      description: 'Complete activity tracking for compliance.',
      href: '/features/audit-logs'
    }
  ];

  const benefits = [
    { icon: Zap, title: 'Lightning Fast', description: 'Messages in milliseconds' },
    { icon: Globe, title: 'Global Reach', description: 'Connect worldwide' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption' },
    { icon: Clock, title: '99.9% Uptime', description: 'Always available' }
  ];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Products | AiReatro',
    description: 'Explore AiReatro\'s complete WhatsApp Business platform — API integration, marketing tools, automation, and enterprise features.',
    url: 'https://aireatro.com/products'
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/products" fallbackTitle="Products — AiReatro WhatsApp Business Suite" fallbackDescription="Explore AiReatro's product suite: Team Inbox, Flow Builder, Broadcast Campaigns, Lead CRM, WhatsApp Forms, and Meta Ads integration — all in one platform." />
      <JsonLd data={[organizationSchema, softwareApplicationSchema, webPageSchema]} />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-gradient-to-br from-background via-muted/30 to-primary/5 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete WhatsApp Business Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                Everything for{' '}
                <span className="text-primary">WhatsApp Success</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
                From API integration to AI-powered marketing — all the tools you need to connect, engage, and grow on WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button size="lg" className="h-14 px-8 text-primary-foreground" onClick={() => navigate('/signup')}>
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 border-border text-foreground hover:bg-muted" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
            <div className="w-full max-w-md lg:max-w-lg shrink-0">
              <img src={productsHero} alt="AiReatro WhatsApp Business Platform" className="w-full h-auto rounded-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-muted/50 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{benefit.title}</div>
                  <div className="text-xs text-muted-foreground">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Solutions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
              Core Solutions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              WhatsApp Business Solutions
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive WhatsApp solutions to transform your customer engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {whatsappSolutions.map((product, index) => (
              <Link key={index} to={product.href} className="block group">
                <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${product.gradient}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <product.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {product.features.map((feature, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-primary" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 px-4 py-2 bg-secondary text-secondary-foreground">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Tools for Every Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage every aspect of your WhatsApp communication with our feature-rich platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {platformFeatures.map((feature, index) => (
              <Link key={index} to={feature.href} className="block group">
                <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/features')} className="border-border text-foreground hover:bg-muted">
              View All Features
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Start your free 14-day trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate('/contact')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
