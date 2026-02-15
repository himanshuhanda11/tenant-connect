import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type {
  DashboardFilters,
  KPIMetric,
  InboxHealthMetrics,
  ActionQueueItem,
  AgentPerformance,
  AutomationMetrics,
  CampaignSnapshot,
  MetaAdsMetrics,
  PhoneNumberHealth,
  ContactsGrowth,
  BillingUsage,
  SystemAlert,
  ConversationHeatmapData,
  NextBestAction,
} from '@/types/dashboard';

const getDateRange = (range: DashboardFilters['dateRange']) => {
  const now = new Date();
  const end = now.toISOString();
  let start: string;

  switch (range) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    default:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  return { start, end };
};

export function useDashboardData(filters: DashboardFilters) {
  const { currentTenant, currentRole } = useTenant();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [inboxHealth, setInboxHealth] = useState<InboxHealthMetrics | null>(null);
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>([]);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [automations, setAutomations] = useState<AutomationMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignSnapshot[]>([]);
  const [metaAds, setMetaAds] = useState<MetaAdsMetrics | null>(null);
  const [phoneHealth, setPhoneHealth] = useState<PhoneNumberHealth[]>([]);
  const [contacts, setContacts] = useState<ContactsGrowth | null>(null);
  const [billing, setBilling] = useState<BillingUsage | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [heatmap, setHeatmap] = useState<ConversationHeatmapData[]>([]);
  const [nextActions, setNextActions] = useState<NextBestAction[]>([]);
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [templatesPending, setTemplatesPending] = useState(0);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [messagesReceivedToday, setMessagesReceivedToday] = useState(0);
  const [messagesRepliedToday, setMessagesRepliedToday] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';

  const fetchDashboardData = useCallback(async () => {
    if (!currentTenant) return;

    setLoading(true);
    const { start, end } = getDateRange(filters.dateRange);

    try {
      // Fetch conversations for KPIs
      const { data: conversations, count: totalConvos } = await supabase
        .from('conversations')
        .select('id, status, unread_count, assigned_to, created_at, last_message_at, sla_breached', { count: 'exact' })
        .eq('tenant_id', currentTenant.id)
        .gte('created_at', start);

      const openConvos = conversations?.filter(c => c.status !== 'closed' && c.status !== 'expired') || [];
      const unassigned = openConvos.filter(c => !c.assigned_to);
      const slaRisk = conversations?.filter(c => c.sla_breached) || [];

      // Fetch messages for response time
      const { data: messages } = await supabase
        .from('messages')
        .select('id, direction, created_at, conversation_id')
        .eq('tenant_id', currentTenant.id)
        .gte('created_at', start)
        .order('created_at', { ascending: true });

      // Calculate avg first response time (simplified)
      let avgResponseTime = 0;
      if (messages && messages.length > 0) {
        const inbound = messages.filter(m => m.direction === 'inbound');
        const outbound = messages.filter(m => m.direction === 'outbound');
        if (inbound.length > 0 && outbound.length > 0) {
          avgResponseTime = 180; // 3 minutes placeholder
        }
      }

      // Resolved today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: resolvedToday } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'closed')
        .gte('updated_at', todayStart.toISOString());

      // Set KPIs
      setKpis([
        {
          id: 'open',
          title: 'Open Conversations',
          value: openConvos.length,
          change: 12,
          changeType: 'positive',
          icon: 'inbox',
          href: '/inbox?status=open',
        },
        {
          id: 'unassigned',
          title: 'Unassigned',
          value: unassigned.length,
          changeType: unassigned.length > 5 ? 'negative' : 'neutral',
          icon: 'user-x',
          href: '/inbox?assigned=none',
        },
        {
          id: 'sla',
          title: 'SLA Risk',
          value: slaRisk.length,
          changeType: slaRisk.length > 0 ? 'negative' : 'positive',
          icon: 'alert-triangle',
          href: '/inbox?sla=breached',
        },
        {
          id: 'response',
          title: 'Avg Response',
          value: avgResponseTime > 0 ? `${Math.round(avgResponseTime / 60)}m` : '—',
          icon: 'clock',
        },
        {
          id: 'resolved',
          title: 'Resolved Today',
          value: resolvedToday || 0,
          change: 8,
          changeType: 'positive',
          icon: 'check-circle',
        },
        {
          id: 'csat',
          title: 'CSAT',
          value: '—',
          icon: 'star',
        },
      ]);

      // Inbox Health
      const waitingOnAgent = openConvos.filter(c => c.assigned_to).length;
      const waitingOnCustomer = openConvos.length - waitingOnAgent;
      const unreadCount = openConvos.reduce((sum, c) => sum + (c.unread_count || 0), 0);

      // Top tags (mock for now - would need contact_tags join)
      const topTags = [
        { name: 'VIP', count: 12, color: 'amber' },
        { name: 'Support', count: 28, color: 'blue' },
        { name: 'Pricing', count: 15, color: 'green' },
        { name: 'Complaint', count: 5, color: 'red' },
        { name: 'Lead', count: 42, color: 'purple' },
      ];

      setInboxHealth({
        openConversations: openConvos.length,
        closedConversations: (totalConvos || 0) - openConvos.length,
        waitingOnAgent,
        waitingOnCustomer,
        unreadCount,
        topTags,
      });

      // Action Queue
      const actionItems: ActionQueueItem[] = [];
      
      // Unassigned > 10 minutes
      unassigned.slice(0, 5).forEach((c, i) => {
        actionItems.push({
          id: c.id,
          type: 'unassigned',
          title: 'Unassigned conversation',
          subtitle: 'Waiting for assignment',
          priority: i < 2 ? 'high' : 'medium',
          timestamp: c.created_at,
          conversationId: c.id,
        });
      });

      // SLA risk
      slaRisk.slice(0, 3).forEach(c => {
        actionItems.push({
          id: `sla-${c.id}`,
          type: 'sla_risk',
          title: 'SLA breach risk',
          subtitle: 'Response time exceeded',
          priority: 'high',
          timestamp: c.last_message_at || c.created_at,
          conversationId: c.id,
        });
      });

      setActionQueue(actionItems);

      // Fetch agents (for admin)
      if (isAdmin) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('id, display_name, is_online, user_id')
          .eq('tenant_id', currentTenant.id)
          .eq('is_active', true);

        const agentPerformance: AgentPerformance[] = (agentData || []).map((a, i) => ({
          id: a.id,
          name: a.display_name || `Agent ${i + 1}`,
          isOnline: a.is_online,
          openChats: Math.floor(Math.random() * 10),
          avgResponseTime: 120 + Math.floor(Math.random() * 180),
          resolvedToday: Math.floor(Math.random() * 15),
          slaBreaches: Math.floor(Math.random() * 3),
        }));

        setAgents(agentPerformance);
      }

      // Fetch automation metrics
      const { count: automationRuns } = await supabase
        .from('automation_runs')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .gte('started_at', start);

      const { data: topWorkflows } = await supabase
        .from('automation_workflows')
        .select('id, name')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .limit(5);

      const { count: pausedWorkflows } = await supabase
        .from('automation_workflows')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'paused');

      setAutomations({
        totalExecutions: automationRuns || 0,
        timeSavedMinutes: (automationRuns || 0) * 2,
        topAutomations: (topWorkflows || []).map(w => ({
          name: w.name,
          runs: Math.floor(Math.random() * 100),
          id: w.id,
        })),
        errorRate: 0.02,
        pausedCount: pausedWorkflows || 0,
        recentFailures: [],
      });

      // Fetch campaigns
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('id, name, status, scheduled_at, sent_count, delivered_count, read_count, replied_count')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setCampaigns((campaignData || []).map(c => ({
        id: c.id,
        name: c.name,
        status: c.status as any,
        scheduledAt: c.scheduled_at,
        sent: c.sent_count || 0,
        delivered: c.delivered_count || 0,
        read: c.read_count || 0,
        replied: c.replied_count || 0,
        replyRate: c.sent_count ? ((c.replied_count || 0) / c.sent_count) * 100 : 0,
      })));

      // Meta Ads metrics (mock for now)
      setMetaAds({
        leadsToday: 23,
        leads7d: 156,
        topCampaigns: [
          { name: 'Summer Sale', leads: 45 },
          { name: 'New Product Launch', leads: 32 },
          { name: 'Brand Awareness', leads: 28 },
        ],
        conversionRate: 34.5,
        avgResponseTime: 145,
      });

      // Phone numbers health
      const { data: phones } = await supabase
        .from('phone_numbers')
        .select('id, display_number, verified_name, quality_rating, status')
        .eq('tenant_id', currentTenant.id);

      setPhoneHealth((phones || []).map(p => ({
        id: p.id,
        displayName: p.verified_name || 'Unnamed',
        phoneNumber: p.display_number,
        qualityRating: (p.quality_rating?.toLowerCase() || 'unknown') as any,
        messagingLimit: '10K/day',
        webhookHealth: 'healthy',
        needsAction: p.quality_rating === 'RED' || p.status !== 'connected',
        actionReason: p.quality_rating === 'RED' ? 'Low quality rating' : undefined,
      })));

      // Contacts growth
      const { count: newToday } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .gte('created_at', todayStart.toISOString());

      const { count: new7d } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: new30d } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setContacts({
        newContactsToday: newToday || 0,
        newContacts7d: new7d || 0,
        newContacts30d: new30d || 0,
        optOuts7d: 3,
        topSources: [
          { source: 'Meta Ads', count: 45 },
          { source: 'Website', count: 32 },
          { source: 'QR Code', count: 18 },
          { source: 'API', count: 12 },
        ],
        topSegments: [
          { name: 'Active Customers', count: 1234, id: '1' },
          { name: 'VIP', count: 89, id: '2' },
          { name: 'New Leads', count: 456, id: '3' },
        ],
      });

      // Fetch real credits balance
      const { data: creditsData } = await supabase
        .from('message_credits')
        .select('balance')
        .eq('tenant_id', currentTenant.id)
        .maybeSingle();
      setCreditsBalance(creditsData?.balance || 0);

      // Fetch templates pending approval + total
      const { count: pendingTemplates } = await supabase
        .from('templates')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'PENDING');
      setTemplatesPending(pendingTemplates || 0);

      const { count: allTemplates } = await supabase
        .from('templates')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id);
      setTotalTemplates(allTemplates || 0);

      // Fetch total campaigns
      const { count: campaignCount } = await supabase
        .from('campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id);
      setTotalCampaigns(campaignCount || 0);

      // Messages received today (inbound) and replied today (outbound)
      const { count: inboundToday } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('direction', 'inbound')
        .gte('created_at', todayStart.toISOString());
      setMessagesReceivedToday(inboundToday || 0);

      const { count: outboundToday } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('direction', 'outbound')
        .gte('created_at', todayStart.toISOString());
      setMessagesRepliedToday(outboundToday || 0);


      if (isAdmin) {
        const { count: memberCount } = await supabase
          .from('tenant_members')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', currentTenant.id);

        const phoneCount = phones?.length || 0;

        // Fetch real plan from workspace_entitlements
        const { data: entitlementData } = await supabase
          .from('workspace_entitlements')
          .select('plan')
          .eq('workspace_id', currentTenant.id)
          .maybeSingle();

        let realPlanName = entitlementData?.plan || 'free';

        // Fallback to subscriptions if no entitlement
        if (!entitlementData) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('tenant_id', currentTenant.id)
            .eq('status', 'active')
            .maybeSingle();
          if (subData?.plan_id) {
            realPlanName = subData.plan_id.replace('plan_', '');
          }
        }

        const planDisplay = realPlanName.charAt(0).toUpperCase() + realPlanName.slice(1);

        setBilling({
          planName: planDisplay,
          seatsUsed: memberCount || 1,
          seatsLimit: 10,
          numbersUsed: phoneCount,
          numbersLimit: 5,
          campaignSends: (campaignData || []).reduce((sum, c) => sum + (c.sent_count || 0), 0),
          campaignLimit: 50000,
          automationRuns: automationRuns || 0,
          automationLimit: 10000,
          storageUsedMB: 256,
          storageLimitMB: 5000,
          hasPaymentIssue: false,
        });
      }

      // System alerts
      const systemAlerts: SystemAlert[] = [];
      
      if (slaRisk.length > 5) {
        systemAlerts.push({
          id: 'sla-alert',
          type: 'warning',
          category: 'api',
          title: 'High SLA breach rate',
          message: `${slaRisk.length} conversations have breached SLA`,
          timestamp: new Date().toISOString(),
          actionLabel: 'View SLA Report',
          actionHref: '/inbox?sla=breached',
        });
      }

      if (unassigned.length > 10) {
        systemAlerts.push({
          id: 'unassigned-alert',
          type: 'warning',
          category: 'api',
          title: 'Many unassigned conversations',
          message: `${unassigned.length} conversations need assignment`,
          timestamp: new Date().toISOString(),
          actionLabel: 'Assign Now',
          actionHref: '/inbox?assigned=none',
        });
      }

      setAlerts(systemAlerts);

      // Next best actions
      setNextActions([
        {
          id: '1',
          type: 'followup',
          title: 'Follow up with VIP customers',
          description: '3 VIP customers have been waiting for a response',
          priority: 'high',
          href: '/inbox?tags=vip',
        },
        {
          id: '2',
          type: 'campaign',
          title: 'Schedule weekly newsletter',
          description: 'Last newsletter was sent 8 days ago',
          priority: 'medium',
          href: '/campaigns/create',
        },
      ]);

      // Conversation heatmap (mock data)
      const heatmapData: ConversationHeatmapData[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmapData.push({
            day,
            hour,
            count: Math.floor(Math.random() * 50),
          });
        }
      }
      setHeatmap(heatmapData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTenant, filters, isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!currentTenant) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        () => {
          // Refetch on conversation changes
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant, fetchDashboardData]);

  return {
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
    creditsBalance,
    templatesPending,
    totalTemplates,
    messagesReceivedToday,
    messagesRepliedToday,
    totalCampaigns,
    refetch: fetchDashboardData,
  };
}
