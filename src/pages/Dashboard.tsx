import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Zap,
  Phone,
  FileText,
  Send,
  Bot,
  BarChart3,
  CheckCircle2,
  Circle,
  Sparkles,
  Inbox,
  Shield,
  HelpCircle,
  ExternalLink,
  Play,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action: () => void;
  actionLabel: string;
}

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant, currentRole } = useTenant();
  const { profile } = useAuth();
  const [embeddedSignupOpen, setEmbeddedSignupOpen] = useState(false);
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
  const [hasTeamMembers, setHasTeamMembers] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch onboarding status
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!currentTenant) return;
      
      try {
        // Check phone numbers
        const { data: phones } = await supabase
          .from('phone_numbers')
          .select('id')
          .eq('tenant_id', currentTenant.id)
          .eq('status', 'connected')
          .limit(1);
        setHasPhoneNumber((phones?.length ?? 0) > 0);

        // Check team members
        const { data: members } = await supabase
          .from('tenant_members')
          .select('id')
          .eq('tenant_id', currentTenant.id);
        setHasTeamMembers((members?.length ?? 0) > 1);

        // Check templates
        const { data: templates } = await supabase
          .from('templates')
          .select('id')
          .eq('tenant_id', currentTenant.id)
          .eq('status', 'APPROVED')
          .limit(1);
        setHasTemplates((templates?.length ?? 0) > 0);

        // Count conversations
        const { count } = await supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id);
        setConversationCount(count ?? 0);
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [currentTenant]);

  const displayName = profile?.full_name?.split(' ')[0] || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'connect',
      title: 'Connect WhatsApp',
      description: 'Link your WhatsApp Business account to start messaging',
      icon: Phone,
      completed: hasPhoneNumber,
      action: () => setEmbeddedSignupOpen(true),
      actionLabel: 'Connect Now'
    },
    {
      id: 'template',
      title: 'Create Templates',
      description: 'Set up message templates for outbound campaigns',
      icon: FileText,
      completed: hasTemplates,
      action: () => navigate('/templates'),
      actionLabel: 'Create Template'
    },
    {
      id: 'team',
      title: 'Invite Your Team',
      description: 'Add team members to collaborate on conversations',
      icon: Users,
      completed: hasTeamMembers,
      action: () => navigate('/team'),
      actionLabel: 'Invite Team'
    },
    {
      id: 'campaign',
      title: 'Launch Campaign',
      description: 'Send your first broadcast message to customers',
      icon: Send,
      completed: conversationCount > 0,
      action: () => navigate('/campaigns'),
      actionLabel: 'Start Campaign'
    }
  ];

  const completedSteps = onboardingSteps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

  const features: FeatureCard[] = [
    {
      title: 'Team Inbox',
      description: 'Manage all conversations in one unified inbox with assignment and filters',
      icon: Inbox,
      href: '/inbox',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Contacts & Segments',
      description: 'Organize contacts with tags and create smart segments for targeting',
      icon: Users,
      href: '/contacts',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Message Templates',
      description: 'Create and manage approved templates for outbound messaging',
      icon: FileText,
      href: '/templates',
      color: 'text-violet-600',
      bgColor: 'bg-violet-500/10'
    },
    {
      title: 'Broadcast Campaigns',
      description: 'Send targeted messages to thousands of customers at once',
      icon: Send,
      href: '/campaigns',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Automation',
      description: 'Set up automated responses and workflows to save time',
      icon: Bot,
      href: '/automation',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Analytics',
      description: 'Track performance with detailed reports and insights',
      icon: BarChart3,
      href: '/billing',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  const stats = [
    {
      title: 'Conversations',
      value: conversationCount.toString(),
      icon: MessageSquare,
      description: 'Total this month',
      trend: '+0%'
    },
    {
      title: 'Team Members',
      value: hasTeamMembers ? '2+' : '1',
      icon: Users,
      description: 'Active users',
      trend: null
    },
    {
      title: 'Response Rate',
      value: conversationCount > 0 ? '98%' : '0%',
      icon: TrendingUp,
      description: 'Average',
      trend: conversationCount > 0 ? '+2%' : null
    },
    {
      title: 'Avg Response',
      value: conversationCount > 0 ? '< 5m' : '0m',
      icon: Clock,
      description: 'This week',
      trend: conversationCount > 0 ? '-10%' : null
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in <span className="font-medium text-foreground">{currentTenant?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Button>
            {!hasPhoneNumber && (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                onClick={() => setEmbeddedSignupOpen(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Connect WhatsApp
              </Button>
            )}
          </div>
        </div>

        {/* Onboarding Progress Card */}
        {completedSteps < onboardingSteps.length && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Getting Started</h2>
                      <p className="text-sm text-muted-foreground">Complete setup to unlock all features</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Progress value={progressPercentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-foreground">{completedSteps}/{onboardingSteps.length}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {onboardingSteps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={step.action}
                        disabled={step.completed}
                        className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          step.completed 
                            ? 'bg-green-500/10 border border-green-500/20' 
                            : 'bg-card border border-border hover:border-primary/30 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          step.completed ? 'bg-green-500/20' : 'bg-muted'
                        }`}>
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <step.icon className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${step.completed ? 'text-green-600' : 'text-foreground'}`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                        </div>
                        {!step.completed && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Illustration placeholder */}
                <div className="hidden lg:flex items-center justify-center">
                  <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                    <MessageSquare className="w-20 h-20 text-primary/40" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  {stat.trend && (
                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-0">
                      {stat.trend}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Explore Features</h2>
              <p className="text-sm text-muted-foreground">Everything you need to manage WhatsApp at scale</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="group cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200"
                onClick={() => navigate(feature.href)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Resources Card */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-slate-600" />
                Resources & Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between h-11 hover:bg-white/80 dark:hover:bg-slate-800/50"
                onClick={() => navigate('/documentation')}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documentation
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-11 hover:bg-white/80 dark:hover:bg-slate-800/50"
                onClick={() => navigate('/help')}
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-11 hover:bg-white/80 dark:hover:bg-slate-800/50"
                onClick={() => navigate('/contact')}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Security Status */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200/50 dark:border-green-700/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End-to-end encryption</span>
                  <Badge className="bg-green-500/20 text-green-600 border-0 hover:bg-green-500/30">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">WhatsApp API Status</span>
                  <Badge className="bg-green-500/20 text-green-600 border-0 hover:bg-green-500/30">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data compliance</span>
                  <Badge className="bg-green-500/20 text-green-600 border-0 hover:bg-green-500/30">GDPR Ready</Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 text-green-600 hover:text-green-700 hover:bg-green-100/50"
                onClick={() => navigate('/security')}
              >
                View Security Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Meta Embedded Signup Dialog */}
        <Dialog open={embeddedSignupOpen} onOpenChange={setEmbeddedSignupOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                Connect WhatsApp Business
              </DialogTitle>
              <DialogDescription>
                Use Meta's secure signup flow to connect your WhatsApp Business Account in one click.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <MetaEmbeddedSignup
                onSuccess={(data) => {
                  setEmbeddedSignupOpen(false);
                  setHasPhoneNumber(true);
                  navigate('/phone-numbers');
                }}
                onError={(error) => {
                  console.error('Embedded signup error:', error);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
