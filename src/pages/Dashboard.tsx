import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { DashboardFilters } from '@/types/dashboard';

// New modern dashboard components
import { WABAStatusCard } from '@/components/dashboard/WABAStatusCard';
import { SetupProgressCard } from '@/components/dashboard/SetupProgressCard';
import { BusinessProfileCard } from '@/components/dashboard/BusinessProfileCard';
import { QuickStatsGrid } from '@/components/dashboard/QuickStatsGrid';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { AIInsightsSummary } from '@/components/dashboard/AIInsightsSummary';
import { VIPQuickActions } from '@/components/dashboard/VIPQuickActions';
import { WorkspaceTip } from '@/components/dashboard/WorkspaceTip';

// Existing enhanced components
import { DashboardFiltersBar } from '@/components/dashboard/DashboardFiltersBar';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { AttentionNeededPanel } from '@/components/dashboard/AttentionNeededPanel';
import { InboxHealthPanel } from '@/components/dashboard/InboxHealthPanel';
import { CampaignsPanel } from '@/components/dashboard/CampaignsPanel';
import { MetaAdsPanel } from '@/components/dashboard/MetaAdsPanel';
import { AutomationsPanel } from '@/components/dashboard/AutomationsPanel';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant, currentRole } = useTenant();
  const { profile } = useAuth();
  const [embeddedSignupOpen, setEmbeddedSignupOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: '7d',
    phoneNumberId: null,
    teamId: null,
    source: 'all',
  });

  const {
    loading,
    kpis,
    inboxHealth,
    actionQueue,
    agents,
    automations,
    campaigns,
    metaAds,
    phoneHealth,
    contacts,
    billing,
    alerts,
    isAdmin,
    refetch,
  } = useDashboardData(filters);

  const displayName = profile?.full_name?.split(' ')[0] || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Check if connected to WhatsApp
  const isWABAConnected = phoneHealth.length > 0 && phoneHealth.some(p => p.webhookHealth === 'healthy');
  const primaryPhone = phoneHealth[0];

  // Setup steps based on actual data
  const setupSteps = useMemo(() => {
    const hasPhone = phoneHealth.length > 0;
    const hasTemplate = true; // We'd need to check templates
    const hasCampaign = campaigns.length > 0;
    const hasAutomation = (automations?.totalExecutions || 0) > 0;

    return [
      {
        id: 'api-live',
        title: 'Get API Live',
        status: hasPhone ? 'completed' : 'current',
        href: '/phone-numbers/connect',
      },
      {
        id: 'create-template',
        title: 'Create Template',
        status: hasPhone && hasTemplate ? 'completed' : hasPhone ? 'current' : 'pending',
        href: '/templates',
      },
      {
        id: 'send-campaign',
        title: 'Send Campaign',
        status: hasCampaign ? 'completed' : hasTemplate ? 'current' : 'pending',
        href: '/campaigns/create',
      },
      {
        id: 'create-flow',
        title: 'Create Flow',
        status: hasAutomation ? 'completed' : 'pending',
        href: '/flows',
      },
    ] as const;
  }, [phoneHealth, campaigns, automations]);

  const allStepsCompleted = setupSteps.every(s => s.status === 'completed');

  // Quick stats from KPIs
  const quickStats = useMemo(() => [
    {
      id: 'conversations',
      label: 'Open Chats',
      value: kpis.find(k => k.id === 'open')?.value || 0,
      change: 12,
      changeType: 'positive' as const,
      icon: 'messages' as const,
      href: '/inbox',
      color: 'primary' as const,
    },
    {
      id: 'contacts',
      label: 'New Contacts',
      value: contacts?.newContacts7d || 0,
      change: 8,
      changeType: 'positive' as const,
      icon: 'contacts' as const,
      href: '/contacts',
      color: 'purple' as const,
    },
    {
      id: 'automations',
      label: 'Automation Runs',
      value: automations?.totalExecutions || 0,
      icon: 'automations' as const,
      href: '/automation',
      color: 'orange' as const,
    },
    {
      id: 'campaigns',
      label: 'Campaigns Sent',
      value: campaigns.reduce((sum, c) => sum + c.sent, 0),
      icon: 'campaigns' as const,
      href: '/campaigns',
      color: 'blue' as const,
    },
    {
      id: 'response',
      label: 'Avg Response',
      value: kpis.find(k => k.id === 'response')?.value || '—',
      icon: 'response' as const,
      color: 'cyan' as const,
    },
    {
      id: 'resolved',
      label: 'Resolved Today',
      value: kpis.find(k => k.id === 'resolved')?.value || 0,
      change: 5,
      changeType: 'positive' as const,
      icon: 'resolved' as const,
      color: 'pink' as const,
    },
  ], [kpis, contacts, automations, campaigns]);

  // Recent activity (mock for now - would come from audit logs)
  const recentActivity = useMemo(() => [
    {
      id: '1',
      type: 'message' as const,
      title: 'New message from VIP customer',
      description: 'Regarding order #12345',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      href: '/inbox',
    },
    {
      id: '2',
      type: 'automation' as const,
      title: 'Welcome Flow triggered',
      description: '3 new contacts enrolled',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      href: '/flows',
    },
    {
      id: '3',
      type: 'campaign' as const,
      title: 'Summer Sale campaign completed',
      description: '2,450 messages delivered',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      href: '/campaigns',
    },
    {
      id: '4',
      type: 'contact' as const,
      title: '12 new contacts added',
      description: 'Via Meta Ads lead form',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      href: '/contacts',
    },
    {
      id: '5',
      type: 'resolved' as const,
      title: 'Ticket resolved',
      description: 'Customer support query handled',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      href: '/inbox',
    },
  ], []);

  // AI metrics for insights panel
  const aiMetrics = useMemo(() => ({
    openConversations: inboxHealth?.openConversations || 0,
    unassigned: kpis.find(k => k.id === 'unassigned')?.value as number || 0,
    slaBreaches: kpis.find(k => k.id === 'sla')?.value as number || 0,
    avgResponseTime: 180,
    resolvedToday: kpis.find(k => k.id === 'resolved')?.value as number || 0,
    conversionRate: metaAds?.conversionRate || 0,
    campaignsSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    automationRuns: automations?.totalExecutions || 0,
  }), [inboxHealth, kpis, metaAds, campaigns, automations]);

  // Attention items
  const attentionItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'unassigned' | 'sla_breach' | 'broken_flow' | 'low_conversion' | 'webhook_error';
      title: string;
      subtitle: string;
      count?: number;
      severity: 'critical' | 'warning' | 'info';
      href: string;
    }> = [];

    const unassignedCount = (kpis.find(k => k.id === 'unassigned')?.value as number) || 0;
    if (unassignedCount > 0) {
      items.push({
        id: 'unassigned',
        type: 'unassigned',
        title: 'Unassigned Chats',
        subtitle: 'Conversations waiting for assignment',
        count: unassignedCount,
        severity: unassignedCount > 10 ? 'critical' : 'warning',
        href: '/inbox?assigned=none',
      });
    }

    const slaCount = (kpis.find(k => k.id === 'sla')?.value as number) || 0;
    if (slaCount > 0) {
      items.push({
        id: 'sla',
        type: 'sla_breach',
        title: 'SLA Breaches',
        subtitle: 'Response time exceeded limits',
        count: slaCount,
        severity: 'critical',
        href: '/inbox?sla=breached',
      });
    }

    return items;
  }, [kpis]);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-[1600px] animate-fade-in">
        {/* Welcome Header with Current Plan - Mobile optimized */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Here's what's happening in{' '}
              <span className="font-medium text-foreground">{currentTenant?.name}</span>
            </p>
          </div>
          <DashboardFiltersBar
            filters={filters}
            onChange={setFilters}
            onRefresh={refetch}
            loading={loading}
          />
        </div>

        {/* System Alerts */}
        <AlertsPanel alerts={alerts} />

        {/* WABA Status Card - Key Feature from Reference */}
        <WABAStatusCard
          isConnected={isWABAConnected}
          qualityRating={primaryPhone?.qualityRating || 'unknown'}
          remainingQuota={10000}
          phoneNumber={primaryPhone?.phoneNumber}
          businessName={currentTenant?.name}
          loading={loading}
          onConnect={() => setEmbeddedSignupOpen(true)}
        />

        {/* Setup Progress - Only show if not all completed */}
        {!allStepsCompleted && (
          <SetupProgressCard
            steps={setupSteps.map(s => ({ ...s, status: s.status as 'completed' | 'pending' | 'current' }))}
            loading={loading}
            creditsReward={200}
          />
        )}

        {/* Quick Stats Grid */}
        <QuickStatsGrid stats={quickStats} loading={loading} />

        {/* Main Content Grid - Responsive */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Full width on mobile, 2/3 on large */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* AI Insights + Attention Needed - Stack on mobile */}
            <div className="grid gap-4 md:grid-cols-2">
              <AIInsightsPanel metrics={aiMetrics} isPro={true} />
              <AttentionNeededPanel items={attentionItems} loading={loading} />
            </div>

            {/* Inbox Health */}
            <InboxHealthPanel
              metrics={inboxHealth}
              actionQueue={actionQueue}
              loading={loading}
            />

            {/* Campaigns, Meta Ads - Side by side */}
            <div className="grid gap-4 sm:grid-cols-2">
              <CampaignsPanel campaigns={campaigns} loading={loading} />
              <MetaAdsPanel metrics={metaAds} loading={loading} />
            </div>

            {/* AI Insights Summary + VIP Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <AIInsightsSummary loading={loading} />
              <VIPQuickActions />
            </div>
          </div>

          {/* Right Column - 1/3 width on large */}
          <div className="space-y-4 sm:space-y-6">
            {/* Business Profile Card */}
            <BusinessProfileCard
              businessName={currentTenant?.name || 'Your Business'}
              businessId={currentTenant?.id?.slice(0, 8).toUpperCase()}
              phoneNumber={primaryPhone?.phoneNumber}
              freeConversations={{ used: 0, limit: Infinity }}
              credits={{ balance: 678.69, currency: '₹' }}
              loading={loading}
              onViewProfile={() => navigate('/settings')}
              onEdit={() => navigate('/settings')}
            />

            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Recent Activity */}
            <RecentActivityCard activities={recentActivity} loading={loading} />
          </div>
        </div>

        {/* Bottom Tip */}
        <WorkspaceTip />
      </div>

      {/* Embedded Signup Dialog */}
      <Dialog open={embeddedSignupOpen} onOpenChange={setEmbeddedSignupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp Business</DialogTitle>
            <DialogDescription>
              Use Meta's secure signup flow to connect your WhatsApp Business Account.
            </DialogDescription>
          </DialogHeader>
          <MetaEmbeddedSignup
            onSuccess={() => {
              setEmbeddedSignupOpen(false);
              refetch();
            }}
            onError={(error) => console.error('Embedded signup error:', error)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
