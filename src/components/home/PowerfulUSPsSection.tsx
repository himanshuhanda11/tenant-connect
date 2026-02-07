import React from 'react';
import {
  Activity, Brain, TrendingUp, Flame, Layout, Sparkles,
  Crown, Plug, Users, Zap, Check, X, Minus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type UspVariant = 'primary' | 'accent' | 'muted';

const usps: Array<{
  number: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  cta: string;
  variant: UspVariant;
}> = [
  {
    number: '01',
    icon: Activity,
    title: 'Diagnostics Everywhere',
    subtitle: 'Not Just Analytics',
    description: "Most platforms show numbers. AiReatro tells you what's broken and why.",
    bullets: ['Broken flow paths', 'Missing replies', 'SLA breaches', 'Drop-off causes', 'Unapproved templates'],
    cta: "You don't guess. You fix.",
    variant: 'primary',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Insights',
    subtitle: 'Not Raw Data',
    description: 'Others show dashboards. AiReatro explains the dashboard.',
    bullets: [
      '"Replies dropped because message was too long"',
      '"Leads from Campaign X have low intent"',
      '"Flow #3 causes 42% drop-off"',
    ],
    cta: 'AI turns data into actions.',
    variant: 'accent',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'True End-to-End Attribution',
    subtitle: 'Full Journey Tracking',
    description: 'Meta Ad → WhatsApp → Flow → Agent → Conversion — connected.',
    bullets: ['Most tools stop at messages', 'AiReatro shows what actually made money'],
    cta: 'You know exactly where to invest.',
    variant: 'muted',
  },
  {
    number: '04',
    icon: Flame,
    title: 'Flow Health Score + Heatmaps',
    subtitle: 'Measured Performance',
    description: "Flows don't just run — they're measured.",
    bullets: ['Node-level completion', 'Heatmaps', 'Version comparison', 'Before/after performance'],
    cta: 'Flows become conversion assets, not guesswork.',
    variant: 'primary',
  },
  {
    number: '05',
    icon: Layout,
    title: 'Clean, Calm, Enterprise UI',
    subtitle: 'Designed for Daily Use',
    description: 'Competitors overwhelm teams with clutter. AiReatro is built for focus.',
    bullets: ['Whitespace-first design', 'Clear hierarchy', 'Focused screens', 'No noise'],
    cta: 'Teams actually enjoy using it.',
    variant: 'accent',
  },
  {
    number: '06',
    icon: Sparkles,
    title: 'AI-First, Not AI-Added',
    subtitle: 'Built-in Intelligence',
    description: 'AI is not bolted on later — it actively improves outcomes.',
    bullets: ['AI flow generation from goals', 'AI reply suggestions with tone control', 'AI lead quality scoring', 'AI growth recommendations'],
    cta: 'AI actively improves outcomes.',
    variant: 'muted',
  },
  {
    number: '07',
    icon: Crown,
    title: 'Pro Features That Matter',
    subtitle: 'Not Artificial Limits',
    description: 'Instead of crippling basics, Pro unlocks real power.',
    bullets: ['Diagnostics', 'Attribution', 'Versioning', 'Conditions', 'Advanced routing'],
    cta: 'Pay more → get smarter tools.',
    variant: 'primary',
  },
  {
    number: '08',
    icon: Plug,
    title: 'One-Click Integrations',
    subtitle: 'With Health Monitoring',
    description: "AiReatro doesn't just connect — it stays reliable.",
    bullets: ['Auto webhook setup (Razorpay, Shopify)', 'Event debugger', 'Retry failed events', 'Integration health score'],
    cta: 'Integrations you can trust.',
    variant: 'accent',
  },
  {
    number: '09',
    icon: Users,
    title: 'Built for Teams & Scale',
    subtitle: 'From Day One',
    description: 'Not just messaging — operations.',
    bullets: ['SLA tracking', 'Agent scorecards', 'Role-based access', 'Audit logs', 'Multi-workspace'],
    cta: 'From startup to enterprise, same platform.',
    variant: 'muted',
  },
  {
    number: '10',
    icon: Zap,
    title: 'Fastest Time-to-Value',
    subtitle: 'Minutes, Not Days',
    description: 'Most tools take hours/days to configure. AiReatro gets you value in one session.',
    bullets: ['Guided onboarding', 'Ready-made templates', 'Setup in minutes', 'Live AI demos'],
    cta: 'Value in the first session.',
    variant: 'primary',
  },
];

const comparisonData = [
  { feature: 'Flow Diagnostics', aireatro: 'Deep health scores & fixes', others: 'None', aiLevel: 'full' as const },
  { feature: 'AI Insights', aireatro: 'Actionable recommendations', others: 'Raw stats only', aiLevel: 'full' as const },
  { feature: 'Ad Attribution', aireatro: 'End-to-end tracking', others: 'Click only', aiLevel: 'full' as const },
  { feature: 'Flow Health Score', aireatro: 'Real-time monitoring', others: 'Not available', aiLevel: 'full' as const },
  { feature: 'UI / UX Quality', aireatro: 'Stripe-level design', others: 'Cluttered dashboards', aiLevel: 'partial' as const },
  { feature: 'Integration Health', aireatro: 'Auto-monitoring', others: 'Manual checks', aiLevel: 'full' as const },
  { feature: 'Team Operations', aireatro: 'SLA, scorecards, RBAC', others: 'Basic assignment', aiLevel: 'partial' as const },
  { feature: 'Onboarding Speed', aireatro: '< 30 minutes', others: 'Hours to days', aiLevel: 'full' as const },
];

function variantClasses(variant: UspVariant) {
  switch (variant) {
    case 'primary':
      return {
        shell: 'bg-card/60 border-border/60',
        chip: 'bg-primary/10 text-primary border-primary/20',
        iconWrap: 'bg-primary/10 text-primary border-primary/20',
        divider: 'border-primary/15',
        glow: 'bg-primary/15',
      };
    case 'accent':
      return {
        shell: 'bg-card/60 border-border/60',
        chip: 'bg-accent text-accent-foreground border-border/60',
        iconWrap: 'bg-accent text-accent-foreground border-border/60',
        divider: 'border-border/60',
        glow: 'bg-primary/10',
      };
    case 'muted':
    default:
      return {
        shell: 'bg-muted/30 border-border/60',
        chip: 'bg-muted text-muted-foreground border-border/60',
        iconWrap: 'bg-muted text-foreground border-border/60',
        divider: 'border-border/60',
        glow: 'bg-primary/10',
      };
  }
}

export default function PowerfulUSPsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Why AiReatro
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            10 Powerful Reasons to Choose <span className="text-primary">AiReatro</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            AiReatro is an AI-powered WhatsApp platform that doesn't just automate conversations — it tells you what's
            working, what's broken, and what to fix to grow revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {usps.map((usp) => {
            const Icon = usp.icon;
            const v = variantClasses(usp.variant);

            return (
              <Card
                key={usp.number}
                className={cn(
                  'relative overflow-hidden p-6 border transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-xl',
                  'group'
                )}
              >
                <div className={cn('absolute inset-0', v.shell)} />
                <div
                  className={cn(
                    'pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity',
                    v.glow
                  )}
                />
                <div className="pointer-events-none absolute -bottom-8 -right-2 text-7xl font-black tracking-tight text-foreground/5">
                  {usp.number}
                </div>

                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn('flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border', v.iconWrap)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className={cn('inline-flex text-[11px] font-bold px-2 py-1 rounded-full border', v.chip)}>
                        USP #{usp.number}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-2 leading-snug">{usp.title}</h3>
                      <p className="text-sm font-medium text-primary/80">{usp.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{usp.description}</p>
                  <ul className="space-y-2 mb-4">
                    {usp.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-foreground/90">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={cn('pt-4 border-t', v.divider)}>
                    <p className="text-sm font-semibold text-primary">→ {usp.cta}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Redesigned Comparison Section */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-0">
              <Zap className="w-3 h-3 mr-1" />
              Head-to-Head
            </Badge>
            <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
              AiReatro vs. Others
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              See why teams switch from legacy WhatsApp platforms to AiReatro
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-5 px-6 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider w-[35%]">
                    Capability
                  </th>
                  <th className="py-5 px-6 text-center w-[35%]">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-sm">
                      <Sparkles className="w-4 h-4" />
                      AiReatro
                    </div>
                  </th>
                  <th className="py-5 px-6 text-center text-sm font-semibold text-muted-foreground w-[30%]">
                    Other Platforms
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/30',
                    idx === comparisonData.length - 1 && 'border-b-0'
                  )}>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-foreground text-sm">{row.feature}</span>
                    </td>
                    <td className="py-4 px-6 text-center bg-primary/[0.03]">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        {row.aireatro}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          {row.others === 'Not available' ? (
                            <X className="w-3.5 h-3.5 text-destructive" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                        {row.others}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {comparisonData.map((row) => (
              <Card key={row.feature} className="p-4 border border-border">
                <p className="text-sm font-semibold text-foreground mb-3">{row.feature}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-primary mb-1">AiReatro</p>
                    <p className="text-xs text-foreground flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {row.aireatro}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">Others</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-destructive/60 flex-shrink-0" />
                      {row.others}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
