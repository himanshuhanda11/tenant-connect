import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Check, 
  X, 
  ArrowRight, 
  Shield, 
  Zap, 
  MessageSquare, 
  Users, 
  Clock, 
  Globe,
  BadgeCheck,
  Sparkles,
  ChevronDown,
  Bot,
  BarChart3,
  Lock,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is WhatsApp API really free for lifetime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. WhatsApp Cloud API is free for lifetime. Meta does not charge any monthly API fee. Only conversation charges apply when you send or receive messages."
      }
    },
    {
      "@type": "Question",
      "name": "Is there any setup or monthly fee with Aireatro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Aireatro does not charge any setup or monthly platform fee. You only pay for WhatsApp conversation fees directly to Meta."
      }
    },
    {
      "@type": "Question",
      "name": "Who charges WhatsApp message fees?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WhatsApp (Meta) charges conversation-based fees. Aireatro does not add any markup on top of Meta's pricing."
      }
    },
    {
      "@type": "Question",
      "name": "Can I send bulk messages using free WhatsApp API?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can send bulk messages using approved WhatsApp message templates. Templates are submitted for Meta approval and usually approved within minutes."
      }
    },
    {
      "@type": "Question",
      "name": "How long does WhatsApp API approval take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Approval usually takes just a few minutes with WhatsApp Cloud API. Most businesses are live and sending messages within the same day."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between Cloud API and Business Solution Providers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cloud API is Meta's official, direct API with no middlemen and no monthly fees. BSPs (resellers) charge monthly platform fees on top of Meta's conversation costs."
      }
    },
    {
      "@type": "Question",
      "name": "Is there any message limit on the free WhatsApp API?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "New accounts start with 1,000 business-initiated conversations per day. This limit increases automatically as you maintain good quality and engagement."
      }
    }
  ]
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Aireatro - Free WhatsApp API Lifetime Platform",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free WhatsApp Cloud API access with no monthly platform fees"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "247"
  }
};

const comparisonData = [
  { feature: 'Monthly Platform Fee', aireatro: 'Free Forever', others: '$49-$299/month' },
  { feature: 'Setup Fee', aireatro: 'Free', others: '$99-$500' },
  { feature: 'API Type', aireatro: 'Official Cloud API', others: 'Often Reseller API' },
  { feature: 'Message Markup', aireatro: 'No Markup', others: '10-50% Markup' },
  { feature: 'Approval Time', aireatro: 'Minutes', others: 'Days to Weeks' },
  { feature: 'Lock-in Contract', aireatro: 'No Contract', others: 'Often 1-Year Lock' },
  { feature: 'AI Features', aireatro: 'Included Free', others: 'Paid Add-on' },
  { feature: 'Automation', aireatro: 'Unlimited Flows', others: 'Limited or Paid' },
];

const features = [
  {
    icon: Zap,
    title: 'Instant Setup',
    description: 'Connect your WhatsApp Business Account in under 5 minutes with Meta\'s embedded signup.'
  },
  {
    icon: Bot,
    title: 'AI-Powered Automation',
    description: 'Build intelligent chatbots and automated workflows without any coding required.'
  },
  {
    icon: MessageSquare,
    title: 'Bulk Messaging',
    description: 'Send personalized template messages to thousands of customers at once.'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track delivery rates, read receipts, and conversion metrics in one dashboard.'
  },
  {
    icon: Users,
    title: 'Team Inbox',
    description: 'Collaborative inbox for your team with smart routing and assignment rules.'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'End-to-end encryption, SOC 2 compliance, and role-based access controls.'
  },
];

const steps = [
  {
    step: '01',
    title: 'Sign Up Free',
    description: 'Create your Aireatro account in 30 seconds. No credit card required.',
  },
  {
    step: '02',
    title: 'Connect WhatsApp',
    description: 'Link your WhatsApp Business Account using Meta\'s secure embedded signup.',
  },
  {
    step: '03',
    title: 'Start Messaging',
    description: 'Create templates, build automations, and start engaging customers instantly.',
  },
];

const trustSignals = [
  { icon: BadgeCheck, text: 'Official Meta Cloud API Partner' },
  { icon: Shield, text: 'No Monthly Platform Fees' },
  { icon: Globe, text: 'Trusted by 10,000+ Businesses' },
  { icon: Clock, text: 'Setup in Under 5 Minutes' },
];

