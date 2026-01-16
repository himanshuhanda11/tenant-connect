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
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const usps = [
  {
    number: '01',
    icon: Activity,
    title: 'Diagnostics Everywhere',
    subtitle: 'Not Just Analytics',
    description: 'Most platforms show numbers. AiReatro tells you what\'s broken and why.',
    bullets: [
      'Broken flow paths',
      'Missing replies',
      'SLA breaches',
      'Drop-off causes',
      'Unapproved templates'
    ],
    cta: 'You don\'t guess. You fix.',
    color: 'emerald'
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
      '"Flow #3 causes 42% drop-off"'
    ],
    cta: 'AI turns data into actions.',
    color: 'violet'
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'True End-to-End Attribution',
    subtitle: 'Full Journey Tracking',
    description: 'AiReatro connects the full journey: Meta Ad → WhatsApp → Flow → Agent → Conversion',
    bullets: [
      'Most tools stop at messages',
      'AiReatro shows what actually made money'
    ],
    cta: 'You know exactly where to invest.',
    color: 'blue'
  },
  {
    number: '04',
    icon: Flame,
    title: 'Flow Health Score + Heatmaps',
    subtitle: 'Measured Performance',
    description: 'Flows don\'t just "run" — they\'re measured.',
    bullets: [
      'Node-level completion',
      'Visual heatmaps',
      'Version comparison',
      'Before/after performance'
    ],
    cta: 'Flows become conversion assets, not guesswork.',
    color: 'orange'
  },
  {
    number: '05',
    icon: Layout,
    title: 'Clean, Calm, Enterprise UI',
    subtitle: 'Designed for Daily Use',
    description: 'Competitors overwhelm users with clutter. AiReatro is designed for daily use by teams.',
    bullets: [
      'Whitespace-first design',
      'Clear hierarchy',
      'Focused screens',
      'No noise'
    ],
    cta: 'Teams actually enjoy using it.',
    color: 'slate'
  },
  {
    number: '06',
    icon: Sparkles,
    title: 'AI-First, Not AI-Added',
    subtitle: 'Built-in Intelligence',
    description: 'AI is not bolted on later.',
    bullets: [
      'AI flow generation from goals',
      'AI reply suggestions with tone control',
      'AI lead quality scoring',
      'AI growth recommendations'
    ],
    cta: 'AI actively improves outcomes.',
    color: 'pink'
  },
  {
    number: '07',
    icon: Crown,
    title: 'Pro Features That Matter',
    subtitle: 'Not Artificial Limits',
    description: 'Instead of crippling basics, AiReatro unlocks real power in Pro.',
    bullets: [
      'Diagnostics',
      'Attribution',
      'Versioning',
      'Conditions',
      'Advanced routing'
    ],
    cta: 'Pay more → get smarter tools.',
    color: 'amber'
  },
  {
    number: '08',
    icon: Plug,
    title: 'One-Click Integrations',
    subtitle: 'With Health Monitoring',
    description: 'AiReatro doesn\'t just "connect".',
    bullets: [
      'Auto webhook setup (Razorpay, Shopify)',
      'Event debugger',
      'Retry failed events',
      'Integration health score'
    ],
    cta: 'Integrations you can trust.',
    color: 'cyan'
  },
  {
    number: '09',
    icon: Users,
    title: 'Built for Teams & Scale',
    subtitle: 'From Day One',
    description: 'Not just messaging — operations.',
    bullets: [
      'SLA tracking',
      'Agent scorecards',
      'Role-based access',
      'Audit logs',
      'Multi-workspace'
    ],
    cta: 'From startup to enterprise, same platform.',
    color: 'indigo'
  },
  {
    number: '10',
    icon: Zap,
    title: 'Fastest Time-to-Value',
    subtitle: 'Minutes, Not Days',
    description: 'Most tools take hours/days to configure.',
    bullets: [
      'Guided onboarding',
      'Ready-made templates',
      'Setup in minutes',
      'Live AI demos'
    ],
    cta: 'Value in the first session.',
    color: 'green'
  }
];

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
};

const comparisonData = [
  { feature: 'Diagnostics', aireatro: 'Deep', others: 'None' },
  { feature: 'AI insights', aireatro: 'Actionable', others: 'Stats only' },
  { feature: 'Attribution', aireatro: 'End-to-end', others: 'Partial' },
  { feature: 'Flow health', aireatro: 'Yes', others: 'No' },
  { feature: 'UI clarity', aireatro: 'Clean', others: 'Cluttered' },
  { feature: 'Integration health', aireatro: 'Yes', others: 'No' },
  { feature: 'Team ops', aireatro: 'Advanced', others: 'Basic' },
];

export default function PowerfulUSPsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Why AiReatro
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            10 Powerful Reasons to Choose{' '}
            <span className="text-primary">AiReatro</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            An AI-powered WhatsApp platform that doesn't just automate conversations — it tells you what's working, what's broken, and what to fix to grow revenue.
          </p>
        </div>

        {/* USP Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {usps.map((usp) => {
            const colors = colorClasses[usp.color];
            const Icon = usp.icon;
            return (
              <Card 
                key={usp.number} 
                className={`p-6 border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.badge} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${colors.text}`}>#{usp.number}</span>
                    <h3 className="text-lg font-bold text-slate-900">{usp.title}</h3>
                    <p className={`text-sm font-medium ${colors.text}`}>{usp.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm mb-4">{usp.description}</p>
                
                <ul className="space-y-2 mb-4">
                  {usp.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                
                <div className={`pt-4 border-t ${colors.border}`}>
                  <p className={`text-sm font-semibold ${colors.text} flex items-center gap-2`}>
                    <span>→</span> {usp.cta}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              AiReatro vs. Others
            </h3>
            <p className="text-slate-600">See the difference at a glance</p>
          </div>
          
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-4 px-6 text-left font-semibold">Feature</th>
                  <th className="py-4 px-6 text-center font-semibold">
                    <span className="text-primary">AiReatro</span>
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-slate-400">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr 
                    key={row.feature} 
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="py-4 px-6 font-medium text-slate-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-2 text-primary font-semibold">
                        <Check className="w-5 h-5" />
                        {row.aireatro}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-2 text-slate-400">
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
