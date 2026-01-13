import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowRight, 
  Users, 
  Zap,
  Inbox,
  FileText,
  Megaphone,
  Bot,
  BarChart3,
  CheckCircle2,
  Phone,
  Send,
  ChevronRight,
  Star,
  Globe,
  Sparkles,
  Shield,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import dashboardPreview from '@/assets/dashboard-preview.png';
import teamCollaboration from '@/assets/team-collaboration.png';
import phoneMockup from '@/assets/phone-mockup.png';
import heroPattern from '@/assets/hero-pattern.png';

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
      description: 'Manage all WhatsApp conversations in one place with smart routing.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      title: 'Message Templates',
      description: 'Create and manage pre-approved templates for notifications.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Megaphone,
      title: 'Broadcast Campaigns',
      description: 'Send bulk messages to thousands of customers instantly.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Bot,
      title: 'Smart Automation',
      description: 'Build no-code flows that respond and route automatically.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Rich Analytics',
      description: 'Track delivery, read rates, and optimize performance.',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with role-based permissions.',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const steps = [
    {
      step: '01',
      icon: Phone,
      title: 'Connect WhatsApp',
      description: 'Link your WhatsApp Business Account in minutes with our 1-click Meta integration.',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      step: '02',
      icon: FileText,
      title: 'Create Templates',
      description: 'Design message templates and get them approved by Meta automatically.',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      step: '03',
      icon: Send,
      title: 'Start Messaging',
      description: 'Send messages, run campaigns, and engage customers at scale.',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Head of Customer Success',
      company: 'TechFlow Inc',
      content: 'smeksh transformed our customer support. We now handle 3x more conversations with the same team.',
      avatar: 'SC',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Marketing Director',
      company: 'GrowthLabs',
      content: 'The broadcast feature helped us achieve 95% open rates on our promotional campaigns.',
      avatar: 'MR',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Manager',
      company: 'QuickServe',
      content: 'Setup was incredibly easy. We were sending messages within 10 minutes of signing up.',
      avatar: 'PS',
      rating: 5
    }
  ];

  const stats = [
    { value: '10M+', label: 'Messages Sent' },
    { value: '5,000+', label: 'Businesses' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' }
  ];

  const trustedCompanies = ['TechCorp', 'GrowthLabs', 'QuickServe', 'DataFlow', 'CloudBase', 'ScaleUp'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroPattern} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6 border border-green-500/20">
                <Sparkles className="w-4 h-4" />
                Official WhatsApp Business API Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Engage Customers on{' '}
                <span className="text-green-600">WhatsApp</span> at Scale
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
                The all-in-one platform for WhatsApp Business messaging. Send broadcasts, automate conversations, and grow your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25" onClick={() => navigate('/signup')}>
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-base" onClick={() => navigate('/contact')}>
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Free 14-day trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Setup in 5 minutes
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <img 
                  src={dashboardPreview} 
                  alt="smeksh Dashboard" 
                  className="rounded-2xl shadow-2xl border border-border/50"
                />
                {/* Floating elements */}
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Message Delivered</div>
                      <div className="text-xs text-muted-foreground">Just now</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-card p-4 rounded-xl shadow-xl border border-border/50">
                  <div className="text-2xl font-bold text-foreground">98.5%</div>
                  <div className="text-xs text-muted-foreground">Delivery Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">TRUSTED BY LEADING COMPANIES WORLDWIDE</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {trustedCompanies.map((company) => (
              <div key={company} className="text-xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need for WhatsApp Business
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to connect with customers, automate conversations, and scale your operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${feature.gradient}`} />
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                  <Link to="/products" className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
              Explore All Features
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Built for Teams
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Collaborate With Your Team in Real-Time
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Invite team members, assign conversations, and work together to provide the best customer experience.
              </p>
              <div className="space-y-4">
                {[
                  'Role-based access control',
                  'Real-time conversation routing',
                  'Team performance analytics',
                  'Internal notes and collaboration'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-8" size="lg" onClick={() => navigate('/signup')}>
                Start Collaborating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="relative">
              <img 
                src={teamCollaboration} 
                alt="Team Collaboration" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Phone Mockup Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1 flex justify-center">
              <img 
                src={phoneMockup} 
                alt="WhatsApp Messaging" 
                className="w-64 md:w-80 drop-shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                WhatsApp Native
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Messages Your Customers Actually Read
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                WhatsApp has 98% open rates compared to just 20% for email. Reach customers where they already are.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-sm text-muted-foreground">Open Rate</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-3xl font-bold text-green-600 mb-1">45%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-3xl font-bold text-green-600 mb-1">3B+</div>
                  <div className="text-sm text-muted-foreground">WhatsApp Users</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-3xl font-bold text-green-600 mb-1">180+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              Go from signup to sending your first message in under 10 minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex mb-8">
                    <div className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl ${step.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground text-background text-sm md:text-lg font-bold flex items-center justify-center shadow-xl">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-yellow-500" />
              Customer Stories
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Loved by Businesses Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say about their experience with smeksh.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card border-border/50 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Enterprise Security
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Built With Security First
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Your data is protected with enterprise-grade security measures
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'SOC 2', desc: 'Type II Compliant' },
                { label: 'GDPR', desc: 'Compliant' },
                { label: 'ISO 27001', desc: 'Certified' },
                { label: '99.9%', desc: 'Uptime SLA' },
              ].map((item, index) => (
                <div key={index} className="p-6 rounded-2xl bg-card border border-border/50">
                  <div className="text-2xl font-bold text-foreground mb-1">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Customer Engagement?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses using smeksh to connect with customers on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base bg-white text-green-600 hover:bg-white/90 shadow-xl" onClick={() => navigate('/signup')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" className="h-14 px-8 text-base bg-white/10 border-white/30 text-white hover:bg-white/20" variant="outline" onClick={() => navigate('/pricing')}>
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
