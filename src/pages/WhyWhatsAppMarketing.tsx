import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle,
  Target,
  Brain,
  Clock,
  RefreshCw,
  ShoppingCart,
  Package,
  Calendar,
  HeartHandshake,
  CreditCard,
  Star,
  Mail,
  Smartphone,
  Bell,
  MessagesSquare,
  Workflow,
  Scale,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/seo/JsonLd';

const WhyWhatsAppMarketing = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Up to 3× Higher Conversions',
      description: 'WhatsApp messages have 90%+ open rates and significantly higher reply rates compared to email or SMS.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      icon: Zap,
      title: 'Instant Engagement',
      description: 'Messages are delivered in real time — no waiting, no noise, no delays.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      icon: MessageCircle,
      title: 'Personal, Not Promotional',
      description: 'Customers feel like they\'re chatting with a brand, not being marketed to.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Shield,
      title: 'No Spam. No Ban. Fully Compliant',
      description: 'Template-based messaging, opt-in communication, clear user consent — zero risk of WhatsApp bans.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Users,
      title: 'Dedicated Enquiries to Dedicated Agents',
      description: 'Route sales leads to sales agents, support issues to support team, VIP customers to senior agents.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: RefreshCw,
      title: 'Two-Way Conversations',
      description: 'Not just broadcasts — real replies, follow-ups, and conversations.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    }
  ];

  const channelComparison = [
    { channel: 'Email', openRate: 'Low', engagement: 'Low', personal: false, twoWay: false },
    { channel: 'SMS', openRate: 'Medium', engagement: 'Low', personal: false, twoWay: false },
    { channel: 'Push Notifications', openRate: 'Medium', engagement: 'Low', personal: false, twoWay: false },
    { channel: 'WhatsApp', openRate: '90%+', engagement: 'High', personal: true, twoWay: true },
  ];

  const aireatroFeatures = [
    {
      icon: Target,
      title: 'Smart Campaigns',
      description: 'Send targeted messages based on customer intent, purchase stage, and past conversations.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Workflow,
      title: 'Automatic Routing',
      description: 'Every enquiry is routed to the right agent or flow instantly.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Know which campaigns convert, where users drop, and what to improve next.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      icon: BarChart3,
      title: 'Track Real ROI',
      description: 'Know exactly: Meta Ads → WhatsApp → Agent → Conversion.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Scale,
      title: 'Scale Without Chaos',
      description: 'Manage thousands of conversations with shared inbox, SLA rules, and agent performance tracking.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    }
  ];

  const useCases = [
    { icon: Target, text: 'Lead generation & qualification' },
    { icon: ShoppingCart, text: 'Abandoned cart recovery' },
    { icon: Package, text: 'Order updates & notifications' },
    { icon: Calendar, text: 'Appointment booking' },
    { icon: HeartHandshake, text: 'Support & service enquiries' },
    { icon: Star, text: 'Feedback & surveys' },
    { icon: CreditCard, text: 'Payments & invoices' }
  ];

  const trustFeatures = [
    'No personal numbers',
    'No unofficial automation',
    'No risk of account bans',
    'Full compliance with Meta policies'
  ];

  const metrics = [
    { value: '3×', label: 'higher reply rates' },
    { value: '2.5×', label: 'faster response times' },
    { value: '40%+', label: 'increase in conversions' },
    { value: 'Lower', label: 'cost per lead' }
  ];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Why WhatsApp Marketing Works | AiReatro',
    description: 'Reach customers where they already are. Deliver instant, personal conversations that convert up to 3× more than email and SMS — safely and at scale.',
    url: 'https://aireatro.com/why-whatsapp-marketing'
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/why-whatsapp-marketing" fallbackTitle="Why WhatsApp Marketing" fallbackDescription="Reach customers where they already are" />
      <JsonLd data={[organizationSchema, softwareApplicationSchema, webPageSchema]} />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-6" />
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              <TrendingUp className="w-4 h-4 mr-2" />
              WhatsApp Marketing
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
              Why WhatsApp Marketing Works —{' '}
              <span className="text-primary">And Why It Wins Every Time</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Reach customers where they already are. Deliver instant, personal conversations that convert up to 3× more than email and SMS — safely and at scale.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
                className="h-14 px-8 text-base border-2 border-border text-foreground hover:bg-muted"
                onClick={() => navigate('/contact')}
              >
                Talk to Sales
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Powered by Official WhatsApp Business API
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Safe & Compliant
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Built for Scale
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Shift Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Customers Don't Want More Ads.{' '}
              <span className="text-primary">They Want Conversations.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Email inboxes are crowded. SMS feels impersonal.<br />
              <strong className="text-foreground">WhatsApp is where customers actually read, reply, and convert.</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                <MessagesSquare className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Start real conversations</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Respond instantly</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Build trust at scale</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Businesses Choose{' '}
              <span className="text-primary">WhatsApp Marketing</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((item, index) => (
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

      {/* Channel Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why WhatsApp Marketing{' '}
              <span className="text-primary">Beats Other Channels</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Channel</TableHead>
                    <TableHead className="font-semibold text-center">Open Rate</TableHead>
                    <TableHead className="font-semibold text-center">Engagement</TableHead>
                    <TableHead className="font-semibold text-center">Personal</TableHead>
                    <TableHead className="font-semibold text-center">Two-Way</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelComparison.map((row, index) => (
                    <TableRow key={index} className={row.channel === 'WhatsApp' ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.channel === 'Email' && <Mail className="w-4 h-4 text-muted-foreground" />}
                          {row.channel === 'SMS' && <Smartphone className="w-4 h-4 text-muted-foreground" />}
                          {row.channel === 'Push Notifications' && <Bell className="w-4 h-4 text-muted-foreground" />}
                          {row.channel === 'WhatsApp' && <MessageCircle className="w-4 h-4 text-primary" />}
                          <span className={row.channel === 'WhatsApp' ? 'text-primary font-semibold' : ''}>{row.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={row.channel === 'WhatsApp' ? 'default' : 'secondary'}>
                          {row.openRate}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={row.engagement === 'High' ? 'default' : 'secondary'}>
                          {row.engagement}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.personal ? (
                          <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.twoWay ? (
                          <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </section>

      {/* AiReatro Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              WhatsApp Marketing Is Powerful.{' '}
              <span className="text-primary">AiReatro Makes It Intelligent.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {aireatroFeatures.map((item, index) => (
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

      {/* Use Cases */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How Businesses Use{' '}
              <span className="text-primary">WhatsApp Marketing</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border hover:border-primary/50 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-primary/20 text-primary border-primary/30">
              <Shield className="w-4 h-4 mr-2" />
              Trust & Compliance
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Safety, Compliance, and Long-Term Growth
            </h2>
            <p className="text-lg text-slate-300">
              AiReatro uses the Official WhatsApp Cloud API, ensuring:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="text-slate-200 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400">
            You can start without business verification — and scale safely as you grow.
          </p>
        </div>
      </section>

      {/* Results Snapshot */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{metric.value}</div>
                <div className="text-primary-foreground/80 text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-emerald-500/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Grow with{' '}
              <span className="text-primary">WhatsApp Marketing?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start conversations that convert — not campaigns that get ignored.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
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

export default WhyWhatsAppMarketing;
