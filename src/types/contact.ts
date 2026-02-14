export interface Contact {
  id: string;
  tenant_id: string;
  wa_id: string;
  name: string | null;
  first_name: string | null;
  profile_picture_url: string | null;
  country: string | null;
  language: string | null;
  timezone: string | null;
  
  // Source & First Interaction
  source: string | null;
  campaign_source: string | null;
  first_message: string | null;
  first_message_time: string | null;
  entry_point: string | null;
  referrer_url: string | null;
  
  // Segmentation
  segment: string | null;
  priority_level: 'low' | 'normal' | 'high' | 'urgent';
  
  // Lead & Request Lifecycle
  lead_status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  deal_stage: string | null;
  closed: boolean;
  closed_reason: string | null;
  closure_time: string | null;
  request_type: string | null;
  request_time: string | null;
  
  // MAU & WhatsApp Status
  mau_status: 'active' | 'inactive' | 'churned';
  last_active_date: string | null;
  whatsapp_quality_rating: string | null;
  pricing_category: string | null;
  blocked_by_user: boolean;
  
  // Automation & AI
  bot_handled: boolean;
  automation_flow: string | null;
  ai_intent_detected: string | null;
  sentiment_score: number | null;
  followup_due: string | null;
  sla_timer: string | null;
  next_best_action: string | null;
  
  // Compliance & Audit
  opt_in_status: boolean;
  opt_in_source: string | null;
  opt_in_timestamp: string | null;
  opt_out: boolean;
  opt_out_timestamp: string | null;
  data_deletion_requested: boolean;
  
  // Agent & Intervention
  notes: string | null;
  assigned_agent_id: string | null;
  intervened: boolean;
  intervened_at: string | null;
  intervened_by: string | null;
  
  // Timestamps
  last_seen: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  tags?: ContactTag[];
  assigned_agent?: { id: string; full_name: string | null; email: string } | null;
  intervened_by_agent?: { id: string; full_name: string | null; email: string } | null;
}

export interface ContactTag {
  id: string;
  tag_id: string;
  tag: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface ContactTimelineEvent {
  id: string;
  contact_id: string;
  tenant_id: string;
  event_type: 'message' | 'status_change' | 'intervention' | 'tag_added' | 'tag_removed' | 'attribute_update' | 'agent_assigned' | 'note_added';
  event_data: Record<string, unknown>;
  actor_id: string | null;
  actor_type: 'user' | 'system' | 'bot' | 'automation';
  created_at: string;
  actor?: { id: string; full_name: string | null; email: string } | null;
}

export interface ContactFilters {
  search: string;
  leadStatus: string[];
  priority: string[];
  mauStatus: string[];
  tags: string[];
  segment: string;
  optInStatus: 'all' | 'opted_in' | 'opted_out';
  hasAgent: 'all' | 'assigned' | 'unassigned';
  intervened: 'all' | 'yes' | 'no';
  // CRM filters
  leadState?: string[];
  assignedTo?: string;
  isUnreplied?: 'all' | 'yes' | 'no';
  createdDateFrom?: string;
  createdDateTo?: string;
  attributes?: { key: string; value: string }[];
}

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-gray-100 text-gray-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  { value: 'won', label: 'Won', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

export const MAU_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'churned', label: 'Churned', color: 'bg-red-100 text-red-700' },
];
