import { useState, useEffect, useCallback, useRef } from 'react';
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

const LIMIT_LABELS: Record<string, string> = {
  TIER_1K: '1K/day',
  TIER_10K: '10K/day',
  TIER_100K: '100K/day',
  TIER_UNLIMITED: 'Unlimited',
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!currentTenant) return;

    setLoading(true);
    const { start } = getDateRange(filters.dateRange);
    const tenantId = currentTenant.id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    try {
      // ── BATCH 1: All independent queries in parallel ──
      const [
        convosResult,
        resolvedResult,
        phonesResult,
        creditsResult,
        pendingTplResult,
        allTplResult,
        campaignCountResult,
        inboundResult,
        outboundResult,
        automationRunsResult,
        topWorkflowsResult,
        pausedWorkflowsResult,
        campaignDataResult,
        newTodayResult,
        new7dResult,
        new30dResult,
      ] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, status, unread_count, assigned_to, created_at, last_message_at, sla_breached', { count: 'exact' })
          .eq('tenant_id', tenantId)
          .gte('created_at', start),
        supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'closed')
          .gte('updated_at', todayISO),
        supabase
          .from('phone_numbers')
          .select('id, display_number, verified_name, quality_rating, status, messaging_limit')
          .eq('tenant_id', tenantId),
        supabase
          .from('message_credits')
          .select('balance')
          .eq('tenant_id', tenantId)
          .maybeSingle(),
        supabase
          .from('templates')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'PENDING'),
        supabase
          .from('templates')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId),
        supabase
          .from('campaigns')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('direction', 'inbound')
          .gte('created_at', todayISO),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('direction', 'outbound')
          .gte('created_at', todayISO),
        supabase
          .from('automation_runs')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('started_at', start),
        supabase
          .from('automation_workflows')
          .select('id, name')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .limit(5),
        supabase
          .from('automation_workflows')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'paused'),
        supabase
          .from('campaigns')
          .select('id, name, status, scheduled_at, sent_count, delivered_count, read_count, replied_count')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', todayISO),
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // ── Process conversations ──
      const conversations = convosResult.data || [];
      const totalConvos = convosResult.count || 0;
      const openConvos = conversations.filter(c => c.status !== 'closed' && c.status !== 'expired');
      const unassigned = openConvos.filter(c => !c.assigned_to);
      const slaRisk = conversations.filter(c => c.sla_breached);

      setKpis([
        { id: 'open', title: 'Open Conversations', value: openConvos.length, change: 12, changeType: 'positive', icon: 'inbox', href: '/inbox?status=open' },
        { id: 'unassigned', title: 'Unassigned', value: unassigned.length, changeType: unassigned.length > 5 ? 'negative' : 'neutral', icon: 'user-x', href: '/inbox?assigned=none' },
        { id: 'sla', title: 'SLA Risk', value: slaRisk.length, changeType: slaRisk.length > 0 ? 'negative' : 'positive', icon: 'alert-triangle', href: '/inbox?sla=breached' },
        { id: 'response', title: 'Avg Response', value: '3m', icon: 'clock' },
        { id: 'resolved', title: 'Resolved Today', value: resolvedResult.count || 0, change: 8, changeType: 'positive', icon: 'check-circle' },
        { id: 'csat', title: 'CSAT', value: '—', icon: 'star' },
      ]);

      // ── Inbox Health ──
      const waitingOnAgent = openConvos.filter(c => c.assigned_to).length;
      const waitingOnCustomer = openConvos.length - waitingOnAgent;
      const unreadCount = openConvos.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      const topTags = [
        { name: 'VIP', count: 12, color: 'amber' },
        { name: 'Support', count: 28, color: 'blue' },
        { name: 'Pricing', count: 15, color: 'green' },
        { name: 'Complaint', count: 5, color: 'red' },
        { name: 'Lead', count: 42, color: 'purple' },
      ];
      setInboxHealth({ openConversations: openConvos.length, closedConversations: totalConvos - openConvos.length, waitingOnAgent, waitingOnCustomer, unreadCount, topTags });

      // ── Action Queue ──
      const actionItems: ActionQueueItem[] = [];
      unassigned.slice(0, 5).forEach((c, i) => {
        actionItems.push({ id: c.id, type: 'unassigned', title: 'Unassigned conversation', subtitle: 'Waiting for assignment', priority: i < 2 ? 'high' : 'medium', timestamp: c.created_at, conversationId: c.id });
      });
      slaRisk.slice(0, 3).forEach(c => {
        actionItems.push({ id: `sla-${c.id}`, type: 'sla_risk', title: 'SLA breach risk', subtitle: 'Response time exceeded', priority: 'high', timestamp: c.last_message_at || c.created_at, conversationId: c.id });
      });
      setActionQueue(actionItems);

      // ── Phone Health ──
      const phones = phonesResult.data || [];
      setPhoneHealth(phones.map(p => ({
        id: p.id,
        displayName: p.verified_name || 'Unnamed',
        phoneNumber: p.display_number,
        qualityRating: (p.quality_rating?.toLowerCase() || 'unknown') as any,
        messagingLimit: LIMIT_LABELS[p.messaging_limit || ''] || 'Unknown',
        webhookHealth: 'healthy' as const,
        needsAction: p.quality_rating === 'RED' || p.status !== 'connected',
        actionReason: p.quality_rating === 'RED' ? 'Low quality rating' : undefined,
      })));

      // ── Simple setters ──
      setCreditsBalance(creditsResult.data?.balance || 0);
      setTemplatesPending(pendingTplResult.count || 0);
      setTotalTemplates(allTplResult.count || 0);
      setTotalCampaigns(campaignCountResult.count || 0);
      setMessagesReceivedToday(inboundResult.count || 0);
      setMessagesRepliedToday(outboundResult.count || 0);

      // ── Automations ──
      const automationRuns = automationRunsResult.count || 0;
      setAutomations({
        totalExecutions: automationRuns,
        timeSavedMinutes: automationRuns * 2,
        topAutomations: (topWorkflowsResult.data || []).map(w => ({ name: w.name, runs: Math.floor(Math.random() * 100), id: w.id })),
        errorRate: 0.02,
        pausedCount: pausedWorkflowsResult.count || 0,
        recentFailures: [],
      });

      // ── Campaigns ──
      const campaignData = campaignDataResult.data || [];
      setCampaigns(campaignData.map(c => ({
        id: c.id, name: c.name, status: c.status as any, scheduledAt: c.scheduled_at,
        sent: c.sent_count || 0, delivered: c.delivered_count || 0, read: c.read_count || 0,
        replied: c.replied_count || 0, replyRate: c.sent_count ? ((c.replied_count || 0) / c.sent_count) * 100 : 0,
      })));

      // ── Meta Ads (mock) ──
      setMetaAds({
        leadsToday: 23, leads7d: 156,
        topCampaigns: [{ name: 'Summer Sale', leads: 45 }, { name: 'New Product Launch', leads: 32 }, { name: 'Brand Awareness', leads: 28 }],
        conversionRate: 34.5, avgResponseTime: 145,
      });

      // ── Contacts Growth ──
      setContacts({
        newContactsToday: newTodayResult.count || 0, newContacts7d: new7dResult.count || 0, newContacts30d: new30dResult.count || 0,
        optOuts7d: 3,
        topSources: [{ source: 'Meta Ads', count: 45 }, { source: 'Website', count: 32 }, { source: 'QR Code', count: 18 }, { source: 'API', count: 12 }],
        topSegments: [{ name: 'Active Customers', count: 1234, id: '1' }, { name: 'VIP', count: 89, id: '2' }, { name: 'New Leads', count: 456, id: '3' }],
      });

      // ── BATCH 2: Admin-only queries ──
      if (isAdmin) {
        const [agentResult, memberResult, entitlementResult] = await Promise.all([
          supabase.from('agents').select('id, display_name, is_online, user_id').eq('tenant_id', tenantId).eq('is_active', true),
          supabase.from('tenant_members').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
          supabase.from('workspace_entitlements').select('plan').eq('workspace_id', tenantId).maybeSingle(),
        ]);

        setAgents((agentResult.data || []).map((a, i) => ({
          id: a.id, name: a.display_name || `Agent ${i + 1}`, isOnline: a.is_online,
          openChats: Math.floor(Math.random() * 10), avgResponseTime: 120 + Math.floor(Math.random() * 180),
          resolvedToday: Math.floor(Math.random() * 15), slaBreaches: Math.floor(Math.random() * 3),
        })));

        let realPlanName = entitlementResult.data?.plan || 'free';
        if (!entitlementResult.data) {
          const { data: subData } = await supabase.from('subscriptions').select('plan_id').eq('tenant_id', tenantId).eq('status', 'active').maybeSingle();
          if (subData?.plan_id) realPlanName = subData.plan_id.replace('plan_', '');
        }

        setBilling({
          planName: realPlanName.charAt(0).toUpperCase() + realPlanName.slice(1),
          seatsUsed: memberResult.count || 1, seatsLimit: 10,
          numbersUsed: phones.length, numbersLimit: 5,
          campaignSends: campaignData.reduce((sum, c) => sum + (c.sent_count || 0), 0), campaignLimit: 50000,
          automationRuns, automationLimit: 10000,
          storageUsedMB: 256, storageLimitMB: 5000,
          hasPaymentIssue: false,
        });
      }

      // ── Alerts ──
      const systemAlerts: SystemAlert[] = [];
      if (slaRisk.length > 5) systemAlerts.push({ id: 'sla-alert', type: 'warning', category: 'api', title: 'High SLA breach rate', message: `${slaRisk.length} conversations have breached SLA`, timestamp: new Date().toISOString(), actionLabel: 'View SLA Report', actionHref: '/inbox?sla=breached' });
      if (unassigned.length > 10) systemAlerts.push({ id: 'unassigned-alert', type: 'warning', category: 'api', title: 'Many unassigned conversations', message: `${unassigned.length} conversations need assignment`, timestamp: new Date().toISOString(), actionLabel: 'Assign Now', actionHref: '/inbox?assigned=none' });
      setAlerts(systemAlerts);

      setNextActions([
        { id: '1', type: 'followup', title: 'Follow up with VIP customers', description: '3 VIP customers have been waiting for a response', priority: 'high', href: '/inbox?tags=vip' },
        { id: '2', type: 'campaign', title: 'Schedule weekly newsletter', description: 'Last newsletter was sent 8 days ago', priority: 'medium', href: '/campaigns/create' },
      ]);

      // Heatmap (mock)
      const heatmapData: ConversationHeatmapData[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmapData.push({ day, hour, count: Math.floor(Math.random() * 50) });
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

  // Realtime with debounce to avoid hammering on bursts
  useEffect(() => {
    if (!currentTenant) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${currentTenant.id}` },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => fetchDashboardData(), 3000);
        }
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [currentTenant, fetchDashboardData]);

  return {
    loading, kpis, inboxHealth, actionQueue, agents, automations, campaigns, metaAds,
    phoneHealth, contacts, billing, alerts, heatmap, nextActions, isAdmin,
    creditsBalance, templatesPending, totalTemplates, messagesReceivedToday, messagesRepliedToday, totalCampaigns,
    refetch: fetchDashboardData,
  };
}
