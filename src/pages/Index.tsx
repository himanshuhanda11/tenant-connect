import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  Shield, 
  Users, 
  Zap,
  Inbox,
  FileText,
  Megaphone,
  Bot,
  BarChart3,
  CheckCircle2,
  Lock,
  BadgeCheck,
  Phone,
  Send,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/select-workspace');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  const features = [
    {
      icon: Inbox,
      title: 'Unified Inbox',
      description: 'Manage all WhatsApp conversations in one place. Assign agents, add tags, and never miss a message.'
    },
    {
      icon: FileText,
      title: 'Message Templates',
      description: 'Create and manage pre-approved message templates. Send notifications, alerts, and marketing messages.'
    },
    {
      icon: Megaphone,
      title: 'Broadcast Campaigns',
      description: 'Send bulk messages to thousands of customers. Target by tags, track delivery, and measure engagement.'
    },
    {
      icon: Bot,
      title: 'Automation',
      description: 'Build no-code automation flows. Auto-reply, route conversations, and trigger actions based on keywords.'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track message delivery, read rates, and response times. Get insights to optimize your messaging.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with role-based access. Owners, admins, and agents with granular permissions.'
    }
  ];

  const steps = [
    {
      step: '01',
      icon: Phone,
      title: 'Connect WhatsApp',
      description: 'Link your WhatsApp Business Account in minutes with our 1-click Meta integration. No technical setup required.'
    },
    {
      step: '02',
      icon: FileText,
      title: 'Create Templates',
      description: 'Design message templates for notifications, marketing, and support. Get them approved by Meta automatically.'
    },
    {
      step: '03',
      icon: Send,
      title: 'Start Messaging',
      description: 'Send messages, run campaigns, and engage customers at scale. Track everything in real-time.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: [
        '1 Phone Number',
        '1,000 Messages/month',
        '3 Team Members',
        'Basic Templates',
        'Email Support'
      ],
      popular: false
    },
    {
      name: 'Growth',
      price: '$149',
      period: '/month',
      description: 'For growing teams with higher volume',
      features: [
        '3 Phone Numbers',
        '10,000 Messages/month',
        '10 Team Members',
        'Advanced Templates',
        'Automation Flows',
        'Priority Support'
      ],
      popular: true
    },
    {
      name: 'Business',
      price: '$399',
      period: '/month',
      description: 'Enterprise-grade for large organizations',
      features: [
        'Unlimited Phone Numbers',
        '50,000 Messages/month',
        'Unlimited Team Members',
        'Custom Templates',
        'Advanced Automation',
        'API Access',
        'Dedicated Support'
      ],
      popular: false
    }
  ];

  const complianceItems = [
    {
      icon: CheckCircle2,
      title: 'Opt-in Messaging',
      description: 'We ensure all messages are sent to users who have explicitly opted in, following WhatsApp policies.'
    },
    {
      icon: BadgeCheck,
      title: 'Approved Templates',
      description: 'All message templates are reviewed and approved by Meta before sending, ensuring compliance.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      description: 'End-to-end encryption, SOC 2 compliant infrastructure, and GDPR-ready data handling.'
    },
    {
      icon: Shield,
      title: 'Meta Verified Partner',
      description: 'Official WhatsApp Business Solution Provider with direct API access from Meta.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">smeksh</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button onClick={() => navigate('/signup')} className="shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <Zap className="w-4 h-4" />
              Official WhatsApp Business API Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Engage Customers on{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                WhatsApp
              </span>
              {' '}at Scale
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The all-in-one platform for WhatsApp Business messaging. Send broadcasts, automate conversations, and grow your business with the world's most popular messaging app.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/20" onClick={() => navigate('/signup')}>
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-base" onClick={() => window.open('https://calendly.com', '_blank')}>
                Book a Demo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Free 14-day trial • Setup in 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                    app.smeksh.com
                  </div>
                </div>
              </div>
              
              {/* Dashboard Content Mock */}
              <div className="grid grid-cols-12 min-h-[400px]">
                {/* Sidebar */}
                <div className="col-span-2 bg-muted/30 border-r border-border p-4 hidden md:block">
                  <div className="space-y-3">
                    {['Inbox', 'Campaigns', 'Templates', 'Contacts', 'Analytics'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-primary/20' : 'bg-muted'}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Conversation List */}
                <div className="col-span-12 md:col-span-4 border-r border-border">
                  <div className="p-4 border-b border-border">
                    <div className="h-8 bg-muted rounded-lg" />
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex items-center gap-3 p-4 border-b border-border ${i === 1 ? 'bg-primary/5' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-muted rounded mb-2" />
                        <div className="h-3 w-32 bg-muted/60 rounded" />
                      </div>
                      {i <= 2 && <div className="w-5 h-5 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">{i}</div>}
                    </div>
                  ))}
                </div>
                
                {/* Chat Area */}
                <div className="col-span-12 md:col-span-6 flex flex-col">
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10" />
                    <div>
                      <div className="h-4 w-28 bg-muted rounded mb-1" />
                      <div className="h-3 w-20 bg-green-500/20 rounded text-[10px] text-green-600 flex items-center justify-center">Online</div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-[70%] text-sm">
                        Hello! How can I help you today?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md max-w-[70%] text-sm">
                        I'd like to know about your products
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-[70%] text-sm">
                        Sure! Let me share our catalog with you 📦
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-muted rounded-lg" />
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Send className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for WhatsApp Business
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to help you connect with customers, automate conversations, and grow your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              Go from signup to sending your first message in under 10 minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Trust Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Compliance & Trust
            </h2>
            <p className="text-lg text-muted-foreground">
              We take security and compliance seriously. Your data and your customers' trust are our priority.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {complianceItems.map((item, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-b from-muted/50 to-transparent border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your business. Scale as you grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-xl shadow-primary/10 scale-105' : 'border-border/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'shadow-lg shadow-primary/20' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-muted-foreground mt-8">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-12 md:p-16 border border-primary/10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your Customer Engagement?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using smeksh to connect with customers on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base shadow-xl shadow-primary/20" onClick={() => navigate('/signup')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-base">
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70">
                  <MessageSquare className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">smeksh</span>
              </div>
              <p className="text-sm text-muted-foreground">
                WhatsApp Business API platform for modern businesses.
              </p>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Webinars</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partners</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="/app-access-instructions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">App Access</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 smeksh.com. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
