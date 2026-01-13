import React from 'react';
import { 
  Bot, 
  Workflow, 
  Zap, 
  Clock,
  MessageSquare,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  Settings,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function AutomationFeature() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Workflow,
      title: 'Visual Flow Builder',
      description: 'Build complex automation flows with our drag-and-drop visual builder. No coding required.'
    },
    {
      icon: Zap,
      title: 'Keyword Triggers',
      description: 'Automatically respond when customers send specific keywords or phrases.'
    },
    {
      icon: Clock,
      title: 'Scheduled Messages',
      description: 'Send follow-ups, reminders, and sequences at the perfect time automatically.'
    },
    {
      icon: GitBranch,
      title: 'Conditional Logic',
      description: 'Create branching flows based on customer responses, tags, or custom conditions.'
    },
    {
      icon: MessageSquare,
      title: 'Auto-Responses',
      description: 'Set up instant replies for common questions. Respond 24/7 without human intervention.'
    },
    {
      icon: Repeat,
      title: 'Drip Campaigns',
      description: 'Nurture leads with automated message sequences spread over days or weeks.'
    }
  ];

  const useCases = [
    {
      title: 'Welcome Series',
      description: 'Automatically onboard new contacts with a sequence of helpful messages.',
      stats: '80% completion rate'
    },
    {
      title: 'Abandoned Cart',
      description: 'Recover lost sales with timely reminders about items left in cart.',
      stats: '25% recovery rate'
    },
    {
      title: 'Appointment Reminders',
      description: 'Reduce no-shows with automated appointment confirmation and reminders.',
      stats: '60% fewer no-shows'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Choose a Trigger',
      description: 'Start with a trigger: keyword, new contact, tag added, or scheduled time.'
    },
    {
      step: '02',
      title: 'Build Your Flow',
      description: 'Add actions, conditions, and delays to create your perfect automation.'
    },
    {
      step: '03',
      title: 'Activate & Monitor',
      description: 'Turn on your automation and watch it work 24/7. Track performance in real-time.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="text-white/70 mb-8" />
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Bot className="w-4 h-4" />
              Automation & Workflows
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Automate Your{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Customer Journeys
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-8">
              Build powerful no-code automation flows that respond to customers 24/7. Save time, scale support, and never miss a message.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/25" onClick={() => navigate('/signup')}>
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
              Powerful Automation Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Build sophisticated workflows without writing a single line of code
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
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
              <Sparkles className="w-4 h-4" />
              Use Cases
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Automation That Works While You Sleep
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
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
              Build Your First Automation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold mb-6 shadow-xl">
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
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Put Your Messaging on Autopilot?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start automating your customer communication today and scale without limits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-emerald-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
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
