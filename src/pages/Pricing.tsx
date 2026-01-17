import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, HelpCircle, Zap, AlertCircle, Plus, Users, Phone, Bot, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';
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
      name: 'Free',
      description: 'Try AiReatro risk-free',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        '1 Phone Number',
        '500 Messages/month',
        '1 Team Member',
        '5 Basic Templates',
        'Community Support',
        '3-day Message History',
      ],
      notIncluded: [
        'Automation',
        'API Access',
        'Custom Integrations',
        'Analytics',
      ],
      popular: false,
      gradient: 'from-slate-400 to-slate-500'
    },
    {
      name: 'Basic',
      description: 'For small businesses getting started',
      monthlyPrice: 29,
      annualPrice: 23,
      features: [
        '1 Phone Number',
        '2,000 Messages/month',
        '3 Team Members',
        '10 Templates',
        'Email Support',
        '7-day Message History',
        'Basic Analytics',
      ],
      notIncluded: [
        'Automation',
        'API Access',
        'Custom Integrations',
      ],
      popular: false,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Standard',
      description: 'For growing teams with higher volume',
      monthlyPrice: 79,
      annualPrice: 63,
      features: [
        '3 Phone Numbers',
        '10,000 Messages/month',
        '10 Team Members',
        'Unlimited Templates',
        'Automation Flows',
        'AI Reply Suggestions',
        'AI Intent Detection',
        'Priority Support',
        '30-day Message History',
        'Advanced Analytics',
      ],
      notIncluded: [
        'API Access',
        'Custom Integrations',
      ],
      popular: true,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Pro',
      description: 'Enterprise-grade for large organizations',
      monthlyPrice: 199,
      annualPrice: 159,
      features: [
        'Unlimited Phone Numbers',
        '50,000 Messages/month',
        'Unlimited Team Members',
        'Custom Templates',
        'Advanced Automation',
        'AI Reply Suggestions',
        'AI Intent Detection',
        'AI Flow Builder',
        'AI Insights Dashboard',
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
    { name: 'Phone Numbers', free: '1', basic: '1', standard: '3', pro: 'Unlimited' },
    { name: 'Monthly Messages', free: '500', basic: '2,000', standard: '10,000', pro: '50,000' },
    { name: 'Team Members', free: '1', basic: '3', standard: '10', pro: 'Unlimited' },
    { name: 'Message Templates', free: '5', basic: '10', standard: 'Unlimited', pro: 'Custom' },
    { name: 'Automation', free: '❌', basic: '❌', standard: '✓', pro: 'Advanced' },
    { name: 'AI Reply Suggestions', free: '❌', basic: '❌', standard: '✓', pro: '✓' },
    { name: 'AI Intent Detection', free: '❌', basic: '❌', standard: '✓', pro: '✓' },
    { name: 'AI Flow Builder', free: '❌', basic: '❌', standard: '❌', pro: '✓' },
    { name: 'AI Insights', free: '❌', basic: '❌', standard: '❌', pro: '✓' },
    { name: 'API Access', free: '❌', basic: '❌', standard: '❌', pro: '✓' },
    { name: 'Analytics', free: '❌', basic: 'Basic', standard: 'Advanced', pro: 'Full' },
    { name: 'Support', free: 'Community', basic: 'Email', standard: 'Priority', pro: 'Dedicated' },
    { name: 'Message History', free: '3 days', basic: '7 days', standard: '30 days', pro: 'Unlimited' },
    { name: 'SLA', free: '❌', basic: '❌', standard: '❌', pro: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing Plans — WhatsApp Business API | AiReatro"
        description="Simple, transparent pricing for WhatsApp Business API. Start free with 500 messages/month. No hidden fees. Plans from $0 to $199/month with AI automation and team inbox."
        canonical="/pricing"
        keywords={['whatsapp api pricing', 'whatsapp business pricing', 'whatsapp automation cost', 'team inbox pricing', 'whatsapp chatbot pricing']}
      />
      <Navbar />

      {/* Hero - Classic Design */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-slate-900">Choose Your</span>{' '}
              <span className="text-primary">Perfect Plan</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Start free for 14 days. No credit card required. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-slate-100 border border-slate-200">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual <span className="text-primary ml-1">(Save 20%)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden flex flex-col ${plan.popular ? 'border-green-500 shadow-2xl shadow-green-500/10 lg:scale-105 z-10' : 'border-border/50'}`}>
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
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    {plan.monthlyPrice === 0 ? (
                      <span className="text-4xl font-bold text-foreground">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </>
                    )}
                    {isAnnual && plan.annualPrice > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Billed ${plan.annualPrice * 12}/year
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-6 flex-1 flex flex-col">
                  <Button 
                    className={`w-full mb-5 h-11 ${plan.popular ? `bg-gradient-to-r ${plan.gradient} shadow-lg` : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/signup')}
                  >
                    {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Start Free Trial'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 opacity-40">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>

          {/* Meta Billing Note */}
          <Card className="mt-12 max-w-3xl mx-auto border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important: WhatsApp Conversation Charges</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    WhatsApp conversation fees are <strong>billed separately by Meta</strong> and are not included in our platform subscription. 
                    These charges are based on the type and volume of conversations you have with customers.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                    <li>• <strong>User-initiated:</strong> When customers message you first (lower cost)</li>
                    <li>• <strong>Business-initiated:</strong> When you start conversations with templates (higher cost)</li>
                    <li>• <strong>Free tier:</strong> First 1,000 user-initiated conversations/month are free</li>
                  </ul>
                  <a 
                    href="https://business.whatsapp.com/products/platform-pricing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Meta's official pricing →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-6">
              <Plus className="w-4 h-4" />
              Flexible Add-ons
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Scale As You Grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Need more capacity? Add extra resources to any plan without upgrading.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Extra Team Members</h3>
                <div className="text-3xl font-bold text-foreground mb-1">$10</div>
                <p className="text-sm text-muted-foreground mb-4">per user / month</p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Full inbox access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Role-based permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Activity tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Extra Phone Numbers</h3>
                <div className="text-3xl font-bold text-foreground mb-1">$25</div>
                <p className="text-sm text-muted-foreground mb-4">per number / month</p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Dedicated WABA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Separate templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Multi-brand support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Advanced Automation</h3>
                <div className="text-3xl font-bold text-foreground mb-1">$49</div>
                <p className="text-sm text-muted-foreground mb-4">per month</p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Unlimited workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    AI-powered responses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Custom triggers
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Extra Messages</h3>
                <div className="text-3xl font-bold text-foreground mb-1">$20</div>
                <p className="text-sm text-muted-foreground mb-4">per 5,000 messages</p>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    No expiry
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Rollover unused
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Volume discounts
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm">
            Add-ons can be added or removed at any time from your account settings.
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

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Basic</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground bg-green-500/5">Standard</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground">{feature.name}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.free}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.basic}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground bg-green-500/5">{feature.standard}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.pro}</td>
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
