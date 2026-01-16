import React from 'react';
import {
  Activity,
  Brain,
  TrendingUp,
  Flame,
  Layout,
  Sparkles,
  Crown,
  Plug,
  Users,
  Zap,
  Check,
  X,
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
      '“Replies dropped because message was too long”',
      '“Leads from Campaign X have low intent”',
      '“Flow #3 causes 42% drop-off”',
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
    description: 'Flows don’t just “run” — they’re measured.',
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
    description: 'AiReatro doesn’t just “connect” — it stays reliable.',
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
  { feature: 'Diagnostics', aireatro: 'Deep', others: 'None' },
  { feature: 'AI insights', aireatro: 'Actionable', others: 'Stats only' },
  { feature: 'Attribution', aireatro: 'End-to-end', others: 'Partial' },
  { feature: 'Flow health', aireatro: 'Yes', others: 'No' },
  { feature: 'UI clarity', aireatro: 'Clean', others: 'Cluttered' },
  { feature: 'Integration health', aireatro: 'Yes', others: 'No' },
  { feature: 'Team ops', aireatro: 'Advanced', others: 'Basic' },
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
            AiReatro is an AI-powered WhatsApp platform that doesn’t just automate conversations — it tells you what’s
            working, what’s broken, and what to fix to grow revenue.
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">AiReatro vs. Others</h3>
            <p className="text-muted-foreground">See the difference at a glance</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 text-foreground">
                  <th className="py-4 px-5 text-left font-semibold">Feature</th>
                  <th className="py-4 px-5 text-center font-semibold text-primary">AiReatro</th>
                  <th className="py-4 px-5 text-center font-semibold text-muted-foreground">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="py-4 px-5 font-medium text-foreground">{row.feature}</td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-2 text-primary font-semibold">
                        <Check className="w-5 h-5" />
                        {row.aireatro}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <X className="w-5 h-5" />
                        {row.others}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
