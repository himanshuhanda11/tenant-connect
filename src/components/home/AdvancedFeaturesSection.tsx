import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Link2, 
  Phone, 
  Shield, 
  GitBranch, 
  FlaskConical, 
  Webhook,
  RotateCcw,
  Bot,
  AlertTriangle,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import whatsappTechFuture from '@/assets/whatsapp-tech-future.jpg';

const advancedFeatures = {
  all: [
    { icon: Link2, title: 'Embedded Signup', description: 'One-click Meta onboarding flow' },
    { icon: Phone, title: 'Multi-Number Management', description: 'Manage multiple WABAs & phone numbers' },
    { icon: Shield, title: 'Role-Based Access (RBAC)', description: 'Granular permissions for teams' },
    { icon: GitBranch, title: 'Approval Workflows', description: 'Review templates & campaigns before sending' },
    { icon: FlaskConical, title: 'A/B Testing', description: 'Test campaign variants for better results' },
    { icon: Webhook, title: 'Webhook Timeline', description: 'Track delivery, read, and fail events' },
    { icon: RotateCcw, title: 'Smart Routing', description: 'Round robin, SLA-based, priority queues' },
    { icon: Bot, title: 'AI Reply Assistant', description: 'Smart suggestions & tone rewriting' },
    { icon: AlertTriangle, title: 'Spam Guardrails', description: 'Compliance & rate limit protection' },
    { icon: FileCheck, title: 'Audit Logs', description: 'Complete activity tracking & export' },
  ],
  basic: [
    { icon: Link2, title: 'Embedded Signup', description: 'One-click Meta onboarding flow' },
    { icon: Phone, title: 'Single Number', description: 'One phone number per account' },
    { icon: Shield, title: 'Basic Roles', description: 'Admin & Agent roles' },
    { icon: Webhook, title: 'Webhook Events', description: 'Basic delivery tracking' },
    { icon: AlertTriangle, title: 'Spam Protection', description: 'Basic rate limiting' },
  ],
  pro: [
    { icon: Link2, title: 'Embedded Signup', description: 'One-click Meta onboarding flow' },
    { icon: Phone, title: 'Multi-Number Management', description: 'Manage multiple WABAs & phone numbers' },
    { icon: Shield, title: 'Role-Based Access (RBAC)', description: 'Granular permissions for teams' },
    { icon: GitBranch, title: 'Approval Workflows', description: 'Review templates & campaigns before sending' },
    { icon: FlaskConical, title: 'A/B Testing', description: 'Test campaign variants for better results' },
    { icon: Webhook, title: 'Webhook Timeline', description: 'Track delivery, read, and fail events' },
    { icon: RotateCcw, title: 'Smart Routing', description: 'Round robin, SLA-based, priority queues' },
    { icon: Bot, title: 'AI Reply Assistant', description: 'Smart suggestions & tone rewriting' },
    { icon: AlertTriangle, title: 'Spam Guardrails', description: 'Compliance & rate limit protection' },
    { icon: FileCheck, title: 'Audit Logs', description: 'Complete activity tracking & export' },
  ],
};

export default function AdvancedFeaturesSection() {
  const [view, setView] = useState<'all' | 'basic' | 'pro'>('all');

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-64 md:w-96 h-64 md:h-96 bg-green-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-64 md:w-96 h-64 md:h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Left - Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={whatsappTechFuture} 
                alt="WhatsApp Business Technology" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-card backdrop-blur-xl p-4 rounded-xl shadow-xl border border-border hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Enterprise Ready</div>
                  <div className="text-xs text-muted-foreground">Scale with confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Power Features
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Enterprise-grade features for scaling your WhatsApp operations
            </p>

            {/* Toggle */}
            <div className="mb-8">
              <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-auto">
                <TabsList className="bg-muted border border-border">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Features</TabsTrigger>
                  <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Basic</TabsTrigger>
                  <TabsTrigger value="pro" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pro</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {advancedFeatures[view].slice(0, 6).map((feature, index) => (
                <Card key={index} className="bg-muted/50 border-border/50 hover:bg-muted transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button size="lg" asChild>
              <Link to="/pricing">Compare All Plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
