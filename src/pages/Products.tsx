import React from 'react';
import { 
  Inbox, 
  FileText, 
  Megaphone, 
  Bot, 
  BarChart3, 
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Products() {
  const navigate = useNavigate();

  const products = [
    {
      id: 'inbox',
      icon: Inbox,
      title: 'Unified Inbox',
      subtitle: 'All conversations in one place',
      description: 'Manage all your WhatsApp conversations from a single, powerful inbox. Never miss a message again.',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Real-time message sync',
        'Smart conversation routing',
        'Team collaboration tools',
        'Quick reply templates',
        'Contact management',
        'Conversation tagging'
      ],
      image: 'inbox'
    },
    {
      id: 'campaigns',
      icon: Megaphone,
      title: 'Broadcast Campaigns',
      subtitle: 'Reach thousands instantly',
      description: 'Send targeted bulk messages to segmented audiences. Track delivery and engagement in real-time.',
      gradient: 'from-orange-500 to-red-500',
      features: [
        'Bulk message sending',
        'Audience segmentation',
        'Scheduled campaigns',
        'A/B testing',
        'Delivery tracking',
        'Performance analytics'
      ],
      image: 'campaigns'
    },
    {
      id: 'templates',
      icon: FileText,
      title: 'Message Templates',
      subtitle: 'Pre-approved messaging',
      description: 'Create and manage message templates that comply with WhatsApp policies. Get instant approval.',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Template builder',
        'Variable personalization',
        'Multi-language support',
        'Category management',
        'Approval tracking',
        'Template analytics'
      ],
      image: 'templates'
    },
    {
      id: 'automation',
      icon: Bot,
      title: 'Smart Automation',
      subtitle: 'Work smarter, not harder',
      description: 'Build powerful no-code automation flows that respond to customers 24/7.',
      gradient: 'from-green-500 to-emerald-500',
      features: [
        'Visual flow builder',
        'Keyword triggers',
        'Auto-responses',
        'Conditional logic',
        'API webhooks',
        'Chatbot integration'
      ],
      image: 'automation'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Rich Analytics',
      subtitle: 'Data-driven decisions',
      description: 'Get deep insights into your messaging performance with comprehensive analytics dashboards.',
      gradient: 'from-indigo-500 to-purple-500',
      features: [
        'Real-time dashboards',
        'Message metrics',
        'Agent performance',
        'Campaign ROI',
        'Custom reports',
        'Export capabilities'
      ],
      image: 'analytics'
    },
    {
      id: 'team',
      icon: Users,
      title: 'Team Collaboration',
      subtitle: 'Scale your support',
      description: 'Invite team members with granular permissions. Collaborate effectively on customer conversations.',
      gradient: 'from-pink-500 to-rose-500',
      features: [
        'Role-based access',
        'Team assignments',
        'Internal notes',
        'Collision detection',
        'Performance tracking',
        'Workload balancing'
      ],
      image: 'team'
    }
  ];

  const benefits = [
    { icon: Zap, title: 'Lightning Fast', description: 'Messages delivered in milliseconds' },
    { icon: Globe, title: 'Global Reach', description: 'Connect with customers worldwide' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption & compliance' },
    { icon: Clock, title: '24/7 Uptime', description: '99.9% availability guaranteed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Powerful Products for{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                WhatsApp Success
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Everything you need to connect, engage, and grow with your customers on WhatsApp.
            </p>
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{benefit.title}</div>
                  <div className="text-sm text-muted-foreground">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              id={product.id}
              className={`flex flex-col lg:flex-row items-center gap-12 py-16 ${
                index !== products.length - 1 ? 'border-b border-border/50' : ''
              } ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Content */}
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${product.gradient} text-white text-sm font-medium mb-6`}>
                  <product.icon className="w-4 h-4" />
                  {product.subtitle}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.title}</h2>
                <p className="text-lg text-muted-foreground mb-8">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={() => navigate('/signup')}>
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Visual */}
              <div className="flex-1">
                <Card className={`overflow-hidden border-0 shadow-2xl bg-gradient-to-br ${product.gradient}`}>
                  <CardContent className="p-8">
                    <div className="aspect-[4/3] rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <product.icon className="w-24 h-24 text-white/80" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start your free 14-day trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-green-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
