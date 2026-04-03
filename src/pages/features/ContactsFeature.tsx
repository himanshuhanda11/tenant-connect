import React from 'react';
import { 
  Users, 
  Tag, 
  Filter, 
  Upload, 
  Download,
  Search,
  ArrowRight,
  CheckCircle2,
  Zap,
  UserPlus,
  Layers,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import featureContacts from '@/assets/feature-contacts.png';

export default function ContactsFeature() {
  const navigate = useNavigate();

  const features = [
    {
      icon: UserPlus,
      title: 'Contact Management',
      description: 'Store and organize all your customer contacts with custom fields, notes, and conversation history.'
    },
    {
      icon: Layers,
      title: 'Smart Segmentation',
      description: 'Create dynamic segments based on behavior, tags, purchase history, or any custom attribute.'
    },
    {
      icon: Tag,
      title: 'Custom Tags',
      description: 'Organize contacts with unlimited custom tags. Use tags to filter, segment, and target campaigns.'
    },
    {
      icon: Upload,
      title: 'Bulk Import',
      description: 'Import thousands of contacts at once via CSV. Map fields automatically and validate data.'
    },
    {
      icon: Download,
      title: 'Easy Export',
      description: 'Export contacts and segments to CSV for use in other tools or for backup purposes.'
    },
    {
      icon: BarChart3,
      title: 'Contact Insights',
      description: 'View conversation history, engagement metrics, and activity timeline for each contact.'
    }
  ];

  const useCases = [
    {
      title: 'Targeted Marketing',
      description: 'Segment contacts by purchase behavior to send personalized promotional campaigns.',
      stats: '2x higher engagement'
    },
    {
      title: 'VIP Customer Care',
      description: 'Tag and prioritize high-value customers for white-glove support treatment.',
      stats: '95% satisfaction rate'
    },
    {
      title: 'Lead Nurturing',
      description: 'Track leads through your funnel with custom stages and automated follow-ups.',
      stats: '35% more conversions'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Import Contacts',
      description: 'Upload your existing contacts via CSV or add them manually. Sync from your CRM automatically.'
    },
    {
      step: '02',
      title: 'Organize & Tag',
      description: 'Apply tags, add custom fields, and organize contacts into meaningful segments.'
    },
    {
      step: '03',
      title: 'Engage & Analyze',
      description: 'Target segments with campaigns and track engagement to optimize your strategy.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium mb-6"><Users className="w-4 h-4" />Contacts & Segments</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Know Your Customers{' '}<span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">Inside Out</span></h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Build rich customer profiles, create smart segments, and deliver personalized experiences at scale.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
                <Button size="lg" variant="outline" className="h-14 px-8" onClick={() => navigate('/contact')}>Start Free</Button>
              </div>
            </div>
            <div className="w-full max-w-sm lg:max-w-md shrink-0">
              <img src={featureContacts} alt="Contact Management & Segmentation" className="w-full h-auto rounded-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Contact Management Solution
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage, segment, and understand your customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-purple-500" />
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
              Unlock the Power of Segmentation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
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
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl font-bold mb-6 shadow-xl">
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
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Understand Your Customers Better?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start building rich customer profiles and smart segments today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-purple-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
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
