export type CampaignType = 'broadcast' | 'drip' | 'retarget' | 'ctwa_followup' | 'ab_test';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type CampaignGoal = 'announcement' | 'promotion' | 'followup' | 'education' | 'reminder' | 'engagement';
export type JobStatus = 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'replied' | 'failed' | 'cancelled' | 'skipped';

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  campaign_type: CampaignType;
  goal?: CampaignGoal;
  status: CampaignStatus;
  
  // Template
  template_id: string;
  template_name?: string;
  template_variables?: Record<string, unknown>;
  header_media_url?: string;
  header_media_type?: string;
  
  // Phone number
  phone_number_id: string;
  phone_display?: string;
  
  // Audience
  audience_source?: string;
  audience_config?: Record<string, unknown>;
  include_segments?: string[];
  exclude_segments?: string[];
  include_tags?: string[];
  exclude_tags?: string[];
  target_tags?: string[];
  total_recipients?: number;
  
  // Delivery settings
  timezone?: string;
  business_hours_only?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  messages_per_minute?: number;
  max_per_hour?: number;
  max_per_day?: number;
  frequency_cap_days?: number;
  
  // A/B Testing
  is_ab_test?: boolean;
  ab_variant?: string;
  ab_parent_id?: string;
  ab_split_ratio?: number;
  ab_winner_metric?: string;
  
  // Conversion tracking
  conversion_tag_id?: string;
  conversion_count?: number;
  
  // Progress
  queued_count?: number;
  processing_count?: number;
  sent_count?: number;
  delivered_count?: number;
  read_count?: number;
  replied_count?: number;
  failed_count?: number;
  skipped_count?: number;
  
  // Timestamps
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  
  // Meta
  created_by?: string;
  error_message?: string;
}

export interface CampaignJob {
  id: string;
  tenant_id: string;
  campaign_id: string;
  contact_id: string;
  phone_number_id: string;
  
  status: JobStatus;
  priority: number;
  
  template_name: string;
  template_language: string;
  template_variables?: Record<string, unknown>;
  header_media_url?: string;
  
  recipient_phone: string;
  recipient_name?: string;
  
  attempts: number;
  max_attempts: number;
  scheduled_at: string;
  
  wamid?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  replied_at?: string;
  failed_at?: string;
  error_code?: string;
  error_message?: string;
  skip_reason?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category?: string;
  industry?: string;
  campaign_type: CampaignType;
  goal?: CampaignGoal;
  template_id?: string;
  template_variables?: Record<string, unknown>;
  audience_config?: Record<string, unknown>;
  delivery_config?: Record<string, unknown>;
  is_public?: boolean;
  use_count?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  id: string;
  tenant_id: string;
  campaign_id: string;
  snapshot_hour: string;
  queued: number;
  sent: number;
  delivered: number;
  read_count: number;
  replied: number;
  failed: number;
  skipped: number;
  converted: number;
  delivery_rate?: number;
  read_rate?: number;
  reply_rate?: number;
  conversion_rate?: number;
  created_at: string;
}

// Create campaign wizard state
export interface CampaignWizardState {
  step: number;
  basics: {
    name: string;
    goal: CampaignGoal | '';
    phone_number_id: string;
    campaign_type: CampaignType;
  };
  message: {
    template_id: string;
    template_name: string;
    template_category: string;
    variables: Record<string, string>;
    header_media_url?: string;
  };
  audience: {
    source: 'segments' | 'tags' | 'csv' | 'ctwa';
    include_segments: string[];
    exclude_segments: string[];
    include_tags: string[];
    exclude_tags: string[];
    exclude_recent_days: number;
    csv_file?: File;
    estimated_count: number;
  };
  delivery: {
    send_type: 'now' | 'scheduled';
    scheduled_at?: Date;
    timezone: string;
    business_hours_only: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    messages_per_minute: number;
    frequency_cap_days: number;
  };
  abTest: {
    enabled: boolean;
    variant_b_template_id?: string;
    split_ratio: number;
    winner_metric: 'reply_rate' | 'read_rate' | 'conversion';
  };
}

