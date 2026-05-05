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

// Module-level TTL cache (per tenant + range). Invalidated by realtime events
// or after CACHE_TTL_MS, so the dashboard stays fast but never goes stale.
const CACHE_TTL_MS = 60_000;
type CacheEntry = { data: any; ts: number };
const cache = new Map<string, CacheEntry>();

export function invalidateDashboardCache(tenantId?: string) {
  if (!tenantId) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.startsWith(`${tenantId}:`)) cache.delete(key);
  }
}

export interface RecentActivityItem {
  id: string;
  action: string;
  resourceType: string | null;
  title: string;
  subtitle: string;
  timestamp: string;
  iconKey: 'template' | 'campaign' | 'automation' | 'contact' | 'message' | 'auth' | 'generic';
}

const ACTION_ICON: Record<string, RecentActivityItem['iconKey']> = {
  template: 'template', templates: 'template', wa_template: 'template',
  campaign: 'campaign', campaigns: 'campaign', broadcast: 'campaign',
  automation: 'automation', workflow: 'automation', flow: 'automation',
  contact: 'contact', contacts: 'contact', lead: 'contact',
  message: 'message', conversation: 'message', inbox: 'message',
  login: 'auth', logout: 'auth', auth: 'auth', user: 'auth',
};

function pickIcon(action: string, resourceType?: string | null): RecentActivityItem['iconKey'] {
  const key = (resourceType || action || '').toLowerCase();
  for (const k of Object.keys(ACTION_ICON)) {
    if (key.includes(k)) return ACTION_ICON[k];
  }
  return 'generic';
}

function humanize(action: string, details: any): { title: string; subtitle: string } {
  const verb = action.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const sub =
    (details && (details.name || details.title || details.message || details.summary)) ||
    (details && details.resource && String(details.resource)) ||
    '';
  return { title: verb, subtitle: typeof sub === 'string' ? sub : '' };
}

