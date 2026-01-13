import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, HelpCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Pricing() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses getting started',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        '1 Phone Number',
        '1,000 Messages/month',
        '3 Team Members',
        'Basic Templates',
        'Email Support',
        '7-day Message History',
      ],
      notIncluded: [
        'Automation',
        'API Access',
        'Custom Integrations',
      ],
      popular: false,
      gradient: 'from-slate-500 to-slate-600'
    },
    {
      name: 'Growth',
      description: 'For growing teams with higher volume',
      monthlyPrice: 149,
      annualPrice: 119,
      features: [
        '3 Phone Numbers',
        '10,000 Messages/month',
        '10 Team Members',
        'Advanced Templates',
        'Automation Flows',
        'Priority Support',
        '30-day Message History',
        'Analytics Dashboard',
      ],
      notIncluded: [
        'API Access',
        'Custom Integrations',
      ],
      popular: true,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Business',
      description: 'Enterprise-grade for large organizations',
      monthlyPrice: 399,
      annualPrice: 319,
      features: [
        'Unlimited Phone Numbers',
        '50,000 Messages/month',
        'Unlimited Team Members',
        'Custom Templates',
        'Advanced Automation',
        'Full API Access',
        'Custom Integrations',
        'Dedicated Support',
        'Unlimited Message History',
        'SLA Guarantee',
      ],
      notIncluded: [],
      popular: false,
      gradient: 'from-purple-500 to-indigo-600'
    }
  ];

  const faqs = [
    {
      question: 'What happens after my free trial?',
      answer: 'After your 14-day free trial ends, you can choose to subscribe to any of our plans. If you don\'t subscribe, your account will be limited but your data will be preserved for 30 days.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately. When downgrading, changes take effect at the start of your next billing cycle.'
    },
    {
      question: 'What counts as a message?',
      answer: 'Each WhatsApp message you send counts as one message. Incoming messages from customers are free and don\'t count toward your limit. Template messages and media messages each count as one message.'
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for registered non-profit organizations. Contact our sales team with proof of non-profit status to learn more about our discounted rates.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. For enterprise customers, we also support invoicing.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No, there are no setup fees or hidden charges. The price you see is the price you pay. All features included in your plan are available from day one.'
    }
  ];

  const comparisonFeatures = [
    { name: 'Phone Numbers', starter: '1', growth: '3', business: 'Unlimited' },
    { name: 'Monthly Messages', starter: '1,000', growth: '10,000', business: '50,000' },
    { name: 'Team Members', starter: '3', growth: '10', business: 'Unlimited' },
    { name: 'Message Templates', starter: 'Basic', growth: 'Advanced', business: 'Custom' },
    { name: 'Automation', starter: '❌', growth: '✓', business: '✓' },
    { name: 'API Access', starter: '❌', growth: '❌', business: '✓' },
    { name: 'Analytics', starter: 'Basic', growth: 'Advanced', business: 'Full' },
    { name: 'Support', starter: 'Email', growth: 'Priority', business: 'Dedicated' },
    { name: 'Message History', starter: '7 days', growth: '30 days', business: 'Unlimited' },
    { name: 'SLA', starter: '❌', growth: '❌', business: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Start free for 14 days. No credit card required. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-white/50'}`}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-sm ${isAnnual ? 'text-white' : 'text-white/50'}`}>
                Annual <span className="text-green-400 font-medium">(Save 20%)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${plan.popular ? 'border-green-500 shadow-2xl shadow-green-500/10 scale-105 z-10' : 'border-border/50'}`}>
                {plan.popular && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient}`} />
                )}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 bg-gradient-to-r ${plan.gradient} text-white text-sm font-medium rounded-full shadow-lg`}>
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold text-foreground">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {isAnnual && (
                      <div className="text-sm text-green-600 mt-1">
                        Billed annually (${plan.annualPrice * 12}/year)
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-8">
                  <Button 
                    className={`w-full mb-6 h-12 ${plan.popular ? `bg-gradient-to-r ${plan.gradient} shadow-lg` : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/signup')}
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 opacity-40">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span className="line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the perfect plan for your business needs
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground bg-green-500/5">Growth</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground">{feature.name}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.starter}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground bg-green-500/5">{feature.growth}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.business}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-left text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your business.
          </p>
          <Button size="lg" className="h-14 px-8 bg-white text-green-600 hover:bg-white/90" onClick={() => navigate('/contact')}>
            Contact Sales
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
