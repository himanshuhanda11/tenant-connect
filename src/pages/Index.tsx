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
import dashboardDemo from '@/assets/dashboard-demo.mp4';
import whatsappWomenIcon from '@/assets/whatsapp-women-icon.jpg';
import whatsappCouple from '@/assets/whatsapp-couple.jpg';
import whatsappPhoneTech from '@/assets/whatsapp-phone-tech.jpg';

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
      <section className="relative overflow-hidden bg-background">
        {/* Subtle Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Official WhatsApp Business API Partner
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
                Engage Customers on{' '}
                <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  WhatsApp
                </span>{' '}
                at Scale
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8">
                The all-in-one platform for WhatsApp Business messaging. Send broadcasts, automate conversations, and grow your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
                <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25 w-full sm:w-auto" onClick={() => navigate('/signup')}>
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" onClick={() => navigate('/contact')}>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  Free 14-day trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  5 min setup
                </div>
              </div>
            </div>

            {/* Right Content - Demo Video */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <video 
                  src={dashboardDemo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto"
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-card backdrop-blur-xl p-2 sm:p-4 rounded-xl shadow-xl border border-border hidden sm:block">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-foreground">Message Delivered</div>
                    <div className="text-xs text-muted-foreground">Just now</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-card backdrop-blur-xl p-2 sm:p-4 rounded-xl shadow-xl border border-border hidden sm:block">
                <div className="text-lg sm:text-2xl font-bold text-foreground">98.5%</div>
                <div className="text-xs text-muted-foreground">Delivery Rate</div>
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
      <section className="py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 md:mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Everything You Need for WhatsApp Business
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Powerful features to connect with customers, automate conversations, and scale your operations.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${feature.gradient}`} />
                <CardHeader className="p-4 md:p-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 md:mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <CardDescription className="text-sm md:text-base">{feature.description}</CardDescription>
                  <Link to="/products" className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 md:mt-4 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/products')}>
              Explore All Features
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Built for Teams
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
                Collaborate With Your Team in Real-Time
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                Invite team members, assign conversations, and work together to provide the best customer experience.
              </p>
              <div className="space-y-3 md:space-y-4 text-left">
                {[
                  'Role-based access control',
                  'Real-time conversation routing',
                  'Team performance analytics',
                  'Internal notes and collaboration'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-6 md:mt-8 w-full sm:w-auto" size="lg" onClick={() => navigate('/signup')}>
                Start Collaborating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="relative order-first lg:order-last">
              <img 
                src={whatsappWomenIcon} 
                alt="Team Collaboration on WhatsApp" 
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-card backdrop-blur-xl p-3 md:p-4 rounded-xl shadow-xl border border-border hidden sm:block">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm md:text-base font-medium text-foreground">5,000+</div>
                    <div className="text-xs text-muted-foreground">Active Teams</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Engagement Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative">
                <img 
                  src={whatsappCouple} 
                  alt="WhatsApp Messaging Engagement" 
                  className="w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl"
                />
                {/* Floating stats */}
                <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4 bg-card backdrop-blur-xl p-2 md:p-3 rounded-xl shadow-xl border border-border">
                  <div className="text-lg md:text-xl font-bold text-green-600">98%</div>
                  <div className="text-xs text-muted-foreground">Open Rate</div>
                </div>
                <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-card backdrop-blur-xl p-2 md:p-3 rounded-xl shadow-xl border border-border">
                  <div className="text-lg md:text-xl font-bold text-green-600">3B+</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                WhatsApp Native
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
                Messages Your Customers Actually Read
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                WhatsApp has 98% open rates compared to just 20% for email. Reach customers where they already are.
              </p>
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="p-3 md:p-4 rounded-xl bg-muted/50">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Open Rate</div>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-muted/50">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">45%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Response Rate</div>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-muted/50">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">3B+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">WhatsApp Users</div>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-muted/50">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">180+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section - New */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-green-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Advanced Technology
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
                Powered by WhatsApp Business API
              </h2>
              <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8">
                Leverage the official WhatsApp Business API with enterprise-grade reliability, security, and scalability built for growing businesses.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-left">
                {[
                  { icon: Shield, title: 'End-to-End Encryption', desc: 'Messages are secure by default' },
                  { icon: Zap, title: 'Instant Delivery', desc: 'Messages delivered in milliseconds' },
                  { icon: Globe, title: 'Global Reach', desc: 'Available in 180+ countries' },
                  { icon: Bot, title: 'AI-Powered', desc: 'Smart automation & routing' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm md:text-base">{item.title}</div>
                      <div className="text-xs md:text-sm text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center order-first lg:order-last">
              <div className="relative">
                <img 
                  src={whatsappPhoneTech} 
                  alt="WhatsApp Technology" 
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-2xl shadow-2xl"
                />
                {/* Glowing effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-green-500/20 to-transparent pointer-events-none" />
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
