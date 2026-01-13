export interface MetaAdAccount {
  id: string;
  workspace_id: string;
  meta_account_id: string;
  meta_account_name: string | null;
  meta_user_id: string | null;
  meta_user_name: string | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  whatsapp_phone_number_id: string | null;
  whatsapp_display_number: string | null;
  status: 'pending' | 'connected' | 'disconnected' | 'error';
  last_synced_at: string | null;
  sync_error: string | null;
  is_active: boolean;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetaAdCampaign {
  id: string;
  workspace_id: string;
  ad_account_id: string;
  meta_campaign_id: string;
  campaign_name: string;
  campaign_objective: string | null;
  meta_adset_id: string | null;
  adset_name: string | null;
  meta_ad_id: string | null;
  ad_name: string | null;
  ad_creative_preview_url: string | null;
  status: 'active' | 'paused' | 'deleted' | 'archived';
  impressions: number;
  clicks: number;
  spend_amount: number;
  spend_currency: string;
  leads_count: number;
  conversations_started: number;
  ctr: number | null;
  cpc: number | null;
  cpl: number | null;
  start_date: string | null;
  end_date: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetaAdLead {
  id: string;
  workspace_id: string;
  ad_account_id: string | null;
  campaign_id: string | null;
  contact_id: string | null;
  phone_e164: string | null;
  wa_id: string | null;
  meta_lead_id: string | null;
  meta_campaign_name: string | null;
  meta_adset_name: string | null;
  meta_ad_name: string | null;
  ad_clicked_at: string | null;
  first_message_at: string | null;
  first_response_at: string | null;
  converted_at: string | null;
  time_to_first_message_seconds: number | null;
  time_to_first_response_seconds: number | null;
  is_converted: boolean;
  conversion_value: number | null;
  attribution_source: string;
  created_at: string;
  updated_at: string;
}

export interface MetaAttributionRule {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  priority: number;
  source_type: string;
  attribution_window: '1_day' | '7_days' | '28_days';
  match_conditions: Record<string, unknown>;
  set_source: string | null;
  set_campaign_source: string | null;
  set_tags: string[] | null;
  set_priority: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetaAdAutomation {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  trigger_type: 'new_lead' | 'first_message' | 'ad_click';
  trigger_ad_account_id: string | null;
  trigger_campaign_ids: string[] | null;
  trigger_conditions: Record<string, unknown>;
  actions: MetaAdAutomationAction[];
  executions_count: number;
  last_executed_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetaAdAutomationAction {
  type: 'send_template' | 'add_tag' | 'assign_agent' | 'assign_team' | 'add_to_segment' | 'start_workflow';
  template_id?: string;
  tag_id?: string;
  agent_id?: string;
  team_id?: string;
  segment_id?: string;
  workflow_id?: string;
}

export interface MetaAdsSettings {
  id: string;
  workspace_id: string;
  tracking_enabled: boolean;
  default_tags: string[] | null;
  default_assigned_team_id: string | null;
  default_assigned_agent_id: string | null;
  default_attribution_window: '1_day' | '7_days' | '28_days';
  attribution_priority: string[];
  enforce_opt_in: boolean;
  marketing_consent_required: boolean;
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  last_full_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

// Mock data for demo
export const MOCK_META_ADS_OVERVIEW = {
  isConnected: true,
  accountName: 'SMEKSH Business',
  activeAdsCount: 5,
  leadsToday: 23,
  leadsThisMonth: 342,
  costPerLead: 2.45,
  conversionRate: 34.5,
  totalSpend: 838.90,
  lastSyncedAt: new Date().toISOString(),
};

export const MOCK_META_CAMPAIGNS: MetaAdCampaign[] = [
  {
    id: '1',
    workspace_id: '1',
    ad_account_id: '1',
    meta_campaign_id: 'camp_001',
    campaign_name: 'Summer Sale 2025',
    campaign_objective: 'MESSAGES',
    meta_adset_id: 'adset_001',
    adset_name: 'UAE - High Intent',
    meta_ad_id: 'ad_001',
    ad_name: 'WhatsApp CTA - Discount 20%',
    ad_creative_preview_url: null,
    status: 'active',
    impressions: 45000,
    clicks: 2100,
    spend_amount: 315.50,
    spend_currency: 'USD',
    leads_count: 145,
    conversations_started: 132,
    ctr: 4.67,
    cpc: 0.15,
    cpl: 2.18,
    start_date: '2025-01-01',
    end_date: null,
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    workspace_id: '1',
    ad_account_id: '1',
    meta_campaign_id: 'camp_002',
    campaign_name: 'New Product Launch',
    campaign_objective: 'MESSAGES',
    meta_adset_id: 'adset_002',
    adset_name: 'GCC - Broad',
    meta_ad_id: 'ad_002',
    ad_name: 'Click to Chat - New Arrivals',
    ad_creative_preview_url: null,
    status: 'active',
    impressions: 32000,
    clicks: 1450,
    spend_amount: 225.00,
    spend_currency: 'USD',
    leads_count: 98,
    conversations_started: 89,
    ctr: 4.53,
    cpc: 0.16,
    cpl: 2.30,
    start_date: '2025-01-05',
    end_date: null,
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    workspace_id: '1',
    ad_account_id: '1',
    meta_campaign_id: 'camp_003',
    campaign_name: 'Retargeting - Cart Abandoners',
    campaign_objective: 'MESSAGES',
    meta_adset_id: 'adset_003',
    adset_name: 'Website Visitors',
    meta_ad_id: 'ad_003',
    ad_name: 'Complete Your Order',
    ad_creative_preview_url: null,
    status: 'paused',
    impressions: 12000,
    clicks: 890,
    spend_amount: 178.40,
    spend_currency: 'USD',
    leads_count: 67,
    conversations_started: 61,
    ctr: 7.42,
    cpc: 0.20,
    cpl: 2.66,
    start_date: '2024-12-15',
    end_date: '2025-01-10',
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_LEADS_BY_DAY = [
  { date: 'Jan 7', leads: 28, spend: 68.60 },
  { date: 'Jan 8', leads: 35, spend: 85.75 },
  { date: 'Jan 9', leads: 42, spend: 102.90 },
  { date: 'Jan 10', leads: 31, spend: 75.95 },
  { date: 'Jan 11', leads: 48, spend: 117.60 },
  { date: 'Jan 12', leads: 52, spend: 127.40 },
  { date: 'Jan 13', leads: 23, spend: 56.35 },
];

export const MOCK_LEADS_BY_CAMPAIGN = [
  { campaign: 'Summer Sale 2025', leads: 145, color: '#10b981' },
  { campaign: 'New Product Launch', leads: 98, color: '#3b82f6' },
  { campaign: 'Retargeting', leads: 67, color: '#f59e0b' },
  { campaign: 'Brand Awareness', leads: 32, color: '#8b5cf6' },
];
