// Dashboard types for enhanced metrics and data

export interface DateRangeFilter {
  label: string;
  value: 'today' | '7d' | '30d' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface DashboardFilters {
  dateRange: DateRangeFilter['value'];
  phoneNumberId: string | null;
  teamId: string | null;
  source: 'all' | 'meta_ads' | 'website' | 'qr' | 'api';
}

export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  href?: string;
  loading?: boolean;
}

export interface InboxHealthMetrics {
  openConversations: number;
  closedConversations: number;
  waitingOnAgent: number;
  waitingOnCustomer: number;
  unreadCount: number;
  topTags: { name: string; count: number; color: string }[];
}

export interface ActionQueueItem {
  id: string;
  type: 'unassigned' | 'sla_risk' | 'ctwa_waiting' | 'vip_waiting';
  title: string;
  subtitle: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  conversationId: string;
}

export interface AgentPerformance {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  openChats: number;
  avgResponseTime: number; // in seconds
  resolvedToday: number;
  slaBreaches: number;
}

export interface AutomationMetrics {
  totalExecutions: number;
  timeSavedMinutes: number;
  topAutomations: { name: string; runs: number; id: string }[];
  errorRate: number;
  pausedCount: number;
  recentFailures: { id: string; name: string; error: string; timestamp: string }[];
}

export interface CampaignSnapshot {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  scheduledAt?: string;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  replyRate: number;
}

export interface MetaAdsMetrics {
  leadsToday: number;
  leads7d: number;
  topCampaigns: { name: string; leads: number }[];
  conversionRate: number;
  avgResponseTime: number; // in seconds
}

export interface PhoneNumberHealth {
  id: string;
  displayName: string;
  phoneNumber: string;
  qualityRating: 'green' | 'yellow' | 'red' | 'unknown';
  messagingLimit: string;
  webhookHealth: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastWebhookAt?: string;
  needsAction: boolean;
  actionReason?: string;
}

export interface ContactsGrowth {
  newContactsToday: number;
  newContacts7d: number;
  newContacts30d: number;
  optOuts7d: number;
  topSources: { source: string; count: number }[];
  topSegments: { name: string; count: number; id: string }[];
}

export interface BillingUsage {
  planName: string;
  seatsUsed: number;
  seatsLimit: number;
  numbersUsed: number;
  numbersLimit: number;
  campaignSends: number;
  campaignLimit: number;
  automationRuns: number;
  automationLimit: number;
  storageUsedMB: number;
  storageLimitMB: number;
  hasPaymentIssue: boolean;
  paymentIssueMessage?: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'webhook' | 'api' | 'automation' | 'campaign' | 'payment' | 'security';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  actionHref?: string;
  dismissed?: boolean;
}

export interface ConversationHeatmapData {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  count: number;
}

export interface NextBestAction {
  id: string;
  type: 'followup' | 'vip' | 'sla' | 'campaign';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  href: string;
}