export function useDashboardData(filters: DashboardFilters) {
  const { currentTenant, currentRole } = useTenant();
  const tenantId = currentTenant?.id ?? '';
  const cacheKey = `${tenantId}:${filters.dateRange}`;
  const cachedEntry = cache.get(cacheKey);
  const isFresh = cachedEntry && Date.now() - cachedEntry.ts < CACHE_TTL_MS;
  const cached: any = cachedEntry?.data || null;

  const [loading, setLoading] = useState(!cached);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(cached?.recentActivity || []);
  const [kpis, setKpis] = useState<KPIMetric[]>(cached?.kpis || []);
  const [inboxHealth, setInboxHealth] = useState<InboxHealthMetrics | null>(cached?.inboxHealth || null);
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>(cached?.actionQueue || []);
  const [agents, setAgents] = useState<AgentPerformance[]>(cached?.agents || []);
  const [automations, setAutomations] = useState<AutomationMetrics | null>(cached?.automations || null);
  const [campaigns, setCampaigns] = useState<CampaignSnapshot[]>(cached?.campaigns || []);
  const [metaAds, setMetaAds] = useState<MetaAdsMetrics | null>(cached?.metaAds || null);
  const [phoneHealth, setPhoneHealth] = useState<PhoneNumberHealth[]>(cached?.phoneHealth || []);
  const [contacts, setContacts] = useState<ContactsGrowth | null>(cached?.contacts || null);
  const [billing, setBilling] = useState<BillingUsage | null>(cached?.billing || null);
  const [alerts, setAlerts] = useState<SystemAlert[]>(cached?.alerts || []);
  const [heatmap, setHeatmap] = useState<ConversationHeatmapData[]>(cached?.heatmap || []);
  const [nextActions, setNextActions] = useState<NextBestAction[]>(cached?.nextActions || []);
  const [creditsBalance, setCreditsBalance] = useState(cached?.creditsBalance || 0);
  const [templatesPending, setTemplatesPending] = useState(cached?.templatesPending || 0);
  const [totalTemplates, setTotalTemplates] = useState(cached?.totalTemplates || 0);
  const [messagesReceivedToday, setMessagesReceivedToday] = useState(cached?.messagesReceivedToday || 0);
  const [messagesRepliedToday, setMessagesRepliedToday] = useState(cached?.messagesRepliedToday || 0);
  const [totalCampaigns, setTotalCampaigns] = useState(cached?.totalCampaigns || 0);

  const isAdmin = currentRole === 'owner' || currentRole === 'admin';
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    if (!currentTenant || inFlightRef.current) return;
    inFlightRef.current = true;

    const { start } = getDateRange(filters.dateRange);
    const tId = currentTenant.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // ── PHASE 1 (CRITICAL): KPIs, phones, credits — render the visible top-fold fast ──
      const [
        openConvosCount,
        unassignedCount,
        slaCount,
        resolvedTodayCount,
        unreadAggResult,
        phonesResult,
        creditsResult,
        inboundCount,
        outboundCount,
      ] = await Promise.all([
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tId).neq('status', 'closed').neq('status', 'expired'),
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tId).neq('status', 'closed').neq('status', 'expired').is('assigned_to', null),
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tId).eq('sla_breached', true),
        supabase.from('conversations').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tId).eq('status', 'closed').gte('updated_at', todayISO),
        supabase.from('conversations').select('unread_count')
          .eq('tenant_id', tId).neq('status', 'closed').gt('unread_count', 0).limit(200),
        supabase.from('phone_numbers')
          .select('id, display_number, verified_name, quality_rating, status, messaging_limit')
          .eq('tenant_id', tId),
        supabase.from('message_credits').select('balance').eq('tenant_id', tId).maybeSingle(),
        supabase.from('messages').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tId).eq('direction', 'inbound').gte('created_at', todayISO),
        supabase.from('messages').select('id', { count: 'exact', head: true })
          .eq('tenant_id', tId).eq('direction', 'outbound').gte('created_at', todayISO),
      ]);

      const openCount = openConvosCount.count || 0;
      const unassigned = unassignedCount.count || 0;
      const slaRisk = slaCount.count || 0;
      const resolvedToday = resolvedTodayCount.count || 0;
      const waitingOnAgent = Math.max(0, openCount - unassigned);
      const waitingOnCustomer = unassigned;
      const unreadCount = (unreadAggResult.data || []).reduce((s, r: any) => s + (r.unread_count || 0), 0);

      setKpis([
        { id: 'open', title: 'Open Conversations', value: openCount, icon: 'inbox', href: '/inbox?status=open' },
        { id: 'unassigned', title: 'Unassigned', value: unassigned, changeType: unassigned > 5 ? 'negative' : 'neutral', icon: 'user-x', href: '/inbox?assigned=none' },
        { id: 'sla', title: 'SLA Risk', value: slaRisk, changeType: slaRisk > 0 ? 'negative' : 'positive', icon: 'alert-triangle', href: '/inbox?sla=breached' },
        { id: 'response', title: 'Avg Response', value: '—', icon: 'clock' },
        { id: 'resolved', title: 'Resolved Today', value: resolvedToday, icon: 'check-circle' },
        { id: 'csat', title: 'CSAT', value: '—', icon: 'star' },
      ]);

      setInboxHealth({
        openConversations: openCount,
        closedConversations: resolvedToday,
        waitingOnAgent, waitingOnCustomer, unreadCount,
        topTags: [],
      });

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

      setCreditsBalance(creditsResult.data?.balance || 0);
      setMessagesReceivedToday(inboundCount.count || 0);
      setMessagesRepliedToday(outboundCount.count || 0);

      // Show the dashboard NOW — secondary data fills in below
      setLoading(false);

      // ── PHASE 2 (SECONDARY): templates, automations, campaigns, contacts ──
      const [
        pendingTplResult,
        allTplResult,
        campaignCountResult,
        automationRunsResult,
        topWorkflowsResult,
        pausedWorkflowsResult,
        campaignDataResult,
        newTodayResult,
        new7dResult,
        new30dResult,
      ] = await Promise.all([
        supabase.from('templates').select('id', { count: 'exact', head: true }).eq('tenant_id', tId).eq('status', 'PENDING'),
        supabase.from('templates').select('id', { count: 'exact', head: true }).eq('tenant_id', tId),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('tenant_id', tId),
        supabase.from('automation_runs').select('id', { count: 'exact', head: true }).eq('tenant_id', tId).gte('started_at', start),
        supabase.from('automation_workflows').select('id, name').eq('tenant_id', tId).eq('status', 'active').limit(5),
        supabase.from('automation_workflows').select('id', { count: 'exact', head: true }).eq('tenant_id', tId).eq('status', 'paused'),
        supabase.from('campaigns').select('id, name, status, scheduled_at, sent_count, delivered_count, read_count, replied_count')
          .eq('tenant_id', tId).order('created_at', { ascending: false }).limit(5),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('tenant_id', tId).gte('created_at', todayISO),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('tenant_id', tId).gte('created_at', sevenDaysAgo),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('tenant_id', tId).gte('created_at', thirtyDaysAgo),
      ]);

      setTemplatesPending(pendingTplResult.count || 0);
      setTotalTemplates(allTplResult.count || 0);
      setTotalCampaigns(campaignCountResult.count || 0);

      const automationRuns = automationRunsResult.count || 0;
      setAutomations({
        totalExecutions: automationRuns,
        timeSavedMinutes: automationRuns * 2,
        topAutomations: (topWorkflowsResult.data || []).map(w => ({ name: w.name, runs: 0, id: w.id })),
        errorRate: 0.02,
        pausedCount: pausedWorkflowsResult.count || 0,
        recentFailures: [],
      });

      const campaignData = campaignDataResult.data || [];
      setCampaigns(campaignData.map(c => ({
        id: c.id, name: c.name, status: c.status as any, scheduledAt: c.scheduled_at,
        sent: c.sent_count || 0, delivered: c.delivered_count || 0, read: c.read_count || 0,
        replied: c.replied_count || 0, replyRate: c.sent_count ? ((c.replied_count || 0) / c.sent_count) * 100 : 0,
      })));

      setMetaAds({
        leadsToday: 0, leads7d: 0,
        topCampaigns: [],
        conversionRate: 0, avgResponseTime: 0,
      });

      setContacts({
        newContactsToday: newTodayResult.count || 0, newContacts7d: new7dResult.count || 0, newContacts30d: new30dResult.count || 0,
        optOuts7d: 0,
        topSources: [],
        topSegments: [],
      });

      // ── PHASE 3 (ADMIN): billing + agents (lowest priority) ──
      if (isAdmin) {
        const [agentResult, memberResult, entitlementResult] = await Promise.all([
          supabase.from('agents').select('id, display_name, is_online, user_id').eq('tenant_id', tId).eq('is_active', true),
          supabase.from('tenant_members').select('id', { count: 'exact', head: true }).eq('tenant_id', tId),
          supabase.from('workspace_entitlements').select('plan').eq('workspace_id', tId).maybeSingle(),
        ]);

        setAgents((agentResult.data || []).map((a, i) => ({
          id: a.id, name: a.display_name || `Agent ${i + 1}`, isOnline: a.is_online,
          openChats: 0, avgResponseTime: 0, resolvedToday: 0, slaBreaches: 0,
        })));

        let realPlanName = entitlementResult.data?.plan || 'free';
        if (!entitlementResult.data) {
          const { data: subData } = await supabase.from('subscriptions').select('plan_id').eq('tenant_id', tId).eq('status', 'active').maybeSingle();
          if (subData?.plan_id) realPlanName = subData.plan_id.replace('plan_', '');
        }

        setBilling({
          planName: realPlanName.charAt(0).toUpperCase() + realPlanName.slice(1),
          seatsUsed: memberResult.count || 1, seatsLimit: 10,
          numbersUsed: phones.length, numbersLimit: 5,
          campaignSends: campaignData.reduce((sum, c) => sum + (c.sent_count || 0), 0), campaignLimit: 50000,
          automationRuns, automationLimit: 10000,
          storageUsedMB: 0, storageLimitMB: 5000,
          hasPaymentIssue: false,
        });
      }

      const systemAlerts: SystemAlert[] = [];
      if (slaRisk > 5) systemAlerts.push({ id: 'sla-alert', type: 'warning', category: 'api', title: 'High SLA breach rate', message: `${slaRisk} conversations have breached SLA`, timestamp: new Date().toISOString(), actionLabel: 'View SLA Report', actionHref: '/inbox?sla=breached' });
      if (unassigned > 10) systemAlerts.push({ id: 'unassigned-alert', type: 'warning', category: 'api', title: 'Many unassigned conversations', message: `${unassigned} conversations need assignment`, timestamp: new Date().toISOString(), actionLabel: 'Assign Now', actionHref: '/inbox?assigned=none' });
      setAlerts(systemAlerts);

      setNextActions([]);

      // ── PHASE 4: Recent activity (real audit log) ──
      const { data: auditRows } = await supabase
        .from('audit_logs')
        .select('id, action, resource_type, details, created_at')
        .eq('tenant_id', tId)
        .order('created_at', { ascending: false })
        .limit(8);

      const activity: RecentActivityItem[] = (auditRows || []).map((row: any) => {
        const { title, subtitle } = humanize(row.action, row.details);
        return {
          id: row.id,
          action: row.action,
          resourceType: row.resource_type,
          title,
          subtitle,
          timestamp: row.created_at,
          iconKey: pickIcon(row.action, row.resource_type),
        };
      });
      setRecentActivity(activity);

      // Cache snapshot with timestamp for TTL invalidation
      cache.set(cacheKey, {
        ts: Date.now(),
        data: {
          kpis: undefined, // re-derived from setters; lightweight fields only
          recentActivity: activity,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [currentTenant, filters, isAdmin, cacheKey]);

  useEffect(() => {
    if (isFresh) {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [fetchDashboardData, isFresh]);

  // Realtime: invalidate cache + refetch on tenant data changes (debounced)
  useEffect(() => {
    if (!currentTenant) return;
    const tId = currentTenant.id;

    const triggerRefresh = () => {
      invalidateDashboardCache(tId);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchDashboardData(), 3000);
    };

    const channel = supabase
      .channel(`dashboard-rt-${tId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${tId}` }, triggerRefresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs', filter: `tenant_id=eq.${tId}` }, triggerRefresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `tenant_id=eq.${tId}` }, triggerRefresh)
      .subscribe();

    // Also auto-refetch when window regains focus & cache is older than TTL
    const onFocus = () => {
      const entry = cache.get(cacheKey);
      if (!entry || Date.now() - entry.ts >= CACHE_TTL_MS) fetchDashboardData();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.removeEventListener('focus', onFocus);
      supabase.removeChannel(channel);
    };
  }, [currentTenant, fetchDashboardData, cacheKey]);

  return {
    loading, kpis, inboxHealth, actionQueue, agents, automations, campaigns, metaAds,
    phoneHealth, contacts, billing, alerts, heatmap, nextActions, isAdmin,
    creditsBalance, templatesPending, totalTemplates, messagesReceivedToday, messagesRepliedToday, totalCampaigns,
    recentActivity,
    refetch: () => { invalidateDashboardCache(tenantId); return fetchDashboardData(); },
  };
}
