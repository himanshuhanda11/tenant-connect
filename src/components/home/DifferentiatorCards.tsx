import React from 'react';
import { 
  Activity, Brain, Route, Palette, Lock, Rocket, ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import homeDifferentiators from '@/assets/home-differentiators.png';

const differentiators = [
  {
    icon: Activity,
    title: 'Diagnostics Everywhere',
    description: 'Health scores, error detection, and actionable fixes across flows, templates, and phone numbers.',
    link: '/features/automation'
  },
  {
    icon: Brain,
    title: 'AI Insights Built-In',
    description: 'Reply suggestions, intent detection, and smart routing powered by AI — no extra setup.',
    badge: 'AI',
    link: '/features/analytics'
  },
  {
    icon: Route,
    title: 'Ads → Flow → Agent Attribution',
    description: 'Track the complete journey from Meta Ads click to conversation to conversion.',
    link: '/features/integrations'
  },
  {
    icon: Palette,
    title: 'Clean, Fast UI',
    description: 'No clutter. Every screen is designed for speed and clarity — inspired by Linear & Stripe.',
    link: '/products'
  },
  {
    icon: Lock,
    title: 'Pro Features, Unlockable',
    description: 'See what\'s possible with Pro badges. Upgrade when you\'re ready — no surprises.',
    badge: 'Pro',
    link: '/pricing'
  },
  {
    icon: Rocket,
    title: 'Templates + Onboarding',
    description: 'Pre-built industry templates and guided setup to go live in under 30 minutes.',
    link: '/template-library'
  },
];

export default function DifferentiatorCards() {
  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-14">
          <Badge className="mb-3 sm:mb-4 bg-muted text-muted-foreground border-0 text-xs sm:text-sm">
            Why AiReatro
          </Badge>
          <h2 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Built Different, By Design
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-4">
            What makes AiReatro stand out from every other WhatsApp platform
          </p>
        </div>

        {/* Image Left + Cards Right Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 max-w-6xl mx-auto items-center">
          {/* Left - Illustration */}
          <div className="w-full lg:w-[45%] shrink-0">
            <img 
              src={homeDifferentiators} 
              alt="Platform features overview" 
              className="w-full rounded-2xl shadow-lg" 
              loading="lazy" 
            />
          </div>

          {/* Right - 2x3 Grid */}
          <div className="w-full lg:w-[55%] grid grid-cols-1 xs:grid-cols-2 gap-4">
            {differentiators.map((item, index) => (
              <Link to={item.link} key={index}>
                <Card className="group h-full border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm">
                        <item.icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      {item.badge && (
                        <Badge className="bg-accent text-accent-foreground border-0 text-[10px] font-semibold">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-2.5">
                      {item.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
