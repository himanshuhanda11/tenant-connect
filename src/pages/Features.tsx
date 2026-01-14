import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHero from '@/components/layout/PageHero';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Inbox, 
  Users, 
  FileText, 
  Megaphone, 
  Bot, 
  Plug, 
  BarChart3, 
  Phone, 
  UserCog, 
  ClipboardList,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';

const coreFeatures = [
  {
    name: 'Unified Inbox',
    description: 'Manage all WhatsApp conversations in one powerful inbox with AI-powered intent detection, smart routing, and SLA tracking.',
    href: '/features/inbox',
    icon: Inbox,
    badge: 'Core',
    highlights: ['AI Intent Detection', 'SLA Timers', 'Team Collaboration']
  },
  {
    name: 'Contacts & Segments',
    description: 'Build a mini-CDP with unified customer profiles, engagement scoring, lifecycle tracking, and dynamic segmentation.',
    href: '/features/contacts',
    icon: Users,
    badge: 'Core',
    highlights: ['Engagement Scoring', 'Lifecycle Stages', 'Smart Segments']
  },
  {
    name: 'Message Templates',
    description: 'Create, manage, and submit WhatsApp templates with AI-powered rejection fix assistant and live previews.',
    href: '/features/templates',
    icon: FileText,
    badge: 'Core',
    highlights: ['Meta Approval Flow', 'AI Fix Assistant', 'Variable Mapping']
  },
  {
    name: 'Campaigns',
    description: 'Launch broadcast campaigns with A/B testing, smart throttling, quiet hours, and real-time delivery analytics.',
    href: '/features/campaigns',
    icon: Megaphone,
    badge: 'Core',
    highlights: ['A/B Testing', 'Delivery Optimization', 'ROI Tracking']
  },
];

const advancedFeatures = [
  {
    name: 'Automation',
    description: 'Build powerful workflows with visual WHEN-IF-THEN logic, triggers, conditions, and multi-step actions.',
    href: '/features/automation',
    icon: Bot,
    badge: 'Advanced',
    highlights: ['Visual Builder', 'Smart Triggers', 'Loop Detection']
  },
  {
    name: 'Integrations',
    description: 'Connect your favorite tools like Shopify, Razorpay, Zapier, and LeadSquared with webhook automation.',
    href: '/features/integrations',
    icon: Plug,
    badge: 'Advanced',
    highlights: ['Shopify', 'Razorpay', 'Zapier', 'CRM']
  },
  {
    name: 'Analytics',
    description: 'Get deep insights with conversation heatmaps, funnel visualization, and AI-powered recommendations.',
    href: '/features/analytics',
    icon: BarChart3,
    badge: 'Advanced',
    highlights: ['Conversation Heatmap', 'Funnel Analysis', 'AI Insights']
  },
  {
    name: 'Phone Numbers',
    description: 'Manage multiple WhatsApp Business numbers with quality monitoring, health checks, and compliance tools.',
    href: '/features/phone-numbers',
    icon: Phone,
    badge: 'Advanced',
    highlights: ['Multi-Number', 'Quality Rating', 'Health Monitoring']
  },
];

const enterpriseFeatures = [
  {
    name: 'Team & Roles',
    description: 'Enterprise-grade access control with custom roles, permissions, and agent performance tracking.',
    href: '/features/team-roles',
    icon: UserCog,
    badge: 'Enterprise',
    highlights: ['Custom Roles', 'RBAC', 'Performance Cards']
  },
  {
    name: 'Audit Logs',
    description: 'Complete activity tracking for compliance with detailed logs, export capabilities, and retention policies.',
    href: '/features/audit-logs',
    icon: ClipboardList,
    badge: 'Enterprise',
    highlights: ['Activity Tracking', 'Compliance Ready', 'Export & Archive']
  },
];

function FeatureCard({ feature, variant = 'default' }: { feature: typeof coreFeatures[0], variant?: 'default' | 'enterprise' }) {
  const Icon = feature.icon;
  
  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            variant === 'enterprise' 
              ? 'bg-secondary' 
              : 'bg-primary/10'
          }`}>
            <Icon className={`w-6 h-6 ${variant === 'enterprise' ? 'text-secondary-foreground' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-lg">{feature.name}</h3>
              <Badge variant={variant === 'enterprise' ? 'secondary' : 'outline'} className="text-xs">
                {feature.badge}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {feature.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {feature.highlights.map((highlight) => (
                <span 
                  key={highlight} 
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {highlight}
                </span>
              ))}
            </div>
            <Link 
              to={feature.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <PageHero
        badge={{ text: "Platform Features" }}
        title="Everything you need to scale"
        titleHighlight="WhatsApp"
        subtitle="A complete suite of tools to manage conversations, automate workflows, run campaigns, and grow your business on WhatsApp."
      />

      {/* Stats Bar */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">Core Features</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Integrations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Core Features</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Essential tools for managing your WhatsApp Business operations from day one.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((feature) => (
              <FeatureCard key={feature.name} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Advanced Features</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Powerful capabilities to automate, integrate, and scale your WhatsApp operations.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {advancedFeatures.map((feature) => (
              <FeatureCard key={feature.name} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Enterprise Features</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-10">
            Security, compliance, and governance features for large teams and regulated industries.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {enterpriseFeatures.map((feature) => (
              <FeatureCard key={feature.name} feature={feature} variant="enterprise" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to transform your WhatsApp experience?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="shadow-lg shadow-primary/20">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
