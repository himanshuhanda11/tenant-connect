import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  GitBranch, 
  Shield, 
  Webhook, 
  BarChart3, 
  Target,
  Users,
  ClipboardList,
  CreditCard,
  FileText,
  ShoppingCart,
  Gift,
  Calendar,
  UtensilsCrossed,
  MessageSquare,
  Plane,
  FileQuestion,
  Quote,
  ArrowRight,
  CheckCircle2,
  Zap,
  MousePointer,
  Share2,
  Settings2,
  Bot,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO, JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/seo';

export default function WhatsAppForms() {
  const features = [
    {
      icon: Bot,
      title: 'AI Form Builder',
      description: 'Type your goal → AI creates the form, flow, and validation automatically.',
      isPro: false,
    },
    {
      icon: GitBranch,
      title: 'Conditional Logic & Branching',
      description: 'Dynamic paths based on user responses. Show/hide fields intelligently.',
      isPro: true,
    },
    {
      icon: Shield,
      title: 'Smart Validation + OTP + Docs',
      description: 'Phone/email validation, OTP verification, and document uploads built-in.',
      isPro: true,
    },
    {
      icon: Webhook,
      title: 'Integrations + Event Debugger',
      description: 'Webhooks with retry logic, event logs, and no silent failures.',
      isPro: false,
    },
    {
      icon: BarChart3,
      title: 'Form Analytics & Heatmaps',
      description: 'Track drop-off points, completion rates, and optimize conversions.',
      isPro: true,
    },
    {
      icon: Target,
      title: 'Meta Ads → Form → Agent Attribution',
      description: 'Track the complete journey from ad click to form to agent conversion.',
      isPro: false,
    },
  ];

  const useCases = [
    {
      title: 'Lead Qualification & Data Collection',
      description: 'Capture leads with structured forms that qualify prospects before they reach your sales team. Collect contact info, preferences, and intent signals automatically.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    },
    {
      title: 'Surveys & Feedback',
      description: 'Run NPS surveys, collect product feedback, and gather customer insights—all within WhatsApp. Higher response rates than email or web forms.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    },
    {
      title: 'Loan Applications (Fintech)',
      description: 'Pre-approved amounts, identity verification, document uploads, and KYC—streamline the entire loan application journey in WhatsApp.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
    },
    {
      title: 'Insurance Quotes',
      description: 'Dynamic plan selection, premium calculation, and instant quote generation. Let users compare plans and choose coverage without leaving the chat.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop',
    },
    {
      title: 'Collect Purchase Intent',
      description: 'Capture product preferences, budget ranges, and purchase timelines. Qualify buyers and route high-intent leads to your sales team instantly.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    },
    {
      title: 'Personalized Offers',
      description: 'Generate dynamic recommendations, apply coupon rules, and create personalized offers based on form responses and user history.',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&h=400&fit=crop',
    },
  ];

  const templates = [
    { icon: ShoppingCart, title: 'Placing Orders', description: 'Collect order details and preferences' },
    { icon: Calendar, title: 'Event Registration', description: 'Sign up attendees with validation' },
    { icon: Users, title: 'Booking Appointments', description: 'Schedule meetings with availability' },
    { icon: UtensilsCrossed, title: 'Restaurant Reservations', description: 'Table bookings with party size' },
    { icon: MessageSquare, title: 'Client Feedback', description: 'NPS and satisfaction surveys' },
    { icon: Quote, title: 'Quotation Request', description: 'Collect requirements for quotes' },
    { icon: ClipboardList, title: 'General Contact Form', description: 'Basic contact information' },
    { icon: Plane, title: 'Travel Booking', description: 'Destinations, dates, preferences' },
  ];

  const integrations = [
    'Shopify', 'WooCommerce', 'Razorpay', 'Stripe', 'Zapier', 
    'LeadSquared', 'WebEngage', 'HubSpot', 'Salesforce', 'Zoho'
  ];

  const steps = [
    {
      icon: Bot,
      title: 'Create Your Form',
      description: 'Use AI to generate forms from a goal, or build with drag-and-drop.',
    },
    {
      icon: Share2,
      title: 'Share Anywhere',
      description: 'QR codes, links, click-to-WhatsApp buttons, or Meta Ads integration.',
    },
    {
      icon: Settings2,
      title: 'Sync & Automate',
      description: 'Push data to your CRM and trigger workflows automatically.',
    },
  ];

  const formsPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'WhatsApp Forms - AI-Powered Form Builder',
    description: 'Collect data seamlessly with WhatsApp Forms powered by AI. Engage users with forms that open directly inside WhatsApp.',
    url: 'https://aireatro.com/whatsapp-forms',
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="WhatsApp Forms — AI-Powered Form Builder"
        description="Collect data seamlessly with WhatsApp Forms powered by AI. Engage users with forms that open directly inside WhatsApp—no external browser needed."
        canonical="/whatsapp-forms"
        keywords={['WhatsApp forms', 'WhatsApp lead capture', 'conversational forms', 'AI form builder', 'WhatsApp surveys']}
      />
      <JsonLd data={[organizationSchema, softwareApplicationSchema, formsPageSchema]} />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* AI Abstract Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-primary/8 via-cyan-500/5 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 to-emerald-400/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered WhatsApp Forms
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                  <span className="text-slate-900">Collect data seamlessly with WhatsApp Forms — </span>
                  <span className="text-primary">Powered by AI</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl animate-fade-in">
                  Engage users with forms that open directly inside WhatsApp—no external browser. 
                  Capture leads, qualify users, book orders, and automate workflows instantly.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 animate-fade-in">
                  <Button size="lg" className="h-14 px-8 text-base font-medium w-full sm:w-auto" asChild>
                    <Link to="/signup">
                      Start for FREE
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium w-full sm:w-auto" asChild>
                    <Link to="/contact">Talk to Sales</Link>
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Powered by Official WhatsApp Business API</span>
                </div>
              </div>

              {/* Right: Hero Image */}
              <div className="relative animate-fade-in">
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl p-8 shadow-2xl shadow-primary/10">
                  {/* Phone mockup with form */}
                  <div className="relative mx-auto w-64 md:w-72">
                    <div className="bg-slate-900 rounded-[2.5rem] p-2 shadow-xl">
                      <div className="bg-white rounded-[2rem] overflow-hidden">
                        {/* WhatsApp header */}
                        <div className="bg-primary px-4 py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">AiReatro Forms</div>
                            <div className="text-white/70 text-xs">Online</div>
                          </div>
                        </div>
                        {/* Form card */}
                        <div className="p-4 space-y-3">
                          <div className="bg-slate-100 rounded-xl p-4">
                            <div className="text-sm font-medium text-slate-900 mb-3">📋 Quick Survey</div>
                            <div className="space-y-2">
                              <div className="bg-white rounded-lg p-2 text-xs text-slate-600">Your Name</div>
                              <div className="bg-white rounded-lg p-2 text-xs text-slate-600">Email Address</div>
                              <div className="bg-white rounded-lg p-2 text-xs text-slate-600">How can we help?</div>
                            </div>
                            <div className="mt-3 bg-primary text-white text-center py-2 rounded-lg text-sm font-medium">
                              Submit
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full py-2 px-4 text-xs text-slate-400">
                              Type a message
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium">AI Generated</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-xs font-medium">98% Completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-slate-500 mb-8">Trusted by teams worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, i) => (
              <div key={i} className="h-8 px-6 bg-slate-200 rounded flex items-center justify-center text-slate-500 text-sm font-medium">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Are WhatsApp Forms */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              What Are <span className="text-primary">WhatsApp Forms</span>?
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Why send users to external forms when you can collect details natively in WhatsApp? 
              AiReatro Forms guides users through booking, orders, surveys, and onboarding—
              <span className="font-medium text-slate-900"> without human intervention</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Why AiReatro Forms - Features Grid */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why <span className="text-primary">AiReatro Forms</span>?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for modern businesses that need intelligent, automated data collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group border-slate-100 bg-white hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {feature.isPro && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium rounded-full">
                      Pro
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Use Cases */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Unique <span className="text-primary">Use Cases</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From lead qualification to fintech applications, forms that work for every industry.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                  index % 2 === 1 ? 'md:grid-flow-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                    <img 
                      src={useCase.image} 
                      alt={useCase.title}
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {useCase.description}
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/signup">
                      Try This Template
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Library */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Template <span className="text-primary">Library</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get started instantly with pre-built templates for every use case.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {templates.map((template, index) => (
              <Card 
                key={index} 
                className="group border-slate-100 bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <template.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{template.description}</p>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    Use Template →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-lg text-slate-600">
              Setup in minutes. Start collecting responses today.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative text-center">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg mx-auto" style={{ left: 'calc(50% + 2rem)' }}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful <span className="text-primary">Integrations</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with Shopify, WooCommerce, Razorpay, Zapier, LeadSquared, WebEngage and more.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto mb-8">
            {integrations.map((integration, index) => (
              <div 
                key={index} 
                className="px-6 py-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-slate-700 font-medium"
              >
                {integration}
              </div>
            ))}
          </div>

          {/* Integration Health */}
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm text-slate-600">Integration Health:</span>
              <span className="text-sm font-medium text-slate-900">Event logs</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-medium text-slate-900">Retries</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-medium text-slate-900">Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Start collecting leads inside <span className="text-primary">WhatsApp</span> today.
            </h2>
            <p className="text-lg text-slate-300 mb-10">
              No credit card required. Setup in minutes. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base font-medium" asChild>
                <Link to="/signup">
                  Start for FREE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-base font-medium border-white/20 text-white hover:bg-white/10" 
                asChild
              >
                <Link to="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
