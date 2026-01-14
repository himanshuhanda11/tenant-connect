import React, { useState } from 'react';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
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

        {/* Top KPIs */}
        <KPICards kpis={kpis} loading={loading} />

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
