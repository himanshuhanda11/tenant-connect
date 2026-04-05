import React from 'react';
import { SEO } from '@/components/seo';
import { 
  Megaphone, 
  Target, 
  Calendar, 
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import featureCampaigns from '@/assets/feature-campaigns.png';

export default function CampaignsFeature() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Send,
      title: 'Bulk Broadcasting',
      description: 'Send messages to thousands of customers at once. Scale your communication effortlessly.'
    },
    {
      icon: Target,
      title: 'Audience Targeting',
      description: 'Target specific segments based on tags, behavior, location, or custom attributes.'
    },
    {
      icon: Calendar,
      title: 'Scheduled Campaigns',
      description: 'Plan and schedule campaigns in advance. Send at the optimal time for engagement.'
    },
    {
      icon: TrendingUp,
      title: 'A/B Testing',
      description: 'Test different message variations to find what resonates best with your audience.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track delivery, read rates, and engagement in real-time. Optimize on the fly.'
    },
    {
      icon: PieChart,
      title: 'Campaign Reports',
      description: 'Get detailed reports on campaign performance with exportable insights.'
    }
  ];

  const useCases = [
    {
      title: 'Product Launches',
      description: 'Announce new products to your entire customer base with rich media messages.',
      stats: '95% delivery rate'
    },
    {
      title: 'Flash Sales',
      description: 'Drive urgency with time-limited offers. WhatsApp messages get opened within minutes.',
      stats: '5x email open rates'
    },
    {
      title: 'Re-engagement',
      description: 'Win back inactive customers with personalized offers and reminders.',
      stats: '30% reactivation rate'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Select Audience',
      description: 'Choose your target segment or create a new one based on custom criteria.'
    },
    {
      step: '02',
      title: 'Compose Message',
      description: 'Select a template, personalize with variables, and preview before sending.'
    },
    {
      step: '03',
      title: 'Send & Track',
      description: 'Send immediately or schedule for later. Monitor results in real-time.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="WhatsApp Bulk Campaigns - AiReatro" description="Send targeted WhatsApp bulk campaigns with scheduling, A/B testing, and real-time analytics. Reach thousands of customers with approved templates." keywords={["WhatsApp campaigns", "bulk messaging", "WhatsApp broadcast", "mass messaging"]} canonical="/features/campaigns" />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm font-medium mb-6"><Megaphone className="w-4 h-4" />Campaigns & Broadcasts</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Reach Thousands{' '}<span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">in Seconds</span></h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Send targeted broadcast campaigns to your customers on WhatsApp. Get 98% open rates and drive real engagement.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
                <Button size="lg" variant="outline" className="h-14 px-8" onClick={() => navigate('/contact')}>Start Free</Button>
              </div>
            </div>
            <div className="w-full max-w-sm lg:max-w-md shrink-0">
              <img src={featureCampaigns} alt="WhatsApp Campaign Broadcasting" className="w-full h-auto rounded-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise-Grade Campaign Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to run successful WhatsApp marketing campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-orange-500" />
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
              Campaigns That Drive Results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
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
              Launch a Campaign in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white text-2xl font-bold mb-6 shadow-xl">
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
      <section className="py-24 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Launch Your First Campaign?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start reaching your customers with WhatsApp campaigns that actually get results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-orange-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
