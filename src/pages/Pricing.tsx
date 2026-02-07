import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, HelpCircle, Zap, AlertCircle, X, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { pricingPlans, comparisonGroups, type PricingPlan } from '@/data/pricingPlans';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 'custom') return null;
    if (plan.price === 0) return 0;
    const monthly = plan.price;
    if (isAnnual) return Math.round(monthly * 0.8);
    return monthly;
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const faqs = [
    {
      question: 'How does workspace-based pricing work?',
      answer: 'Each workspace gets its own WhatsApp phone number and subscription plan. You can create multiple workspaces for different brands or departments, each with their own plan.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can change plans at any time. Upgrades are applied immediately, and downgrades take effect at the next billing cycle.',
    },
    {
      question: 'What are WhatsApp conversation charges?',
      answer: 'WhatsApp conversation fees are billed separately by Meta based on the type and volume of conversations. The first 1,000 user-initiated conversations per month are free.',
    },
    {
      question: 'Do I need a separate phone number for each workspace?',
      answer: 'Yes, each workspace is linked to one WhatsApp Business API phone number. This ensures clean separation of contacts, templates, and analytics.',
    },
    {
      question: 'What happens when I hit my plan limits?',
      answer: 'You\'ll receive alerts as you approach limits. You can either purchase add-ons or upgrade to a higher plan for more capacity.',
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/pricing" fallbackTitle="Pricing Plans - Aireatro" fallbackDescription="Simple, transparent pricing per workspace. Each workspace includes 1 WhatsApp number." />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-16 bg-white overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-green-500/3 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Per Workspace Pricing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-slate-900">Simple, transparent pricing</span>
              <br />
              <span className="text-green-600">— per workspace</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-4">
              Each workspace includes 1 WhatsApp number. Upgrade when you automate.
            </p>
            <p className="text-sm text-slate-500 mb-10">
              1 phone number per workspace • Plan applies per workspace
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-slate-100 border border-slate-200">
              <span className={cn('text-sm font-medium', !isAnnual ? 'text-slate-900' : 'text-slate-500')}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={cn('text-sm font-medium', isAnnual ? 'text-slate-900' : 'text-slate-500')}>
                Yearly <span className="text-green-600 ml-1">(Save 20%)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan) => {
              const price = getPrice(plan);
              const isCustom = plan.price === 'custom';

              return (
                <Card key={plan.id} className={cn(
                  'relative overflow-hidden flex flex-col transition-all',
                  plan.highlight && 'border-green-500 shadow-2xl shadow-green-500/10 lg:scale-105 z-10',
                )}>
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                  )}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-full shadow-lg gap-1">
                        <Sparkles className="w-3 h-3" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.tagline}</CardDescription>
                    <div className="mt-4">
                      {isCustom ? (
                        <span className="text-3xl font-bold text-foreground">Custom</span>
                      ) : price === 0 ? (
                        <span className="text-4xl font-bold text-foreground">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-foreground">{formatPrice(price!)}</span>
                          <span className="text-muted-foreground">/mo</span>
                          {isAnnual && (
                            <div className="text-xs text-green-600 mt-1">
                              Billed {formatPrice(price! * 12)}/year
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-6 flex-1 flex flex-col px-5">
                    <Button
                      className={cn(
                        'w-full mb-5 h-11',
                        plan.highlight && 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg hover:from-green-600 hover:to-emerald-600',
                      )}
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => isCustom ? navigate('/contact') : navigate('/signup')}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    {/* Limits summary */}
                    <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-muted/50 text-xs">
                      <div><span className="text-muted-foreground">Members:</span> <span className="font-medium">{plan.limits.team_members === 25 ? '25+' : plan.limits.team_members}</span></div>
                      <div><span className="text-muted-foreground">Contacts:</span> <span className="font-medium">{plan.limits.contacts === 'unlimited' ? '∞' : (plan.limits.contacts as number).toLocaleString('en-IN')}</span></div>
                      <div><span className="text-muted-foreground">Flows:</span> <span className="font-medium">{plan.limits.flows === 'unlimited' ? '∞' : plan.limits.flows === 0 ? '—' : plan.limits.flows}</span></div>
                      <div><span className="text-muted-foreground">AutoForms:</span> <span className="font-medium">{plan.limits.autoforms === 'unlimited' ? '∞' : plan.limits.autoforms === 0 ? '—' : plan.limits.autoforms}</span></div>
                      <div><span className="text-muted-foreground">Automations:</span> <span className="font-medium">{plan.limits.automations === 'unlimited' ? '∞' : plan.limits.automations === 0 ? '—' : plan.limits.automations}</span></div>
                      <div><span className="text-muted-foreground">AI:</span> <span className="font-medium capitalize">{plan.limits.ai_features}</span></div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 flex-1">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                      {plan.restrictions?.map((r, i) => (
                        <div key={`r-${i}`} className="flex items-center gap-2 opacity-40">
                          <X className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm line-through">{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Add-ons note */}
                    {plan.addons.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-4 text-center">
                        + Add-ons available
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            All paid plans include a 14-day free trial. No credit card required.
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
                    className="text-sm text-green-600 hover:underline inline-flex items-center gap-1"
                  >
                    View Meta's official pricing →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the perfect plan for your workspace
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Basic</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground bg-green-500/5">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparisonGroups.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr>
                      <td colSpan={5} className="pt-6 pb-2 px-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-green-600">
                          {group.category}
                        </span>
                      </td>
                    </tr>
                    {group.features.map((feature, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3 px-4 text-sm text-foreground">{feature.name}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{feature.free}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{feature.basic}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground bg-green-500/5 font-medium">{feature.pro}</td>
                        <td className="py-3 px-4 text-center text-sm text-muted-foreground">{feature.business}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Official Partner
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Built on Official WhatsApp Business API
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            No WhatsApp ban risk. Enterprise-grade reliability with Meta's official infrastructure.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
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
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start free — no credit card required. Upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-green-600 hover:bg-white/90" onClick={() => navigate('/signup')}>
              Start Free
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
