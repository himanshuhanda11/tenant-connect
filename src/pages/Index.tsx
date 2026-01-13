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
  Phone,
  Send,
  ChevronRight,
  Star,
  Globe,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

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
      color: 'bg-blue-500'
    },
    {
      step: '02',
      icon: FileText,
      title: 'Create Templates',
      description: 'Design message templates and get them approved by Meta automatically.',
      color: 'bg-purple-500'
    },
    {
      step: '03',
      icon: Send,
      title: 'Start Messaging',
      description: 'Send messages, run campaigns, and engage customers at scale.',
      color: 'bg-green-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Head of Customer Success',
      company: 'TechFlow Inc',
      content: 'smeksh transformed our customer support. We now handle 3x more conversations with the same team.',
      avatar: 'SC'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Marketing Director',
      company: 'GrowthLabs',
      content: 'The broadcast feature helped us achieve 95% open rates on our promotional campaigns.',
      avatar: 'MR'
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Manager',
      company: 'QuickServe',
      content: 'Setup was incredibly easy. We were sending messages within 10 minutes of signing up.',
      avatar: 'PS'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Messages Sent' },
    { value: '5,000+', label: 'Businesses' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Official WhatsApp Business API Platform
              <ChevronRight className="w-4 h-4" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Engage Customers on{' '}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                WhatsApp
              </span>
              <br />at Scale
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10">
              The all-in-one platform for WhatsApp Business messaging. Send broadcasts, automate conversations, and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-xl shadow-green-500/25" onClick={() => navigate('/signup')}>
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-base bg-white/5 border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
                Book a Demo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-white/50">
              No credit card required • Free 14-day trial • Setup in 5 minutes
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-white/10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-background border-b border-border/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">TRUSTED BY LEADING COMPANIES WORLDWIDE</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['TechCorp', 'GrowthLabs', 'QuickServe', 'DataFlow', 'CloudBase', 'ScaleUp'].map((company) => (
              <div key={company} className="text-xl font-bold text-muted-foreground">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                WhatsApp Business
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to connect with customers, automate conversations, and scale your operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
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
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              A Dashboard Built for Speed
            </h2>
            <p className="text-lg text-white/60">
              Beautiful, intuitive interface designed for productivity
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-slate-700/50 text-xs text-white/50">
                    app.smeksh.com
                  </div>
                </div>
              </div>
              
              {/* Dashboard Content Mock */}
              <div className="grid grid-cols-12 min-h-[450px]">
                {/* Sidebar */}
                <div className="col-span-2 bg-slate-800/30 border-r border-white/10 p-4 hidden md:block">
                  <div className="space-y-2">
                    {[
                      { name: 'Inbox', active: true },
                      { name: 'Campaigns', active: false },
                      { name: 'Templates', active: false },
                      { name: 'Contacts', active: false },
                      { name: 'Analytics', active: false }
                    ].map((item) => (
                      <div key={item.name} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${item.active ? 'bg-green-500/20 text-green-400' : 'text-white/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-400' : 'bg-white/20'}`} />
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Conversation List */}
                <div className="col-span-12 md:col-span-4 border-r border-white/10">
                  <div className="p-4 border-b border-white/10">
                    <div className="h-9 bg-slate-700/50 rounded-lg" />
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`flex items-center gap-3 p-4 border-b border-white/5 ${i === 1 ? 'bg-green-500/10' : ''}`}>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${i === 1 ? 'from-green-400 to-emerald-600' : 'from-slate-600 to-slate-700'}`} />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-slate-600/50 rounded mb-2" />
                        <div className="h-3 w-32 bg-slate-700/50 rounded" />
                      </div>
                      {i <= 2 && <div className="w-5 h-5 rounded-full bg-green-500 text-[10px] text-white flex items-center justify-center font-bold">{i}</div>}
                    </div>
                  ))}
                </div>
                
                {/* Chat Area */}
                <div className="col-span-12 md:col-span-6 flex flex-col">
                  <div className="flex items-center gap-3 p-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600" />
                    <div>
                      <div className="h-4 w-28 bg-slate-600/50 rounded mb-1" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-green-400">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[70%] text-sm shadow-lg">
                        Hello! How can I help you today? 👋
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-white px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[70%] text-sm">
                        I'd like to know about your products
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[70%] text-sm shadow-lg">
                        Sure! Let me share our catalog with you 📦
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <div className="flex-1 h-11 bg-slate-700/50 rounded-xl" />
                      <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Get Started in{' '}
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Go from signup to sending your first message in under 10 minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex mb-8">
                    <div className={`w-28 h-28 rounded-3xl ${step.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-foreground text-background text-lg font-bold flex items-center justify-center shadow-xl">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-yellow-500" />
              Customer Stories
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
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
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
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
