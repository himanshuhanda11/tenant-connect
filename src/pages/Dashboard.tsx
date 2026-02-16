import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { DashboardFilters } from '@/types/dashboard';

// Dashboard components
import { StatusStrip } from '@/components/dashboard/StatusStrip';
import { SetupProgressCard } from '@/components/dashboard/SetupProgressCard';
import { KPIRow } from '@/components/dashboard/KPIRow';
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { AttentionCard } from '@/components/dashboard/AttentionCard';
import { RecentTimeline } from '@/components/dashboard/RecentTimeline';
import { MessagesChart } from '@/components/dashboard/MessagesChart';
import { ConversationTrendsChart } from '@/components/dashboard/ConversationTrendsChart';
import { GoalsCard } from '@/components/dashboard/GoalsCard';
import { WhatsAppLinksCard } from '@/components/dashboard/WhatsAppLinksCard';

import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { profile } = useAuth();
  const [embeddedSignupOpen, setEmbeddedSignupOpen] = useState(false);
  const [filters] = useState<DashboardFilters>({
    dateRange: '7d',
    phoneNumberId: null,
    teamId: null,
    source: 'all',
  });

  const {
    loading,
    kpis,
    inboxHealth,
    automations,
    campaigns,
    metaAds,
    phoneHealth,
    contacts,
    billing,
    creditsBalance,
    templatesPending,
    totalTemplates,
    messagesReceivedToday,
    messagesRepliedToday,
    totalCampaigns,
    refetch,
  } = useDashboardData(filters);

  const displayName = profile?.full_name?.split(' ')[0] || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const hasPhoneConnected = phoneHealth.length > 0;
  const isWABAConnected = hasPhoneConnected && phoneHealth.some(p => p.webhookHealth === 'healthy');
  const primaryPhone = phoneHealth[0];

  // Setup steps
  const setupSteps = useMemo(() => {
    const hasPhone = phoneHealth.length > 0;
    const hasCampaign = campaigns.length > 0;
    const hasAutomation = (automations?.totalExecutions || 0) > 0;

    return [
      { id: 'api-live', title: 'Get API Live', status: hasPhone ? 'completed' : 'current', href: '/phone-numbers/connect' },
      { id: 'create-template', title: 'Create Template', status: hasPhone ? 'completed' : 'pending', href: '/templates' },
      { id: 'send-campaign', title: 'Send Campaign', status: hasCampaign ? 'completed' : 'pending', href: '/campaigns/create' },
      { id: 'create-flow', title: 'Create Flow', status: hasAutomation ? 'completed' : 'pending', href: '/flows' },
    ] as const;
  }, [phoneHealth, campaigns, automations]);

  // AI Insights metrics
  const aiMetrics = useMemo(() => ({
    openConversations: inboxHealth?.openConversations || 0,
    unassigned: (kpis.find(k => k.id === 'unassigned')?.value as number) || 0,
    slaBreaches: (kpis.find(k => k.id === 'sla')?.value as number) || 0,
    avgResponseTime: 180,
    resolvedToday: (kpis.find(k => k.id === 'resolved')?.value as number) || 0,
    conversionRate: metaAds?.conversionRate || 0,
    campaignsSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
    automationRuns: automations?.totalExecutions || 0,
  }), [inboxHealth, kpis, metaAds, campaigns, automations]);

  // Recent timeline events
  const timelineEvents = useMemo(() => [
    { id: '1', type: 'template_submitted' as const, title: 'Template "welcome_v2" submitted for approval', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '2', type: 'campaign_sent' as const, title: 'Campaign "Summer Sale" completed — 2,450 delivered', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: '3', type: 'flow_triggered' as const, title: 'Welcome Flow triggered for 3 new contacts', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '4', type: 'payment_success' as const, title: 'Payment of ₹2,500 received successfully', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: '5', type: 'template_approved' as const, title: 'Template "order_update" approved by Meta', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  ], []);

  const openChats = (kpis.find(k => k.id === 'open')?.value as number) || 0;
  const unassigned = (kpis.find(k => k.id === 'unassigned')?.value as number) || 0;
  const resolvedToday = (kpis.find(k => k.id === 'resolved')?.value as number) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {greeting}, {displayName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Here's what's happening in <span className="font-medium text-foreground">{currentTenant?.name}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading} className="h-9 rounded-xl backdrop-blur-sm">
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Row 1: Status Strip */}
        <StatusStrip
          isWABAConnected={isWABAConnected}
          phoneNumber={primaryPhone?.phoneNumber}
          qualityRating={(primaryPhone?.qualityRating as any) || 'unknown'}
          creditsBalance={creditsBalance}
          creditsCurrency="₹"
          planName={billing?.planName || 'Free'}
          loading={loading}
          onConnect={() => setEmbeddedSignupOpen(true)}
        />

        {/* Row 2: KPI Row */}
        <KPIRow
          openChats={openChats}
          newContacts7d={contacts?.newContacts7d || 0}
          automationRuns7d={automations?.totalExecutions || 0}
          templatesPending={templatesPending}
          totalTemplates={totalTemplates}
          messagesReceivedToday={messagesReceivedToday}
          messagesRepliedToday={messagesRepliedToday}
          totalCampaigns={totalCampaigns}
          loading={loading}
        />

        {/* Row 3: Charts + Goals */}
        <div className="grid gap-5 lg:grid-cols-3">
          <MessagesChart
            messagesReceived={messagesReceivedToday}
            messagesReplied={messagesRepliedToday}
            loading={loading}
          />
          <ConversationTrendsChart
            openChats={openChats}
            resolvedToday={resolvedToday}
            loading={loading}
          />
          <GoalsCard
            messagesReceived={messagesReceivedToday}
            contacts7d={contacts?.newContacts7d || 0}
            campaignsSent={totalCampaigns}
            automationRuns={automations?.totalExecutions || 0}
            loading={loading}
          />
        </div>

        {/* Row 4: Quick Actions */}
        <QuickActionButtons />

        {/* Row 5: WhatsApp Links + Attention + AI Insights */}
        <div className="grid gap-5 lg:grid-cols-3">
          <WhatsAppLinksCard
            phoneNumber={primaryPhone?.phoneNumber}
            businessName={currentTenant?.name}
            loading={loading}
          />
          <AttentionCard
            templatesPending={templatesPending}
            qualityRating={primaryPhone?.qualityRating || 'green'}
            chatsWaiting={unassigned}
            loading={loading}
          />
          <AIInsightsCard
            metrics={aiMetrics}
            isPro={true}
            loading={loading}
          />
        </div>

        {/* Row 6: Setup Progress */}
        <SetupProgressCard
          steps={setupSteps.map(s => ({ ...s, status: s.status as 'completed' | 'pending' | 'current' }))}
          loading={loading}
          creditsReward={200}
        />

        {/* Row 7: Recent Activity */}
        <RecentTimeline
          events={timelineEvents}
          loading={loading}
        />
      </div>

      {/* Embedded Signup Dialog */}
      <Dialog open={embeddedSignupOpen} onOpenChange={setEmbeddedSignupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hasPhoneConnected ? 'Reconnect WhatsApp Business' : 'Connect WhatsApp Business'}</DialogTitle>
            <DialogDescription>
              {hasPhoneConnected
                ? 'Re-authenticate your existing WhatsApp Business Account connection.'
                : 'Use Meta\'s secure signup flow to connect your WhatsApp Business Account.'}
            </DialogDescription>
          </DialogHeader>
          <MetaEmbeddedSignup
            onSuccess={() => { setEmbeddedSignupOpen(false); refetch(); }}
            onError={(error) => console.error('Embedded signup error:', error)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
