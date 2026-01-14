import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetaEmbeddedSignup } from '@/components/meta/MetaEmbeddedSignup';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { DashboardFilters } from '@/types/dashboard';

// Dashboard components
import { DashboardFiltersBar } from '@/components/dashboard/DashboardFiltersBar';
import { KPICards } from '@/components/dashboard/KPICards';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { InboxHealthPanel } from '@/components/dashboard/InboxHealthPanel';
import { AgentPerformancePanel } from '@/components/dashboard/AgentPerformancePanel';
import { AutomationsPanel } from '@/components/dashboard/AutomationsPanel';
import { CampaignsPanel } from '@/components/dashboard/CampaignsPanel';
import { MetaAdsPanel } from '@/components/dashboard/MetaAdsPanel';
import { PhoneHealthPanel } from '@/components/dashboard/PhoneHealthPanel';
import { ContactsGrowthPanel } from '@/components/dashboard/ContactsGrowthPanel';
import { BillingPanel } from '@/components/dashboard/BillingPanel';
import { ConversationHeatmap } from '@/components/dashboard/ConversationHeatmap';
import { NextBestActionsPanel } from '@/components/dashboard/NextBestActionsPanel';

// New enhanced components
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { AttentionNeededPanel } from '@/components/dashboard/AttentionNeededPanel';
import { FunnelVisualization } from '@/components/dashboard/FunnelVisualization';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import { QuickActions } from '@/components/dashboard/QuickActions';

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
    heatmap,
    nextActions,
    isAdmin,
    refetch,
  } = useDashboardData(filters);

  const displayName = profile?.full_name?.split(' ')[0] || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Determine role for role-based dashboard
  const dashboardRole = useMemo((): 'admin' | 'manager' | 'agent' => {
    if (currentRole === 'owner' || currentRole === 'admin') return 'admin';
    // Manager role check - cast to handle potential type mismatch
    if ((currentRole as string) === 'manager') return 'manager';
    return 'agent';
  }, [currentRole]);

  // Prepare AI insights metrics
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

  // Prepare attention items
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

    // Check for broken flows (mock)
    if (automations?.recentFailures && automations.recentFailures.length > 0) {
      items.push({
        id: 'broken-flows',
        type: 'broken_flow',
        title: 'Broken Automations',
        subtitle: 'Flows with recent errors',
        count: automations.recentFailures.length,
        severity: 'warning',
        href: '/automation',
      });
    }

    // Check for low conversion campaigns
    const lowConvCampaigns = campaigns.filter(c => c.replyRate < 5 && c.sent > 100);
    if (lowConvCampaigns.length > 0) {
      items.push({
        id: 'low-conv',
        type: 'low_conversion',
        title: 'Low Conversion Campaigns',
        subtitle: 'Reply rate below 5%',
        count: lowConvCampaigns.length,
        severity: 'warning',
        href: '/campaigns',
      });
    }

    // Check phone health
    const unhealthyPhones = phoneHealth.filter(p => p.needsAction);
    if (unhealthyPhones.length > 0) {
      items.push({
        id: 'phone-health',
        type: 'webhook_error',
        title: 'Phone Number Issues',
        subtitle: unhealthyPhones[0]?.actionReason || 'Requires attention',
        count: unhealthyPhones.length,
        severity: 'warning',
        href: '/phone-numbers',
      });
    }

    return items;
  }, [kpis, automations, campaigns, phoneHealth]);

  // Prepare funnel data
  const funnelData = useMemo(() => ({
    metaAds: metaAds?.leads7d || 156,
    inbox: inboxHealth?.openConversations || 0 + (inboxHealth?.closedConversations || 0),
    flows: automations?.totalExecutions || 0,
    agents: agents.reduce((sum, a) => sum + a.resolvedToday, 0),
    conversions: Math.round((metaAds?.leads7d || 156) * (metaAds?.conversionRate || 34.5) / 100),
  }), [metaAds, inboxHealth, automations, agents]);

  // Role-based stats
  const adminStats = useMemo(() => ({
    monthlyRevenue: 420000,
    revenueChange: 12,
    totalConversations: (inboxHealth?.openConversations || 0) + (inboxHealth?.closedConversations || 0),
    attributionBreakdown: [
      { source: 'Meta Ads', value: 180000, percentage: 43 },
      { source: 'Organic', value: 120000, percentage: 29 },
      { source: 'Campaigns', value: 80000, percentage: 19 },
      { source: 'Other', value: 40000, percentage: 9 },
    ],
    usageCosts: 15000,
    planUtilization: billing ? Math.round((billing.campaignSends / billing.campaignLimit) * 100) : 45,
  }), [inboxHealth, billing]);

  const managerStats = useMemo(() => ({
    teamSize: agents.length || 5,
    onlineAgents: agents.filter(a => a.isOnline).length || 3,
    avgTeamResponseTime: '2.8m',
    slaCompliance: 94,
    escalations: 2,
    topPerformer: { name: agents[0]?.name || 'Sarah', score: 98 },
  }), [agents]);

  const agentStats = useMemo(() => ({
    openChats: 5,
    resolvedToday: 12,
    avgResponseTime: '1.8m',
    csat: 96,
    pendingTasks: 3,
    streak: 7,
  }), []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px]">
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
        </div>

        {/* Filters Bar */}
        <DashboardFiltersBar
          filters={filters}
          onChange={setFilters}
          onRefresh={refetch}
          loading={loading}
        />

        {/* System Alerts */}
        <AlertsPanel alerts={alerts} />

        {/* AI Insights + Attention Needed - Top Priority */}
        <div className="grid gap-4 lg:grid-cols-2">
          <AIInsightsPanel metrics={aiMetrics} isPro={true} />
          <AttentionNeededPanel items={attentionItems} loading={loading} />
        </div>

        {/* Role-Based Dashboard Section */}
        <RoleBasedDashboard
          role={dashboardRole}
          adminStats={dashboardRole === 'admin' ? adminStats : undefined}
          managerStats={dashboardRole === 'manager' ? managerStats : undefined}
          agentStats={dashboardRole === 'agent' ? agentStats : undefined}
          loading={loading}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Top KPIs */}
        <KPICards kpis={kpis} loading={loading} />

        {/* Funnel Visualization */}
        <FunnelVisualization data={funnelData} loading={loading} />

        {/* Next Best Actions */}
        <NextBestActionsPanel actions={nextActions} />

        {/* Inbox Health + Action Queue */}
        <InboxHealthPanel
          metrics={inboxHealth}
          actionQueue={actionQueue}
          loading={loading}
        />

        {/* Agent Performance (Admin) or My Performance (Agent) */}
        <AgentPerformancePanel
          agents={agents}
          isAdmin={isAdmin}
          loading={loading}
        />

        {/* 3-column grid: Automations, Campaigns, Meta Ads */}
        <div className="grid gap-4 lg:grid-cols-3">
          <AutomationsPanel metrics={automations} loading={loading} />
          <CampaignsPanel campaigns={campaigns} loading={loading} />
          <MetaAdsPanel metrics={metaAds} loading={loading} />
        </div>

        {/* Phone Health + Contacts Growth */}
        <div className="grid gap-4 lg:grid-cols-2">
          <PhoneHealthPanel phones={phoneHealth} loading={loading} />
          <ContactsGrowthPanel data={contacts} loading={loading} />
        </div>

        {/* Heatmap + Billing (Admin only) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ConversationHeatmap data={heatmap} loading={loading} />
          {isAdmin && <BillingPanel data={billing} loading={loading} />}
        </div>
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
