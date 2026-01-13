import React from 'react';
import { 
  Inbox, 
  Users, 
  MessageSquare, 
  Bell, 
  Tag, 
  Clock,
  ArrowRight,
  CheckCircle2,
  Zap,
  UserCheck,
  StickyNote,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function InboxFeature() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Team Inbox',
      description: 'Manage all customer conversations in a shared team inbox. Multiple agents can work together seamlessly.'
    },
    {
      icon: UserCheck,
      title: 'Smart Assignment',
      description: 'Automatically route conversations to the right team member based on skills, availability, or custom rules.'
    },
    {
      icon: StickyNote,
      title: 'Internal Notes',
      description: 'Add private notes to conversations that only your team can see. Perfect for handoffs and context sharing.'
    },
    {
      icon: Tag,
      title: 'Conversation Tags',
      description: 'Organize conversations with custom tags. Filter and search by tags to find what you need quickly.'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Get instant notifications for new messages, mentions, and assignments. Never miss an important conversation.'
    },
    {
      icon: Filter,
      title: 'Advanced Filters',
      description: 'Filter conversations by status, assignee, tags, date range, and more. Find any conversation in seconds.'
    }
  ];

  const useCases = [
    {
      title: 'Customer Support Teams',
      description: 'Handle high volumes of customer inquiries efficiently with team collaboration and smart routing.',
      stats: '3x faster response time'
    },
    {
      title: 'Sales Teams',
      description: 'Track and manage sales conversations from lead to close. Never lose a deal due to missed messages.',
      stats: '40% more conversions'
    },
    {
      title: 'E-commerce Businesses',
      description: 'Manage order inquiries, shipping updates, and returns all in one place with full order context.',
      stats: '50% fewer support tickets'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Connect WhatsApp',
      description: 'Link your WhatsApp Business Account to start receiving messages in your team inbox.'
    },
    {
      step: '02',
      title: 'Set Up Your Team',
      description: 'Invite team members and configure routing rules to automatically assign conversations.'
    },
    {
      step: '03',
      title: 'Start Collaborating',
      description: 'Your team can now work together to respond to customers faster and more efficiently.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="text-white/70 mb-8" />
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Inbox className="w-4 h-4" />
              Team Inbox
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              One Inbox for Your{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Entire Team
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-8">
              Manage all WhatsApp conversations in a unified team inbox. Collaborate with your team, assign chats, and respond faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-xl shadow-blue-500/25" onClick={() => navigate('/signup')}>
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 border-white/20 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Team Collaboration
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help your team work together efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Use Cases
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Teams Like Yours
            </h2>
            <p className="text-lg text-muted-foreground">
              See how different teams use the unified inbox to improve their operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl text-foreground mb-3">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {useCase.stats}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Setting up your team inbox is quick and easy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-2xl font-bold mb-6 shadow-xl">
                  {step.step}
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of teams using our unified inbox to deliver exceptional customer experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-blue-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