// Mock data for demo
export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    tenant_id: '1',
    name: 'Summer Sale 2025',
    description: 'Promotional campaign for summer collection',
    campaign_type: 'broadcast',
    goal: 'promotion',
    status: 'completed',
    template_id: 't1',
    template_name: 'summer_sale_promo',
    phone_number_id: 'p1',
    phone_display: '+971 50 123 4567',
    total_recipients: 2500,
    queued_count: 0,
    sent_count: 2450,
    delivered_count: 2380,
    read_count: 1850,
    replied_count: 320,
    failed_count: 50,
    skipped_count: 70,
    conversion_count: 156,
    scheduled_at: '2025-01-10T09:00:00Z',
    started_at: '2025-01-10T09:00:00Z',
    completed_at: '2025-01-10T11:30:00Z',
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-10T11:30:00Z',
    created_by: 'user1',
  },
  {
    id: '2',
    tenant_id: '1',
    name: 'New Year Greetings',
    campaign_type: 'broadcast',
    goal: 'engagement',
    status: 'completed',
    template_id: 't2',
    template_name: 'new_year_greeting',
    phone_number_id: 'p1',
    phone_display: '+971 50 123 4567',
    total_recipients: 5000,
    sent_count: 4920,
    delivered_count: 4800,
    read_count: 4200,
    replied_count: 890,
    failed_count: 80,
    scheduled_at: '2025-01-01T00:01:00Z',
    completed_at: '2025-01-01T03:00:00Z',
    created_at: '2024-12-30T10:00:00Z',
    updated_at: '2025-01-01T03:00:00Z',
  },
  {
    id: '3',
    tenant_id: '1',
    name: 'Product Launch - Premium Line',
    campaign_type: 'broadcast',
    goal: 'announcement',
    status: 'scheduled',
    template_id: 't3',
    template_name: 'product_launch',
    phone_number_id: 'p1',
    phone_display: '+971 50 123 4567',
    total_recipients: 3200,
    queued_count: 3200,
    scheduled_at: '2025-01-15T10:00:00Z',
    created_at: '2025-01-12T16:00:00Z',
    updated_at: '2025-01-12T16:00:00Z',
  },
  {
    id: '4',
    tenant_id: '1',
    name: 'CTWA Lead Follow-up',
    campaign_type: 'ctwa_followup',
    goal: 'followup',
    status: 'sending',
    template_id: 't4',
    template_name: 'ctwa_followup',
    phone_number_id: 'p1',
    phone_display: '+971 50 123 4567',
    total_recipients: 450,
    queued_count: 120,
    processing_count: 5,
    sent_count: 280,
    delivered_count: 265,
    read_count: 180,
    replied_count: 45,
    failed_count: 15,
    started_at: new Date().toISOString(),
    created_at: '2025-01-13T08:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    tenant_id: '1',
    name: 'A/B Test - CTA Comparison',
    campaign_type: 'ab_test',
    goal: 'promotion',
    status: 'draft',
    is_ab_test: true,
    ab_split_ratio: 50,
    ab_winner_metric: 'reply_rate',
    template_id: 't1',
    phone_number_id: 'p1',
    phone_display: '+971 50 123 4567',
    total_recipients: 1000,
    created_at: '2025-01-13T10:00:00Z',
    updated_at: '2025-01-13T10:00:00Z',
  },
];

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  scheduled: { label: 'Scheduled', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  sending: { label: 'Sending', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  paused: { label: 'Paused', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export const CAMPAIGN_GOAL_CONFIG: Record<CampaignGoal, { label: string; icon: string; description: string }> = {
  announcement: { label: 'Announcement', icon: '📢', description: 'Share news, updates, or important information' },
  promotion: { label: 'Promotion', icon: '🎁', description: 'Promote offers, discounts, or sales' },
  followup: { label: 'Follow-up', icon: '🔄', description: 'Re-engage leads or continue conversations' },
  education: { label: 'Education', icon: '📚', description: 'Share tutorials, guides, or educational content' },
  reminder: { label: 'Reminder', icon: '⏰', description: 'Send appointment or event reminders' },
  engagement: { label: 'Engagement', icon: '💬', description: 'Build relationships and gather feedback' },
};

export const CAMPAIGN_TYPE_CONFIG: Record<CampaignType, { label: string; description: string }> = {
  broadcast: { label: 'Broadcast', description: 'Send to all selected contacts at once' },
  drip: { label: 'Drip Campaign', description: 'Send messages over time in a sequence' },
  retarget: { label: 'Retargeting', description: 'Re-engage contacts based on behavior' },
  ctwa_followup: { label: 'CTWA Follow-up', description: 'Follow up with Click-to-WhatsApp leads' },
  ab_test: { label: 'A/B Test', description: 'Test different messages to find the best' },
};