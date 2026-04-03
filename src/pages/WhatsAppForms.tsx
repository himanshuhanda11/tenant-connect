import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  GitBranch, 
  Shield, 
  Webhook, 
  BarChart3, 
  Target,
  Zap,
  Layout,
  ShoppingCart,
  Calendar,
  FileText,
  Star,
  Ticket,
  CreditCard,
  ShieldCheck,
  Phone,
  ArrowRight,
  CheckCircle2,
  Share2,
  Settings2,
  Bot,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { JsonLd, organizationSchema, softwareApplicationSchema } from '@/components/seo';

// Import images
import heroImage from '@/assets/whatsapp-forms-hero.png';
import aiBuilderImage from '@/assets/forms-ai-builder.png';
import conditionalLogicImage from '@/assets/forms-conditional-logic.png';
import fintechImage from '@/assets/forms-fintech.png';
import surveysImage from '@/assets/forms-surveys.png';
import ctaImage from '@/assets/forms-cta.png';

export default function WhatsAppForms() {
  const features = [
    {
      icon: Bot,
      title: 'AI Form Builder',
      headline: 'Create forms from intent, not fields.',
      description: 'Just describe what you want to collect — AI builds the WhatsApp form, flow logic, and validations automatically.',
      isPro: false,
    },
    {
      icon: GitBranch,
      title: 'Conditional Logic & Branching',
      headline: 'Forms that adapt in real time.',
      description: 'Show or skip questions based on user responses to qualify leads and reduce drop-offs.',
      isPro: true,
    },
    {
      icon: Shield,
      title: 'Smart Validation & Identity Checks',
      headline: 'Collect accurate, verified data.',
      description: 'Auto-validate inputs, verify users with OTP, and securely collect documents directly in WhatsApp.',
      isPro: true,
    },
    {
      icon: Webhook,
      title: 'Integrations & Webhooks',
      headline: 'Your data, synced instantly.',
      description: 'Push form responses to CRMs, payment systems, and tools using APIs, webhooks, Zapier, or native integrations.',
      isPro: false,
    },
    {
      icon: BarChart3,
      title: 'Form Analytics & Drop-off Insights',
      headline: 'Know exactly where users quit.',
      description: 'Track question-level completion, drop-offs, and get AI suggestions to improve form performance.',
      isPro: true,
    },
    {
      icon: Target,
      title: 'End-to-End Attribution',
      headline: 'Track what actually converts.',
      description: 'Connect Meta Ads → WhatsApp Form → Flow → Agent → Conversion in one clear journey.',
      isPro: false,
    },
    {
      icon: Zap,
      title: 'Native WhatsApp Experience',
      headline: 'No links. No browsers. No friction.',
      description: 'Forms open and complete directly inside WhatsApp for higher engagement and faster responses.',
      isPro: false,
    },
    {
      icon: Layout,
      title: 'Template Library',
      headline: 'Launch in minutes, not hours.',
      description: 'Use ready-made form templates for common business scenarios and customize them instantly.',
      isPro: false,
    },
  ];

  const templates = [
    { 
      icon: ShoppingCart, 
      title: 'Order Placement', 
      description: 'Collect product selection, quantity, delivery location, and payment preference — then trigger order confirmation automatically.' 
    },
    { 
      icon: Calendar, 
      title: 'Appointment Booking', 
      description: 'Capture customer details, preferred date/time, and service type. Instantly confirm bookings via WhatsApp.' 
    },
    { 
      icon: FileText, 
      title: 'Quotation Request', 
      description: 'Let users specify requirements, budget, and urgency. Send personalized quotes automatically.' 
    },
    { 
      icon: Star, 
      title: 'Customer Feedback', 
      description: 'Collect ratings, comments, and suggestions after service completion — without human follow-up.' 
    },
    { 
      icon: Ticket, 
      title: 'Event Registration', 
      description: 'Capture attendee details and preferences. Confirm registration and send reminders via WhatsApp.' 
    },
    { 
      icon: CreditCard, 
      title: 'Loan / Credit Application', 
      description: 'Show pre-approved offers, collect financial details, verify identity, and route applications securely.' 
    },
    { 
      icon: ShieldCheck, 
      title: 'Insurance Quote', 
      description: 'Gather coverage needs, member details, and risk factors. Generate personalized insurance options instantly.' 
    },
    { 
      icon: Phone, 
      title: 'General Contact / Lead Form', 
      description: 'Collect contact details and intent, then route leads to the right team or automation.' 
    },
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
      <SeoMeta route="/whatsapp-forms" fallbackTitle="WhatsApp Forms" fallbackDescription="AI-Powered Form Builder for WhatsApp" />
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
          <Breadcrumb className="mb-6" />
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
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Powered by Official WhatsApp Business API</span>
                </div>
              </div>

              {/* Right: Hero Image */}
              <div className="relative animate-fade-in">
                <img 
                  src={heroImage} 
                  alt="WhatsApp Forms - AI-powered form builder for WhatsApp Business" 
                  className="w-full h-auto rounded-2xl shadow-2xl shadow-primary/10"
                />
              </div>
            </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{feature.headline}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlight - AI Form Builder */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Bot className="w-4 h-4" />
                  AI-Powered
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Describe Your Goal. <span className="text-primary">AI Builds the Form.</span>
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Just type what you want to collect — like "qualify leads for a home loan" — and our AI 
                  creates the complete form with validation rules, branching logic, and WhatsApp-native formatting.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Auto-generated field validation', 'Smart branching based on responses', 'WhatsApp-optimized layout', 'One-click customization'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link to="/signup">
                    Try AI Form Builder
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <img 
                  src={aiBuilderImage} 
                  alt="AI Form Builder - Generate WhatsApp forms with AI"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlight - Conditional Logic */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img 
                  src={conditionalLogicImage} 
                  alt="Conditional Logic - Dynamic form branching"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-4">
                  <GitBranch className="w-4 h-4" />
                  Pro Feature
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Forms That <span className="text-primary">Adapt in Real Time</span>
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  Create intelligent forms that show or skip questions based on previous answers. 
                  Qualify leads faster, reduce friction, and increase completion rates.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Dynamic show/hide logic', 'Multi-path branching', 'Score-based routing', 'Personalized journeys'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link to="/signup">
                    Explore Pro Features
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases with Images */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for <span className="text-primary">Every Industry</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From lead qualification to fintech applications, forms that work for every use case.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Fintech Use Case */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
                  <CreditCard className="w-4 h-4" />
                  Fintech & Banking
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Loan & Credit Applications
                </h3>
                <p className="text-lg text-slate-600 mb-6">
                  Show pre-approved offers, collect financial details, verify identity with OTP, 
                  and route applications securely — all within WhatsApp.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/signup">
                    Use This Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div>
                <img 
                  src={fintechImage} 
                  alt="Loan application form in WhatsApp"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>

            {/* Surveys Use Case */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1">
                <img 
                  src={surveysImage} 
                  alt="Customer feedback survey in WhatsApp"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-4">
                  <Star className="w-4 h-4" />
                  Customer Experience
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Surveys & Feedback Collection
                </h3>
                <p className="text-lg text-slate-600 mb-6">
                  Collect NPS scores, ratings, and detailed feedback directly in WhatsApp. 
                  Higher response rates than email or web forms.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/signup">
                    Use This Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {templates.map((template, index) => (
              <Card 
                key={index} 
                className="group border-slate-100 bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <template.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-3">{template.description}</p>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0">
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
                <div key={index} className="relative text-center group">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 left-1/2 transform translate-x-8 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg">
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
          <div className="flex items-center justify-center">
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
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Start collecting leads inside <span className="text-primary">WhatsApp</span> today.
                </h2>
                <p className="text-lg text-slate-300 mb-10">
                  No credit card required. Setup in minutes. Cancel anytime.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <Button size="lg" className="h-14 px-8 text-base font-medium" asChild>
                    <Link to="/signup">
                      Start for FREE
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-8 text-base font-medium border-white/40 text-white hover:bg-white/10 hover:text-white" 
                    asChild
                  >
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src={ctaImage} 
                  alt="Get started with WhatsApp Forms"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
