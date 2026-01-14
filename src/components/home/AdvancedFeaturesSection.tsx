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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-green-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Power Features
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Advanced Capabilities
          </h2>
          <p className="text-lg text-gray-300">
            Enterprise-grade features for scaling your WhatsApp operations
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-auto">
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="all" className="data-[state=active]:bg-white/20 text-white">All Features</TabsTrigger>
              <TabsTrigger value="basic" className="data-[state=active]:bg-white/20 text-white">Basic</TabsTrigger>
              <TabsTrigger value="pro" className="data-[state=active]:bg-white/20 text-white">Pro</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {advancedFeatures[view].map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-4 md:p-5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-green-400" />
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90" asChild>
            <Link to="/pricing">Compare Plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
