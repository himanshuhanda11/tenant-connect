import React, { useState } from 'react';
import {
  CheckCircle2, ArrowRight, HelpCircle, Zap, AlertCircle, X, Shield, Sparkles,
  Users, Phone, Contact, Tag, Bot, Workflow, Brain, MessageSquare,
  Rocket, Crown, Building2, Gift, Star, TrendingUp, Lock, HeadphonesIcon,
  ChevronRight, Globe, BarChart3, Check, Plus
} from 'lucide-react';
import { addOns, addOnCategories, formatINR as formatAddOnINR, type AddOnCategory } from '@/data/addOns';
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

const planIcons: Record<string, React.ReactNode> = {
  free: <Gift className="w-6 h-6" />,
  basic: <Rocket className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  business: <Building2 className="w-6 h-6" />,
};

const planColors: Record<string, { bg: string; text: string; border: string; badge: string; iconBg: string }> = {
  free: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600', iconBg: 'bg-slate-100' },
  basic: { bg: 'bg-blue-50/50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-100' },
  pro: { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary', badge: 'bg-primary text-primary-foreground', iconBg: 'bg-primary/10' },
  business: { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-100' },
};

const limitIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  team_members: Users,
  contacts: Contact,
  flows: Workflow,
  autoforms: MessageSquare,
  automations: Bot,
  ai_features: Brain,
};

export default function Pricing() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 'custom') return null;
    if (plan.price === 0) return 0;
    const monthly = plan.price;
    return isAnnual ? Math.round(monthly * 0.8) : monthly;
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const faqs = [
    { question: 'How does workspace-based pricing work?', answer: 'Each workspace gets its own WhatsApp phone number and subscription plan. You can create multiple workspaces for different brands or departments, each with their own plan.' },
    { question: 'Can I upgrade or downgrade my plan?', answer: 'Yes, you can change plans at any time. Upgrades are applied immediately, and downgrades take effect at the next billing cycle.' },
    { question: 'What are WhatsApp conversation charges?', answer: 'WhatsApp conversation fees are billed separately by Meta based on the type and volume of conversations. The first 1,000 user-initiated conversations per month are free.' },
    { question: 'Do I need a separate phone number for each workspace?', answer: 'Yes, each workspace is linked to one WhatsApp Business API phone number. This ensures clean separation of contacts, templates, and analytics.' },
    { question: 'What happens when I hit my plan limits?', answer: "You'll receive alerts as you approach limits. You can either purchase add-ons or upgrade to a higher plan for more capacity." },
    { question: 'Is the Free plan really free forever?', answer: 'Yes! The Free plan has no time limit. Use it for as long as you need. When you are ready to grow, upgrade to a paid plan for more features and capacity.' },
  ];

  const trustedBy = [
    { icon: Globe, label: '2,000+ Businesses' },
    { icon: MessageSquare, label: '50M+ Messages Sent' },
    { icon: Users, label: '10,000+ Users' },
    { icon: Star, label: '4.8/5 Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route="/pricing" fallbackTitle="Pricing Plans - Aireatro" fallbackDescription="Simple, transparent pricing per workspace. Each workspace includes 1 WhatsApp number." />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20 pb-6 md:pt-28 md:pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl hidden md:block" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl hidden md:block" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Per Workspace Pricing
              <Phone className="w-3.5 h-3.5 ml-1" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-foreground">
              Simple, transparent pricing
              <br className="hidden sm:block" />
              <span className="text-primary"> — per workspace</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
              Each workspace includes 1 WhatsApp number. Upgrade when you automate.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60">
                <Phone className="w-3 h-3" /> 1 number per workspace
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60">
                <Gift className="w-3 h-3" /> Free plan available
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60">
                <Lock className="w-3 h-3" /> No credit card required
              </span>
            </div>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-card border border-border shadow-sm">
              <span className={cn('text-sm font-medium transition-colors', !isAnnual ? 'text-foreground' : 'text-muted-foreground')}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span className={cn('text-sm font-medium transition-colors', isAnnual ? 'text-foreground' : 'text-muted-foreground')}>
                Yearly
              </span>
              {isAnnual && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs animate-fade-in">Save 20%</Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {pricingPlans.map((plan) => {
              const price = getPrice(plan);
              const isCustom = plan.price === 'custom';
              const colors = planColors[plan.id];

              return (
                <Card key={plan.id} className={cn(
                  'relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl group',
                  plan.highlight
                    ? 'border-primary shadow-2xl shadow-primary/10 lg:scale-[1.04] z-10 ring-1 ring-primary/20'
                    : 'hover:border-primary/30',
                )}>
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
                  )}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="px-4 py-1.5 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-semibold rounded-full shadow-lg gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-3">
                    <div className={cn('w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center', colors.iconBg, colors.text)}>
                      {planIcons[plan.id]}
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{plan.tagline}</CardDescription>
                    <div className="mt-5">
                      {isCustom ? (
                        <span className="text-3xl font-bold text-foreground">Custom</span>
                      ) : price === 0 ? (
                        <div>
                          <span className="text-4xl font-bold text-foreground">Free</span>
                          <p className="text-xs text-muted-foreground mt-1">Forever</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-sm text-muted-foreground line-through opacity-60">
                              {isAnnual ? formatPrice(plan.price as number) : ''}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-center gap-0.5">
                            <span className="text-4xl font-bold text-foreground">{formatPrice(price!)}</span>
                            <span className="text-muted-foreground text-sm">/mo</span>
                          </div>
                          {isAnnual && (
                            <p className="text-xs text-primary font-medium mt-1">
                              Billed {formatPrice(price! * 12)}/year
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-6 flex-1 flex flex-col px-5">
                    <Button
                      className={cn(
                        'w-full mb-5 h-11 font-semibold gap-2 transition-all',
                        plan.highlight && 'bg-gradient-to-r from-primary to-emerald-500 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
                      )}
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => isCustom ? navigate('/contact') : navigate('/signup')}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    {/* Limits grid with icons */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5 p-3.5 rounded-xl bg-muted/40 border border-border/50">
                      {[
                        { key: 'team_members', label: 'Members', value: plan.limits.team_members === 25 ? '25+' : plan.limits.team_members },
                        { key: 'contacts', label: 'Contacts', value: plan.limits.contacts === 'unlimited' ? '∞' : (plan.limits.contacts as number).toLocaleString('en-IN') },
                        { key: 'flows', label: 'Flows', value: plan.limits.flows === 'unlimited' ? '∞' : plan.limits.flows === 0 ? '—' : plan.limits.flows },
                        { key: 'autoforms', label: 'AutoForms', value: plan.limits.autoforms === 'unlimited' ? '∞' : plan.limits.autoforms === 0 ? '—' : plan.limits.autoforms },
                        { key: 'automations', label: 'Automations', value: plan.limits.automations === 'unlimited' ? '∞' : plan.limits.automations === 0 ? '—' : plan.limits.automations },
                        { key: 'ai_features', label: 'AI', value: plan.limits.ai_features },
                      ].map((item) => {
                        const Icon = limitIcons[item.key];
                        return (
                          <div key={item.key} className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
                              <p className="text-xs font-semibold text-foreground capitalize truncate">{item.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Features */}
                    <div className="space-y-2 flex-1">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground leading-snug">{feature}</span>
                        </div>
                      ))}
                      {plan.restrictions?.map((r, i) => (
                        <div key={`r-${i}`} className="flex items-start gap-2.5 opacity-40">
                          <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="text-sm line-through leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>

                    {plan.addons.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50 text-center">
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Add-ons available
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm">
            Start free — no credit card required. Upgrade anytime.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustedBy.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meta Billing Note */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important: WhatsApp Conversation Charges</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    WhatsApp conversation fees are <strong>billed separately by Meta</strong> and are not included in our platform subscription.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1.5 mb-3">
                    <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> <strong>User-initiated:</strong> When customers message you first (lower cost)</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> <strong>Business-initiated:</strong> When you start conversations with templates (higher cost)</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> <strong>Free tier:</strong> First 1,000 user-initiated conversations/month are free</li>
                  </ul>
                  <a
                    href="https://business.whatsapp.com/products/platform-pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    View Meta's official pricing <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Premium Comparison Table */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Feature Comparison
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Compare Plans Side by Side
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every feature, every limit — at a glance
            </p>
          </div>

          {/* Mobile: Premium accordion cards */}
          <div className="block md:hidden max-w-lg mx-auto space-y-3">
            {comparisonGroups.map((group, gi) => (
              <Accordion key={gi} type="single" collapsible>
                <AccordionItem value={`cg-${gi}`} className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                  <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-foreground hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      {group.category}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    <div className="space-y-3">
                      {group.features.map((feature, fi) => (
                        <div key={fi} className="rounded-xl border border-border/50 overflow-hidden">
                          <div className="bg-muted/30 px-3.5 py-2">
                            <p className="text-sm font-medium text-foreground">{feature.name}</p>
                          </div>
                          <div className="grid grid-cols-4 divide-x divide-border/40">
                            {(['free', 'basic', 'pro', 'business'] as const).map((tier) => (
                              <div key={tier} className={cn(
                                'text-center py-2.5 px-1.5',
                                tier === 'pro' && 'bg-primary/5'
                              )}>
                                <p className={cn(
                                  'text-[9px] uppercase tracking-wider mb-0.5 font-medium',
                                  tier === 'pro' ? 'text-primary' : 'text-muted-foreground'
                                )}>{tier}</p>
                                <div className="text-xs font-semibold text-foreground">
                                  {renderCellMobile(feature[tier], tier === 'pro')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>

          {/* Desktop: Premium glassmorphism table */}
          <div className="hidden md:block max-w-6xl mx-auto">
            <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Sticky header with plan columns */}
                  <thead>
                    <tr className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50">
                      <th className="text-left py-5 px-6 w-[280px]">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Feature</span>
                      </th>
                      {/* Free */}
                      <th className="text-center py-5 px-3 w-[140px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Gift className="w-4.5 h-4.5 text-slate-500" />
                          </div>
                          <span className="text-sm font-bold text-foreground">Free</span>
                          <span className="text-xs text-muted-foreground">₹0/mo</span>
                        </div>
                      </th>
                      {/* Basic */}
                      <th className="text-center py-5 px-3 w-[140px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Rocket className="w-4.5 h-4.5 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-foreground">Basic</span>
                          <span className="text-xs text-muted-foreground">{isAnnual ? '₹1,199' : '₹1,499'}/mo</span>
                        </div>
                      </th>
                      {/* Pro — highlighted column */}
                      <th className="text-center py-5 px-3 w-[140px] relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500" />
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full">
                          <Badge className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-[10px] px-2.5 py-0.5 rounded-full shadow-lg gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Popular
                          </Badge>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                            <Crown className="w-4.5 h-4.5 text-primary" />
                          </div>
                          <span className="text-sm font-bold text-primary">Pro</span>
                          <span className="text-xs text-primary font-medium">{isAnnual ? '₹2,799' : '₹3,499'}/mo</span>
                        </div>
                      </th>
                      {/* Business */}
                      <th className="text-center py-5 px-3 w-[140px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Building2 className="w-4.5 h-4.5 text-amber-600" />
                          </div>
                          <span className="text-sm font-bold text-foreground">Business</span>
                          <span className="text-xs text-muted-foreground">Custom</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonGroups.map((group, gi) => (
                      <React.Fragment key={group.category}>
                        {/* Category header row */}
                        <tr>
                          <td colSpan={5} className={cn(
                            'px-6 pt-6 pb-2',
                            gi > 0 && 'border-t border-border/50'
                          )}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                                <Zap className="w-3 h-3 text-primary" />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                {group.category}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {/* Feature rows */}
                        {group.features.map((feature, idx) => (
                          <tr
                            key={idx}
                            className="group/row border-b border-border/20 last:border-b-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3.5 px-6 text-sm text-foreground font-medium">
                              {feature.name}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {renderCellDesktop(feature.free, false)}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {renderCellDesktop(feature.basic, false)}
                            </td>
                            <td className="py-3.5 px-3 text-center bg-primary/[0.03]">
                              {renderCellDesktop(feature.pro, true)}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {renderCellDesktop(feature.business, false)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {/* CTA row at bottom of table */}
                    <tr className="border-t border-border/50">
                      <td className="py-5 px-6" />
                      <td className="py-5 px-3 text-center">
                        <Button size="sm" variant="outline" className="text-xs h-8 px-4" onClick={() => navigate('/signup')}>
                          Start Free
                        </Button>
                      </td>
                      <td className="py-5 px-3 text-center">
                        <Button size="sm" variant="outline" className="text-xs h-8 px-4" onClick={() => navigate('/signup')}>
                          Get Basic
                        </Button>
                      </td>
                      <td className="py-5 px-3 text-center bg-primary/[0.03]">
                        <Button size="sm" className="text-xs h-8 px-4 bg-gradient-to-r from-primary to-emerald-500 shadow-md" onClick={() => navigate('/signup')}>
                          Start Pro
                        </Button>
                      </td>
                      <td className="py-5 px-3 text-center">
                        <Button size="sm" variant="outline" className="text-xs h-8 px-4" onClick={() => navigate('/contact')}>
                          Contact Sales
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add-Ons Showcase */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add-Ons
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Scale When You Grow
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Extend any paid plan with add-ons — no plan change required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {addOns.map((addon) => {
              const Icon = addon.icon;
              return (
                <div
                  key={addon.id}
                  className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30"
                >
                  {addon.badge && (
                    <Badge variant="secondary" className="absolute -top-2 right-3 text-[10px]">
                      {addon.badge}
                    </Badge>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{addon.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{addon.benefit}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{addon.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      <span className="font-bold text-foreground">Starting at {formatAddOnINR(addon.price)}</span>
                      <span className="text-muted-foreground text-xs block">{addon.unit}</span>
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    Available on: {addon.availableOn.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Official Meta Partner
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Built on Official WhatsApp Business API
          </h2>
          <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
            No WhatsApp ban risk. Enterprise-grade reliability with Meta's official infrastructure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-60">
            <span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4" /> SOC2 Compliant</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4" /> End-to-End Encrypted</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Globe className="w-4 h-4" /> GDPR Ready</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-xl px-5 bg-card hover:border-primary/30 transition-colors">
                  <AccordionTrigger className="text-left text-foreground hover:no-underline text-sm sm:text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary via-emerald-500 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Start free — no credit card required. Upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-13 px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-xl" onClick={() => navigate('/signup')}>
              Start Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold" onClick={() => navigate('/contact')}>
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Cell renderers ── */

function renderCellDesktop(value: string, isPro: boolean) {
  if (value === '✓') {
    return (
      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
        <Check className={cn('w-4 h-4', isPro ? 'text-primary' : 'text-primary')} />
      </div>
    );
  }
  if (value === '—') {
    return (
      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted/50">
        <X className="w-3.5 h-3.5 text-muted-foreground/30" />
      </div>
    );
  }
  if (value === 'Unlimited') {
    return <span className={cn('text-sm font-bold', isPro ? 'text-primary' : 'text-foreground')}>∞</span>;
  }
  return (
    <span className={cn(
      'text-sm font-medium',
      isPro ? 'text-primary font-semibold' : 'text-foreground'
    )}>
      {value}
    </span>
  );
}

function renderCellMobile(value: string, isPro: boolean) {
  if (value === '✓') return <Check className={cn('w-3.5 h-3.5 mx-auto', isPro ? 'text-primary' : 'text-primary')} />;
  if (value === '—') return <X className="w-3 h-3 mx-auto text-muted-foreground/30" />;
  if (value === 'Unlimited') return <span className={cn('text-[11px] font-bold', isPro ? 'text-primary' : '')}>∞</span>;
  return <span className={cn('text-[11px]', isPro ? 'text-primary font-bold' : '')}>{value}</span>;
}
