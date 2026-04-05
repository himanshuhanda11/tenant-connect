import React from 'react';
import { SEO } from '@/components/seo';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Globe,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  Edit3,
  Eye,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import featureTemplates from '@/assets/feature-templates.png';

export default function TemplatesFeature() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Edit3,
      title: 'Visual Template Builder',
      description: 'Create beautiful message templates with our drag-and-drop builder. No coding required.'
    },
    {
      icon: CheckCircle,
      title: 'Instant Approval',
      description: 'Submit templates for Meta approval directly from our platform. Track status in real-time.'
    },
    {
      icon: Layers,
      title: 'Category Management',
      description: 'Organize templates by category: Marketing, Utility, Authentication. Easy to find and use.'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Create templates in multiple languages to reach customers worldwide in their native tongue.'
    },
    {
      icon: Sparkles,
      title: 'Variable Personalization',
      description: 'Add dynamic variables to personalize messages with customer names, order details, and more.'
    },
    {
      icon: Eye,
      title: 'Live Preview',
      description: 'See exactly how your template will look on WhatsApp before submitting for approval.'
    }
  ];

  const categories = [
    {
      title: 'Marketing Templates',
      description: 'Promotional messages, product announcements, and special offers.',
      examples: ['Product launches', 'Flash sales', 'Event invitations']
    },
    {
      title: 'Utility Templates',
      description: 'Transactional updates, order confirmations, and service notifications.',
      examples: ['Order updates', 'Shipping alerts', 'Appointment reminders']
    },
    {
      title: 'Authentication Templates',
      description: 'OTP codes, verification messages, and security alerts.',
      examples: ['Login OTP', 'Password reset', 'Account verification']
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Template',
      description: 'Use our visual builder to design your message template with text, media, and buttons.'
    },
    {
      step: '02',
      title: 'Submit for Approval',
      description: 'Submit to Meta for review. Most templates are approved within minutes.'
    },
    {
      step: '03',
      title: 'Start Sending',
      description: 'Once approved, use your template in campaigns or for customer conversations.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="WhatsApp Message Templates - AiReatro" description="Create, manage, and get Meta-approved WhatsApp message templates with AI validation and guided fix flows. 50+ pre-built templates included." keywords={["WhatsApp templates", "message templates", "Meta approval", "template builder"]} canonical="/features/templates" />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-sm font-medium mb-6"><FileText className="w-4 h-4" />Message Templates</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Create Templates That{' '}<span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">Get Approved</span></h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Build, manage, and send WhatsApp message templates with our intuitive template builder. Fast approval, easy management.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
                <Button size="lg" variant="outline" className="h-14 px-8" onClick={() => navigate('/contact')}>Start Free</Button>
              </div>
            </div>
            <div className="w-full max-w-sm lg:max-w-md shrink-0">
              <img src={featureTemplates} alt="WhatsApp Message Template Builder" className="w-full h-auto rounded-2xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Template Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to create and manage WhatsApp message templates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="font-semibold text-xl text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Layers className="w-4 h-4" />
              Template Categories
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Templates for Every Use Case
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <Card key={index} className="border-border/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl text-foreground mb-3">{category.title}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="space-y-2">
                    {category.examples.map((example, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-foreground">{example}</span>
                      </div>
                    ))}
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-bold mb-6 shadow-xl">
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
      <section className="py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Start Creating Templates Today
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Build your first template in minutes and get it approved faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-violet-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
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
