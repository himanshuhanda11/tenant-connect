import React from 'react';
import { 
  Activity,
  Brain,
  Route,
  Palette,
  Lock,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const differentiators = [
  {
    icon: Activity,
    title: 'Diagnostics Everywhere',
    description: 'Health scores, error detection, and actionable fixes across flows, templates, and phone numbers.',
    color: 'green',
    link: '/features/automation'
  },
  {
    icon: Brain,
    title: 'AI Insights Built-In',
    description: 'Reply suggestions, intent detection, and smart routing powered by AI — no extra setup.',
    color: 'purple',
    badge: 'AI',
    link: '/features/analytics'
  },
  {
    icon: Route,
    title: 'Ads → Flow → Agent Attribution',
    description: 'Track the complete journey from Meta Ads click to conversation to conversion.',
    color: 'blue',
    link: '/features/integrations'
  },
  {
    icon: Palette,
    title: 'Clean, Fast UI',
    description: 'No clutter. Every screen is designed for speed and clarity — inspired by Linear & Stripe.',
    color: 'slate',
    link: '/products'
  },
  {
    icon: Lock,
    title: 'Pro Features, Unlockable',
    description: 'See what\'s possible with Pro badges. Upgrade when you\'re ready — no surprises.',
    color: 'amber',
    badge: 'Pro',
    link: '/pricing'
  },
  {
    icon: Rocket,
    title: 'Templates + Onboarding',
    description: 'Pre-built industry templates and guided setup to go live in under 30 minutes.',
    color: 'cyan',
    link: '/template-library'
  },
];

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-500',
    badge: 'bg-green-100 text-green-700'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700'
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'bg-slate-700',
    badge: 'bg-slate-100 text-slate-700'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700'
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'bg-cyan-500',
    badge: 'bg-cyan-100 text-cyan-700'
  },
};

export default function DifferentiatorCards() {
  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-14">
          <Badge className="mb-3 sm:mb-4 bg-slate-100 text-slate-700 border-0 text-xs sm:text-sm">
            Why AiReatro
          </Badge>
          <h2 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            Built Different, By Design
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 px-4">
            What makes AiReatro stand out from every other WhatsApp platform
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {differentiators.map((item, index) => {
            const colors = colorClasses[item.color as keyof typeof colorClasses];
            return (
              <Link to={item.link} key={index}>
                <Card 
                  className={`group h-full border-2 ${colors.border} ${colors.bg} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-lg sm:rounded-xl ${colors.icon} flex items-center justify-center shadow-lg`}>
                        <item.icon className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                      </div>
                      {item.badge && (
                        <Badge className={`${colors.badge} border-0 text-[10px] sm:text-xs font-semibold`}>
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 sm:mb-2 group-hover:text-green-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-green-600 group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