export default function FreeWhatsAppApiLifetime() {
  return (
    <>
      <Helmet>
        <title>Free WhatsApp API Lifetime | No Monthly Fees | Aireatro</title>
        <meta 
          name="description" 
          content="Get Free WhatsApp API Lifetime access with Aireatro. No monthly fees, no setup costs. Official Meta Cloud API with unlimited messaging. Start in 5 minutes." 
        />
        <meta 
          name="keywords" 
          content="free whatsapp api lifetime, whatsapp api free, whatsapp cloud api free, free whatsapp business api, whatsapp api no monthly fee" 
        />
        <link rel="canonical" href="https://aireatro.com/free-whatsapp-api-lifetime" />
        <meta property="og:title" content="Free WhatsApp API Lifetime | No Monthly Fees | Aireatro" />
        <meta property="og:description" content="Get Free WhatsApp API Lifetime access. No monthly fees, official Meta Cloud API." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aireatro.com/free-whatsapp-api-lifetime" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white pt-24 sm:pt-32 pb-16 sm:pb-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <BadgeCheck className="w-4 h-4" />
                Official Meta Cloud API Partner
              </div>

              {/* H1 with exact keyword */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Free WhatsApp API Lifetime
                <span className="block text-green-600 mt-2">No Monthly Fees. Ever.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Access WhatsApp Cloud API for free — forever. No platform fees, no hidden charges, no markup on messages. 
                Pay only what Meta charges for conversations.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 h-14 text-lg shadow-lg shadow-green-600/20"
                  asChild
                >
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 h-14 text-lg border-gray-300"
                  asChild
                >
                  <Link to="/pricing">
                    View Pricing Details
                  </Link>
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500">
                {trustSignals.map((signal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <signal.icon className="w-4 h-4 text-green-600" />
                    <span>{signal.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What Does Free WhatsApp API Lifetime Mean? */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                What Does "Free WhatsApp API Lifetime" Actually Mean?
              </h2>
              
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-lg leading-relaxed mb-6">
                  Many businesses search for "Free WhatsApp API Lifetime" hoping to find a way to use WhatsApp 
                  for business communication without ongoing monthly fees. Here's the truth:
                </p>

                <Card className="bg-green-50 border-green-200 mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      The Good News
                    </h3>
                    <p className="text-green-700">
                      <strong>WhatsApp Cloud API is genuinely free.</strong> Meta (WhatsApp's parent company) provides the API at no cost. 
                      There are no monthly API fees, no per-user charges, and no platform licensing costs.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200 mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      The Only Cost: Conversation Fees
                    </h3>
                    <p className="text-amber-700">
                      Meta charges per-conversation fees when you message customers. These vary by country 
                      (typically $0.005 - $0.08 per conversation). Customer-initiated conversations in 
                      response to your messages are free for 24 hours.
                    </p>
                  </CardContent>
                </Card>

                <div className="bg-gray-50 rounded-xl p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How Aireatro Makes It Truly Free
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>No platform fee</strong> — We don't charge monthly subscriptions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>No message markup</strong> — You pay Meta's exact rates, nothing extra</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>No setup fee</strong> — Get started immediately at zero cost</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Free AI features</strong> — Automation, chatbots, and analytics included</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                Aireatro vs Other WhatsApp Platforms
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
                See how Aireatro's truly free model compares to typical WhatsApp Business Solution Providers.
              </p>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Aireatro
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">Other Providers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comparisonData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{row.feature}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 text-green-700 font-medium text-sm">
                            <Check className="w-4 h-4" />
                            {row.aireatro}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 text-gray-500 text-sm">
                            <X className="w-4 h-4 text-red-400" />
                            {row.others}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {comparisonData.map((row, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">{row.feature}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <span className="text-xs text-green-600 font-medium block mb-1">Aireatro</span>
                          <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {row.aireatro}
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <span className="text-xs text-gray-500 font-medium block mb-1">Others</span>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <X className="w-3.5 h-3.5 text-red-400" />
                            {row.others}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works / Onboarding Steps */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                From signup to sending your first message in under 5 minutes.
              </p>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {steps.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="relative bg-gradient-to-b from-green-50 to-white rounded-2xl p-6 sm:p-8 border border-green-100"
                  >
                    <span className="text-5xl sm:text-6xl font-bold text-green-100 absolute top-4 right-4">
                      {item.step}
                    </span>
                    <div className="relative z-10">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 h-12"
                  asChild
                >
                  <Link to="/signup">
                    Start Free Now
                    <Rocket className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                Everything You Need — All Included Free
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Powerful features that other platforms charge extra for, included in your free account.
              </p>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, idx) => (
                  <Card key={idx} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="py-16 sm:py-20 bg-green-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                Trusted by Businesses Worldwide
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">10K+</div>
                  <div className="text-green-200 text-sm">Active Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">50M+</div>
                  <div className="text-green-200 text-sm">Messages Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-green-200 text-sm">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">24/7</div>
                  <div className="text-green-200 text-sm">Support Available</div>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                  <BadgeCheck className="w-4 h-4 mr-2" />
                  Official Cloud API
                </Badge>
                <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Enterprise Security
                </Badge>
                <Badge className="bg-white/20 text-white border-0 px-4 py-2">
                  <Lock className="w-4 h-4 mr-2" />
                  GDPR Compliant
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 text-center mb-10">
                Everything you need to know about Free WhatsApp API Lifetime access.
              </p>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {faqSchema.mainEntity.map((faq, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`}
                    className="bg-gray-50 rounded-xl border-0 px-6 data-[state=open]:bg-green-50"
                  >
                    <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-gray-900 hover:no-underline py-4">
                      {faq.name}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-sm sm:text-base pb-4">
                      {faq.acceptedAnswer.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready for Free WhatsApp API Lifetime?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                Join 10,000+ businesses using Aireatro to connect with customers on WhatsApp — 
                without monthly platform fees.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-10 h-14 text-lg shadow-lg shadow-green-600/20"
                  asChild
                >
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="w-full sm:w-auto text-gray-600 hover:text-gray-900"
                  asChild
                >
                  <Link to="/contact">
                    Talk to Sales
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                No credit card required · Setup in 5 minutes · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
